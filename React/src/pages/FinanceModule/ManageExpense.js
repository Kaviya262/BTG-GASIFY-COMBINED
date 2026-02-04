import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import Select from "react-select";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Tag } from "primereact/tag";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Label } from "reactstrap";
import { getPettyCashList, getPettyCashCategories, getPettyCashExpenseTypes } from "../../../src/common/data/mastersapi";
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

const ManageExpense = () => {
  const history = useHistory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Set default dates: fromDate = 1 week ago, toDate = today
  const getDefaultFromDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  };

  const [fromDate, setFromDate] = useState(getDefaultFromDate());
  const [toDate, setToDate] = useState(new Date());

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchExpenses(true); // Load data with default date range (last 7 days)
  }, []);

  const fetchExpenses = async (applyDateFilter = true) => {
    try {
      setLoading(true);
      const branchId = 1;
      const orgId = 1;
      const pettyIdValue = 0;

      const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-CA') : null; // YYYY-MM-DD
      // Only apply date filter if explicitly requested and dates are set
      const fDate = (applyDateFilter && fromDate) ? formatDate(fromDate) : null;
      const tDate = (applyDateFilter && toDate) ? formatDate(toDate) : null;

      const [data, typesData] = await Promise.all([
        getPettyCashList(orgId, branchId, pettyIdValue, null, null, null, fDate, tDate),
        getPettyCashExpenseTypes(orgId, branchId),
      ]);

      const typeMap = {};
      typesData.forEach(t => typeMap[t.id] = t.expense_type);



      const transformed = data.map(item => ({
        voucherNo: item.pc_number,
        expDate: new Date(item.ExpDate),
        expenseType: typeMap[item.expense_type_id] || "-",
        expenseTypename: typeMap[item.expense_type_id] || "-",
        expenseDescription: item.ExpenseDescription || "-",
        expenseDescriptionId: item.ExpenseDescriptionId,
        glcode: item.glcode || "",
        CurrencyCode: item.CurrencyCode,
        billNumber: item.VoucherNo,
        amountIDR: item.AmountIDR,
        amount: item.Amount,
        attachment: item.ExpenseFileName ? { name: item.ExpenseFileName } : null,
        status: item.IsSubmitted ? "Posted" : "Saved",
        pettyCashId: item.PettyCashId,
        expense_type_id: item.expense_type_id, // Keep ID for reference
        raw: item // Store raw data for editing
      }));

      setExpenses(transformed);

      // Populate dropdowns
      // Populate dropdowns - Metadata only for table display now
      // setPettyCashIdOptions([...]) - Removed
      // setExpTypeOptions([...]) - Removed

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to fetch expenses");
      console.error("Expense load error:", error);
    }
  };

  const getSeverity = (status) => {
    switch (status) {
      case 'Posted': return 'success';
      case 'Saved': return 'danger';
      default: return 'info';
    }
  };

  const statusBodyTemplate = (rowData) => {
    const statusShort = rowData.status === "Saved" ? "S" : rowData.status === "Posted" ? "P" : rowData.status;
    return <Tag value={statusShort} severity={getSeverity(rowData.status)} />;
  };

  const clearFilter = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    setGlobalFilter("");
  };

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2 justify-content-center">
      <Button
        color="link"
        size="sm"
        disabled={rowData.status !== "Saved"}
        onClick={() => handleEdit(rowData)}
      >
        <i className="mdi mdi-pencil"></i>
      </Button>
    </div>
  );

  const handleEdit = (rowData) => {
    const pettyCashData = rowData.raw;
    history.push(`/pettyCash/edit/${rowData.pettyCashId}`, { pettyCashData });
  };

  const exportToExcel = () => {
    const exportData = expenses.map((ex) => ({
      "Date": new Date(ex.expDate).toLocaleDateString(),
      "Expense Type": ex.expenseType,
      "Description": ex.expenseDescription,
      "GL Code": ex.glcode,
      "Currency": ex.CurrencyCode,
      "Bill Number": ex.billNumber,
      "Amount": ex.amount,
      "Amount (IDR)": ex.amountIDR,
      "Attachment": ex.attachment ? ex.attachment.name : "",
      "Status": ex.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, `Expenses-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const dAddOrder = () => { history.push("/pettyCash/add"); };

  const handleCancelFilters = () => {
    setFromDate(getDefaultFromDate());
    setToDate(new Date());
    fetchExpenses(true); // Reload with default date range
  };


  const renderHeader = () => (
    <div className="row align-items-center g-3 clear-spa">
      <div className="col-12 col-lg-6">
        <Button className="btn btn-danger btn-label" onClick={clearFilter} >
          <i className="mdi mdi-filter-off label-icon" /> Clear
        </Button>
      </div>
      <div className="col-12 col-lg-3 text-end">
        <span className="me-4"><Tag value="S" severity="danger" /> Saved</span>
        <span className="me-1"><Tag value="P" severity="success" /> Posted</span>
      </div>
      <div className="col-12 col-lg-3">
        <InputText
          type="search"
          value={globalFilter}
          className="form-control"
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Global Search..."
        />
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Finance" breadcrumbItem="PettyCash" />

        <Row className="pt-2 pb-3 align-items-center">
          <Col md="3">
            <div className="d-flex align-items-center gap-2">
              <Label className="mb-0" style={{ minWidth: "60px" }}>From</Label>
              <Flatpickr
                className="form-control"
                options={{ dateFormat: "d-m-Y" }}
                value={fromDate}
                onChange={([date]) => setFromDate(date)}
              />
            </div>
          </Col>
          <Col md="3">
            <div className="d-flex align-items-center gap-2">
              <Label className="mb-0" style={{ minWidth: "60px" }}>To</Label>
              <Flatpickr
                className="form-control"
                options={{ dateFormat: "d-m-Y" }}
                value={toDate}
                onChange={([date]) => setToDate(date)}
              />
            </div>
          </Col>

          <Col md="6" className="d-flex justify-content-end gap-2 align-items-center">
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-info" onClick={() => fetchExpenses(true)}> <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>
              <button type="button" className="btn btn-danger" onClick={handleCancelFilters}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
              <button type="button" className="btn btn-secondary" onClick={exportToExcel}> <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i> Export</button>
              <button type="button" className="btn btn-success" onClick={dAddOrder} disabled={isSubmitting}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                <DataTable
                  value={expenses}
                  loading={loading}
                  paginator
                  rows={20}
                  dataKey="pettyCashId"
                  filters={filters}
                  globalFilterFields={[
                    "CurrencyCode", "expDate",
                    "amount", "amountIDR", "attachment",
                    "expenseDescription", "billNumber",
                    "status", "voucherNo", "expenseTypename", "glcode"
                  ]}
                  globalFilter={globalFilter}
                  emptyMessage="No expenses found."
                  showGridlines
                  header={renderHeader()}
                >

                  <Column field="voucherNo" header="PC Number" sortable />
                  <Column field="billNumber" header="Voucher No" sortable />
                  <Column field="expDate" header="Date" body={(d) => new Date(d.expDate).toLocaleDateString()} sortable />
                  <Column field="expenseTypename" header="Expense Type" sortable />

                  <Column field="CurrencyCode" header="Currency" sortable />
                  <Column field="amount" header="Amount" body={(d) => Number(d.amount).toLocaleString('en-US', {
                    style: 'decimal', minimumFractionDigits: 2
                  })} className="text-end" />
                  <Column field="status" header="Status" style={{ textAlign: "center" }} body={statusBodyTemplate} sortable />
                  <Column header="Action" body={actionBodyTemplate} />
                </DataTable>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
          <ModalHeader toggle={() => setIsModalOpen(false)}>Confirm Action</ModalHeader>
          <ModalBody className="py-3 px-5 text-center">
            <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "6em", color: "orange" }} />
            <h4>Do you want to continue?</h4>
            <div className="mt-3 d-flex justify-content-center gap-3">
              <Button color="success" size="lg" onClick={() => setIsModalOpen(false)}>Yes</Button>
              <Button color="danger" size="lg" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            </div>
          </ModalBody>
        </Modal>
      </Container>
    </div >
  );
};

export default ManageExpense;