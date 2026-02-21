from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class PartyRequest(BaseModel):
    party_type: str  # 'customer', 'supplier', 'bank'

class JournalDetailItem(BaseModel):
    gl_code: Optional[str] = None
    type: str # 'Debit', 'Credit'
    description: Optional[str] = None
    amount: float
    reference_no: Optional[str] = None
    party_name: Optional[str] = None # Added based on UI, though typically ID is preferred

class JournalCreateRequest(BaseModel):
    journal_date: date
    description: Optional[str] = None
    party_type: str
    party_id: Optional[int] = None
    party_name: Optional[str] = None
    reference_no: Optional[str] = None
    total_amount: float
    status: str # 'Saved', 'Posted'
    created_by: str
    details: List[JournalDetailItem]

class JournalResponse(BaseModel):
    status: bool
    message: str
    journal_id: Optional[int] = None
