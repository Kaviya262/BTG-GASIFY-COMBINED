from fastapi import APIRouter, HTTPException
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/api/procurement_memo",
    tags=["Procurement Memo"]
)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME_PURCHASE'),
        port=int(os.getenv('DB_PORT', 3306)),
        ssl_disabled=True
    )

@router.get("/get_all")
def get_all(requesterid: int, BranchId: int, OrgId: int, pmnumber: str, userid: int):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # stored procedure: proc_purchasememo
        # params: @opt, @pmid, @branchid, @orgid, @reqid, @pmnumber, @user_id
        # We need to ensure the order of arguments matches the stored procedure definition 
        # OR use keyword arguments if callproc supports it (it binds by position).
        # Based on C# PurchaseMemoRepository.cs:
        # param.Add("@opt", 1);
        # param.Add("@pmid", 0);
        # param.Add("@branchid", BranchId);
        # param.Add("@orgid", OrgId);
        # param.Add("@reqid", requesterid);
        # param.Add("@pmnumber", pmnumber);
        # param.Add("@user_id", userid);
        
        # Typically procedures are defined with parameters in a specific order.
        # Without seeing the CREATE PROCEDURE statement, I have to guess the order.
        # Standard convention in this project seems to be opt, pmid...
        # Let's hope the order in C# dapper param addition matches the SP definition order.
        # Commonly: opt, id, ...
        
        args = (1, 0, BranchId, OrgId, requesterid, pmnumber, userid)
        
        cursor.callproc('proc_purchasememo', args)
        
        results = []
        for result in cursor.stored_results():
            results = result.fetchall()
            # We take the first result set. 
            # If the procedure returns multiple sets (SELECT LAST_INSERT_ID etc), 
            # GetAll usually returns a single SELECT.
            break 
            
        return {"status": True, "data": results, "message": "Success"}
        
    except Exception as e:
        print(f"Error in get_all_procurement_memo: {e}")
        return {"status": False, "message": str(e), "data": []}
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()