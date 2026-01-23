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
import { GetInvoiceDetails } from "../../../common/data/invoiceapi";

const ARBookReport = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth() - 2, 1);

  const [arBook, setArBook] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const custRes = await GetCustomerFilter(1, "%");
        setCustomers(custRes);
        if (custRes && custRes.length > 0) {
          setSelectedCustomer(custRes[0]);
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
    try {
      const data = await getARBook(
        selectedCustomer ? selectedCustomer.value : 0,
        1, // OrgID
        1, // BranchID
        fromDate ? format(fromDate, "yyyy-MM-dd") : null,
        toDate ? format(toDate, "yyyy-MM-dd") : null
      );

      // Check against your specific JSON structure
      if (data.status && data.data?.length > 0) {
        let rawData = data.data;
        rawData.sort((a, b) => parseDate(a.ledger_date) - parseDate(b.ledger_date));

        const uniqueCurrencies = [...new Set(rawData.map(item => item.currencycode || item.CurrencyCode))];
        const newCurrencyOptions = uniqueCurrencies.filter(c => c).map(c => ({ label: c, value: c }));
        setCurrencyOptions(newCurrencyOptions);

        const processedData = rawData.map(row => {
          const currency = row.currencycode || row.CurrencyCode || "IDR";
          const rate = (currency === "IDR") ? 1 : (currencyRates[currency] || 1);

          return {
            ...row,
            convertedInvoiceAmount: (parseFloat(row.invoice_amount) || 0) * rate,
            convertedReceiptAmount: (parseFloat(row.receipt_amount) || 0) * rate,
            convertedDebitNote: (parseFloat(row.debit_note_amount) || 0) * rate,
            convertedCreditNote: (parseFloat(row.credit_note_amount) || 0) * rate,
          };
        });

        setArBook(processedData);
      } else {
        setArBook([]);
      }
    } catch (err) {
      toast.error("Failed to load AR data");
      setArBook([]);
    }
  };

  // --- UPDATED HANDLE CLICK EVENT ---
  const handleInvoiceClick = async (rowData) => {
    // UPDATED: Using 'real_invoice_id' from the updated Stored Procedure
    // Fallback to 'transaction_id' only if needed, but primary logic relies on the real ID now.
    const invoiceId = rowData.real_invoice_id || rowData.invoice_id;

    if (!invoiceId) {
      toast.error("Invoice ID not found for this record.");
      return;
    }

    setLoadingDetails(true);
    setShowInvoiceDialog(true);
    setInvoiceDetails(null); // Clear previous data

    try {
      const response = await GetInvoiceDetails(invoiceId);

      // Handle cases where response might be wrapped in { data: ... }
      const data = response.data || response;

      if (data) {
        setInvoiceDetails(data);
      } else {
        toast.warning("No details returned for this invoice.");
      }
    } catch (err) {
      console.error("API Fetch Error:", err);

      // 1. Capture the specific error message from the backend
      if (err.response && err.response.data && err.response.data.detail) {
        toast.error(`Server Error: ${err.response.data.detail}`);
      } else {
        toast.error("Failed to fetch invoice details. Please try again.");
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const finalProcessedData = useMemo(() => {
    let filtered = selectedCurrency
      ? arBook.filter((x) => (x.CurrencyCode || x.currencycode) === selectedCurrency.value)
      : arBook;

    filtered = filtered.filter(item => !item.invoice_no?.includes("DO"));

    let runningBalance = 0;
    return filtered.map(row => {
      runningBalance += (row.convertedInvoiceAmount + row.convertedDebitNote - row.convertedReceiptAmount - row.convertedCreditNote);
      return { ...row, cumulativeBalance: runningBalance };
    });
  }, [arBook, selectedCurrency]);

  const exportExcel = () => {
    const exportData = finalProcessedData.map(item => ({
      Date: format(new Date(item.ledger_date), "dd-MMM-yyyy"),
      "Reference No.": item.convertedReceiptAmount > 0 ? "" : item.invoice_no,
      "Invoice Amount (A)": item.convertedInvoiceAmount,
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

  // --- RENDER LINK IN TABLE ---
  const referenceBodyTemplate = (row) => {
    // If it is a Receipt (Receipt Amount > 0), typically we display plain text or Receipt No
    if (row.convertedReceiptAmount > 0) {
      return row.receipt_no || row.invoice_no || "-";
    }

    // If it is an Invoice, render the clickable link
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

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Reports" breadcrumbItem="AR Book" />
        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                {/* Filters */}
                <Row className="mb-3 align-items-end">
                  <Col md="3" className="d-flex align-items-center">
                    <Label className="me-2 mb-0">Customer:</Label>
                    <Select options={customers} onChange={setSelectedCustomer} value={selectedCustomer} isClearable className="flex-grow-1" />
                  </Col>
                  <Col md="3" className="d-flex align-items-center">
                    <Label className="me-2 mb-0">Currency:</Label>
                    <Select options={currencyOptions} value={selectedCurrency} onChange={setSelectedCurrency} isClearable className="flex-grow-1" />
                  </Col>
                  <Col md="3" className="d-flex align-items-center">
                    <Label className="me-2 mb-0">From:</Label>
                    <Flatpickr className="form-control" value={fromDate} onChange={(date) => setFromDate(date[0])} options={{ altInput: true, altFormat: "d-M-Y", dateFormat: "Y-m-d" }} />
                  </Col>
                  <Col md="3" className="d-flex align-items-center">
                    <Label className="me-2 mb-0">To:</Label>
                    <Flatpickr className="form-control" value={toDate} onChange={(date) => setToDate(date[0])} options={{ altInput: true, altFormat: "d-M-Y", dateFormat: "Y-m-d" }} />
                  </Col>
                  <Col md="12" className="text-end mt-2">
                    <button type="button" className="btn btn-primary me-2" onClick={fetchARBook}>Search</button>
                    <button type="button" className="btn btn-success me-2" onClick={exportExcel}>Export</button>
                    <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print</button>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <DataTable
                    ref={dtRef}
                    value={finalProcessedData}
                    paginator
                    rows={20}
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

                    {/* The Clickable Reference Column */}
                    <Column field="invoice_no" header="Reference No." body={referenceBodyTemplate} headerStyle={{ whiteSpace: 'nowrap' }} />

                    <Column field="convertedInvoiceAmount" header="Invoice Amount (A)" body={(d) => d.convertedInvoiceAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })} className="text-end" />
                    <Column field="convertedDebitNote" header="Debit Note (B)" body={(d) => d.convertedDebitNote?.toLocaleString('en-US', { minimumFractionDigits: 2 })} className="text-end" />
                    <Column field="convertedReceiptAmount" header="Receipt (C)" body={(d) => d.convertedReceiptAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })} className="text-end" />
                    <Column field="convertedCreditNote" header="Credit Note (D)" body={(d) => d.convertedCreditNote?.toLocaleString('en-US', { minimumFractionDigits: 2 })} className="text-end" />
                    <Column field="cumulativeBalance" header="Balance" body={(d) => d.cumulativeBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })} className="text-end" />
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
              {/* Header Details */}
              <div className="bg-light p-3 mb-3 rounded border">
                <Row>
                  <Col md={6}><strong>Customer:</strong> {invoiceDetails.CustomerName}</Col>
                  <Col md={6}><strong>Invoice Date:</strong> {invoiceDetails.Salesinvoicesdate ? format(new Date(invoiceDetails.Salesinvoicesdate), "dd-MMM-yyyy") : ''}</Col>
                  <Col md={6} className="mt-2"><strong>Total Amount:</strong> {invoiceDetails.TotalAmount?.toLocaleString()}</Col>
                  <Col md={6} className="mt-2"><strong>Status:</strong> <span className="badge bg-info">{invoiceDetails.Status}</span></Col>
                </Row>
              </div>

              {/* Items Table */}
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