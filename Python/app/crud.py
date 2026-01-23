from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, update
from datetime import datetime
from . import schemas
from .models.finance import ARReceipt
from sqlalchemy import text
from typing import List

# ----------------------------------------------------------
# 1. CREATE AR RECEIPT
# ----------------------------------------------------------
async def create_ar_receipt(db: AsyncSession, command: schemas.CreateARCommand):
    created_records = []
    
    for item in command.header:
        is_cleared_status = False
        if item.deposit_bank_id and str(item.deposit_bank_id) != "0" and str(item.deposit_bank_id).strip() != "":
            is_cleared_status = True

        # --- WORKFLOW LOGIC ---
        # If Posted: It goes to Marketing Verify (pending_verification = True)
        # If Saved: It stays local (pending_verification = False)
        is_posted = item.is_posted
        pending_verification = True if is_posted else False

        db_receipt = ARReceipt(
            orgid=command.orgId,
            branchid=command.branchId,
            created_by=str(command.userId),
            created_ip=command.userIp,
            receipt_date=datetime.now().date(),
            customer_id=item.customer_id,
            bank_amount=item.bank_amount,
            bank_charges=item.bank_charges,
            deposit_bank_id=str(item.deposit_bank_id),
            
            # New Fields
            reference_no=item.reference_no,
            sales_person_id=item.sales_person_id,
            send_notification=item.send_notification,
            
            # --- STATUS FLAGS ---
            is_posted=is_posted,
            pending_verification=pending_verification, 
            is_submitted=False,
            
            # ... other fields ...
            flag=is_cleared_status, 
            is_cleared=is_cleared_status,
            is_active=True
        )
        db.add(db_receipt)
        created_records.append(db_receipt)

    await db.commit()
    for record in created_records:
        await db.refresh(record)
    return created_records

# ----------------------------------------------------------
# 2. GET PENDING LIST
# ----------------------------------------------------------
async def get_pending_bank_books(db: AsyncSession):
    stmt = (
        select(ARReceipt)
        .where(ARReceipt.pending_verification == True)
        .order_by(desc(ARReceipt.receipt_id))
    )
    result = await db.execute(stmt)
    return result.scalars().all()


# ----------------------------------------------------------
# 3. GET RECEIPT BY ID
# ----------------------------------------------------------
async def get_receipt_by_id(db: AsyncSession, receipt_id: int):
    stmt = select(ARReceipt).where(ARReceipt.receipt_id == receipt_id)
    result = await db.execute(stmt)
    return result.scalars().first()


# ----------------------------------------------------------
# 4. UPDATE CUSTOMER + VERIFY
# ----------------------------------------------------------
async def update_customer_and_verify(db: AsyncSession, receipt_id: int, new_customer_id: int):
    stmt = select(ARReceipt).where(
        ARReceipt.receipt_id == receipt_id,
        ARReceipt.pending_verification == True
    )

    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        return None 

    if not record.customer_id or record.customer_id == 0:
        record.customer_id = new_customer_id

    record.pending_verification = False
    record.modified_on = datetime.now()

    await db.commit()
    await db.refresh(record)

    return record


# ----------------------------------------------------------
# 5. GET VERIFIED UNSUBMITTED
# ----------------------------------------------------------
async def get_verified_unsubmitted_books(db: AsyncSession):
    stmt = (
        select(ARReceipt)
        .where(
            ARReceipt.pending_verification == False,
            ARReceipt.is_submitted == False
        )
        .order_by(desc(ARReceipt.receipt_id))
    )
    result = await db.execute(stmt)
    return result.scalars().all()


# ----------------------------------------------------------
# 6. SUBMIT RECEIPT
# ----------------------------------------------------------
async def submit_receipt(db: AsyncSession, receipt_id: int):
    stmt = (
        update(ARReceipt)
        .where(ARReceipt.receipt_id == receipt_id)
        .values(is_submitted=True, pending_verification=True) # Move to next stage
        .execution_options(synchronize_session="fetch")
    )
    
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0


# ----------------------------------------------------------
# 7. UPDATE AR RECEIPT
# ----------------------------------------------------------
async def update_ar_receipt(db: AsyncSession, command: schemas.CreateARCommand):
    updated_count = 0
    
    for item in command.header:
        is_cleared_status = False
        if item.deposit_bank_id and str(item.deposit_bank_id) != "0" and str(item.deposit_bank_id).strip() != "":
            is_cleared_status = True

        # --- LOGIC: Post vs Save ---
        is_posted = item.is_posted
        pending_verification = True if is_posted else False

        values_to_update = {
            "customer_id": item.customer_id,
            "bank_amount": item.bank_amount,
            "cash_amount": item.cash_amount,
            "contra_amount": item.contra_amount,
            "bank_charges": item.bank_charges,
            "tax_rate": item.tax_rate,
            
            "deposit_bank_id": str(item.deposit_bank_id),
            "deposit_account_number": item.deposit_account_number,
            "cheque_number": item.cheque_number,
            "giro_number": item.giro_number,
            "bank_payment_via": item.bank_payment_via,

            # --- New Fields ---
            "reference_no": item.reference_no,
            "sales_person_id": item.sales_person_id,
            "send_notification": item.send_notification,

            # --- Status Flags ---
            "is_posted": is_posted,
            "pending_verification": pending_verification,
            
            "flag": is_cleared_status,
            "is_cleared": is_cleared_status,
            "proof_missing": item.proof_missing,
            "contra_reference": item.contra_reference,
        }

        stmt = (
            update(ARReceipt)
            .where(ARReceipt.receipt_id == item.receipt_id)
            .values(**values_to_update)
            .execution_options(synchronize_session="fetch")
        )
        result = await db.execute(stmt)
        updated_count += result.rowcount

    await db.commit()
    return updated_count > 0


