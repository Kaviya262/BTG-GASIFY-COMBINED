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

const GLCode = () => {
  const history = useHistory();

  const [glList, setGlList] = useState([
    { id: 1, glCodeCategory: "Assets", glCodeType: "Current", glCode: "1001", glDescription: "Cash in Hand", isActive: true, createdBy: "Admin", createdDate: "2025-09-01", modifiedBy: "Admin", modifiedDate: "2025-09-05" },
    { id: 2, glCodeCategory: "Liabilities", glCodeType: "Long-Term", glCode: "2001", glDescription: "Loans Payable", isActive: false, createdBy: "Admin", createdDate: "2025-08-20", modifiedBy: "Admin", modifiedDate: "2025-09-03" },
    { id: 3, glCodeCategory: "Revenue", glCodeType: "Income", glCode: "3001", glDescription: "Sales Revenue", isActive: true, createdBy: "Admin", createdDate: "2025-07-15", modifiedBy: "Admin", modifiedDate: "2025-07-20" },
  ]);

  const [filters, setFilters] = useState({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  // Column filter
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [valueOptions, setValueOptions] = useState([]);

  const columnOptions = [
    { value: "glCodeCategory", label: "GL Code Category" },
    { value: "glCodeType", label: "GL Code Type" },
    { value: "isActive", label: "Is Active" },
  ];

  useEffect(() => {
    if (selectedColumn) {
      const uniqueValues = [...new Set(glList.map(a => a[selectedColumn.value]))];
      setValueOptions(uniqueValues.map(v => ({ value: v, label: v.toString() })));
      setSelectedValue(null);
    } else {
      setValueOptions([]);
    }
  }, [selectedColumn, glList]);

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
    setGlList(glList.map(item =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ));
  };

  const exportToExcel = () => {
    const exportData = glList.map(a => ({
      "GL Code Category": a.glCodeCategory,
      "GL Code Type": a.glCodeType,
      "GL Code": a.glCode,
      "GL Description": a.glDescription,
      "Is Active": a.isActive ? "Yes" : "No",
      "Created By / Date": `${a.createdBy} / ${a.createdDate}`,
      "Modified By / Date": `${a.modifiedBy} / ${a.modifiedDate}`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GLCode");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `GLCode-${new Date().toISOString().slice(0,10)}.xlsx`);
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

  const addNewGLCode = () => {
    history.push("/GLCode");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Masters" breadcrumbItem="GL Code" />

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
              <Button color="info" className="me-2" onClick={addNewGLCode}>New</Button>
              <Button color="secondary" className="me-2" onClick={exportToExcel}>Export</Button>
              <Button color="danger" onClick={clearColumnFilter}>Cancel</Button>
            </Col>
          </Row>

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <DataTable
                    value={glList}
                    paginator
                    rows={5}
                    dataKey="id"
                    filters={filters}
                    globalFilterFields={["glCodeCategory","glCodeType","glCode"]}
                    header={header}
                    emptyMessage="No GL Codes found."
                    showGridlines
                  >
                    <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} />
                    <Column field="glCodeCategory" header="GL Code Category" sortable />
                    <Column field="glCodeType" header="GL Code Type" sortable />
                    <Column field="glCode" header="GL Code" sortable />
                    <Column field="glDescription" header="GL Description" sortable />
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

export default GLCode;
