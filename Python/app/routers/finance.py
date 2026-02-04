from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import schemas, crud, database
from sqlalchemy import text
import mysql.connector
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
import os
from dotenv import load_dotenv

load_dotenv()

# --- UPDATED DEFAULTS TO LIVE DATABASES ---
DB_NAME_FINANCE = os.getenv('DB_NAME_FINANCE', 'btggasify_finance_live')
DB_NAME_USER = os.getenv('DB_NAME_USER', 'btggasify_live')
DB_NAME_USER_NEW = os.getenv('DB_NAME_USER_NEW', 'btggasify_userpanel_live')
DB_NAME_MASTER = os.getenv('DB_NAME_MASTER', 'btggasify_masterpanel_live')
DB_NAME_OLD = os.getenv('DB_NAME_OLD', 'btggasify_live')

router = APIRouter(
    prefix="/AR",
    tags=["Accounts Receivable"]
)

# --------------------------------------------------
# 1. NEW SCHEMA FOR AR BOOK REQUEST
# --------------------------------------------------
class ARBookRequest(BaseModel):
    org_id: int
    branch_id: int
    customer_id: int 
    from_date: Optional[date] = None
    to_date: Optional[date] = None

# --------------------------------------------------
# 2. DB HELPER (SYNC) FOR REPORTING
# --------------------------------------------------
def get_db_connection_sync():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=DB_NAME_FINANCE,
        ssl_disabled=True 
    )

