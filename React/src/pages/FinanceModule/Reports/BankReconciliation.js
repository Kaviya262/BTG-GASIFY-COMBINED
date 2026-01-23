import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Button } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { getBankReconciliation } from "../service/financeapi";
import { InputText } from "primereact/inputtext";

// 🔹 Breadcrumb Component
const Breadcrumbs = ({ title, breadcrumbItem }) => (
  <div className="page-title-box d-sm-flex align-items-center justify-content-between">
    <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
    <div className="page-title-right">
      <ol className="breadcrumb m-0">
        <li className="breadcrumb-item"><a href="/#">{title}</a></li>
        <li className="breadcrumb-item active">{breadcrumbItem}</li>
      </ol>
    </div>
  </div>
);

// 🔹 Date Helpers
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const formatPrintDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// 🔹 Main Component
const BankReconciliation = () => {
  const firstDayOfMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const today = formatDate(new Date());
  const [globalFilter, setGlobalFilter] = useState("");
  const [reconData, setReconData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);

  const [filters, setFilters] = useState({
    receipt_no: { value: null, matchMode: FilterMatchMode.CONTAINS },
    customer_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    invoice_no: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // 🔹 Fetch Data from API
  const fetchReconciliation = async () => {
    try {
      setLoading(true);
      const orgid = 1;
      const branchid = 1;

      const response = await getBankReconciliation({
        orgid,
        branchid,
        fromDate,
        toDate,
      });

      const formatted = response.map((r) => ({
        receipt_no: r.receipt_no,
        receipt_date: r.receipt_date ? new Date(r.receipt_date) : null,
        invoice_no: r.invoice_no || "-",
        customer_name: r.customer_name || "-",
        bank_name: r.bank_name || "-",
        deposit_account_number: r.deposit_account_number || "-",
        receipt_applied_amount: parseFloat(r.receipt_applied_amount || 0),
        bank_amount: parseFloat(r.bank_amount || 0),
        posted_amount: parseFloat(r.posted_amount || 0),
        difference: parseFloat(r.difference || 0),
        status: r.status || "Not Posted",
      }));

      setReconData(formatted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch bank reconciliation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliation();
  }, []);

  // 🔹 Export to Excel
  const exportToExcel = () => {
    const data = reconData.map((r) => ({
      "Receipt No": r.receipt_no,
      "Date": r.receipt_date ? r.receipt_date.toLocaleDateString() : "",
      "Invoice No": r.invoice_no,
      "Customer": r.customer_name,
      "Bank": r.bank_name,
      "Account No": r.deposit_account_number,
      "Applied Amount": r.receipt_applied_amount,
      "Bank Amount": r.bank_amount,
      "Posted Amount": r.posted_amount,
      "Difference": r.difference,
      "Status": r.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bank Reconciliation");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `BankReconciliation_${formatDate(new Date())}.xlsx`);
  };

  // 🔹 Print Report
  const handlePrint = () => {
    const html = document.getElementById("print-section").innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Bank Reconciliation Report</title>
          <style>
            body { font-family: Arial; font-size: 10px; margin: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            th, td { border: 1px solid #ccc; padding: 5px; }
            th { background-color: #f1f1f1; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Bank Reconciliation Report</h2>
          <p style="text-align:center">From ${formatPrintDate(fromDate)} to ${formatPrintDate(toDate)}</p>
          ${html}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  const resetFilters = () => {
    setFromDate(firstDayOfMonth);
    setToDate(today);
    fetchReconciliation();
  };
  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-end">
        <span className="p-input-icon-left">
       
          <InputText
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Global Search..."
            className="form-control"
            style={{ width: "250px" }}
          />
        </span>
      </div>
    );
  };
  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Finance" breadcrumbItem="Bank Reconciliation" />

        {/* 🔹 Filters */}
        <Row className="pt-3 pb-2 align-items-end">
          <Col md="3">
            <label>From Date</label>
            <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </Col>
          <Col md="3">
            <label>To Date</label>
            <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </Col>
          <Col md="6" className="text-end">
            <Button color="primary" onClick={fetchReconciliation} className="me-2">Search</Button>
            <Button color="danger" onClick={resetFilters} className="me-2">Reset</Button>
           
        
            <Button color="info" className="me-2" onClick={handlePrint}><i className="bx bx-printer me-1"></i> Print</Button>
            <Button color="secondary" onClick={exportToExcel}><i className="bx bx-export me-1"></i> Export</Button>
          </Col>
        </Row>

        {/* 🔹 Data Table */}
        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
              <DataTable
    value={reconData}
    loading={loading}
    paginator
    rows={20}
    filters={filters}
    onFilter={(e) => setFilters(e.filters)}
    globalFilter={globalFilter}                    // bind global filter here
    globalFilterFields={["receipt_no", "customer_name", "invoice_no", "status", "bank_name", "deposit_account_number"]}
    showGridlines
    emptyMessage="No records found."
    filterDisplay="menu"
    header={renderHeader()}  
                >
                  <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} style={{ width: "60px" }} />
                  <Column field="receipt_no" header="Receipt No" sortable filter />
                  <Column field="receipt_date" header="Date" body={(r) => r.receipt_date?.toLocaleDateString() || "-"} sortable />
                  <Column field="invoice_no" header="Invoice No" filter sortable />
                  <Column field="customer_name" header="Customer" filter sortable />
                  <Column field="bank_name" header="Bank" sortable />
                  <Column field="deposit_account_number" header="Account No" />
                  <Column field="receipt_applied_amount" header="Applied Amt" body={(r) => r.receipt_applied_amount.toLocaleString()} className="text-end" sortable />
                  <Column field="bank_amount" header="Bank Amt" body={(r) => r.bank_amount.toLocaleString()} className="text-end" sortable />
                  <Column field="posted_amount" header="Posted Amt" body={(r) => r.posted_amount.toLocaleString()} className="text-end" sortable />
                  <Column field="difference" header="Difference" body={(r) => r.difference.toLocaleString()} className="text-end" sortable />
                  <Column field="status" header="Status" sortable />
                </DataTable>

                {/* 🔹 Hidden print table */}
                <div id="print-section" style={{ display: "none" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>S.No.</th>
                        <th>Receipt No</th>
                        <th>Date</th>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Bank</th>
                        <th>Account</th>
                        <th>Applied</th>
                        <th>Bank</th>
                        <th>Posted</th>
                        <th>Diff</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconData.map((r, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{r.receipt_no}</td>
                          <td>{formatPrintDate(r.receipt_date)}</td>
                          <td>{r.invoice_no}</td>
                          <td>{r.customer_name}</td>
                          <td>{r.bank_name}</td>
                          <td>{r.deposit_account_number}</td>
                          <td className="text-end">{r.receipt_applied_amount.toLocaleString()}</td>
                          <td className="text-end">{r.bank_amount.toLocaleString()}</td>
                          <td className="text-end">{r.posted_amount.toLocaleString()}</td>
                          <td className="text-end">{r.difference.toLocaleString()}</td>
                          <td>{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BankReconciliation;
