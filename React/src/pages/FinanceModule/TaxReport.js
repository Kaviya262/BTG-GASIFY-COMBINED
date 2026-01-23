import React, { useState } from "react";
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Button,
  Input,
} from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Tag } from "primereact/tag";

import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

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

const TaxReport = () => {
  const [searchField, setSearchField] = useState("Supplier Name");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  // Dummy Data
  const data = [
    {
      id: 1,
      monthName: "Jan",
      supplierName: "ABC Logistics",
      supplierAddress: "123 Main St, Mumbai",
      description: "Shipping Charges",
      tin: "TIN123456",
      poNo: "PO001",
      invNo: "INV1001",
      invDate: "2025-01-15",
      invAmt: 50000,
      invCurrency: "INR",
      govtRateConversion: 1,
      taxType: "GST",
      taxRate: "18%",
      taxAmount: 9000,
      depositCode: "DEP001",
      govtReceiptNo: "REC123",
      bankSlipNo: "BS001",
      taxPaidDate: "2025-01-20",
      ledgerCode: "LED123",
    },
    {
      id: 2,
      monthName: "Feb",
      supplierName: "XYZ Services",
      supplierAddress: "45 Industrial Area, Delhi",
      description: "Handling Charges",
      tin: "TIN789012",
      poNo: "PO002",
      invNo: "INV1002",
      invDate: "2025-02-10",
      invAmt: 30000,
      invCurrency: "USD",
      govtRateConversion: 82.5,
      taxType: "VAT",
      taxRate: "12%",
      taxAmount: 3600,
      depositCode: "DEP002",
      govtReceiptNo: "REC456",
      bankSlipNo: "BS002",
      taxPaidDate: "2025-02-15",
      ledgerCode: "LED456",
    },
  ];

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const clearFilter = () => {
    setFilters({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
    setGlobalFilterValue("");
  };

  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <Button color="danger" onClick={clearFilter}>
          <i className="mdi mdi-filter-off me-1"></i> Clear
        </Button>
        <span className="p-input-icon-left">
          
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Global Search"
          />
        </span>
      </div>
    );
  };

  const actionBodyTemplate = () => (
    <div className="d-flex gap-2 justify-content-center">
      <Button color="link" size="sm"><i className="mdi mdi-pencil"></i></Button>
      <Button color="link" size="sm"><i className="mdi mdi-delete"></i></Button>
    </div>
  );

  const header = renderHeader();

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Finance" breadcrumbItem="Tax Report" />

          {/* Search & Actions */}
          <Row className="pt-3 pb-3">
            <Col md="3">
              <Input
                type="select"
                value={searchField}
                onChange={e => setSearchField(e.target.value)}
              >
                <option>Supplier Name</option>
                <option>Month Name</option>
                <option>PO No.</option>
              </Input>
            </Col>
            <Col md="3">
              <Input
                type="text"
                placeholder={searchField}
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </Col>
            <Col md="6" className="text-end">
              <Button color="primary" className="me-2">
                <i className="mdi mdi-magnify"></i> Search
              </Button>
             
              <Button color="secondary" className="me-2">Export</Button>
              <Button color="danger" className="me-2">Cancel</Button>
              {/* <Button color="success">+ New</Button> */}
            </Col>
          </Row>

          {/* DataTable */}
          <Card>
            <CardBody>
              <DataTable
                value={data}
                paginator
                rows={20}
                dataKey="id"
                filters={filters}
                globalFilterFields={[
                  "supplierName",
                  "monthName",
                  "poNo",
                  "invNo",
                  "taxType"
                ]}
                header={header}
                emptyMessage="No tax records found."
                showGridlines
              >
                <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} />
                <Column field="monthName" header="Month Name" sortable filter />
                <Column field="supplierName" header="Supplier Name" sortable filter />
                <Column field="supplierAddress" header="Supplier Address" />
                <Column field="description" header="Description" />
                <Column field="tin" header="TIN" />
                <Column field="poNo" header="PO No." sortable />
                <Column field="invNo" header="Inv No." sortable />
                <Column field="invDate" header="Inv Date" />
                <Column field="invAmt" header="Inv Amt" body={(d) => d.invAmt.toLocaleString()} className="text-end" />
                <Column field="invCurrency" header="Currency" />
                <Column field="govtRateConversion" header="Govt Rate Conversion" />
                <Column field="taxType" header="Tax Type" sortable />
                <Column field="taxRate" header="Tax Rate" />
                <Column field="taxAmount" header="Tax Amount" body={(d) => d.taxAmount.toLocaleString()} className="text-end" />
                <Column field="depositCode" header="Deposit Code" />
                <Column field="govtReceiptNo" header="Govt Receipt No." />
                <Column field="bankSlipNo" header="Bank Slip No." />
                <Column field="taxPaidDate" header="Tax Paid Date" />
                <Column field="ledgerCode" header="Ledger Code" />
                {/* <Column header="Action" body={actionBodyTemplate} /> */}
              </DataTable>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default TaxReport;
