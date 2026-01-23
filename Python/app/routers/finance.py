from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .. import schemas, crud, database
from sqlalchemy import text
# --- IMPORTS FOR AR BOOK LOGIC ---
import mysql.connector
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
# -------------------------------

router = APIRouter(
    prefix="/api/AR",
    tags=["Accounts Receivable"]
)

# --------------------------------------------------
# 1. NEW SCHEMA FOR AR BOOK REQUEST
# --------------------------------------------------
class ARBookRequest(BaseModel):
    org_id: int
    branch_id: int
    customer_id: int # Customer ID is required for the calculation
    from_date: Optional[date] = None
    to_date: Optional[date] = None

# --------------------------------------------------
# 2. DB HELPER (SYNC) FOR REPORTING
# --------------------------------------------------
def get_db_connection_sync():
    """
    Returns a raw MySQL connection for the AR Book reporting logic.
    """
    return mysql.connector.connect(
        host="localhost",       # UPDATE THIS
        user="root",            # UPDATE THIS
        password="password",    # UPDATE THIS
        database="btg_finance_uat" # Ensure this matches your DB Name
    )

# --------------------------------------------------
# 3. UPDATED ENDPOINT: CALLING STORED PROCEDURE
# --------------------------------------------------
@router.post("/get_ar_book")
def get_ar_book(request: ARBookRequest):
    """
    Fetches the AR Book by calling the updated MySQL Stored Procedure `proc_ar_book`.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection_sync()
        cursor = conn.cursor(dictionary=True)

        # Arguments matching the stored procedure signature:
        # p_orgid, p_branchid, p_customer_id, p_from_date, p_to_date
        args = (
            request.org_id, 
            request.branch_id, 
            request.customer_id, 
            request.from_date, 
            request.to_date
        )

        # Execute Stored Procedure
        cursor.callproc('proc_ar_book', args)

        # Fetch results
        # When using callproc, results are stored in separate result sets
        result_rows = []
        for result in cursor.stored_results():
            result_rows = result.fetchall()

        # Handle Date serialization (convert date objects to strings for JSON)
        for row in result_rows:
            if row.get('ledger_date'):
                row['ledger_date'] = str(row['ledger_date'])
            
            # The SP already returns 'debit_note_amount' and 'credit_note_amount'
            # which matches exactly what your React frontend needs.

        return {
            "status": True, 
            "message": "Success", 
            "data": result_rows
        }

    except mysql.connector.Error as err:
        print(f"Database Error: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    
    except Exception as e:
        print(f"General Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# ==============================================================================
# EXISTING ENDPOINTS (UNCHANGED)
# ==============================================================================

# --------------------------------------------------
# CREATE AR RECEIPT
# --------------------------------------------------
@router.post("/create")
async def create_ar_receipt_endpoint(
    command: schemas.CreateARCommand,
    db: AsyncSession = Depends(database.get_db)
):
    """
    Creates a new AR Receipt (Bank Book).
    """
    try:
        new_receipts = await crud.create_ar_receipt(db, command)
        
        if new_receipts:
             return {
                "status": "success",
                "message": f"Created {len(new_receipts)} record(s)",
                "data": new_receipts
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to create receipt")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# GET ALL PENDING RECEIPTS (pending_verification = 1)
# --------------------------------------------------
@router.get("/get-pending-list")
async def get_pending_list(db: AsyncSession = Depends(database.get_db)):
    """
    Get all Bank Book entries where pending_verification = 1.
    """
    try:
        results = await crud.get_pending_bank_books(db)
        return {
            "status": "success",
            "count": len(results),
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# GET RECEIPT BY ID
# --------------------------------------------------
@router.get("/get-by-id")
async def get_by_id(receipt_id: int, db: AsyncSession = Depends(database.get_db)):
    """
    Get a specific Bank Book entry by its receipt_id.
    """
    try:
        result = await crud.get_receipt_by_id(db, receipt_id)

        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Receipt with ID {receipt_id} not found"
            )

        return {"status": "success", "data": result}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# UPDATE CUSTOMER + VERIFY RECEIPT
# --------------------------------------------------
@router.put("/verify/{receipt_id}")
async def verify_receipt(
    receipt_id: int,
    data: schemas.VerifyCustomerUpdate,
    db: AsyncSession = Depends(database.get_db)
):
    try:
        updated = await crud.update_customer_and_verify(
            db, receipt_id, data.customer_id
        )

        if not updated:
            raise HTTPException(
                status_code=404,
                detail="Receipt not found OR already verified."
            )

        return {
            "status": "success",
            "message": "Receipt updated and verification completed.",
            "data": updated
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# --------------------------------------------------
# GET VERIFIED UNSUBMITTED LIST
# --------------------------------------------------
@router.get("/get-verified-unsubmitted")
async def get_verified_unsubmitted(db: AsyncSession = Depends(database.get_db)):
    try:
        results = await crud.get_verified_unsubmitted_books(db)
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# SUBMIT RECEIPT
# --------------------------------------------------
@router.put("/submit/{receipt_id}")
async def submit_receipt(receipt_id: int, db: AsyncSession = Depends(database.get_db)):
    try:
        success = await crud.submit_receipt(db, receipt_id)
        if not success:
            raise HTTPException(status_code=404, detail="Receipt not found")
        return {"status": "success", "message": "Receipt submitted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# ----------------------------------------------------------
# UPDATE AR RECEIPT (PUT)
# ----------------------------------------------------------
@router.put("/update")
async def update_ar_receipt_endpoint(
    command: schemas.CreateARCommand, 
    db: AsyncSession = Depends(database.get_db)
):
    try:
        # Call the update function in CRUD
        updated_count = await crud.update_ar_receipt(db, command)
        
        if updated_count > 0:
            return {"status": "success", "message": "Receipt updated successfully"}
        else:
            # If no rows matched the ID, it might be invalid
            raise HTTPException(status_code=404, detail="Receipt ID not found or no changes made")
            
    except Exception as e:
        print(f"Error updating receipt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
# ----------------------------------------------------------
# (OLD) GET BOOK
# ----------------------------------------------------------
@router.get("/get-book")
async def get_ar_book_endpoint_legacy(
    customer_id: int, 
    from_date: str = None, 
    to_date: str = None, 
    db: AsyncSession = Depends(database.get_db)
):
    try:
        # Call the CRUD function to get history
        results = await crud.get_ar_book(db, customer_id, from_date, to_date)
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# --------------------------------------------------
# NEW ENDPOINT: GET OUTSTANDING INVOICES
# --------------------------------------------------
@router.get("/get-outstanding-invoices/{customer_id}")
async def get_outstanding_invoices(customer_id: int, db: AsyncSession = Depends(database.get_db)):
    """
    Fetches invoices for a customer where the Balance Due > 0.
    Calculates Balance Due as: TotalAmount - (Already Paid Amount).
    """
    try:
        # LOGIC:
        # We assume 'PaidAmount' exists in your header table, or we calculate it from previous allocations.
        # For this example, I will assume a 'PaidAmount' column exists or we calculate it.
        # If you don't have a 'PaidAmount' column, let me know, and we'll need a different SQL approach.
        
        query = text("""
            SELECT 
                h.id as invoice_id,
                h.salesinvoicenbr as invoice_no,
                DATE_FORMAT(h.Salesinvoicesdate, '%d-%m-%Y') as invoice_date,
                h.TotalAmount as total_amount,
                (h.TotalAmount - IFNULL(h.PaidAmount, 0)) as balance_due
            FROM btg_userpanel_uat.tbl_salesinvoices_header h
            WHERE h.customerid = :cust_id
              AND (h.TotalAmount - IFNULL(h.PaidAmount, 0)) > 0
              AND h.IsSubmitted = 1 -- Only show posted invoices
            ORDER BY h.Salesinvoicesdate ASC
        """)
        
        result = await db.execute(query, {"cust_id": customer_id})
        invoices = result.mappings().all()
        
        return {"status": "success", "data": invoices}

    except Exception as e:
        print(f"Error fetching outstanding invoices: {e}")
        return {"status": "error", "detail": str(e)}

# --------------------------------------------------
# UPDATED: VERIFY RECEIPT
# --------------------------------------------------
@router.put("/verify/{receipt_id}")
async def verify_receipt(
    receipt_id: int,
    data: schemas.VerifyCustomerUpdate, # Uses the NEW Schema
    db: AsyncSession = Depends(database.get_db)
):
    try:
        # Call the updated CRUD function
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
    

# ----------------------------------------------------------
# NEW ENDPOINT: UPDATE REFERENCE NO
# ----------------------------------------------------------
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
    """
    Updates the Invoice Number (Reference) for multiple AR entries at once.
    """
    success = await crud.bulk_update_ar_reference(db, payload.ids, payload.new_reference)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update records.")
        
    return {"status": "success", "message": "Records updated successfully"}