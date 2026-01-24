from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy import text
from ..database import engine 

router = APIRouter()

# ==========================================
# 1. RESPONSE & FILTER MODELS
# ==========================================

class InvoiceFilter(BaseModel):
    customerid: int = 0
    FromDate: str
    ToDate: str
    BranchId: int = 1
    IsAR: int = 0 
    ItemId: Optional[int] = 0
    SalesPersonId: Optional[int] = 0

class SalesReportItem(BaseModel):
    DetailId: int
    Salesinvoicesdate: Optional[str] = ""
    CustomerName: Optional[str] = ""
    InvoiceCurrency: Optional[str] = ""
    InvoiceNo: Optional[str] = ""
    
    # --- NEW FIELD ---
    DONumber: Optional[str] = "" 
    
    ItemName: Optional[str] = ""
    Qty: float
    UnitPrice: float
    OriginalTotal: float 
    ConvertedTotal: float 

class DOFilter(BaseModel):
    customerid: int
    gascodeid: Optional[int] = 0

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
    GasName: Optional[str] = ""
    PickedQty: float
    UnitPrice: float
    TotalPrice: float
    Currencyid: int
    ExchangeRate: float

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

class ConvertDORequest(BaseModel):
    customerid: int
    do_ids: List[int]
    created_by: int = 1

# ==========================================
# 2. REQUEST MODELS 
# ==========================================

class ManualInvoiceDetail(BaseModel):
    gasCodeId: int 
    pickedQty: float
    UnitPrice: float
    CurrencyId: int
    UomId: Optional[int] = 0
    poNumber: Optional[str] = ""
    doNumber: Optional[str] = ""
    driverName: Optional[str] = ""
    truckName: Optional[str] = ""
    deliveryAddress: Optional[str] = ""
    
    class Config:
        extra = "ignore"

class ManualInvoiceHeader(BaseModel):
    customerId: int
    salesInvoiceDate: str
    salesInvoiceNbr: str 
    userId: int = 1
    orgId: int = 1
    branchId: int = 1
    isSubmitted: int = 0
    ismanual: int = 1
    
    class Config:
        extra = "ignore"

class CreateInvoiceRequest(BaseModel):
    header: ManualInvoiceHeader
    details: List[ManualInvoiceDetail]
    
    class Config:
        extra = "ignore"

# ==========================================
# 3. API ENDPOINTS
# ==========================================

# --- Create Manual Invoice ---
@router.post("/CreateInvoice")
async def create_invoice(payload: CreateInvoiceRequest):
    async with engine.begin() as conn: 
        try:
            # 1. Create Header
            header_query = text("""
                INSERT INTO btg_userpanel_uat.tbl_salesinvoices_header 
                (salesinvoicenbr, customerid, Salesinvoicesdate, TotalAmount, IsSubmitted, CalculatedPrice, createdby, OrgId, BranchId, IsManual, CreatedDate)
                VALUES (:nbr, :cust, :date, 0, :submitted, 0, :user, :org, :branch, :manual, NOW())
            """)
            
            result = await conn.execute(header_query, {
                "nbr": payload.header.salesInvoiceNbr, 
                "cust": payload.header.customerId,
                "date": payload.header.salesInvoiceDate,
                "submitted": payload.header.isSubmitted,
                "user": payload.header.userId,
                "org": payload.header.orgId,
                "branch": payload.header.branchId,
                "manual": payload.header.ismanual
            })
            new_header_id = result.lastrowid

            total_header_amount = 0.0
            total_calculated_price_idr = 0.0

            # 2. Process Details
            for item in payload.details:
                # A. Get Rate
                rate_query = text("""
                    SELECT COALESCE(ExchangeRate, 1) 
                    FROM btg_userpanel_uat.master_currency 
                    WHERE CurrencyId = :cid
                """)
                cid = item.CurrencyId if item.CurrencyId else 1
                rate_result = await conn.execute(rate_query, {"cid": cid})
                exchange_rate = rate_result.scalar() or 1.0

                # B. Calcs
                line_total = item.pickedQty * item.UnitPrice
                line_calculated_price = line_total * float(exchange_rate)

                total_header_amount += line_total
                total_calculated_price_idr += line_calculated_price

                # C. Insert Detail
                # Insert DOnumber string directly
                detail_query = text("""
                    INSERT INTO btg_userpanel_uat.tbl_salesinvoices_details
                    (salesinvoicesheaderid, gascodeid, PickedQty, UnitPrice, TotalPrice, Price, Currencyid, ExchangeRate, uomid, DOnumber, PONumber, DriverName, TruckName, DeliveryAddress)
                    VALUES (:hid, :gas, :qty, :price, :total, :calc_price, :cur, :rate, :uom, :do, :po, :driver, :truck, :addr)
                """)
                await conn.execute(detail_query, {
                    "hid": new_header_id,
                    "gas": item.gasCodeId,
                    "qty": item.pickedQty,
                    "price": item.UnitPrice,
                    "total": line_total,
                    "calc_price": line_calculated_price,
                    "cur": cid,
                    "rate": exchange_rate,
                    "uom": item.UomId,
                    "do": item.doNumber,
                    "po": item.poNumber,
                    "driver": item.driverName,
                    "truck": item.truckName,
                    "addr": item.deliveryAddress
                })

            # 3. Update Header Totals
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

