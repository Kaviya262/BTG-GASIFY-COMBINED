import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Button,
} from "reactstrap";
import Select from "react-select";
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

const AssetRegister = () => {
  const [assets, setAssets] = useState([
    {
      assetName: "Office Laptop",
      qty: 10,
      purchaseYear: 2022,
      purchaseMonth: "Jan",
      purchasePrice: 50000,
      openingBalance: 480000,
      depreciationMonth: 5000,
      depreciationYear: 15000,
      depreciationEarlier: 20000,
      currentValue: 445000,
      status: "Active",
    },
    {
      assetName: "Projector",
      qty: 2,
      purchaseYear: 2021,
      purchaseMonth: "Sep",
      purchasePrice: 30000,
      openingBalance: 55000,
      depreciationMonth: 2000,
      depreciationYear: 8000,
      depreciationEarlier: 10000,
      currentValue: 37000,
      status: "Active",
    },
  ]);

  // Global filter
  const [filters, setFilters] = useState({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  // Column filter
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [valueOptions, setValueOptions] = useState([]);

  const columnOptions = [
    { value: "assetName", label: "Asset Name" },
    { value: "qty", label: "Qty" },
    { value: "purchaseYear", label: "Purchase Year" },
    { value: "purchaseMonth", label: "Purchase Month" },
    { value: "purchasePrice", label: "Purchase Price" },
    { value: "openingBalance", label: "Opening Balance" },
    { value: "depreciationMonth", label: "Depreciation (Month)" },
    { value: "depreciationYear", label: "Depreciation (Year)" },
    { value: "depreciationEarlier", label: "Depreciation (Earlier)" },
    { value: "currentValue", label: "Current Value" },
    { value: "status", label: "Status" },
  ];

  useEffect(() => {
    if (selectedColumn) {
      const uniqueValues = [...new Set(assets.map(r => r[selectedColumn.value]))];
      setValueOptions(uniqueValues.map(v => ({ value: v, label: v })));
      setSelectedValue(null);
    } else {
      setValueOptions([]);
    }
  }, [selectedColumn, assets]);

  const applyColumnFilter = (column, value) => {
    if (column && value) {
      setFilters({
        ...filters,
        [column.value]: { value: value.value, matchMode: FilterMatchMode.EQUALS },
      });
    }
  };

  const clearColumnFilter = () => {
    setFilters({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
    setSelectedColumn(null);
    setSelectedValue(null);
    setGlobalFilterValue("");
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, global: { value, matchMode: FilterMatchMode.CONTAINS } });
    setGlobalFilterValue(value);
  };

  const renderHeader = () => (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <Button color="danger" onClick={clearColumnFilter}>
        <i className="mdi mdi-filter-off me-1"></i> Clear
      </Button>
      <span className="p-input-icon-right">
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Global Search"
        />
      </span>
    </div>
  );

  const statusBodyTemplate = (rowData) => <Tag value={rowData.status} severity={rowData.status === "Active" ? "success" : "danger"} />;

  // Dummy handlers for top buttons
  const handleSearch = () => alert("Search clicked");
  const handleCancel = () => alert("Cancel clicked");
  const handleExport = () => alert("Export clicked");

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Finance" breadcrumbItem="Asset Register" />

      

          {/* Column Filter */}
          <Row className="pt-2 pb-3">
            <Col md="3">
              <Select
                placeholder="Select Column"
                value={selectedColumn}
                onChange={setSelectedColumn}
                options={columnOptions}
                isClearable
              />
            </Col>
            <Col md="3">
              <Select
                placeholder="Select Value"
                value={selectedValue}
                onChange={(val) => {
                  setSelectedValue(val);
                  applyColumnFilter(selectedColumn, val);
                }}
                options={valueOptions}
                isClearable
                isDisabled={!selectedColumn}
              />
            </Col>
            <Col md="6" className="text-end">
            <Button color="primary" className="me-2" onClick={handleSearch}>
                <i className="mdi mdi-magnify"></i> Search
              </Button>
             
              <Button color="secondary" className="me-2" onClick={handleExport}>
                Export
              </Button>
              <Button color="danger" onClick={clearColumnFilter}>Cancel</Button>
            </Col>
          </Row>

          {/* DataTable */}
          <Card>
            <CardBody>
              <DataTable
                value={assets}
                paginator
                rows={10}
                dataKey="assetName"
                filters={filters}
                globalFilterFields={columnOptions.map(c => c.value)}
                header={renderHeader()}
                emptyMessage="No assets found."
                showGridlines
              >
                                  <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} />
                
                <Column field="assetName" header="Asset Name" sortable />
                <Column field="qty" header="Qty" sortable />
                <Column field="purchaseYear" header="Purchase Year" sortable />
                <Column field="purchaseMonth" header="Purchase Month" sortable />
                <Column field="purchasePrice" header="Purchase Price" body={d => d.purchasePrice?.toLocaleString()} sortable />
                <Column field="openingBalance" header="Opening Balance" body={d => d.openingBalance?.toLocaleString()} sortable />
                <Column field="depreciationMonth" header="Depreciation (Month)" body={d => d.depreciationMonth?.toLocaleString()} sortable />
                <Column field="depreciationYear" header="Depreciation (Year)" body={d => d.depreciationYear?.toLocaleString()} sortable />
                <Column field="depreciationEarlier" header="Depreciation (Earlier)" body={d => d.depreciationEarlier?.toLocaleString()} sortable />
                <Column field="currentValue" header="Current Value" body={d => d.currentValue?.toLocaleString()} sortable />
                <Column field="status" header="Status" body={statusBodyTemplate} sortable />
              </DataTable>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AssetRegister;
