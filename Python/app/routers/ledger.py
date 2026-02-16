from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, text
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from ..database import get_db, DB_NAME_USER
from ..models import ledger as models

router = APIRouter(
    prefix="/ledger",
    tags=["Ledger Book"]
)

# -----------------------------------------------------------------------------
# SCHEMAS
# -----------------------------------------------------------------------------

class LedgerBase(BaseModel):
    gl_id: Optional[int] = None
    reference_no: Optional[str] = None
    category: Optional[str] = None
    party_id: Optional[int] = None
    currency_id: Optional[int] = None
    debit: Optional[float] = 0.0
    credit: Optional[float] = 0.0
    narration: Optional[str] = None
    org_id: Optional[int] = 1
    branch_id: Optional[int] = 1
    created_by: Optional[str] = None
    modified_by: Optional[str] = None

class LedgerCreate(LedgerBase):
    pass

class LedgerUpdate(LedgerBase):
    party: Optional[str] = None
    exchange_rate: Optional[float] = 1.0

class LedgerResponse(LedgerBase):
    party: Optional[str] = None
    exchange_rate: Optional[float] = 1.0
    ledger_id: int
    created_at: Optional[datetime] = None
    modified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# -----------------------------------------------------------------------------
# LOOKUP ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/get-gl-codes")
async def get_gl_codes(db: AsyncSession = Depends(get_db)):
    try:
        # Assuming tbl_GLcodemaster is in the default finance database
        query = text("SELECT * FROM tbl_GLcodemaster")
        result = await db.execute(query)
        gl_codes = result.mappings().all()
        return {
            "status": "success",
            "data": gl_codes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get-currencies")
async def get_currencies(db: AsyncSession = Depends(get_db)):
    try:
        # master_currency is typically in the user DB (btggasify_live) based on finance.py
        
        query = text(f"SELECT * FROM {DB_NAME_USER}.master_currency")
        result = await db.execute(query)
        currencies = result.mappings().all()
        return {
            "status": "success",
            "data": currencies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------------------------------------------------------
# CRUD OPERATIONS
# -----------------------------------------------------------------------------

@router.post("/", response_model=LedgerResponse, status_code=status.HTTP_201_CREATED)
async def create_ledger_entry(
    ledger_data: LedgerCreate, 
    db: AsyncSession = Depends(get_db)
):
    try:
        data_dict = ledger_data.dict()
        
        # 1. Determine Party
        computed_party = None
        if ledger_data.party_id == 1:
            computed_party = "Supplier"
        elif ledger_data.party_id == 2:
            computed_party = "Customer"
        data_dict['party'] = computed_party

        # 2. Determine Exchange Rate
        computed_exchange_rate = 1.0
        if ledger_data.currency_id:
            # Assuming 'Rate' or 'ExchangeRate' column in master_currency. 
            # Standardizing on ExchangeRate usually, but if not sure select all or specific.
            # Based on previous pattern, query master_currency.
            query = text(f"SELECT CurrencyId, ExchangeRate FROM {DB_NAME_USER}.master_currency WHERE CurrencyId = :cid")
            result = await db.execute(query, {"cid": ledger_data.currency_id})
            row = result.mappings().one_or_none()
            if row and row.get('ExchangeRate') is not None:
                computed_exchange_rate = float(row['ExchangeRate'])
        
        data_dict['exchange_rate'] = computed_exchange_rate

        new_ledger = models.LedgerBook(**data_dict)
        db.add(new_ledger)
        await db.commit()
        await db.refresh(new_ledger)
        return new_ledger
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[LedgerResponse])
async def get_all_ledgers(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(models.LedgerBook).offset(skip).limit(limit)
        result = await db.execute(query)
        ledgers = result.scalars().all()
        return ledgers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ledger_id}", response_model=LedgerResponse)
async def get_ledger(
    ledger_id: int, 
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(models.LedgerBook).where(models.LedgerBook.ledger_id == ledger_id)
        result = await db.execute(query)
        ledger = result.scalar_one_or_none()
        
        if not ledger:
            raise HTTPException(status_code=404, detail="Ledger entry not found")
        
        return ledger
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{ledger_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ledger(
    ledger_id: int, 
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(models.LedgerBook).where(models.LedgerBook.ledger_id == ledger_id)
        result = await db.execute(query)
        ledger = result.scalar_one_or_none()
        
        if not ledger:
            raise HTTPException(status_code=404, detail="Ledger entry not found")
            
        await db.delete(ledger)
        await db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))