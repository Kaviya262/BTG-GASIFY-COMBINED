import React, { useState, useEffect, useRef, useMemo } from "react";
import { Container, Row, Col, Card, CardBody, Label } from "reactstrap";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import Select from "react-select";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { toast } from "react-toastify";

// Ensure these paths match your project structure
import { getARBook, GetCustomerFilter } from "../service/financeapi";
import { GetAllCurrencies } from "../../../common/data/mastersapi";
import { GetInvoiceDetails, GetSalesDetails, GetItemFilter } from "../../../common/data/invoiceapi";

const ARBookReport = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth() - 2, 1);

  const [arBook, setArBook] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(today);
  const [globalFilter, setGlobalFilter] = useState("");
  const dtRef = useRef(null);

  const [currencyRates, setCurrencyRates] = useState({});
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // --- POPUP STATE ---
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const custRes = await GetCustomerFilter(1, "%");
        setCustomers(custRes);
        if (custRes && custRes.length > 0) {
          setSelectedCustomer(custRes[0]);
        }

        const itemRes = await GetItemFilter(); 
        if (Array.isArray(itemRes)) {
            setItems(itemRes);
        } else if (itemRes.data) {
            setItems(itemRes.data);
        }

        const currRes = await GetAllCurrencies({ currencyCode: "", currencyName: "" });
        const currencyData = currRes.data || currRes;

        if (Array.isArray(currencyData)) {
          const rates = {};
          currencyData.forEach(c => {
            rates[c.CurrencyCode] = c.ExchangeRate || c.Rate || c.SellingRate || 1;
          });
          setCurrencyRates(rates);
        }
      } catch (error) {
        console.error("Error loading masters:", error);
      }
    };
    loadMasters();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchARBook();
    }
  }, [selectedCustomer]);

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    return new Date(dateStr);
  };

  const fetchARBook = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Basic AR Book Data
      const data = await getARBook(
        selectedCustomer ? selectedCustomer.value : 0,
        1, // OrgID
        1, // BranchID
        fromDate ? format(fromDate, "yyyy-MM-dd") : null,
        toDate ? format(toDate, "yyyy-MM-dd") : null
      );

      if (data.status && data.data?.length > 0) {
        let rawData = data.data;

        // 2. Sorting
        if (selectedItem) {
             rawData.sort((a, b) => parseDate(b.ledger_date) - parseDate(a.ledger_date));
        } else {
             rawData.sort((a, b) => parseDate(a.ledger_date) - parseDate(b.ledger_date));
        }

        // 3. Filter by Item (Frontend Workaround)
        if (selectedItem) {
            try {
                const salesPayload = {
                    customerid: selectedCustomer ? selectedCustomer.value : 0,
                    FromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : "",
                    ToDate: toDate ? format(toDate, "yyyy-MM-dd") : "",
                    ItemId: selectedItem.value,
                    BranchId: 1,
                    IsAR: 1
                };

                const salesRes = await GetSalesDetails(salesPayload);
                const salesData = salesRes.data || salesRes;
                const validInvoiceNos = new Set(salesData.map(x => x.InvoiceNo));
                rawData = rawData.filter(row => validInvoiceNos.has(row.invoice_no));

            } catch (err) {
                console.error("Error filtering by item:", err);
                toast.warning("Could not filter by item. Showing all records.");
            }
        }

        const uniqueCurrencies = [...new Set(rawData.map(item => item.currencycode || item.CurrencyCode))];
        const newCurrencyOptions = uniqueCurrencies.filter(c => c).map(c => ({ label: c, value: c }));
        setCurrencyOptions(newCurrencyOptions);

        // --- STEP 4: PROCESS & CONVERT CURRENCY ---
        const convertedData = rawData.map(row => {
          const currency = row.currencycode || row.CurrencyCode || "IDR";
          const rate = (currency === "IDR") ? 1 : (currencyRates[currency] || 1);

          return {
            ...row,
            currencyCode: currency,
            exchangeRate: rate, 
            convertedInvoiceAmount: (parseFloat(row.invoice_amount) || 0) * rate,
            convertedReceiptAmount: (parseFloat(row.receipt_amount) || 0) * rate,
            convertedDebitNote: (parseFloat(row.debit_note_amount) || 0) * rate,
            convertedCreditNote: (parseFloat(row.credit_note_amount) || 0) * rate,
            // We do NOT calculate balance here yet, we do it after grouping
          };
        });

        // --- STEP 5: GROUPING LOGIC (The Fix) ---
        const groupedMap = new Map();
        const finalRows = [];

        convertedData.forEach(row => {
            const refNo = row.invoice_no ? String(row.invoice_no).trim() : "";
            
            // Only group if it's a valid Invoice (Not a DO, Not a Receipt without reference)
            // And ensure we don't group different currencies together accidentally
            const shouldGroup = refNo && !refNo.startsWith("DO") && !refNo.startsWith("27") && row.convertedReceiptAmount === 0;

            if (shouldGroup) {
                const key = `${refNo}_${row.currencyCode}`;
                
                if (groupedMap.has(key)) {
                    // Update existing group entry
                    const existing = groupedMap.get(key);
                    existing.convertedInvoiceAmount += row.convertedInvoiceAmount;
                    existing.convertedDebitNote += row.convertedDebitNote;
                    existing.convertedCreditNote += row.convertedCreditNote;
                    // Note: We sum the original amounts too for display in "Other Currency" column
                    existing.invoice_amount = (parseFloat(existing.invoice_amount) || 0) + (parseFloat(row.invoice_amount) || 0);
                    
                    // Keep the first ID found for the click handler
                } else {
                    // Create new group entry
                    // We clone the row to avoid mutating original data
                    groupedMap.set(key, { ...row });
                }
            } else {
                // If it's a Receipt or a DO, just add it directly (no grouping)
                finalRows.push(row);
            }
        });

        // Merge grouped items back into the main array
        groupedMap.forEach(value => finalRows.push(value));

        // Re-sort by date after merging
        finalRows.sort((a, b) => parseDate(a.ledger_date) - parseDate(b.ledger_date));

        setArBook(finalRows);
      } else {
        setArBook([]);
      }
    } catch (err) {
      toast.error("Failed to load AR data");
      setArBook([]);
    } finally {
        setLoadingData(false);
    }
  };

  const handleInvoiceClick = async (rowData) => {
    // We use the Invoice Number (string) to search because we merged multiple IDs into one row
    const invoiceIdentifier = rowData.invoice_no;

    if (!invoiceIdentifier) {
      toast.warning("No Invoice Number available.");
      return;
    }

    setLoadingDetails(true);
    setShowInvoiceDialog(true);
    setInvoiceDetails(null); 

    try {
      const response = await GetInvoiceDetails(invoiceIdentifier);
      const data = response.data || response;

      if (data) {
        setInvoiceDetails(data);
      } else {
        toast.warning("No details returned for this invoice.");
      }
    } catch (err) {
      console.error("API Fetch Error:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        toast.error(`Server Error: ${err.response.data.detail}`);
      } else {
        toast.error("Failed to fetch invoice details.");
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const finalProcessedData = useMemo(() => {
    let filtered = selectedCurrency
      ? arBook.filter((x) => (x.CurrencyCode || x.currencycode) === selectedCurrency.value)
      : arBook;

    // Filter out DOs from this report (Double check)
    filtered = filtered.filter(item => {
      const ref = item.invoice_no ? String(item.invoice_no).trim().toUpperCase() : "";
      return !ref.startsWith("DO") && !ref.startsWith("27");
    });

    let runningBalance = 0;
    return filtered.map(row => {
      // Calculate Balance Due for this specific row (Inv + Debit - Credit - Receipt)
      // This is needed for the "Balance ToReceive" column
      const rowBalance = (row.convertedInvoiceAmount || 0) + (row.convertedDebitNote || 0) 
                       - (row.convertedCreditNote || 0) - (row.convertedReceiptAmount || 0);
      
      // Calculate Cumulative Running Balance
      runningBalance += rowBalance;
      
      return { 
          ...row, 
          balanceDue: rowBalance, // The amount specifically outstanding for this row
          cumulativeBalance: runningBalance // The running total
      };
    });
  }, [arBook, selectedCurrency]);

  const totalARValue = useMemo(() => {
    if (finalProcessedData.length === 0) return 0;
    // The total AR Value is usually the final cumulative balance
    return finalProcessedData[finalProcessedData.length - 1].cumulativeBalance;
  }, [finalProcessedData]);

  const hasForeignCurrency = useMemo(() => {
      return finalProcessedData.some(row => row.currencyCode && row.currencyCode !== 'IDR');
  }, [finalProcessedData]);


  const exportExcel = () => {
    const exportData = finalProcessedData.map(item => ({
      Date: format(new Date(item.ledger_date), "dd-MMM-yyyy"),
      "Reference No.": item.convertedReceiptAmount > 0 ? "" : item.invoice_no,
      "Other Currency": item.currencyCode !== 'IDR' ? item.invoice_amount?.toLocaleString() : "",
      "Invoice Amount (A)": item.convertedInvoiceAmount,
      "Balance Due": item.balanceDue,
      "Debit Note (B)": item.convertedDebitNote,
      "Receipt (C)": item.convertedReceiptAmount,
      "Credit Note (D)": item.convertedCreditNote,
      "Balance ((A+B)-(C+D))": item.cumulativeBalance
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AR Book");
    XLSX.writeFile(wb, "AR_Book.xlsx");
  };

  const referenceBodyTemplate = (row) => {
    if (row.convertedReceiptAmount > 0) {
      return row.receipt_no || row.invoice_no || "-";
    }
    return (
      <span
        className="text-primary fw-bold"
        style={{ cursor: "pointer", textDecoration: "underline" }}
        onClick={() => handleInvoiceClick(row)}
        title="View Invoice Details"
      >
        {row.invoice_no}
      </span>
    );
  };

  // --- UPDATED: Added Title Attribute for Exchange Rate ---
  const otherCurrencyBodyTemplate = (rowData) => {
      if (rowData.currencyCode && rowData.currencyCode !== 'IDR') {
          const originalAmt = rowData.convertedReceiptAmount > 0 
                ? rowData.receipt_amount 
                : (rowData.invoice_amount || rowData.credit_note_amount || rowData.debit_note_amount);
          
          return (
              <span 
                className="text-muted" 
                style={{fontSize: '12px', cursor: 'pointer'}}
                // This line adds the hover effect
                title={`Ex. Rate: ${rowData.exchangeRate?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              >
                  {parseFloat(originalAmt).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
          );
      }
      return "";
  };

  const receiptBodyTemplate = (rowData) => {
    return (
      <span style={{ color: "red" }} title={`Ex. Rate: ${rowData.exchangeRate?.toLocaleString()}`}>
        {rowData.convertedReceiptAmount > 0 ? rowData.convertedReceiptAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ""}
      </span>
    );
  };

  const creditNoteBodyTemplate = (rowData) => {
    return (
      <span style={{ color: "red" }} title={`Ex. Rate: ${rowData.exchangeRate?.toLocaleString()}`}>
        {rowData.convertedCreditNote > 0 ? rowData.convertedCreditNote?.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ""}
      </span>
    );
  };

  const invoiceAmountBodyTemplate = (rowData) => {
      return (
        <span title={`Ex. Rate: ${rowData.exchangeRate?.toLocaleString()}`}>
            {rowData.convertedInvoiceAmount > 0 ? rowData.convertedInvoiceAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ""}
        </span>
      );
  };

  const debitNoteBodyTemplate = (rowData) => {
      return (
        <span title={`Ex. Rate: ${rowData.exchangeRate?.toLocaleString()}`}>
            {rowData.convertedDebitNote > 0 ? rowData.convertedDebitNote?.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ""}
        </span>
      );
  };

  const balanceDueBodyTemplate = (rowData) => {
     if (rowData.convertedInvoiceAmount > 0) {
        return (
            <span title={`Ex. Rate: ${rowData.exchangeRate?.toLocaleString()}`}>
                {rowData.balanceDue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
        );
     }
     return "";
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Reports" breadcrumbItem="AR Book" />
        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                {/* --- Row 1: Selection Filters --- */}
                <Row className="mb-3">
                  <Col md="4" className="d-flex align-items-center mb-2">
                    <Label className="me-2 mb-0" style={{ minWidth: "80px" }}>Customer:</Label>
                    <Select options={customers} onChange={setSelectedCustomer} value={selectedCustomer} isClearable className="flex-grow-1" />
                  </Col>

                  <Col md="4" className="d-flex align-items-center mb-2">
                    <Label className="me-2 mb-0" style={{ minWidth: "60px" }}>Item:</Label>
                    <Select 
                        options={items} 
                        onChange={setSelectedItem} 
                        value={selectedItem} 
                        isClearable 
                        placeholder="Select Item..."
                        className="flex-grow-1" 
                    />
                  </Col>

                  <Col md="4" className="d-flex align-items-center mb-2">
                    <Label className="me-2 mb-0" style={{ minWidth: "80px" }}>Currency:</Label>
                    <Select options={currencyOptions} value={selectedCurrency} onChange={setSelectedCurrency} isClearable className="flex-grow-1" />
                  </Col>
                </Row>

                {/* --- Row 2: Date Filters --- */}
                <Row className="mb-3">
                  <Col md="4" className="d-flex align-items-center mb-2">
                    <Label className="me-2 mb-0" style={{ minWidth: "80px" }}>From:</Label>
                    <Flatpickr className="form-control" value={fromDate} onChange={(date) => setFromDate(date[0])} options={{ altInput: true, altFormat: "d-M-Y", dateFormat: "Y-m-d" }} />
                  </Col>
                  
                  <Col md="4" className="d-flex align-items-center mb-2">
                    <Label className="me-2 mb-0" style={{ minWidth: "60px" }}>To:</Label>
                    <Flatpickr className="form-control" value={toDate} onChange={(date) => setToDate(date[0])} options={{ altInput: true, altFormat: "d-M-Y", dateFormat: "Y-m-d" }} />
                  </Col>
                </Row>

                {/* --- Row 3: Totals & Actions --- */}
                <Row>
                   <Col md="12" className="d-flex justify-content-between align-items-center mt-2 border-top pt-3">
                    <div className="d-flex align-items-center">
                      <h5 className="mb-0 me-2">Total AR Value:</h5>
                      <h4 className="mb-0 fw-bold" style={{ color: "firebrick" }}>
                        {totalARValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </h4>
                    </div>

                    <div className="text-end">
                      <button type="button" className="btn btn-primary me-2" onClick={fetchARBook} disabled={loadingData}>
                        {loadingData ? "Loading..." : "Search"}
                      </button>
                      <button type="button" className="btn btn-success me-2" onClick={exportExcel}>Export</button>
                      <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print</button>
                    </div>
                  </Col>
                </Row>

                <div className="table-responsive mt-3">
                  <DataTable
                    ref={dtRef}
                    value={finalProcessedData}
                    paginator
                    rows={20}
                    loading={loadingData}
                    globalFilter={globalFilter}
                    style={{ fontSize: '13px' }}
                    header={
                      <div className="d-flex justify-content-end">
                        <InputText type="search" placeholder="Global Search" className="form-control" style={{ width: "250px" }} value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
                      </div>
                    }
                    responsiveLayout="scroll"
                  >
                    <Column field="ledger_date" header="Date" body={(row) => format(new Date(row.ledger_date), "dd-MMM-yyyy")} headerStyle={{ whiteSpace: 'nowrap' }} />

                    <Column field="invoice_no" header="Reference No." body={referenceBodyTemplate} headerStyle={{ whiteSpace: 'nowrap' }} />

                    {hasForeignCurrency && (
                        <Column 
                            header="Other Currency" 
                            body={otherCurrencyBodyTemplate} 
                            className="text-end" 
                            headerStyle={{ whiteSpace: 'nowrap', color: 'white' }}
                        />
                    )}

                    <Column field="convertedInvoiceAmount" header="Invoice Amount (A)" body={invoiceAmountBodyTemplate} className="text-end" />
                    
                    <Column 
                        field="balanceDue" 
                        header="Balance ToReceive" 
                        body={balanceDueBodyTemplate} 
                        className="text-end"
                        headerStyle={{ color: 'white' }}
                    />

                    <Column field="convertedDebitNote" header="Debit Note (B)" body={debitNoteBodyTemplate} className="text-end" />
                    
                    <Column field="convertedReceiptAmount" header="Receipt (C)" body={receiptBodyTemplate} className="text-end" />
                    
                    <Column field="convertedCreditNote" header="Credit Note (D)" body={creditNoteBodyTemplate} className="text-end" />
                    
                    <Column field="cumulativeBalance" header="Balance ((A+B)-(C+D))" body={(d) => d.cumulativeBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })} className="text-end" />
                  </DataTable>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* --- INVOICE VIEW POPUP --- */}
        <Dialog
          header={`Invoice View: ${invoiceDetails?.InvoiceNbr || ''}`}
          visible={showInvoiceDialog}
          style={{ width: '60vw' }}
          onHide={() => setShowInvoiceDialog(false)}
          draggable={false}
          resizable={false}
        >
          {loadingDetails ? (
            <div className="d-flex justify-content-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : invoiceDetails ? (
            <div>
              <div className="bg-light p-3 mb-3 rounded border">
                <Row>
                  <Col md={6}><strong>Customer:</strong> {invoiceDetails.CustomerName}</Col>
                  <Col md={6}><strong>Invoice Date:</strong> {invoiceDetails.Salesinvoicesdate ? format(new Date(invoiceDetails.Salesinvoicesdate), "dd-MMM-yyyy") : ''}</Col>
                  <Col md={6} className="mt-2"><strong>Total Amount:</strong> {invoiceDetails.TotalAmount?.toLocaleString()}</Col>
                  <Col md={6} className="mt-2"><strong>Status:</strong> <span className="badge bg-info">{invoiceDetails.Status}</span></Col>
                </Row>
              </div>

              <DataTable
                value={invoiceDetails.Items || []}
                className="p-datatable-sm p-datatable-gridlines"
                responsiveLayout="scroll"
              >
                <Column field="gascodeid" header="Item Code" />
                <Column field="GasName" header="Description" body={(r) => r.GasName || r.ItemName || "Item"} />
                <Column field="PickedQty" header="Qty" className="text-end" />
                <Column field="UnitPrice" header="Unit Price" className="text-end" body={(r) => r.UnitPrice?.toLocaleString()} />
                <Column field="TotalPrice" header="Total" className="text-end" body={(r) => r.TotalPrice?.toLocaleString()} />
              </DataTable>

              <div className="text-end mt-3">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowInvoiceDialog(false)}>Close</button>
              </div>
            </div>
          ) : (
            <div className="text-center p-3 text-muted">
              No details found for this invoice.
            </div>
          )}
        </Dialog>

      </Container>
    </div>
  );
};

export default ARBookReport;