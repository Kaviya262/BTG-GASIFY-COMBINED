import React, { useState, useMemo } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import "flatpickr/dist/themes/material_blue.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/primereact.css";

// ===== Sample Data =====
const customers = [
  { id: "CUST001", name: "PT. Nusantara Trading" },
  { id: "CUST002", name: "CV. Merdeka" },
  { id: "CUST003", name: "PT. Sejahtera" },
];
const suppliers = [
  { id: "SUPP001", name: "PT. Sumber Jaya" },
  { id: "SUPP002", name: "PT. Sentosa" },
  { id: "SUPP003", name: "CV. Makmur" },
];
const salesInvoices = [
  { id: "SI1001", date: "2025-09-02", customerId: "CUST001", amount: 15000000 },
  { id: "SI1002", date: "2025-09-12", customerId: "CUST002", amount: 25000000 },
  { id: "SI1003", date: "2025-09-15", customerId: "CUST003", amount: 18000000 },
];
const purchases = [
  { id: "PO4001", date: "2025-09-05", supplierId: "SUPP001", amount: 12000000 },
  { id: "PO4002", date: "2025-09-10", supplierId: "SUPP002", amount: 8000000 },
  { id: "PO4003", date: "2025-09-14", supplierId: "SUPP003", amount: 5000000 },
];
const claims = [
  { id: "CL3001", date: "2025-09-14", party: "CUST002", amount: 2000000, type: "Refund" },
  { id: "CL3002", date: "2025-09-16", party: "CUST001", amount: 1500000, type: "Adjustment" },
];

// ===== Helpers =====
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");

const numFmt = new Intl.NumberFormat("en-US", { style: "decimal", minimumFractionDigits: 0 });

const aggregateTransactions = () => {
  const tx = [];
  salesInvoices.forEach((si) => {
    const customer = customers.find((c) => c.id === si.customerId)?.name || si.customerId;
    tx.push({ id: si.id, module: "Sales", account: customer, date: si.date, description: `Invoice ${si.id}`, debit: 0, credit: si.amount });
  });
  purchases.forEach((po) => {
    const supplier = suppliers.find((s) => s.id === po.supplierId)?.name || po.supplierId;
    tx.push({ id: po.id, module: "Purchase", account: supplier, date: po.date, description: `PO ${po.id}`, debit: po.amount, credit: 0 });
  });
  claims.forEach((cl) => {
    tx.push({ id: cl.id, module: "Claims", account: cl.party, date: cl.date, description: `${cl.type} ${cl.id}`, debit: cl.amount, credit: 0 });
  });
  return tx;
};

// ===== Export CSV =====
const exportCSV = (rows, filename = "trial-balance.csv") => {
  const header = ["Account", "Total Debit", "Total Credit", "Balance"];
  const lines = rows.map((r) => [r.account, r.totalDebit, r.totalCredit, r.balance].join(";"));
  const csv = [header.join(";"), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ===== Breadcrumb Component =====
const Breadcrumbs = ({ title, breadcrumbItem }) => (
  <div className="page-title-box d-sm-flex align-items-center justify-content-between mb-3">
    <h4 className="mb-0">{breadcrumbItem}</h4>
    <div className="page-title-right">
      <ol className="breadcrumb m-0">
        <li className="breadcrumb-item"><a href="/#">{title}</a></li>
        <li className="breadcrumb-item active">{breadcrumbItem}</li>
      </ol>
    </div>
  </div>
);

// ===== Main Component =====
export default function TrialBalanceReport() {
  const allTx = useMemo(() => aggregateTransactions(), []);
  const [dateRange, setDateRange] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedParty, setSelectedParty] = useState(null);
  const [expandedAccount, setExpandedAccount] = useState(null);

  // ===== Filtering =====
  const filteredTx = useMemo(() => {
    return allTx.filter((t) => {
      if (dateRange.length === 2) {
        const start = new Date(dateRange[0]).setHours(0,0,0,0);
        const end = new Date(dateRange[1]).setHours(23,59,59,999);
        const td = new Date(t.date).getTime();
        if (td < start || td > end) return false;
      }
      if (selectedParty && t.account !== selectedParty.value) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allTx, dateRange, selectedParty, search]);

  // ===== Group by account =====
  const trialData = useMemo(() => {
    const groups = {};
    filteredTx.forEach((t) => {
      if (!groups[t.account]) groups[t.account] = { account: t.account, totalDebit: 0, totalCredit: 0, transactions: [] };
      groups[t.account].totalDebit += t.debit;
      groups[t.account].totalCredit += t.credit;
      groups[t.account].transactions.push(t);
    });
    return Object.values(groups).map(g => ({ ...g, balance: g.totalDebit - g.totalCredit }));
  }, [filteredTx]);

  const totalDebit = trialData.reduce((a,b)=>a+b.totalDebit,0);
  const totalCredit = trialData.reduce((a,b)=>a+b.totalCredit,0);

  return (

        <div className="page-content">
          <Container fluid>
            <Breadcrumbs title="Report" breadcrumbItem="Trial Balance" />
    
      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 15, marginBottom: 20, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Date Range</label>
          <Flatpickr
            className="form-control"
            options={{ mode: "range", dateFormat: "d-M-Y" }}
            value={dateRange}
            onChange={setDateRange}
            style={{ minWidth: 200, padding: "6px 8px", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", minWidth: 220 }}>
          <label>Party</label>
          <Select
            value={selectedParty}
            onChange={setSelectedParty}
            options={[...customers, ...suppliers].map(p => ({ label: p.name, value: p.name }))}
            isClearable
            placeholder="Select Party"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search description"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 180, padding: "6px 8px", fontSize: 14 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Button color="secondary" onClick={() => { setDateRange([]); setSearch(""); setSelectedParty(null); }}>Clear</Button>
          <Button color="primary" onClick={() => exportCSV(trialData)}>Export Excel</Button>
          <Button color="success" onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable value={trialData} showGridlines responsiveLayout="scroll" rowHover>
        <Column 
          header="Account"
          body={(row) => (
            <span
              style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setExpandedAccount(expandedAccount === row.account ? null : row.account)}
            >
              {row.account}
            </span>
          )}
          sortable
        />
        <Column field="totalDebit" header="Total Debit" body={r => numFmt.format(r.totalDebit)} style={{ textAlign: "right" }} footer={numFmt.format(totalDebit)} />
        <Column field="totalCredit" header="Total Credit" body={r => numFmt.format(r.totalCredit)} style={{ textAlign: "right" }} footer={numFmt.format(totalCredit)} />
        <Column field="balance" header="Balance" body={r => numFmt.format(r.balance)} style={{ textAlign: "right", fontWeight: 600 }} footer={numFmt.format(totalDebit - totalCredit)} />
      </DataTable>

      {/* Transactions below the selected account */}
      {expandedAccount && (
        <div style={{ marginTop: 20 }}>
          <h5>Transactions for: {expandedAccount}</h5>
          <DataTable
            value={trialData.find(t => t.account === expandedAccount)?.transactions || []}
            showGridlines
            responsiveLayout="scroll"
          >
            <Column field="date" header="Date" body={r => formatDate(r.date)} />
            <Column field="module" header="Module" />
            <Column field="description" header="Description" />
            <Column field="debit" header="Debit" body={r => numFmt.format(r.debit)} style={{ textAlign: "right" }} />
            <Column field="credit" header="Credit" body={r => numFmt.format(r.credit)} style={{ textAlign: "right" }} />
          </DataTable>
        </div>
      )}
 
      </Container>
        </div>
  );
}
