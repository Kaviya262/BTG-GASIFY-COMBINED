import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Button } from "reactstrap";
import Select from "react-select";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useHistory } from "react-router-dom";
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

const ManageRevenueType = () => {
      const history = useHistory();
  const [revenueList, setRevenueList] = useState([
    { id: 1, systemNumber: "REV-001", revenueType: "Product Sales", isActive: true, createdBy: "Admin", createdDate: "2025-09-01", modifiedBy: "Admin", modifiedDate: "2025-09-05" },
    { id: 2, systemNumber: "REV-002", revenueType: "Service Income", isActive: false, createdBy: "Admin", createdDate: "2025-08-20", modifiedBy: "Admin", modifiedDate: "2025-09-03" },
    { id: 3, systemNumber: "REV-003", revenueType: "Interest Income", isActive: true, createdBy: "Admin", createdDate: "2025-07-15", modifiedBy: "Admin", modifiedDate: "2025-07-20" },
  ]);
  
  const [filters, setFilters] = useState({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  // Column filter
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [valueOptions, setValueOptions] = useState([]);

  const columnOptions = [
    { value: "revenueType", label: "Revenue Type" },
    { value: "isActive", label: "Is Active" },
  ];

  useEffect(() => {
    if (selectedColumn) {
      const uniqueValues = [...new Set(revenueList.map(a => a[selectedColumn.value]))];
      setValueOptions(uniqueValues.map(v => ({ value: v, label: v.toString() })));
      setSelectedValue(null);
    } else {
      setValueOptions([]);
    }
  }, [selectedColumn, revenueList]);

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

  const toggleActive = (id) => {
    setRevenueList(revenueList.map(item =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ));
  };

  const exportToExcel = () => {
    const exportData = revenueList.map(a => ({
      "System Number": a.systemNumber,
      "Revenue Type": a.revenueType,
      "Is Active": a.isActive ? "Yes" : "No",
      "Created By / Date": `${a.createdBy} / ${a.createdDate}`,
      "Modified By / Date": `${a.modifiedBy} / ${a.modifiedDate}`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RevenueType");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `RevenueType-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const statusBodyTemplate = (rowData) => (rowData.isActive ? "Yes" : "No");

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2 justify-content-center">
      <Button color="warning" style={{ width: "50px" }}>Edit</Button>
      <Button style={{ width: "80px" }} color={rowData.isActive ? "danger" : "success"} onClick={() => toggleActive(rowData.id)}>
        {rowData.isActive ? "Inactive" : "Activate"}
      </Button>
    </div>
  );

  const renderHeader = () => (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <Button color="danger" onClick={clearColumnFilter}>Clear</Button>
      <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Global Search" />
    </div>
  );

  const header = renderHeader();

  const addNewRevenueType = () => {
    history.push("/RevenueType");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Masters" breadcrumbItem="Revenue Type" />

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
              <Button color="info" className="me-2" onClick={addNewRevenueType}>New</Button>
              <Button color="secondary" className="me-2" onClick={exportToExcel}>Export</Button>
              <Button color="danger" onClick={clearColumnFilter}>Cancel</Button>
            </Col>
          </Row>

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <DataTable
                    value={revenueList}
                    paginator
                    rows={5}
                    dataKey="id"
                    filters={filters}
                    globalFilterFields={["systemNumber","revenueType"]}
                    header={header}
                    emptyMessage="No Revenue Types found."
                    showGridlines
                  >
                    <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} />
                    <Column field="systemNumber" header="System Number" sortable />
                    <Column field="revenueType" header="Revenue Type" sortable />
                    <Column field="isActive" header="IsActive" body={statusBodyTemplate} sortable />
                    <Column field="createdBy" header="Created By / Date" body={(row) => `${row.createdBy} / ${row.createdDate}`} />
                    <Column field="modifiedBy" header="Modified By / Date" body={(row) => `${row.modifiedBy} / ${row.modifiedDate}`} />
                    <Column header="Actions" body={actionBodyTemplate} />
                  </DataTable>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ManageRevenueType;
