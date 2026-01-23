from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession 
from sqlalchemy import text, select, update
from datetime import date
from typing import List, Optional
from pydantic import BaseModel
from .. import schemas
from .. import crud 
from ..database import get_db
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
        # FIXED: Removed 'DATE(r.created_date) = CURDATE()' logic.
        # Now fetches ALL records that are NOT yet submitted.
        query = text("""
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
            LEFT JOIN btg_userpanel_uat.master_customer c ON r.customer_id = c.Id
            
            -- Filter only for items that haven't been submitted to the next stage yet
            WHERE (r.is_submitted = 0 OR r.is_submitted IS NULL) 
            ORDER BY r.receipt_id DESC
        """)
        
        result = await db.execute(query)
        data = result.mappings().all()
        return {"status": "success", "data": data}
        
    except Exception as e:
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
        query = text("""
            SELECT 
                Id as value, 
                CONCAT(FirstName, ' ', IFNULL(LastName, '')) as label 
            FROM btg_userpanel_uat.users 
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