# --------------------------------------------------
# 3. CALLING STORED PROCEDURE
# --------------------------------------------------
@router.post("/get_ar_book")
def get_ar_book(request: ARBookRequest):
    conn = None
    cursor = None
    try:
        conn = get_db_connection_sync()
        cursor = conn.cursor(dictionary=True)

        args = (
            request.org_id, 
            request.branch_id, 
            request.customer_id, 
            request.from_date, 
            request.to_date
        )

        cursor.callproc('proc_ar_book', args)

        result_rows = []
        for result in cursor.stored_results():
            result_rows = result.fetchall()

        for row in result_rows:
            if row.get('ledger_date'):
                row['ledger_date'] = str(row['ledger_date'])

        return {
            "status": True, 
            "message": "Success", 
            "data": result_rows
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# --------------------------------------------------
# 4. GET AR BOOK COMPATIBILITY ENDPOINT
# --------------------------------------------------
@router.get("/getARBook")
def get_ar_book_get(
    orgid: int = 1,
    branchid: int = 1,
    customer_id: int = 0,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None
):
    conn = None
    cursor = None
    try:
        conn = get_db_connection_sync()
        cursor = conn.cursor(dictionary=True)

        args = (
            orgid, 
            branchid, 
            customer_id, 
            from_date, 
            to_date
        )

        cursor.callproc('proc_ar_book', args)

        result_rows = []
        for result in cursor.stored_results():
            result_rows = result.fetchall()

        for row in result_rows:
            if row.get('ledger_date'):
                row['ledger_date'] = str(row['ledger_date'])

        return {
            "status": True, 
            "message": "Success", 
            "data": result_rows
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# --------------------------------------------------
# CREATE AR RECEIPT
# --------------------------------------------------
@router.post("/create")
async def create_ar_receipt(
    command: schemas.CreateARCommand,
    db: AsyncSession = Depends(database.get_db)
):
    try:
        new_receipts = await crud.create_ar_receipt(db, command)
        return {
            "status": "success",
            "message": "Receipt(s) created successfully",
            "data": new_receipts
        }
    except Exception as e:
        print(f"Error creating AR receipt: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# GET ALL PENDING RECEIPTS
# --------------------------------------------------
@router.get("/get-pending-list")
async def get_pending_list(
    user_id: Optional[int] = None, 
    department: Optional[str] = None, 
    db: AsyncSession = Depends(database.get_db)
):
    try:
        # Base WHERE clause
        where_clause = "WHERE r.pending_verification = 1 AND r.is_active = 1"
        query_params = {}

        # LOGIC: If Department is '9' (Sales), filter by sales_person_id
        if department == '9' and user_id is not None:
            where_clause += " AND r.sales_person_id = :user_id"
            query_params["user_id"] = user_id

        query = text(f"""
            SELECT 
                r.*, 
                COALESCE(mc.CurrencyCode, 'IDR') as CurrencyCode,
                c.CustomerName
            FROM tbl_ar_receipt r
            LEFT JOIN {DB_NAME_USER_NEW}.master_customer c ON r.customer_id = c.Id
            LEFT JOIN {DB_NAME_MASTER}.master_bank b ON r.deposit_bank_id = b.BankId
            LEFT JOIN {DB_NAME_USER}.master_currency mc ON b.CurrencyId = mc.CurrencyId
            {where_clause}
            ORDER BY r.receipt_id DESC
        """)
        
        result = await db.execute(query, query_params)
        results = result.mappings().all()
        
        return {
            "status": "success",
            "count": len(results),
            "data": results
        }
    except Exception as e:
        print(f"Error fetching pending list: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# VERIFY RECEIPT
# --------------------------------------------------
@router.put("/verify/{receipt_id}")
async def verify_receipt(
    receipt_id: int,
    data: schemas.VerifyCustomerUpdate,
    db: AsyncSession = Depends(database.get_db)
):
    try:
        updated = await crud.update_customer_and_verify(
            db, receipt_id, data
        )

        if not updated:
            raise HTTPException(
                status_code=404,
                detail="Receipt not found OR already verified."
            )

        return {
            "status": "success",
            "message": "Verification posted successfully.",
            "data": updated
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --------------------------------------------------
# SAVE DRAFT
# --------------------------------------------------
@router.put("/save-draft/{receipt_id}")
async def save_draft(
    receipt_id: int,
    data: schemas.SaveDraftRequest,
    db: AsyncSession = Depends(database.get_db)
):
    try:
        saved_record = await crud.save_verification_draft(db, receipt_id, data)
        
        if not saved_record:
            raise HTTPException(status_code=404, detail="Receipt not found")

        return {
            "status": "success",
            "message": "Draft saved successfully",
            "data": saved_record
        }
    except Exception as e:
        print(f"Error saving draft: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --------------------------------------------------
# GET OUTSTANDING INVOICES
# --------------------------------------------------
@router.get("/get-outstanding-invoices/{customer_id}")
async def get_outstanding_invoices(customer_id: int, db: AsyncSession = Depends(database.get_db)):
    try:
        query = text(f"""
            SELECT 
                h.id as invoice_id,
                h.salesinvoicenbr as invoice_no,
                DATE_FORMAT(h.Salesinvoicesdate, '%d-%m-%Y') as invoice_date,
                h.TotalAmount as total_amount,
                (h.TotalAmount - IFNULL(h.PaidAmount, 0)) as balance_due
            FROM {DB_NAME_USER_NEW}.tbl_salesinvoices_header h
            WHERE h.customerid = :cust_id
              AND (h.TotalAmount - IFNULL(h.PaidAmount, 0)) > 0
              AND h.IsSubmitted = 1
            ORDER BY h.Salesinvoicesdate ASC
        """)
        
        result = await db.execute(query, {"cust_id": customer_id})
        invoices = result.mappings().all()
        
        return {"status": "success", "data": invoices}

    except Exception as e:
        print(f"Error fetching outstanding invoices: {e}")
        return {"status": "error", "detail": str(e)}

# --------------------------------------------------
# UPDATE REFERENCE ENDPOINTS
# --------------------------------------------------
@router.put("/update-reference")
async def update_reference_endpoint(
    payload: schemas.UpdateReferenceRequest,
    db: AsyncSession = Depends(database.get_db)
):
    success = await crud.update_invoice_reference(db, payload.id, payload.new_reference)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update reference. ID might not exist.")
        
    return {"status": "success", "message": "Reference updated successfully"}


@router.put("/bulk-update-reference")
async def bulk_update_reference(
    payload: schemas.BulkUpdateReferenceRequest,
    db: AsyncSession = Depends(database.get_db)
):
    updated_count = await crud.bulk_update_ar_reference(db, payload.ids, payload.new_reference)
    
    if updated_count == -1:
        raise HTTPException(status_code=500, detail="Database error occurred.")
    
    if updated_count == 0:
        raise HTTPException(status_code=404, detail=f"No records found for IDs: {payload.ids}")
        
    return {
        "status": "success", 
        "message": f"Successfully updated {updated_count} records."
    }

# --------------------------------------------------
# POST INVOICE TO AR
# --------------------------------------------------
@router.post("/post-invoice")
async def post_invoice_endpoint(
    payload: schemas.PostInvoiceToARRequest,
    db: AsyncSession = Depends(database.get_db)
):
    success = await crud.post_invoice_to_ar(db, payload)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to post Invoice to AR Book.")
        
    return {"status": "success", "message": "Invoice posted to AR Book successfully"}