async def get_ar_book(db: AsyncSession, customer_id: int, from_date: str = None, to_date: str = None):
    stmt = (
        select(ARReceipt)
        .where(ARReceipt.customer_id == customer_id)
        .where(ARReceipt.is_active == True)
        .order_by(desc(ARReceipt.receipt_date))
    )
    result = await db.execute(stmt)
    return result.scalars().all()

# ----------------------------------------------------------
# UPDATED: 4. UPDATE CUSTOMER + VERIFY + ALLOCATE
# ----------------------------------------------------------
async def update_customer_and_verify(
    db: AsyncSession, 
    receipt_id: int, 
    data: schemas.VerifyCustomerUpdate
):
    # 1. Fetch the Receipt
    stmt = select(ARReceipt).where(
        ARReceipt.receipt_id == receipt_id,
        ARReceipt.pending_verification == True
    )
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        return None 

    # 2. Update Receipt Details
    if data.customer_id and data.customer_id != 0:
        record.customer_id = data.customer_id
    
    record.bank_charges = data.bank_charges
    # We don't have a specific column for 'tax_deduction' in the standard ARReceipt model 
    # based on your file, but we can store it in 'tax_rate' or a new column if exists.
    # For now, I'll assume we just update the basic fields.
    
    record.pending_verification = False
    record.modified_on = datetime.now()

    # 3. PROCESS ALLOCATIONS (Update Invoice Balances)
    # This loop updates the 'PaidAmount' on the Invoice Header table.
    # IMPORTANT: This assumes you have a 'PaidAmount' column in tbl_salesinvoices_header.
    
    for alloc in data.allocations:
        if alloc.amount_allocated > 0:
            # SQL to update the invoice balance
            update_invoice_sql = text("""
                UPDATE btg_userpanel_uat.tbl_salesinvoices_header
                SET PaidAmount = IFNULL(PaidAmount, 0) + :amount
                WHERE id = :inv_id
            """)
            await db.execute(update_invoice_sql, {
                "amount": alloc.amount_allocated,
                "inv_id": alloc.invoice_id
            })

            # OPTIONAL: Insert into a history/allocation table if you have one
            # insert_alloc_sql = ...

    await db.commit()
    await db.refresh(record)

    return record

# ----------------------------------------------------------
# NEW: SAVE DRAFT (Updates Receipt fields but KEEPS pending_verification=True)
# ----------------------------------------------------------
async def save_verification_draft(
    db: AsyncSession, 
    receipt_id: int, 
    data: schemas.SaveDraftRequest
):
    stmt = select(ARReceipt).where(ARReceipt.receipt_id == receipt_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        return None 

    # 1. Update Basic Fields
    if data.customer_id:
        record.customer_id = data.customer_id
    
    record.bank_charges = data.bank_charges
    # storing tax_deduction in 'tax_rate' column if no other column exists, 
    # OR you need to ensure you have a column for it. 
    # record.tax_rate = data.tax_deduction 

    # 2. Handle Allocations (If we want to save them as drafts)
    # Without a draft table, we can't easily save "partial" checkboxes safely.
    # For now, we will just save the Receipt level details.
    
    record.modified_on = datetime.now()
    # vital: pending_verification remains True
    
    await db.commit()
    await db.refresh(record)
    return record

# ----------------------------------------------------------
# UPDATE REFERENCE NUMBER (For AR Book Editing)
# ----------------------------------------------------------
async def update_invoice_reference(db: AsyncSession, invoice_id: int, new_reference: str):
    try:
        # Update the Sales Invoice Header table
        query = text("""
            UPDATE btg_userpanel_uat.tbl_salesinvoices_header 
            SET salesinvoicenbr = :ref 
            WHERE id = :id
        """)
        
        result = await db.execute(query, {"ref": new_reference, "id": invoice_id})
        await db.commit()
        
        # Return True if a row was actually updated
        return result.rowcount > 0
    except Exception as e:
        print(f"Error updating reference: {e}")
        await db.rollback()
        return False

async def bulk_update_ar_reference(db: AsyncSession, ar_ids: List[int], new_reference: str):
    try:
        # 1. Update Accounts Receivable Table (This reflects in the Report)
        query_ar = text("""
            UPDATE tbl_accounts_receivable 
            SET invoice_no = :ref 
            WHERE ar_id IN :ids
        """)
        
        # 2. Optional: Update Header Table too (To keep them in sync if they are linked)
        # Note: This assumes 'ar_id' in AR table corresponds to 'id' in Header, 
        # or there is a link. If not, only run the first query.
        
        await db.execute(query_ar, {"ref": new_reference, "ids": tuple(ar_ids)})
        await db.commit()
        
        return True
    except Exception as e:
        print(f"Error bulk updating reference: {e}")
        await db.rollback()
        return False