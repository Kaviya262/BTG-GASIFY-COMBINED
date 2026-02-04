from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from . import schemas
from .models.finance import ARReceipt
from sqlalchemy import select, desc, update
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# --- UPDATED DEFAULTS TO LIVE DATABASES ---
DB_NAME_FINANCE = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')
DB_NAME_USER = os.getenv('DB_NAME_USER', 'btggasify_live')
DB_NAME_USER_NEW = os.getenv('DB_NAME_USER_NEW', 'btggasify_userpanel_live')

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
        is_posted = item.is_posted
        pending_verification = True if is_posted else False

        db_receipt = ARReceipt(
            orgid=command.orgId,
            branchid=command.branchId,
            created_by=str(command.userId),
            created_ip=command.userIp,
            
            # 🟢 FIX: Use the User-Selected Date (Transaction Date), NOT Today's Date
            receipt_date=item.receipt_date, 
            
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
    record.tax_rate = data.tax_deduction 
    record.exchange_rate = data.exchange_rate
    
    if data.reply_message:
        current_desc = record.reference_no or ""
        record.reference_no = f"{current_desc} | Reply: {data.reply_message}"

    record.pending_verification = False
    record.modified_on = datetime.now()

    # 3. PROCESS ALLOCATIONS (Update Invoice Balances)
    for alloc in data.allocations:
        if alloc.amount_allocated > 0:
            update_invoice_sql = text(f"""
                UPDATE {DB_NAME_USER_NEW}.tbl_salesinvoices_header
                SET PaidAmount = IFNULL(PaidAmount, 0) + :amount
                WHERE id = :inv_id
            """)
            await db.execute(update_invoice_sql, {
                "amount": alloc.amount_allocated,
                "inv_id": alloc.invoice_id
            })

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
        .values(is_submitted=True, pending_verification=True)
        .execution_options(synchronize_session="fetch")
    )
    
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0


# ----------------------------------------------------------
# 6. Post to AR (UPSERT LOGIC)
# ----------------------------------------------------------
# ----------------------------------------------------------
# 6. Post to AR (UPSERT LOGIC + AUTO CLEANUP)
# ----------------------------------------------------------
async def post_invoice_to_ar(db: AsyncSession, request: schemas.PostInvoiceToARRequest):
    try:
        # 1. Check if AR entry already exists for this Invoice ID
        check_sql = text(f"SELECT ar_id, already_received FROM {DB_NAME_FINANCE}.tbl_accounts_receivable WHERE invoice_id = :inv_id")
        result = await db.execute(check_sql, {"inv_id": str(request.invoiceId)})
        existing_row = result.fetchone()

        if existing_row:
            # --- UPDATE SCENARIO ---
            print(f"Updating existing AR record for Invoice ID: {request.invoiceId}")
            
            update_ar_sql = text(f"""
                UPDATE {DB_NAME_FINANCE}.tbl_accounts_receivable ar
                JOIN {DB_NAME_USER_NEW}.tbl_salesinvoices_header h ON ar.invoice_id = h.id
                SET 
                    ar.inv_amount = h.TotalAmount,
                    ar.invoice_amt_idr = h.CalculatedPrice,
                    ar.balance_amount = (h.TotalAmount - ar.already_received),
                    ar.updated_by = :userId,
                    ar.updated_date = NOW()
                WHERE ar.invoice_id = :inv_id
            """)
            
            await db.execute(update_ar_sql, {"userId": request.userId, "inv_id": str(request.invoiceId)})

        else:
            # --- INSERT SCENARIO ---
            print(f"Inserting new AR record for Invoice ID: {request.invoiceId}")
            
            insert_sql = text(f"""
                INSERT INTO {DB_NAME_FINANCE}.tbl_accounts_receivable (
                    orgid, branchid, 
                    ar_no, 
                    invoice_no, invoice_id, invoice_date, 
                    customer_id, customer_name, 
                    inv_amount, balance_amount, already_received, 
                    invoice_amt_idr, currencyid, 
                    created_by, created_ip, created_date, 
                    is_active, is_partial
                )
                SELECT 
                    :orgId, :branchId,
                    CONCAT('AR-', h.salesinvoicenbr), 
                    h.salesinvoicenbr, 
                    h.id, 
                    h.Salesinvoicesdate,
                    h.customerid, 
                    IFNULL(c.CustomerName, 'Unknown'), 
                    h.TotalAmount, 
                    h.TotalAmount, 
                    0, 
                    h.CalculatedPrice, 
                    
                    (SELECT COALESCE(d.Currencyid, 1) 
                     FROM {DB_NAME_USER_NEW}.tbl_salesinvoices_details d 
                     WHERE d.salesinvoicesheaderid = h.id 
                     LIMIT 1), 
                     
                    :userId, '127.0.0.1', NOW(), 
                    1, 0
                FROM {DB_NAME_USER_NEW}.tbl_salesinvoices_header h
                LEFT JOIN {DB_NAME_USER_NEW}.master_customer c ON h.customerid = c.Id
                WHERE h.id = :inv_id
            """)
            
            await db.execute(insert_sql, {
                "orgId": request.orgId, 
                "branchId": request.branchId, 
                "userId": request.userId, 
                "inv_id": str(request.invoiceId)
            })

        # ---------------------------------------------------------
        # 🟢 NEW LOGIC: Deactivate relevant DOs from AR Book
        # ---------------------------------------------------------
        # This prevents "Ghost" DOs from staying active after being converted to an Invoice.
        deactivate_dos_sql = text(f"""
            UPDATE {DB_NAME_FINANCE}.tbl_accounts_receivable
            SET is_active = 0
            WHERE is_active = 1
              AND invoice_no IN (
                  SELECT DISTINCT DOnumber 
                  FROM {DB_NAME_USER_NEW}.tbl_salesinvoices_details 
                  WHERE salesinvoicesheaderid = :inv_id 
                    AND DOnumber IS NOT NULL 
                    AND DOnumber != ''
              )
        """)
        await db.execute(deactivate_dos_sql, {"inv_id": str(request.invoiceId)})

        # ---------------------------------------------------------
        # 3. UPDATE HEADER FLAG
        # ---------------------------------------------------------
        update_header_flag_sql = text(f"""
            UPDATE {DB_NAME_USER_NEW}.tbl_salesinvoices_header 
            SET IsAR = 1 
            WHERE id = :inv_id
        """)
        
        await db.execute(update_header_flag_sql, {"inv_id": str(request.invoiceId)})

        await db.commit()
        return True

    except Exception as e:
        print(f"CRITICAL ERROR in post_invoice_to_ar: {str(e)}")
        await db.rollback()
        return False