# --- Get All Invoices ---
@router.post("/GetALLInvoices", response_model=List[InvoiceListItem])
async def get_all_invoices(filter_data: InvoiceFilter):
    try:
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
          AND h.IsAR = :is_ar
        ORDER BY h.id DESC;
        """)

        async with engine.connect() as conn:
            result = await conn.execute(sql, {
                "from_date": filter_data.FromDate,
                "to_date": filter_data.ToDate,
                "customer_id": filter_data.customerid,
                "is_ar": filter_data.IsAR
            })
            
            rows = result.fetchall()
            return [dict(row._mapping) for row in rows]

    except Exception as e:
        print(f"Error fetching invoices: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Get Single Invoice Details ---
@router.get("/GetInvoiceDetails", response_model=InvoiceFullDetail)
async def get_invoice_details(invoiceid: str):
    try:
        async with engine.connect() as conn:
            # 1. Fetch ALL Headers matching this Invoice Number (or ID)
            # We removed "LIMIT 1" and fetch all matches to aggregate them.
            header_query = text("""
                SELECT 
                    h.id AS RealHeaderId, 
                    h.salesinvoicenbr AS InvoiceNbr,
                    COALESCE(DATE_FORMAT(h.Salesinvoicesdate, '%Y-%m-%d'), '') AS Salesinvoicesdate,
                    h.customerid,
                    COALESCE(c.CustomerName, 'Unknown') AS CustomerName,
                    COALESCE(h.TotalAmount, 0) AS TotalAmount,
                    COALESCE(h.CalculatedPrice, h.TotalAmount, 0) AS CalculatedPrice,
                    CASE WHEN h.IsSubmitted = 1 THEN 'Posted' ELSE 'Saved' END AS Status
                FROM btg_userpanel_uat.tbl_salesinvoices_header h
                LEFT JOIN btg_userpanel_uat.master_customer c ON h.customerid = c.Id
                WHERE h.salesinvoicenbr = :input_val 
                   OR h.id = :input_val
            """)
            
            result = await conn.execute(header_query, {"input_val": invoiceid})
            headers = result.fetchall()
            
            if not headers:
                raise HTTPException(status_code=404, detail=f"Invoice '{invoiceid}' not found")

            # 2. Aggregate Header Data
            # We take the metadata (Date, Customer) from the FIRST row found.
            # We SUM the totals from ALL rows found.
            primary_header = headers[0]
            
            aggregated_total_amount = 0.0
            aggregated_calc_price = 0.0
            all_header_ids = []

            for h in headers:
                aggregated_total_amount += float(h.TotalAmount)
                aggregated_calc_price += float(h.CalculatedPrice)
                all_header_ids.append(h.RealHeaderId)

            # 3. Construct the Response Dict
            header_dict = dict(primary_header._mapping)
            header_dict["InvoiceId"] = header_dict.pop("RealHeaderId") # Use primary ID as representative
            header_dict["TotalAmount"] = aggregated_total_amount
            header_dict["CalculatedPrice"] = aggregated_calc_price

            # 4. Fetch Details for ALL identified Header IDs
            # We use the IN clause to get items from all 7 DOs
            if all_header_ids:
                detail_query = text("""
                    SELECT 
                        d.id AS Id,
                        COALESCE(d.gascodeid, 0) AS gascodeid,
                        COALESCE(g.GasName, 'Item') AS GasName,
                        COALESCE(d.PickedQty, 0) AS PickedQty,
                        COALESCE(d.UnitPrice, 0) AS UnitPrice,
                        COALESCE(d.TotalPrice, 0) AS TotalPrice,
                        COALESCE(d.Currencyid, 1) AS Currencyid,
                        COALESCE(d.ExchangeRate, 1) AS ExchangeRate,
                        d.DOnumber AS DOnumber,
                        d.PONumber AS PONumber
                    FROM btg_userpanel_uat.tbl_salesinvoices_details d
                    LEFT JOIN btg_userpanel_uat.master_gascode g ON d.gascodeid = g.Id
                    WHERE d.salesinvoicesheaderid IN :hids
                """)
                
                # SQLAlchemy handles list binding with tuple
                details_result = await conn.execute(detail_query, {"hids": tuple(all_header_ids)})
                details_rows = details_result.fetchall()
            else:
                details_rows = []

            # 5. Process Items
            items_list = []
            for row in details_rows:
                row_dict = dict(row._mapping)
                row_dict["PickedQty"] = float(row_dict["PickedQty"])
                row_dict["UnitPrice"] = float(row_dict["UnitPrice"])
                row_dict["TotalPrice"] = float(row_dict["TotalPrice"])
                row_dict["ExchangeRate"] = float(row_dict["ExchangeRate"])
                items_list.append(row_dict)
            
            header_dict["Items"] = items_list
            return header_dict

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error fetching invoice {invoiceid}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Get Available DOs ---
@router.post("/GetAvailableDOs")
async def get_available_dos(filter_data: DOFilter):
    try:
        async with engine.connect() as conn:
            query = text("""
                SELECT 
                    h.id as do_id,
                    h.salesinvoicenbr as do_number,
                    DATE_FORMAT(h.Salesinvoicesdate, '%Y-%m-%d') as do_date,
                    h.TotalQty as qty,
                    h.TotalAmount as total,
                    MAX(g.GasName) as GasName
                FROM btg_userpanel_uat.tbl_salesinvoices_header h
                LEFT JOIN btg_userpanel_uat.tbl_salesinvoices_details det ON h.id = det.salesinvoicesheaderid
                LEFT JOIN btg_userpanel_uat.master_gascode g ON det.gascodeid = g.Id
                WHERE h.customerid = :cust_id
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

