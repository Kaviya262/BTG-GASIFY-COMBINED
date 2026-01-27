from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession 
from sqlalchemy import text, select, update
from datetime import date
from typing import List, Optional
from pydantic import BaseModel
from .. import schemas
from .. import crud 
from ..database import get_db, DB_NAME_USER, DB_NAME_FINANCE, DB_NAME_MASTER, DB_NAME_OLD
from ..models.finance import ARReceipt

router = APIRouter(
    prefix="/AR", 
    tags=["Bank Book Entry"]
)

# --- Pydantic Schemas ---
class ReceiptItem(BaseModel):
    receipt_id: int = 0
    customer_id: int
    bank_amount: float
    bank_charges: float
    deposit_bank_id: int
    reference_no: Optional[str] = None
    sales_person_id: Optional[int] = None
    send_notification: bool = False
    status: str 

class CreateReceiptRequest(BaseModel):
    orgId: int
    branchId: int
    userId: int
    userIp: str = "127.0.0.1"
    header: List[ReceiptItem]

# --- API Endpoints ---

@router.get("/get-daily-entries")
async def get_daily_entries(db: AsyncSession = Depends(get_db)):
    try:
        # UPDATED: Filter where deposit_bank_id is NOT NULL, NOT Empty, and NOT '0'
        query = text(f"""
            SELECT 
                r.receipt_id,
                r.created_date as date,
                r.customer_id,
                c.CustomerName as customerName,
                r.bank_amount,
                r.bank_charges,
                r.deposit_bank_id,
                r.reference_no,
                r.sales_person_id,
                r.send_notification,
                r.is_posted, 
                r.pending_verification, 

                -- Status Code (S/P)
                CASE WHEN r.is_posted = 1 THEN 'P' ELSE 'S' END as status_code,
                
                -- Verification Status Logic
                CASE 
                    WHEN r.is_posted = 1 AND r.pending_verification = 1 THEN 'Pending'
                    WHEN r.is_posted = 1 AND r.pending_verification = 0 THEN 'Completed'
                    ELSE NULL 
                END as verification_status

            FROM tbl_ar_receipt r
            LEFT JOIN {DB_NAME_USER}.master_customer c ON r.customer_id = c.Id
            
            -- FILTER FOR BANK BOOK ENTRIES ONLY --
            WHERE r.deposit_bank_id IS NOT NULL 
              AND r.deposit_bank_id != '' 
              AND r.deposit_bank_id != '0'
            
            ORDER BY r.receipt_id DESC
        """)
        
        result = await db.execute(query)
        data = result.mappings().all()
        return {"status": "success", "data": data}
        
    except Exception as e:
        return {"status": "error", "detail": str(e)}

