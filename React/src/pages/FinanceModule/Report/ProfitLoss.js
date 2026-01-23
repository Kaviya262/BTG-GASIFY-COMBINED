import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Select from "react-select";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { getProfitLoss } from "../service/financeapi";

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

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
};

const formatPrintDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()}-${d.toLocaleString("en-US",{ month: "short"})}-${d.getFullYear()}`;
};

const ProfitLoss = () => {
  const firstDayOfMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth()-4, 1));
  const today = formatDate(new Date());

  const [loading, setLoading] = useState(false);
  const [profitLoss, setProfitLoss] = useState([]);
  const [currency, setCurrency] = useState(null);
  const [currencyList, setCurrencyList] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);

  const filtersSchema = {
    category: { value: null, matchMode: FilterMatchMode.CONTAINS },
    amount: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
  const [filters, setFilters] = useState(filtersSchema);

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      const response = await getProfitLoss( 1,0,
         fromDate,
         toDate,
      );
if(response.status){
    const uCurrency = [...new Set(response?.data.map(i => i.Currency || "NO-CURRENCY"))]
  .map(c => ({ label: c, value: c }));
      setCurrencyList(uCurrency);

    //   setProfitLoss(
    //     response?.data.map((x) => ({
    //       category: x.Category,
    //       type: x.Type,
    //       currency: x.Currency,
    //       amount: parseFloat(x.Amount || 0),
    //     }))
    //   );
      setProfitLoss(
        response?.data.map((x) => ({
          category: x.categoryName,
          type: x.Section === "Revenue" ? "Income" : "Expense",
          currency: x.Currency,
          amount: parseFloat(x.Amount || 0),
        }))
      );
    }
    } catch (err) {
      toast.error("Error loading profit & loss report");
    } finally {
      setLoading(false);
    }
  };

  const filtered = currency ? profitLoss.filter((d) => d.currency === currency.value) : [];

  const calcNet = () => {
    const income = filtered.filter((d) => d.type === "Income").reduce((a, b) => a + b.amount, 0);
    const expense = filtered.filter((d) => d.type === "Expense").reduce((a, b) => a + b.amount, 0);
    return income - expense;
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((i) => ({
        Category: i.category,
        Type: i.type,
        Currency: i.currency,
        Amount: i.amount
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProfitLoss");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })]),
      `ProfitLoss-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handlePrint = () => {
    const content = document.getElementById("print-section").innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Profit Loss Report</title></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleCancelFilters = () => {
    setCurrency(null);
    setFromDate(firstDayOfMonth);
    setToDate(today);
    setFilters(filtersSchema);
    fetchProfitLoss();
  };

  useEffect(() => {
    fetchProfitLoss();
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Finance" breadcrumbItem="Profit & Loss" />

        <Row className="pt-2 pb-3">
          <Col md="3">
            <Select options={currencyList} value={currency} onChange={setCurrency} placeholder="Filter Currency" isClearable />
          </Col>
          <Col md="3">
            <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} max={toDate} />
          </Col>
          <Col md="3">
            <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} min={fromDate} />
          </Col>
          <Col md="12" className="text-end mt-2">
            <button className="btn btn-primary me-2" onClick={fetchProfitLoss}>Search</button>
            <button className="btn btn-danger me-2" onClick={handleCancelFilters}>Cancel</button>
            <button className="btn btn-info me-2" onClick={handlePrint}><i className="bx bx-printer me-2"></i> Print</button>
            <button className="btn btn-secondary" onClick={exportToExcel}><i className="bx bx-export me-2"></i> Export</button>
          </Col>
        </Row>

        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-2">
                  <input type="text" placeholder="Global Search" className="form-control w-auto" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
                </div>

                <DataTable
  value={filtered} // filtered by currency if needed
  loading={loading}
  paginator
  rows={20}
  globalFilter={globalFilter}
  globalFilterFields={["category", "type", "currency", "amount"]}
  showGridlines
>
  <Column field="category" header="Category" />
  <Column field="type" header="Type" />
  <Column field="currency" header="Currency" />
  <Column
    field="amount"
    header="Amount"
    body={(d) =>
      d.amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })
    }
    className="text-end"
  />
</DataTable>


                <h4 className={`text-end mt-3 fw-bold ${calcNet() >= 0 ? "text-success" : "text-danger"}`}>
                  Net Profit / Loss: {calcNet().toLocaleString("en-US",{ minimumFractionDigits: 2 })}
                </h4>

                {/* PRINT TABLE */}
                <div id="print-section" style={{ display: "none" }}>
                  <h3 style={{ textAlign: "center" }}>Profit & Loss Report</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Currency</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((i, index) => (
                        <tr key={index}>
                          <td>{i.category}</td>
                          <td>{i.type}</td>
                          <td>{i.currency}</td>
                          <td style={{ textAlign: "right" }}>{i.amount.toLocaleString("en-US",{ minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h4 style={{ textAlign: "right",marginTop:"10px" }} >
                    Net Profit/Loss: {calcNet().toLocaleString("en-US",{ minimumFractionDigits: 2 })}
                  </h4>
                </div>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfitLoss;