# --- Create Invoice From DO (FIXED) ---
@router.post("/CreateInvoiceFromDO")
async def create_invoice_from_do(payload: ConvertDORequest):
    async with engine.begin() as conn:
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

            # 2. Process selected DOs
            for do_id in payload.do_ids:
                # --- FIX: Fetch the DO Number string to copy into details ---
                do_header_query = text("SELECT salesinvoicenbr FROM btg_userpanel_uat.tbl_salesinvoices_header WHERE id = :doid")
                do_header_res = await conn.execute(do_header_query, {"doid": do_id})
                do_number_str = do_header_res.scalar() or ""

                # Fetch DO Items
                do_details_query = text("""
                    SELECT gascodeid, PickedQty, UnitPrice, Currencyid, ExchangeRate 
                    FROM btg_userpanel_uat.tbl_salesinvoices_details 
                    WHERE salesinvoicesheaderid = :doid
                """)
                do_res = await conn.execute(do_details_query, {"doid": do_id})
                do_rows = do_res.fetchall()
                
                for row in do_rows:
                    line_total = row.PickedQty * row.UnitPrice
                    line_calc_price = line_total * float(row.ExchangeRate or 1.0)
                    
                    total_amount += line_total
                    total_calculated_price += line_calc_price
                    
                    # --- FIX: Insert into 'DOnumber' column (text), NOT 'ref_do_id' ---
                    det_query = text("""
                        INSERT INTO btg_userpanel_uat.tbl_salesinvoices_details
                        (salesinvoicesheaderid, gascodeid, PickedQty, UnitPrice, TotalPrice, Currencyid, ExchangeRate, DOnumber)
                        VALUES (:hid, :gas, :qty, :price, :total, :cur, :rate, :do_str)
                    """)
                    await conn.execute(det_query, {
                        "hid": new_invoice_id,
                        "gas": row.gascodeid,
                        "qty": row.PickedQty,
                        "price": row.UnitPrice,
                        "total": line_total,
                        "cur": row.Currencyid,
                        "rate": row.ExchangeRate,
                        "do_str": do_number_str  # <--- Insert the String
                    })

            # 3. Update Header Totals
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

