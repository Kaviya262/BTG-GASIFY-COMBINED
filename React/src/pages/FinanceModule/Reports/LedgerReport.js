import React, { useState, useMemo, useRef } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { InputText } from "primereact/inputtext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// Simple breadcrumb header
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

// -------- Sample Data --------
const customers = [
  { id: "C001", name: "PT Nusantara Trading" },
  { id: "C002", name: "CV Merdeka" },
  { id: "C003", name: "PT Garuda Supplies" },
];
const suppliers = [
  { id: "S001", name: "PT Sumber Jaya" },
  { id: "S002", name: "PT Sentosa Makmur" },
  { id: "S003", name: "PT Mega Abadi" },
];

const transactionsRaw = [
  { id: "SI1001", date: "2025-09-02", module: "Sales Invoice", party: "PT Nusantara Trading", debit: 0, credit: 15000000, description: "Product sale" },
  { id: "SI1002", date: "2025-09-05", module: "Sales Invoice", party: "CV Merdeka", debit: 0, credit: 20000000, description: "Service fee" },
  { id: "PO4001", date: "2025-09-03", module: "Purchase", party: "PT Sumber Jaya", debit: 12000000, credit: 0, description: "Office supplies" },
  { id: "CL3001", date: "2025-09-10", module: "Claim", party: "PT Garuda Supplies", debit: 3000000, credit: 0, description: "Refund claim" },
  { id: "PO4002", date: "2025-09-09", module: "Purchase", party: "PT Sentosa Makmur", debit: 8000000, credit: 0, description: "Raw materials" },
  { id: "SI1003", date: "2025-09-12", module: "Sales Invoice", party: "PT Garuda Supplies", debit: 0, credit: 18000000, description: "Consulting" },
  { id: "PO4003", date: "2025-09-13", module: "Purchase", party: "PT Mega Abadi", debit: 9500000, credit: 0, description: "Equipment" },
  { id: "CL3002", date: "2025-09-15", module: "Claim", party: "PT Nusantara Trading", debit: 1500000, credit: 0, description: "Adjustment" },
  { id: "SI1004", date: "2025-09-16", module: "Sales Invoice", party: "CV Merdeka", debit: 0, credit: 22000000, description: "Annual maintenance" },
];

const numFormat = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 });
const fmtDate = iso =>
  new Date(iso)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, "-");

export default function LedgerReport() {
  const openingBalance = 50000000;
  const tableRef = useRef(null);

  const [dateRange, setDateRange] = useState([]);
  const [moduleFilter, setModuleFilter] = useState(null);
  const [partyFilter, setPartyFilter] = useState(null);
  const [search, setSearch] = useState("");

  const moduleOptions = [
    { value: null, label: "All Modules" },
    ...Array.from(new Set(transactionsRaw.map(t => t.module))).map(m => ({ value: m, label: m }))
  ];
  const partyOptions = [
    { value: null, label: "All Parties" },
    ...[...customers, ...suppliers].map(p => ({ value: p.name, label: p.name }))
  ];

  const filtered = useMemo(() => {
    return transactionsRaw.filter(t => {
      if (moduleFilter?.value) {
        if (t.module !== moduleFilter.value) return false;
      }
      if (partyFilter?.value) {
        if (t.party !== partyFilter.value) return false;
      }
      if (search && !(`${t.party} ${t.description} ${t.module}`.toLowerCase()
                        .includes(search.toLowerCase())))
        return false;
      if (dateRange.length === 2) {
        const [start, end] = dateRange;
        const d = new Date(t.date);
        if (d < new Date(start) || d > new Date(end)) return false;
      }
      return true;
    });
  }, [moduleFilter, partyFilter, search, dateRange]);
  

  const withBalance = useMemo(() => {
    let bal = openingBalance;
    return filtered
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(r => {
        bal += (r.debit || 0) - (r.credit || 0);
        return { ...r, balance: bal };
      });
  }, [filtered]);

  const clearFilters = () => {
    setModuleFilter(null);
    setPartyFilter(null);
    setSearch("");
    setDateRange([]);
  };

  // -------- Export / Print --------
  const exportCSV = () => {
    const rows = [
      ["Date", "Module", "Reference", "Description", "Party", "Debit", "Credit", "Running Balance"],
      ...withBalance.map(r => [
        fmtDate(r.date), r.module, r.id, r.description, r.party,
        r.debit, r.credit, r.balance
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "ledger.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(withBalance.map(r => ({
      Date: fmtDate(r.date),
      Module: r.module,
      Reference: r.id,
      Description: r.description,
      Party: r.party,
      Debit: r.debit,
      Credit: r.credit,
      "Running Balance": r.balance
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");
    XLSX.writeFile(wb, "ledger.xlsx");
  };

  const printTable = () => {
    const content = document.getElementById("ledger-print").innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Ledger</title></head><body>${content}</body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Report" breadcrumbItem="Ledger Report" />

        {/* Filter & Action Bar */}
        <Row className="pt-3 pb-2">
          <Col>
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <Flatpickr
                className="form-control"
                style={{ width: 250 }}
                options={{ mode: "range", dateFormat: "d-M-Y" }}
                value={dateRange}
                onChange={setDateRange}
                placeholder="Date"
              />
              <Select
                value={moduleFilter}
                onChange={setModuleFilter}
                options={moduleOptions}
                placeholder="Module"
                styles={{ container: base => ({ ...base, minWidth: 200 }) }}
              />
              <Select
                value={partyFilter}
                onChange={setPartyFilter}
                options={partyOptions}
                placeholder="Party"
                isSearchable
                styles={{ container: base => ({ ...base, minWidth: 250 }) }}
              />
              <InputText
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search"
                style={{ minWidth: 180 }}
              />
              <Button color="secondary" onClick={clearFilters}>Clear</Button>
              {/* <Button color="primary" onClick={exportCSV}>Export CSV</Button> */}
              <Button color="primary" onClick={exportExcel}>Export Excel</Button>
              <Button color="success" onClick={printTable}>Print</Button>
            </div>
          </Col>
        </Row>

        {/* Ledger Table */}
        <Card>
          <CardBody id="ledger-print">
             <div className="mb-2"><strong>Opening Balance:</strong> {numFormat.format(openingBalance)}</div>

            <DataTable
              ref={tableRef}
              value={withBalance}
              paginator rows={20}
              showGridlines responsiveLayout="scroll"
              emptyMessage="No records found."
            >
              <Column header="No." body={(_, { rowIndex }) => rowIndex + 1} style={{ width: "3rem" }} />
              <Column field="date" header="Date" body={r => fmtDate(r.date)} sortable />
              <Column field="module" header="Module" sortable />
              <Column field="id" header="Reference" sortable />
              <Column field="description" header="Description" style={{ minWidth: 220 }} />
              <Column field="party" header="Party" sortable />
              <Column field="debit" header="Debit" body={r => numFormat.format(r.debit || 0)} style={{ textAlign: "right" }} sortable />
              <Column field="credit" header="Credit" body={r => numFormat.format(r.credit || 0)} style={{ textAlign: "right" }} sortable />
              <Column field="balance" header="Running Balance" body={r => numFormat.format(r.balance || 0)} style={{ textAlign: "right", fontWeight: 600 }} sortable />
            </DataTable>

            <div className="mt-3">
              <strong>Closing Balance:</strong>{" "}
              {numFormat.format(withBalance.at(-1)?.balance ?? openingBalance)}
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
