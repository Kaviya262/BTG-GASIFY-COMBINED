from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import text
from ..database import engine 

router = APIRouter()

# ==========================================
# 1. DEFINE ALL MODELS
# ==========================================

# --- Filter Models ---
class InvoiceFilter(BaseModel):
    customerid: int = 0
    FromDate: str
    ToDate: str
    BranchId: int = 1
    IsAR: int = 0  # <--- Added IsAR Flag (Default 0)

# --- FIXED MODEL: Added Optional[] to handle NULLs from database ---
class SalesReportItem(BaseModel):
    Salesinvoicesdate: Optional[str] = ""
    CustomerName: Optional[str] = ""
    InvoiceCurrency: Optional[str] = "" # Handles NULL currency
    InvoiceNo: Optional[str] = ""
    ItemName: Optional[str] = ""        # Handles NULL item names
    Qty: float
    UnitPrice: float
    Total: float

class DOFilter(BaseModel):
    customerid: int
    gascodeid: Optional[int] = 0 # Optional, default to 0

# --- Response Models ---
class InvoiceListItem(BaseModel):
    InvoiceId: int
    InvoiceNbr: str
    Salesinvoicesdate: str
    CustomerName: str
    PONumber: Optional[str] = ""
    CurrencyCode: Optional[str] = ""
    TotalAmount: float
    CalculatedPrice: float
    Status: str

class InvoiceItemDetail(BaseModel):
    Id: int
    gascodeid: int
    PickedQty: float
    UnitPrice: float
    TotalPrice: float
    Currencyid: int
    ExchangeRate: float
    # Add 'ref_do_id' if you want to expose which DO this line came from

class InvoiceFullDetail(BaseModel):
    InvoiceId: int
    InvoiceNbr: str
    Salesinvoicesdate: str
    CustomerName: str
    customerid: int
    TotalAmount: float
    CalculatedPrice: float
    Status: str
    Items: List[InvoiceItemDetail] = []

# --- Request Models (Manual Invoice) ---
class InvoiceDetailItem(BaseModel):
    gascodeid: int
    PickedQty: float
    UnitPrice: float
    Currencyid: int  
    # ... other detail fields

class CreateInvoiceRequest(BaseModel):
    customerid: int
    Salesinvoicesdate: str
    items: List[InvoiceDetailItem]
    # ... other header fields

# --- Request Models (Convert DO) ---
class ConvertDORequest(BaseModel):
    customerid: int
    do_ids: List[int] # List of selected Delivery Order IDs
    created_by: int = 1

# ==========================================
# 2. API ENDPOINTS
# ==========================================

# --- 1. Create Manual Invoice ---
@router.post("/CreateInvoice")
async def create_invoice(invoice: CreateInvoiceRequest):
    async with engine.begin() as conn: # automatic transaction handling
        try:
            # 1. Create the Header first (Initial Insert)
            header_query = text("""
                INSERT INTO btg_userpanel_uat.tbl_salesinvoices_header 
                (customerid, Salesinvoicesdate, TotalAmount, IsSubmitted, CalculatedPrice, createdby)
                VALUES (:cust, :date, 0, 0, 0, 1)
            """)
            result = await conn.execute(header_query, {
                "cust": invoice.customerid,
                "date": invoice.Salesinvoicesdate
            })
            new_header_id = result.lastrowid

            total_header_amount = 0.0
            total_calculated_price_idr = 0.0

            # 2. Process Details
            for item in invoice.items:
                # A. FETCH LIVE RATE (The "Freeze" Step)
                rate_query = text("""
                    SELECT COALESCE(ExchangeRate, 1) 
                    FROM btg_userpanel_uat.master_currency 
                    WHERE CurrencyId = :cid
                """)
                rate_result = await conn.execute(rate_query, {"cid": item.Currencyid})
                exchange_rate = rate_result.scalar() or 1.0

                # B. Calculate Line Totals
                line_total = item.PickedQty * item.UnitPrice
                
                # C. Calculate Frozen IDR Value for this line
                line_calculated_price = line_total * float(exchange_rate)

                # D. Add to Header Accumulators
                total_header_amount += line_total
                total_calculated_price_idr += line_calculated_price

                # E. Insert Detail with the FROZEN RATE
                detail_query = text("""
                    INSERT INTO btg_userpanel_uat.tbl_salesinvoices_details
                    (salesinvoicesheaderid, gascodeid, PickedQty, UnitPrice, TotalPrice, Currencyid, ExchangeRate)
                    VALUES (:hid, :gas, :qty, :price, :total, :cur, :rate)
                """)
                await conn.execute(detail_query, {
                    "hid": new_header_id,
                    "gas": item.gascodeid,
                    "qty": item.PickedQty,
                    "price": item.UnitPrice,
                    "total": line_total,
                    "cur": item.Currencyid,
                    "rate": exchange_rate 
                })

            # 3. Update Header with Final Totals
            update_header = text("""
                UPDATE btg_userpanel_uat.tbl_salesinvoices_header
                SET TotalAmount = :total,
                    CalculatedPrice = :calc_price
                WHERE id = :hid
            """)
            await conn.execute(update_header, {
                "total": total_header_amount,
                "calc_price": total_calculated_price_idr,
                "hid": new_header_id
            })

            return {"status": "success", "message": "Invoice Created", "InvoiceId": new_header_id}

        except Exception as e:
            print(f"Error creating invoice: {e}")
            raise HTTPException(status_code=500, detail=str(e))

