from pydantic import BaseModel
from typing import List, Optional

class ArReceiptInput(BaseModel):
    receipt_id: int = 0
    payment_amount: float = 0
    ar_id: int = 0  
    cash_amount: float = 0
    bank_amount: float = 0
    contra_amount: float = 0
    tax_rate: float = 0
    bank_payment_via: int = 0
    cheque_number: Optional[str] = None
    giro_number: Optional[str] = None
    deposit_bank_id: int = 0
    deposit_account_number: Optional[str] = None
    contra_reference: Optional[str] = None
    proof_missing: bool = False
    bank_charges: float = 0
    pending_verification: bool = False
    customer_id: int
    
    # --- NEW FIELDS ---
    reference_no: Optional[str] = None
    sales_person_id: Optional[int] = None
    send_notification: bool = False
    is_posted: bool = False

class CreateARCommand(BaseModel):
    orgId: int
    branchId: int
    userId: int
    userIp: str
    header: List[ArReceiptInput]

class VerifyCustomerUpdate(BaseModel):
    customer_id: int

class InvoiceAllocation(BaseModel):
    invoice_id: int
    invoice_no: str
    payment_type: str  # "Full" or "Partial"
    amount_allocated: float

class VerifyCustomerUpdate(BaseModel):
    customer_id: int
    bank_charges: float
    tax_deduction: float
    allocations: List[InvoiceAllocation]

# ADD THIS NEW SCHEMA
class SaveDraftRequest(BaseModel):
    customer_id: int
    bank_charges: float
    tax_deduction: float
    allocations: List[InvoiceAllocation]

class UpdateReferenceRequest(BaseModel):
    id: int
    new_reference: str

class BulkUpdateReferenceRequest(BaseModel):
    ids: List[int]
    new_reference: str