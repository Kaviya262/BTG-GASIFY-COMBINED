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

# Distinct prefix for Cash Book to avoid conflict with Bank Book
router = APIRouter(
    prefix="/AR/cash", 
    tags=["Cash Book Entry"]
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

# ==========================================
# 1. LISTING & REPORTING (CASH SPECIFIC)
# ==========================================

@router.get("/get-daily-entries")
async def get_daily_cash_entries(db: AsyncSession = Depends(get_db)):
    """
    Fetches entries for the Cash Book Entry screen.
    Ideally, this could filter by Cash Accounts (Type 2), but currently returns all AR Receipts
    to ensure visibility, letting Frontend filter if necessary.
    """
    try:
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
                
                COALESCE(mc.CurrencyCode, 'IDR') as CurrencyCode,

                CASE WHEN r.is_posted = 1 THEN 'P' ELSE 'S' END as status_code,
                
                CASE 
                    WHEN r.is_posted = 1 AND r.pending_verification = 1 THEN 'Pending'
                    WHEN r.is_posted = 1 AND r.pending_verification = 0 THEN 'Completed'
                    ELSE NULL 
                END as verification_status

            FROM tbl_ar_receipt r
            LEFT JOIN {DB_NAME_USER}.master_customer c ON r.customer_id = c.Id
            LEFT JOIN {DB_NAME_MASTER}.master_bank b ON r.deposit_bank_id = b.BankId
            LEFT JOIN {DB_NAME_OLD}.master_currency mc ON b.CurrencyId = mc.CurrencyId
            
            -- Optional: Add filter for Cash Accounts here if needed
            -- WHERE b.BankTypeId = 2 
            
            ORDER BY r.receipt_id DESC
        """)
        
        result = await db.execute(query)
        data = result.mappings().all()
        return {"status": "success", "data": data}
        
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@router.get("/get-report")
async def get_cash_book_report(
    from_date: str,
    to_date: str,
    bank_id: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Specific Report Endpoint for Cash Book.
    """
    try:
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
                
                CASE WHEN r.bank_amount >= 0 THEN r.bank_amount ELSE 0 END as CashIn,
                CASE WHEN r.bank_amount < 0 THEN ABS(r.bank_amount) ELSE 0 END as CashOut,
                
                r.bank_amount as NetAmount
                
            FROM tbl_ar_receipt r
            LEFT JOIN {DB_NAME_USER}.master_customer c ON r.customer_id = c.Id
            LEFT JOIN {DB_NAME_MASTER}.master_bank b ON r.deposit_bank_id = b.BankId
            LEFT JOIN {DB_NAME_OLD}.master_currency mc ON b.CurrencyId = mc.CurrencyId
            
            WHERE r.created_date BETWEEN :from_date AND :to_date
              AND r.is_active = 1
        """
        
        params = {"from_date": from_date, "to_date": to_date}
        
        if bank_id and int(bank_id) != 0:
            sql += " AND r.deposit_bank_id = :bank_id"
            params["bank_id"] = bank_id
            
        sql += " ORDER BY r.created_date ASC, r.receipt_id ASC"
        
        result = await db.execute(text(sql), params)
        rows = result.mappings().all()
        
        data = []
        running_balance = 0.0 
        
        for row in rows:
            item = dict(row)
            cash_in = float(item["CashIn"] or 0)
            cash_out = float(item["CashOut"] or 0)
            running_balance += (cash_in - cash_out)
            
            item["CashIn"] = cash_in
            item["CashOut"] = cash_out
            item["Balance"] = running_balance
            data.append(item)
            
        return {"status": "success", "data": data}

    except Exception as e:
        return {"status": "error", "detail": str(e)}

# ==========================================
# 2. TRANSACTIONAL ENDPOINTS (CREATE/UPDATE)
# ==========================================

@router.post("/create")
async def create_cash_receipt(payload: schemas.CreateARCommand, db: AsyncSession = Depends(get_db)):
    try:
        new_records = await crud.create_ar_receipt(db, payload)
        if new_records:
            return {"status": "success", "message": "Cash entry created", "ids": [r.receipt_id for r in new_records]}
        else:
            raise HTTPException(status_code=400, detail="Failed to create entry")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update/{receipt_id}")
async def update_cash_receipt(receipt_id: int, payload: CreateReceiptRequest, db: AsyncSession = Depends(get_db)):
    try:
        data = payload.header[0]
        stmt = select(ARReceipt).where(ARReceipt.receipt_id == receipt_id)
        result = await db.execute(stmt)
        entry = result.scalars().first()
        
        if not entry:
            raise HTTPException(status_code=404, detail="Entry not found")

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

@router.put("/submit/{receipt_id}")
async def submit_cash_receipt(receipt_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        update(ARReceipt)
        .where(ARReceipt.receipt_id == receipt_id)
        .values(is_submitted=True, pending_verification=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"status": "success"}