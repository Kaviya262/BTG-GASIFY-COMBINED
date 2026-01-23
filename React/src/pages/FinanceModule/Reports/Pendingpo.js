import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Label,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import "flatpickr/dist/themes/material_green.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { GetInvoiceReceiptAddDetails } from "common/data/mastersapi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { startOfWeek } from "date-fns";

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Pendingpo = () => {
  const { irnid } = useParams();
  const isEditMode = Boolean(irnid && parseInt(irnid));

  const today = new Date();
  const defaultFromDate = startOfWeek(today, { weekStartsOn: 1 });
  const defaultToDate = new Date(defaultFromDate);
  defaultToDate.setDate(defaultFromDate.getDate() + 5);

  const [dueFromDate, setDueFromDate] = useState(defaultFromDate);
  const [dueToDate, setDueToDate] = useState(defaultToDate);
  const [items, setItems] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const dtRef = useRef(null);

  // Fetch data from API
  const handleSearch = async (from, to) => {
    const fromDate = formatDate(from);
    const toDate = formatDate(to);

    try {
      const res = await GetInvoiceReceiptAddDetails(1, 1, fromDate, toDate);
      if (res?.data?.length > 0) {
        const mappedItems = res.data.map((item) => ({
          grnNo: item.grnno,
          pono: item.pono,
          supplierName: item.suppliername,
          poAmount: item.po_amount
            ? parseFloat(item.po_amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00",
          balanceAmount: item.balance_amount
            ? parseFloat(item.balance_amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00",
        }));
        setItems(mappedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  // Export CSV
  const exportCSV = () => {
    dtRef.current.exportCSV();
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Reports" breadcrumbItem="Outstanding POs" />
        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                {/* Top Controls: Dates + Buttons */}
                <Row className="mb-3 align-items-end">
                <Col md="3" className="d-flex align-items-center">
    <Label className="me-2 mb-0" style={{ whiteSpace: "nowrap" }}>
      GRN From Date
    </Label>
    <Flatpickr
      className="form-control"
      value={dueFromDate}
      onChange={(date) => setDueFromDate(date[0])}
      options={{
        altInput: true,
        altFormat: "d-M-Y",
        dateFormat: "Y-m-d",
      }}
    />
  </Col>

  {/* GRN To */}
  <Col md="3" className="d-flex align-items-center">
    <Label className="me-2 mb-0" style={{ whiteSpace: "nowrap" }}>
      GRN To Date
    </Label>
    <Flatpickr
      className="form-control"
      value={dueToDate}
      onChange={(date) => setDueToDate(date[0])}
      options={{
        altInput: true,
        altFormat: "d-M-Y",
        dateFormat: "Y-m-d",
      }}
    />
  </Col>
                  <Col md="6" className="text-end">
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={() => handleSearch(dueFromDate, dueToDate)}
                    >
                      <i className="bx bx-search-alt align-middle me-1"></i>
                      Search
                    </button>
                    <button
                      type="button"
                      className="btn btn-success me-2"
                      onClick={exportCSV}
                    >
                      <i className="bx bx-export align-middle me-1"></i>
                      Export
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => window.print()}
                    >
                      <i className="bx bx-printer align-middle me-1"></i>
                      Print
                    </button>
                  </Col>
                </Row>

                {/* DataTable with Global Search in Header */}
                <div className="table-responsive">
                  <DataTable
                    ref={dtRef}
                    value={items}
                    paginator
                    rows={20}
                    globalFilter={globalFilter}
                    header={
                      <div className="d-flex justify-content-end">
                        <input
                          type="search"
                          placeholder="Global Search"
                          className="form-control"
                          style={{ width: "250px" }}
                          value={globalFilter}
                          onChange={(e) => setGlobalFilter(e.target.value)}
                        />
                      </div>
                    }
                    responsiveLayout="scroll"
                  >
                    <Column field="supplierName" header="Supplier"></Column>
                    <Column field="pono" header="PO No"></Column>
                    <Column field="grnNo" header="GRN No"></Column>
                    <Column
                      field="poAmount"
                      header="PO Amount"
                      style={{ textAlign: "right" }}
                    ></Column>
                    <Column
                      field="balanceAmount"
                      header="Balance Amount"
                      style={{ textAlign: "right" }}
                    ></Column>
                  </DataTable>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Pendingpo;
