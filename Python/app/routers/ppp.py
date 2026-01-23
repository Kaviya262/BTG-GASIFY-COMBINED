from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import mysql.connector
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/PeriodicPaymentPlan",
    tags=["Periodic Payment Plan"]
)

def get_db_connection_finance():
    """Get connection to Finance database"""
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME_FINANCE'),
        ssl_disabled=True
    )

@router.get("/GetAll")
async def get_all_ppp(Id: int, orgid: int, BranchId: int, UserId: int):
    """
    Get all Periodic Payment Plan details
    This replaces the .NET API endpoint: /PeriodicPaymentPlan/GetAll
    """
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection_finance()
        cursor = conn.cursor(dictionary=True)
        
        # Query to get PPP data - adjust table/column names based on your schema
        query = """
            SELECT 
                *
            FROM tbl_periodic_payment_plan
            WHERE org_id = %s 
            AND branch_id = %s
            ORDER BY created_date DESC
        """
        
        cursor.execute(query, (orgid, BranchId))
        results = cursor.fetchall()
        
        return {
            "status": True,
            "message": "Success",
            "data": results
        }
        
    except mysql.connector.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


class CreatePPPRequest(BaseModel):
    approve: dict
    userId: int
    orgid: int
    branchid: int


@router.post("/Create")
async def create_ppp(request: CreatePPPRequest):
    """
    Create/Save Periodic Payment Plan voucher
    This replaces the .NET API endpoint: /PeriodicPaymentPlan/Create
    """
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection_finance()
        cursor = conn.cursor()
        
        # Insert PPP data - adjust based on your schema
        # This is a placeholder - you'll need to adjust based on actual table structure
        insert_query = """
            INSERT INTO tbl_periodic_payment_plan 
            (org_id, branch_id, user_id, created_date, status)
            VALUES (%s, %s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (
            request.orgid,
            request.branchid,
            request.userId,
            datetime.now(),
            'Created'
        ))
        
        conn.commit()
        
        return {
            "status": True,
            "message": "PPP created successfully",
            "data": {"id": cursor.lastrowid}
        }
        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.get("/GetVoucher")
async def get_voucher(VoucherId: int, orgid: int, BranchId: int):
    """
    Get Payment Voucher details
    This replaces the .NET API endpoint: /PeriodicPaymentPlan/GetVoucher
    """
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection_finance()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT *
            FROM tbl_payment_voucher
            WHERE voucher_id = %s
            AND org_id = %s
            AND branch_id = %s
        """
        
        cursor.execute(query, (VoucherId, orgid, BranchId))
        result = cursor.fetchone()
        
        if not result:
            return {
                "status": False,
                "message": "Voucher not found",
                "data": None
            }
        
        return {
            "status": True,
            "message": "Success",
            "data": result
        }
        
    except mysql.connector.Error as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