# ----------------------------------------------------------
# 7. UPDATE AR RECEIPT
# ----------------------------------------------------------
async def update_ar_receipt(db: AsyncSession, command: schemas.CreateARCommand):
    updated_count = 0
    
    for item in command.header:
        is_cleared_status = False
        if item.deposit_bank_id and str(item.deposit_bank_id) != "0" and str(item.deposit_bank_id).strip() != "":
            is_cleared_status = True

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
            "reference_no": item.reference_no,
            "sales_person_id": item.sales_person_id,
            "send_notification": item.send_notification,
            "is_posted": is_posted,
            "pending_verification": pending_verification,
            "flag": is_cleared_status,
            "is_cleared": is_cleared_status,
            "proof_missing": item.proof_missing,
            "contra_reference": item.contra_reference,
            # 🟢 FIX: Update receipt_date on Edit too
            "receipt_date": item.receipt_date
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
# SAVE DRAFT
# ----------------------------------------------------------
async def save_verification_draft(db: AsyncSession, receipt_id: int, data: schemas.SaveDraftRequest):
    stmt = select(ARReceipt).where(ARReceipt.receipt_id == receipt_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        return None 

    if data.customer_id:
        record.customer_id = data.customer_id
    
    record.bank_charges = data.bank_charges
    record.tax_rate = data.tax_deduction
    record.exchange_rate = data.exchange_rate
    
    record.modified_on = datetime.now()
    
    await db.commit()
    await db.refresh(record)
    return record

# ----------------------------------------------------------
# UPDATE REFERENCE NUMBER (For AR Book Editing)
# ----------------------------------------------------------
async def update_invoice_reference(db: AsyncSession, invoice_id: int, new_reference: str):
    try:
        query = text(f"""
            UPDATE {DB_NAME_USER_NEW}.tbl_salesinvoices_header 
            SET salesinvoicenbr = :ref 
            WHERE id = :id
        """)
        
        result = await db.execute(query, {"ref": new_reference, "id": invoice_id})
        await db.commit()
        return result.rowcount > 0
    except Exception as e:
        print(f"Error updating reference: {e}")
        await db.rollback()
        return False

# 🟢 FIXED BULK UPDATE LOGIC TO PREVENT DUPLICATE ERRORS
async def bulk_update_ar_reference(db: AsyncSession, ar_ids: List[int], new_reference: str):
    try:
        if not ar_ids:
            return 0 

        updated_count = 0

        for ar_id in ar_ids:
            # 🟢 FIXED: Removed the if-index logic that added suffixes like -1, -2
            unique_ref = new_reference

            # 1. Update Details (Preserve DO Linkage)
            preserve_do_query = text(f"""
                UPDATE {DB_NAME_USER_NEW}.tbl_salesinvoices_details d
                INNER JOIN {DB_NAME_FINANCE}.tbl_accounts_receivable ar 
                    ON d.salesinvoicesheaderid = ar.invoice_id
                SET d.DOnumber = :ref
                WHERE ar.ar_id = :id
            """)
            await db.execute(preserve_do_query, {"id": ar_id, "ref": unique_ref})
            
            # 2. Update Finance AR Table
            query_finance = text(f"""
                UPDATE {DB_NAME_FINANCE}.tbl_accounts_receivable 
                SET invoice_no = :ref 
                WHERE ar_id = :id
            """)
            await db.execute(query_finance, {"ref": unique_ref, "id": ar_id})

            # 3. Update Sales Header Table
            query_sales = text(f"""
                UPDATE {DB_NAME_USER_NEW}.tbl_salesinvoices_header
                SET salesinvoicenbr = :ref
                WHERE id IN (
                    SELECT invoice_id 
                    FROM {DB_NAME_FINANCE}.tbl_accounts_receivable 
                    WHERE ar_id = :id
                )
            """)
            await db.execute(query_sales, {"ref": unique_ref, "id": ar_id})
            
            updated_count += 1

        await db.commit()
        return updated_count

    except Exception as e:
        print(f"CRITICAL DB ERROR in bulk_update: {str(e)}")
        await db.rollback()
        return -1