import React, { useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Container, Row, Col, Button } from "reactstrap";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/primereact.css";

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

// ===== Sample Data =====
const sampleData = [
  {
    id: 1,
    account: "Cash & Bank",
    type: "Asset",
    currency: "IDR",
    openingBalance: 15000000,
    debit: 5000000,
    credit: 2000000,
    closingBalance: 18000000,
    transactions: [
      { id: "TX001", date: "2025-09-01", description: "Deposit", debit: 5000000, credit: 0 },
      { id: "TX002", date: "2025-09-05", description: "Withdrawal", debit: 0, credit: 2000000 },
    ],
  },
  {
    id: 2,
    account: "Accounts Receivable",
    type: "Asset",
    currency: "IDR",
    openingBalance: 10000000,
    debit: 3000000,
    credit: 1000000,
    closingBalance: 12000000,
    transactions: [
      { id: "TX003", date: "2025-09-03", description: "Invoice Received", debit: 3000000, credit: 0 },
      { id: "TX004", date: "2025-09-07", description: "Payment Received", debit: 0, credit: 1000000 },
    ],
  },
  {
    id: 3,
    account: "Accounts Payable",
    type: "Liability",
    currency: "IDR",
    openingBalance: 8000000,
    debit: 1000000,
    credit: 4000000,
    closingBalance: 5000000,
    transactions: [
      { id: "TX005", date: "2025-09-02", description: "Purchase", debit: 1000000, credit: 0 },
      { id: "TX006", date: "2025-09-08", description: "Payment Made", debit: 0, credit: 4000000 },
    ],
  },
  {
    id: 4,
    account: "Capital",
    type: "Equity",
    currency: "IDR",
    openingBalance: 20000000,
    debit: 0,
    credit: 0,
    closingBalance: 20000000,
    transactions: [],
  },
];

// ===== Number formatting =====
const numFmt = (value) => value.toLocaleString();

export default function BalanceSheetPrime() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTx, setModalTx] = useState([]);
  const [modalAccount, setModalAccount] = useState("");

  // Filtered Data
  const filteredData = useMemo(() => {
    return sampleData.filter((d) => {
      const typeMatch = typeFilter === "All" || d.type === typeFilter;
      const searchMatch = d.account.toLowerCase().includes(search.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [typeFilter, search]);

  // Open transaction modal
  const openModal = (account) => {
    setModalTx(account.transactions);
    setModalAccount(account.account);
    setModalOpen(true);
  };

  return (
    <div className="page-content">

    <Container fluid className="mt-3">
      {/* Breadcrumb */}
      <Breadcrumbs title="Report" breadcrumbItem="Balance Sheet" />
 

      {/* Filters & Actions */}
      <Row className="mb-3 align-items-center">
        <Col md={3}>
          <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Asset">Asset</option>
            <option value="Liability">Liability</option>
            <option value="Equity">Equity</option>
          </select>
        </Col>
        <Col md={3}>
          <input
            type="text"
            className="form-control"
            placeholder="Search Account"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={6} className="text-end">
          <Button color="secondary" className="me-2">Export</Button>
          <Button color="success">Print</Button>
        </Col>
      </Row>

      {/* DataTable */}
      <DataTable
        value={filteredData}
        paginator
        rows={5}
        responsiveLayout="scroll"
        rowHover
        className="p-datatable-sm"
      >
        <Column
          field="account"
          header="Account Name"
          sortable
          body={(row) => (
            <span
              style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => openModal(row)}
            >
              {row.account}
            </span>
          )}
        />
        <Column field="type" header="Type" sortable />
        <Column field="currency" header="Currency" />
        <Column field="openingBalance" header="Opening Balance" body={(row) => numFmt(row.openingBalance)} style={{ textAlign: "right" }} />
        <Column field="debit" header="Debit" body={(row) => numFmt(row.debit)} style={{ textAlign: "right" }} />
        <Column field="credit" header="Credit" body={(row) => numFmt(row.credit)} style={{ textAlign: "right" }} />
        <Column field="closingBalance" header="Closing Balance" body={(row) => numFmt(row.closingBalance)} style={{ textAlign: "right", fontWeight: "600" }} />
      </DataTable>

      {/* Transaction Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="modal-content"
            style={{ background: "#fff", padding: 20, borderRadius: 8, width: "80%", maxHeight: "80%", overflowY: "auto" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <h4>{modalAccount} Transactions</h4>
              <button onClick={() => setModalOpen(false)} style={{ cursor: "pointer" }}>
                Close
              </button>
            </div>
            <DataTable value={modalTx} showGridlines responsiveLayout="scroll">
              <Column field="id" header="ID" />
              <Column field="date" header="Date" />
              <Column field="description" header="Description" />
              <Column field="debit" header="Debit" body={(r) => numFmt(r.debit)} style={{ textAlign: "right" }} />
              <Column field="credit" header="Credit" body={(r) => numFmt(r.credit)} style={{ textAlign: "right" }} />
            </DataTable>
          </div>
        </div>
      )}
    </Container>
    </div>
  );
}