# --- NEW ENDPOINT: BANK BOOK REPORT ---
@router.get("/get-report")
async def get_bank_book_report(
    from_date: str,
    to_date: str,
    bank_id: int = 0,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Fetches data specifically for the Bank Book Report
        sql = f"""
            SELECT 
                r.receipt_id,
                r.created_date as Date,
                r.reference_no as VoucherNo,
                'Receipt' as TransactionType, 
                b.BankName as Account,
                c.CustomerName as Party,
                r.reference_no as Description,
                COALESCE(mc.CurrencyCode, 'IDR') as Currency, 
                
                CASE WHEN r.bank_amount >= 0 THEN r.bank_amount ELSE 0 END as CreditIn,
                CASE WHEN r.bank_amount < 0 THEN ABS(r.bank_amount) ELSE 0 END as DebitOut,
                
                r.bank_amount as NetAmount
                
            FROM tbl_ar_receipt r
            LEFT JOIN {DB_NAME_USER_NEW}.master_customer c ON r.customer_id = c.Id
            LEFT JOIN {DB_NAME_MASTER}.master_bank b ON r.deposit_bank_id = b.BankId
            LEFT JOIN {DB_NAME_USER}.master_currency mc ON b.CurrencyId = mc.CurrencyId
            WHERE r.created_date BETWEEN :from_date AND :to_date
              AND r.is_active = 1
              AND r.deposit_bank_id IS NOT NULL 
              AND r.deposit_bank_id != '' 
              AND r.deposit_bank_id != '0'
        """
        
        params = {"from_date": from_date, "to_date": to_date}
        
        if bank_id and bank_id != 0:
            sql += " AND r.deposit_bank_id = :bank_id"
            params["bank_id"] = bank_id
            
        sql += " ORDER BY r.created_date ASC, r.receipt_id ASC"
        
        result = await db.execute(text(sql), params)
        rows = result.mappings().all()
        
        # --- FIXED: Cast Decimal to Float for calculation ---
        data = []
        running_balance = 0.0 
        
        for row in rows:
            item = dict(row)
            
            # Cast to float to avoid "unsupported operand type" error
            credit_in = float(item["CreditIn"] or 0)
            debit_out = float(item["DebitOut"] or 0)
            
            running_balance += (credit_in - debit_out)
            
            item["CreditIn"] = credit_in
            item["DebitOut"] = debit_out
            item["Balance"] = running_balance
            
            data.append(item)
            
        return {"status": "success", "data": data}

    except Exception as e:
        print(f"Error fetching bank book report: {e}")
        return {"status": "error", "detail": str(e)}

@router.put("/submit/{receipt_id}")
async def submit_receipt(receipt_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        update(ARReceipt)
        .where(ARReceipt.receipt_id == receipt_id)
        .values(
            is_submitted=True,
            pending_verification=True 
        )
    )
    result = await db.execute(stmt)
    await db.commit()
    return {"status": "success"}

@router.get("/get-by-id")
async def get_by_id(receipt_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(ARReceipt).where(ARReceipt.receipt_id == receipt_id)
    result = await db.execute(stmt)
    entry = result.scalars().first()
    
    if not entry:
        return {"status": "error", "detail": "Not Found"}
    return {"status": "success", "data": entry}

@router.post("/create")
async def create_receipt(payload: schemas.CreateARCommand, db: AsyncSession = Depends(get_db)):
    try:
        new_records = await crud.create_ar_receipt(db, payload)
        
        if new_records:
            return {"status": "success", "message": f"Created {len(new_records)} entries", "ids": [r.receipt_id for r in new_records]}
        else:
            raise HTTPException(status_code=400, detail="Failed to create receipt")

    except Exception as e:
        print(f"Create Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update/{receipt_id}")
async def update_receipt(receipt_id: int, payload: CreateReceiptRequest, db: AsyncSession = Depends(get_db)):
    try:
        data = payload.header[0]
        
        stmt = select(ARReceipt).where(ARReceipt.receipt_id == receipt_id)
        result = await db.execute(stmt)
        entry = result.scalars().first()
        
        if not entry:
            raise HTTPException(status_code=404, detail="Receipt not found")

        entry.customer_id = data.customer_id
        entry.deposit_bank_id = str(data.deposit_bank_id)
        entry.bank_amount = data.bank_amount
        entry.bank_charges = data.bank_charges
        entry.reference_no = data.reference_no
        entry.sales_person_id = data.sales_person_id
        entry.send_notification = data.send_notification
        entry.status = data.status
        
        if data.status == "Posted":
            entry.is_posted = True
            entry.pending_verification = True
        else:
            entry.is_posted = False
            
        entry.updated_by = str(payload.userId)

        await db.commit()
        return {"status": "success"}

    except Exception as e:
        await db.rollback()
        return {"status": "error", "detail": str(e)}

@router.get("/get-sales-persons")
async def get_sales_persons(db: AsyncSession = Depends(get_db)):
    try:
        query = text(f"""
            SELECT 
                Id as value, 
                CONCAT(FirstName, ' ', IFNULL(LastName, '')) as label 
            FROM {DB_NAME_USER}.users 
            WHERE IsActive = 1 
              AND Department = '4'
            ORDER BY FirstName ASC
        """)
        
        result = await db.execute(query)
        sales_persons = result.mappings().all()
        
        return {"status": "success", "data": sales_persons}

    except Exception as e:
        print(f"Error fetching sales persons: {e}")
        return {"status": "error", "detail": str(e)}

@router.get("/get-customer-defaults")
async def get_customer_defaults(db: AsyncSession = Depends(get_db)):
    try:
        query = text(f"""
            SELECT Id, SalesPersonId 
            FROM {DB_NAME_USER_NEW}.master_customer 
            WHERE IsActive = 1
        """)
        
        result = await db.execute(query)
        rows = result.mappings().all()
        defaults = {row.Id: row.SalesPersonId for row in rows}
        
        return {"status": "success", "data": defaults}

    except Exception as e:
        print(f"Error fetching customer defaults: {e}")
        return {"status": "error", "detail": str(e)}