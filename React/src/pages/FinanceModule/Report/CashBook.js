import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getCashBookList } from "common/data/mastersapi";
import { toast } from "react-toastify";
import Select from "react-select";

const Breadcrumbs = ({ title, breadcrumbItem }) => (
    <div className="page-title-box d-sm-flex align-items-center justify-content-between">
        <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
        <div className="page-title-right">
            <ol className="breadcrumb m-0">
                <li className="breadcrumb-item"><a href="/#">{title}</a></li>
                <li className="breadcrumb-item active"><a href="/#">{breadcrumbItem}</a></li>
            </ol>
        </div>
    </div>
);

// Format date to yyyy-MM-dd
const formatDate = (date) => {
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

const CashBook = () => {
  const firstDayOfMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const today = formatDate(new Date());

  const [cashBook, setCashBook] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");


  "GLcode","description", "voucherNo","actamount", "party", "transactionType","cashIn","cashOut","balance"

  const [filters, setFilters] = useState({
    description: { value: null, matchMode: FilterMatchMode.CONTAINS },
    GLcode: { value: null, matchMode: FilterMatchMode.CONTAINS },
    actamount: { value: null, matchMode: FilterMatchMode.CONTAINS },
    cashIn: { value: null, matchMode: FilterMatchMode.CONTAINS },
    cashOut: { value: null, matchMode: FilterMatchMode.CONTAINS },
    balance: { value: null, matchMode: FilterMatchMode.CONTAINS },
    CurrencyCode: { value: null, matchMode: FilterMatchMode.CONTAINS },
    voucherNo: { value: null, matchMode: FilterMatchMode.CONTAINS },
    transactionType: { value: null, matchMode: FilterMatchMode.CONTAINS },
    party: { value: null, matchMode: FilterMatchMode.CONTAINS },
    date: { value: null, matchMode: FilterMatchMode.DATE_IS },
  });
 const [currency, setCurrency] = useState(null);
    const [currencyList, setCurrencyList] = useState([]);
  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);

  const fetchCashBook = async () => {
    try {
      setLoading(true);
      setCashBook([]);
      const orgId = 1;
      const branchId = 1;

      const response = await getCashBookList({
        orgid: orgId,
        branchid: branchId,
        fromDate: fromDate || null,
        toDate: toDate || null,
      });

      const uniqueCurrency = [
        ...new Set(response.map((x) => x.CurrencyCode))
      ].map((c) => ({ label: c, value: c }));
    
      setCurrencyList(uniqueCurrency);

      const transformed = response.map((item) => ({
        date: item.Date ? (item.Date) : null,
        voucherNo: item["Voucher No"] || "-",
        GLcode:item["GLcode"] || "",
        transactionType: item.TransactionType || "-",
        actamount:item.actamount || "",
        CurrencyCode:item.CurrencyCode || "",
        party: item["Party / Account"] || "-",
        description: item.Description || "-",
        cashIn: parseFloat(item["Cash In (Debit)"]?.replace(/,/g, "") || 0),
        cashOut: parseFloat(item["Cash Out (Credit)"]?.replace(/,/g, "") || 0),
        balance: parseFloat(item["Balance"]?.replace(/,/g, "") || 0),
      }));

      setCashBook(transformed);
    } catch (error) {
      toast.error("Error fetching cash book data.");
    } finally {
      setLoading(false);
    }
  };
  const filtered = currency
  ? cashBook.filter(item => item.CurrencyCode === currency.value)
  : [];
  const exportToExcel = () => {
    const exportData = filtered.map((ex) => ({
      Date: ex.date ? ex.date.toLocaleDateString() : "",
      "Voucher No": ex.voucherNo,
      "GL Code":ex.GLcode,
      "Transaction Type": ex.transactionType,
      "Party / Account": ex.party,
      Description: ex.description,
"Currency":ex.CurrencyCode,
      "":ex.actamount,
      

      "Cash In (IDR)": ex.cashIn,
      "Cash Out (IDR)": ex.cashOut,
      "Balance (IDR)": ex.balance,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cash Book");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, `CashBook-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePrint = () => {
    const tableHTML = document.getElementById("print-section").innerHTML;
    const from = formatPrintDate(fromDate);
    const to = formatPrintDate(toDate);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Cash Book</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
            h2 { text-align: center; font-size: 12px; margin-bottom: 5px; }
            p { text-align: center; font-size: 10px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            th, td { padding: 5px; border: 1px solid #ccc; text-align: left; }
            th { background-color: #f8f8f8; }
            .text-end { text-align: right; }
          </style>
        </head>
        <body>
          <h2>Cash Book Report</h2>
          <p>From: ${from} To: ${to}</p>
          ${tableHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleCancelFilters = () => {
    setCurrency(null);

    setFromDate(firstDayOfMonth);
    setToDate(today);
    setFilters({
      description: { value: null, matchMode: FilterMatchMode.CONTAINS },
      voucherNo: { value: null, matchMode: FilterMatchMode.CONTAINS },
      transactionType: { value: null, matchMode: FilterMatchMode.CONTAINS },
      party: { value: null, matchMode: FilterMatchMode.CONTAINS },
      date: { value: null, matchMode: FilterMatchMode.DATE_IS },
    });
    setGlobalFilter("");
  };

  useEffect(() => {
    fetchCashBook();
  }, []);

  // Define header outside JSX for cleaner code
const renderHeader = () => {
    return (
      <div className="d-flex justify-content-end">
        <span className="p-input-icon-left">
         
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Global Search"
            className="form-control"
            style={{ width: '250px' }}
          />
        </span>
      </div>
    );
  };
  
  const header = renderHeader();

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Finance" breadcrumbItem="Cash Book" />

        {/* Filter & Buttons Section */}
        <Row className="pt-2 pb-3 align-items-end">
        <Col md="3" className="d-flex align-items-center">
                    
                    <Select
        options={currencyList}
        placeholder="Filter Currency"
        value={currency}
        onChange={setCurrency}
        isClearable
        styles={{ container: (base) => ({ ...base, width: "100%" }) }}
      /> </Col>
          <Col md="2">
            <input
              type="date"
              className="form-control"
              value={fromDate ?? ""}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate}
            />
          </Col>

          <Col md="2">
            <input
              type="date"
              className="form-control"
              value={toDate ?? ""}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              max={today}
            />
          </Col>

          

          <Col md="5" className="d-flex justify-content-end">
            <button type="button" className="btn btn-primary me-2" onClick={fetchCashBook}>
              Search
            </button>
            <button type="button" className="btn btn-danger me-2" onClick={handleCancelFilters}>
              Cancel
            </button>
            <button type="button" className="btn btn-info me-2" onClick={handlePrint}>
              <i className="bx bx-printer me-1"></i> Print
            </button>
            <button type="button" className="btn btn-secondary" onClick={exportToExcel}>
              <i className="bx bx-export me-1"></i> Export
            </button>
          </Col>
        </Row>

        {/* Data Table */}
        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                <DataTable
                  value={filtered}
                  loading={loading}
                  paginator
                  rows={20}
                 
                  filters={filters}
                  onFilter={(e) => setFilters(e.filters)}
                  globalFilter={globalFilter}
                  globalFilterFields={["date","GLcode","description","CurrencyCode", "voucherNo","actamount", "party", "transactionType","cashIn","cashOut","balance"]}
                  emptyMessage="No records found."
                  showGridlines
                  filterDisplay="menu"
                  filter
                  header={header} // <-- add header here

                >
                  {/* <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} style={{ width: '60px' }} /> */}
                  <Column field="date" header="Date"   />
                  <Column field="voucherNo" header="Voucher No" filter filterPlaceholder="Search Voucher" />
                  <Column field="GLcode" header="GL Code" filter filterPlaceholder="Search GL" />
                  
                  <Column field="transactionType" header="Transaction Type" filter filterPlaceholder="Search Type" />
                  <Column field="party" header="Party / Account" filter filterPlaceholder="Search Party" />
                  <Column field="description" header="Description"   
 filter filterPlaceholder="Search Description" />
   <Column field="CurrencyCode" header="Currency"      
 filter filterPlaceholder="Search Currency" />
                  <Column field="actamount" className="text-end" header="Currency Amount"   body={(d) => d.actamount.toLocaleString('en-US', {
                                                style: 'decimal',
                                                minimumFractionDigits: 2
                                            })}   
 filter filterPlaceholder="Search Amount" />
 
                  <Column field="cashIn" header="Cash In (IDR)" body={(d) => d.cashIn.toLocaleString('en-US', {
                                                style: 'decimal',
                                                minimumFractionDigits: 2
                                            })} className="text-end" />
                  <Column field="cashOut" header="Cash Out (IDR)" body={(d) => d.cashOut.toLocaleString('en-US', {
                                                style: 'decimal',
                                                minimumFractionDigits: 2
                                            })} className="text-end" />
                  <Column field="balance" header="Balance (IDR)" body={(d) => d.balance.toLocaleString('en-US', {
                                                style: 'decimal',
                                                minimumFractionDigits: 2
                                            })} className="text-end" />
                </DataTable>

                <div id="print-section" style={{ display: "none" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>S.No.</th>
                        <th>Date</th>
                        <th>Voucher No</th>
                        <th>Transaction Type</th>
                        <th>Party / Account</th>
                        <th>Description</th>
                        <th>Cash In (IDR)</th>
                        <th>Cash Out (IDR)</th>
                        <th>Balance (IDR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{formatPrintDate(item.date)}</td>
                          <td>{item.voucherNo}</td>
                          <td>{item.transactionType}</td>
                          <td>{item.party}</td>
                          <td>{item.description}</td>
                          <td className="text-end">{item.cashIn.toLocaleString('en-US', {
                                                style: 'decimal',
                                                minimumFractionDigits: 2
                                            })}</td>
                          <td className="text-end">{item.cashOut.toLocaleString('en-US', {
                                                style: 'decimal',
                                                minimumFractionDigits: 2
                                            })}</td>
                          <td className="text-end">{item.balance.toLocaleString('en-US', {
                                                style: 'decimal',
                                                minimumFractionDigits: 2
                                            })}</td>
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

export default CashBook;