# --- 2. Get All Invoices (List View) ---
@router.post("/GetALLInvoices", response_model=List[InvoiceListItem])
async def get_all_invoices(filter_data: InvoiceFilter):
    try:
        # Added IsAR filter to the WHERE clause
        sql = text("""
        SELECT 
            h.id AS InvoiceId,
            h.salesinvoicenbr AS InvoiceNbr,
            DATE_FORMAT(h.Salesinvoicesdate, '%Y-%m-%d') AS Salesinvoicesdate,
            COALESCE(c.CustomerName, 'Unknown') AS CustomerName,
            (SELECT d.PONumber FROM btg_userpanel_uat.tbl_salesinvoices_details d 
             WHERE d.salesinvoicesheaderid = h.id LIMIT 1) AS PONumber, 
            (SELECT mc.CurrencyCode 
             FROM btg_userpanel_uat.tbl_salesinvoices_details d 
             JOIN btg_userpanel_uat.master_currency mc ON d.Currencyid = mc.CurrencyId
             WHERE d.salesinvoicesheaderid = h.id LIMIT 1) AS CurrencyCode,
            h.TotalAmount,
            COALESCE(h.CalculatedPrice, h.TotalAmount) AS CalculatedPrice,
            CASE 
                WHEN h.IsSubmitted = 1 THEN 'Posted' 
                ELSE 'Saved' 
            END AS Status
        FROM btg_userpanel_uat.tbl_salesinvoices_header h
        LEFT JOIN btg_userpanel_uat.master_customer c ON h.customerid = c.Id
        WHERE h.Salesinvoicesdate BETWEEN :from_date AND :to_date
          AND (:customer_id = 0 OR h.customerid = :customer_id)
          AND h.isactive = 1 
          AND h.IsAR = :is_ar  -- <--- NEW FILTER
        ORDER BY h.id DESC;
        """)

        async with engine.connect() as conn:
            result = await conn.execute(sql, {
                "from_date": filter_data.FromDate,
                "to_date": filter_data.ToDate,
                "customer_id": filter_data.customerid,
                "is_ar": filter_data.IsAR # Pass the param
            })
            
            rows = result.fetchall()
            return [dict(row._mapping) for row in rows]

    except Exception as e:
        print(f"Error fetching invoices: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. Get Single Invoice Details ---
@router.get("/GetInvoiceDetails", response_model=InvoiceFullDetail)
async def get_invoice_details(invoiceid: int):
    try:
        async with engine.connect() as conn:
            # 1. Fetch Header
            header_query = text("""
                SELECT 
                    h.id AS InvoiceId,
                    h.salesinvoicenbr AS InvoiceNbr,
                    DATE_FORMAT(h.Salesinvoicesdate, '%Y-%m-%d') AS Salesinvoicesdate,
                    h.customerid,
                    COALESCE(c.CustomerName, 'Unknown') AS CustomerName,
                    h.TotalAmount,
                    COALESCE(h.CalculatedPrice, h.TotalAmount) AS CalculatedPrice,
                    CASE WHEN h.IsSubmitted = 1 THEN 'Posted' ELSE 'Saved' END AS Status
                FROM btg_userpanel_uat.tbl_salesinvoices_header h
                LEFT JOIN btg_userpanel_uat.master_customer c ON h.customerid = c.Id
                WHERE h.id = :id
            """)
            
            result = await conn.execute(header_query, {"id": invoiceid})
            header = result.fetchone()
            
            if not header:
                raise HTTPException(status_code=404, detail="Invoice not found")

            # 2. Fetch Details (Line Items)
            detail_query = text("""
                SELECT 
                    Id, gascodeid, PickedQty, UnitPrice, TotalPrice, Currencyid, ExchangeRate
                FROM btg_userpanel_uat.tbl_salesinvoices_details
                WHERE salesinvoicesheaderid = :id
            """)
            
            details_result = await conn.execute(detail_query, {"id": invoiceid})
            details_rows = details_result.fetchall()
            
            # 3. Construct Response
            header_dict = dict(header._mapping)
            items_list = [dict(row._mapping) for row in details_rows]
            
            header_dict["Items"] = items_list
            
            return header_dict

    except Exception as e:
        print(f"Error fetching invoice details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. Get Available DOs (Consolidated Invoicing) ---
@router.post("/GetAvailableDOs")
async def get_available_dos(filter_data: DOFilter):
    """
    Fetches ALL invoices for the customer without strict filters.
    Filtering will be done on the Frontend (AddManualInvoice.js).
    """
    try:
        async with engine.connect() as conn:
            query = text("""
                SELECT 
                    h.id as do_id,
                    h.salesinvoicenbr as do_number,
                    DATE_FORMAT(h.Salesinvoicesdate, '%Y-%m-%d') as do_date,
                    h.TotalQty as qty,
                    CASE WHEN h.TotalQty > 0 THEN h.TotalAmount / h.TotalQty ELSE 0 END as unit_price,
                    h.TotalAmount as total,
                    MAX(g.GasName) as GasName
                FROM btg_userpanel_uat.tbl_salesinvoices_header h
                LEFT JOIN btg_userpanel_uat.tbl_salesinvoices_details det ON h.id = det.salesinvoicesheaderid
                LEFT JOIN btg_userpanel_uat.master_gascode g ON det.gascodeid = g.Id
                WHERE h.customerid = :cust_id
                  -- REMOVED "LIKE DO%" AND "IsSubmitted" FILTERS
                  -- We now return everything active for this customer
                  AND h.isactive = 1 
                GROUP BY h.id, h.salesinvoicenbr, h.Salesinvoicesdate, h.TotalQty, h.TotalAmount
                ORDER BY h.Salesinvoicesdate ASC
            """)
            
            result = await conn.execute(query, {
                "cust_id": filter_data.customerid
            })
            
            rows = result.fetchall()
            return {"status": True, "data": [dict(row._mapping) for row in rows]}

    except Exception as e:
        print(f"Error fetching DOs: {e}")
        return {"status": False, "message": str(e), "data": []}

# --- 5. Create Invoice From DOs (Consolidation Logic) ---
@router.post("/CreateInvoiceFromDO")
async def create_invoice_from_do(payload: ConvertDORequest):
    """
    Consolidates multiple DOs (from tbl_salesinvoices_header) into a single Invoice.
    Copies details from the source DOs to the new Invoice.
    """
    async with engine.begin() as conn: # Transaction
        try:
            if not payload.do_ids:
                 raise HTTPException(status_code=400, detail="No DOs selected")

            # 1. Create Invoice Header
            header_query = text("""
                INSERT INTO btg_userpanel_uat.tbl_salesinvoices_header 
                (customerid, Salesinvoicesdate, TotalAmount, IsSubmitted, CalculatedPrice, createdby, invoice_type)
                VALUES (:cust, CURDATE(), 0, 0, 0, :user, 'DSI')
            """)
            result = await conn.execute(header_query, {
                "cust": payload.customerid,
                "user": payload.created_by
            })
            new_invoice_id = result.lastrowid

            total_amount = 0.0
            total_calculated_price = 0.0

            # 2. Process Selected DOs (Headers)
            for do_id in payload.do_ids:
                # Fetch details belonging to this DO (Header ID)
                # Note: We fetch from the DETAILS table now because we want the breakdown
                do_details_query = text("""
                    SELECT gascodeid, PickedQty, UnitPrice, Currencyid, ExchangeRate 
                    FROM btg_userpanel_uat.tbl_salesinvoices_details 
                    WHERE salesinvoicesheaderid = :doid
                """)
                do_res = await conn.execute(do_details_query, {"doid": do_id})
                do_rows = do_res.fetchall()
                
                for row in do_rows:
                    line_total = row.PickedQty * row.UnitPrice
                    # Use exchange rate from DO to calculate base currency value
                    line_calc_price = line_total * float(row.ExchangeRate or 1.0)
                    
                    total_amount += line_total
                    total_calculated_price += line_calc_price
                    
                    # Insert into New Invoice Details
                    det_query = text("""
                        INSERT INTO btg_userpanel_uat.tbl_salesinvoices_details
                        (salesinvoicesheaderid, gascodeid, PickedQty, UnitPrice, TotalPrice, Currencyid, ExchangeRate, ref_do_id)
                        VALUES (:hid, :gas, :qty, :price, :total, :cur, :rate, :doid)
                    """)
                    await conn.execute(det_query, {
                        "hid": new_invoice_id,
                        "gas": row.gascodeid,
                        "qty": row.PickedQty,
                        "price": row.UnitPrice,
                        "total": line_total,
                        "cur": row.Currencyid,
                        "rate": row.ExchangeRate,
                        "doid": do_id # Link back to the Source DO Header ID
                    })

            # 4. Update New Header Total
            update_header = text("""
                UPDATE btg_userpanel_uat.tbl_salesinvoices_header
                SET TotalAmount = :total, CalculatedPrice = :calc_total
                WHERE id = :hid
            """)
            await conn.execute(update_header, {
                "total": total_amount, 
                "calc_total": total_calculated_price,
                "hid": new_invoice_id
            })

            return {"status": True, "message": "Invoice Created Successfully", "InvoiceId": new_invoice_id}

        except Exception as e:
            print(f"Error converting DO: {e}")
            raise HTTPException(status_code=500, detail=str(e))

# --- ADD THIS TO invoice_api.py ---

@router.get("/GetGasItems")
async def get_gas_items():
    """
    Fetches active Gas Items for the dropdown list.
    """
    try:
        async with engine.connect() as conn:
            # Select Id and GasName, ordered alphabetically
            query = text("""
                SELECT Id, GasName 
                FROM btg_userpanel_uat.master_gascode 
                WHERE IsActive = 1 
                ORDER BY GasName ASC
            """)
            result = await conn.execute(query)
            rows = result.fetchall()
            
            # Return as a clean list of dictionaries
            return {"status": True, "data": [dict(row._mapping) for row in rows]}

    except Exception as e:
        print(f"Error fetching gas items: {e}")
        return {"status": False, "message": str(e), "data": []}

@router.post("/GetSalesDetails", response_model=List[SalesReportItem])
async def get_sales_details(filter_data: InvoiceFilter):
    try:
        # Fetches detailed line items for the reports
        sql = text("""
        SELECT 
            DATE_FORMAT(h.Salesinvoicesdate, '%Y-%m-%d') AS Salesinvoicesdate,
            COALESCE(c.CustomerName, 'Unknown') AS CustomerName,
            mc.CurrencyCode as InvoiceCurrency,
            h.salesinvoicenbr as InvoiceNo,
            g.GasName as ItemName,
            d.PickedQty as Qty,
            d.UnitPrice,
            d.TotalPrice as Total
        FROM btg_userpanel_uat.tbl_salesinvoices_header h
        JOIN btg_userpanel_uat.tbl_salesinvoices_details d ON h.id = d.salesinvoicesheaderid
        LEFT JOIN btg_userpanel_uat.master_customer c ON h.customerid = c.Id
        LEFT JOIN btg_userpanel_uat.master_gascode g ON d.gascodeid = g.Id
        LEFT JOIN btg_userpanel_uat.master_currency mc ON d.Currencyid = mc.CurrencyId
        WHERE h.Salesinvoicesdate BETWEEN :from_date AND :to_date
          AND h.isactive = 1 
          AND h.IsAR = 1 -- Reports usually show Posted/History items
        ORDER BY h.Salesinvoicesdate DESC, h.salesinvoicenbr DESC
        """)

        async with engine.connect() as conn:
            result = await conn.execute(sql, {
                "from_date": filter_data.FromDate,
                "to_date": filter_data.ToDate
            })
            rows = result.fetchall()
            return [dict(row._mapping) for row in rows]

    except Exception as e:
        print(f"Error fetching sales details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))