# --- Get Gas Items ---
@router.get("/GetGasItems")
async def get_gas_items():
    try:
        async with engine.connect() as conn:
            query = text("""
                SELECT Id, GasName 
                FROM btg_userpanel_uat.master_gascode 
                WHERE IsActive = 1 
                ORDER BY GasName ASC
            """)
            result = await conn.execute(query)
            rows = result.fetchall()
            return {"status": True, "data": [dict(row._mapping) for row in rows]}

    except Exception as e:
        print(f"Error fetching gas items: {e}")
        return {"status": False, "message": str(e), "data": []}

# --- Get Sales Details (Reports) ---
@router.post("/GetSalesDetails", response_model=List[SalesReportItem])
async def get_sales_details(filter_data: InvoiceFilter):
    try:
        # --- FIXED QUERY: Uses existing 'DOnumber' column, no invalid JOIN ---
        sql = text("""
        SELECT 
            d.id as DetailId,
            DATE_FORMAT(h.Salesinvoicesdate, '%Y-%m-%d') AS Salesinvoicesdate,
            COALESCE(TRIM(c.CustomerName), 'Unknown') AS CustomerName,
            mc.CurrencyCode as InvoiceCurrency,
            h.salesinvoicenbr as InvoiceNo,
            
            -- Use the existing Text Column --
            COALESCE(d.DOnumber, '') AS DONumber,
            
            COALESCE(g.GasName, 'Item') as ItemName,
            d.PickedQty as Qty,
            d.UnitPrice,
            d.TotalPrice as OriginalTotal, 
            (d.TotalPrice * COALESCE(mc.ExchangeRate, 1)) as ConvertedTotal
        FROM btg_userpanel_uat.tbl_salesinvoices_header h
        JOIN btg_userpanel_uat.tbl_salesinvoices_details d ON h.id = d.salesinvoicesheaderid
        
        LEFT JOIN btg_userpanel_uat.master_customer c ON h.customerid = c.Id
        LEFT JOIN btg_userpanel_uat.master_gascode g ON d.gascodeid = g.Id
        LEFT JOIN btg_userpanel_uat.master_currency mc ON d.Currencyid = mc.CurrencyId
        
        WHERE DATE(h.Salesinvoicesdate) BETWEEN :from_date AND :to_date 
          AND h.isactive = 1 
          AND h.IsAR = 1
          AND (:cust_id = 0 OR h.customerid = :cust_id)
          AND (:item_id = 0 OR d.gascodeid = :item_id)
          AND (:sp_id = 0 OR c.SalesPersonId = :sp_id) 
        ORDER BY COALESCE(TRIM(c.CustomerName), 'Unknown') ASC, h.Salesinvoicesdate ASC, h.salesinvoicenbr ASC
        """)

        async with engine.connect() as conn:
            result = await conn.execute(sql, {
                "from_date": filter_data.FromDate,
                "to_date": filter_data.ToDate,
                "cust_id": filter_data.customerid,
                "item_id": filter_data.ItemId,
                "sp_id": filter_data.SalesPersonId 
            })
            rows = result.fetchall()
            return [dict(row._mapping) for row in rows]

    except Exception as e:
        print(f"Error fetching sales details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/GetItemFilter")
async def get_item_filter():
    try:
        sql = text("SELECT Id as value, GasName as label FROM btg_userpanel_uat.master_gascode WHERE IsActive = 1 ORDER BY GasName")
        async with engine.connect() as conn:
            result = await conn.execute(sql)
            return [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))