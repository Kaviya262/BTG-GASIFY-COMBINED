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
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

import { getPettyCashList } from "../../../src/common/data/mastersapi";

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
  const [pettyCashIdOptions, setPettyCashIdOptions] = useState([]);
  const [expTypeOptions, setExpTypeOptions] = useState([]);
  const [selectedExpDescription, setSelectedExpDescription] = useState(null);
  const [selectedVoucherNo, setSelectedVoucherNo] = useState(null);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const branchId = 1;
      const orgId = 1;
      const pettyIdValue = 0;
      const expTypeValue = selectedExpDescription?.value ?? null;
      const voucherNoValue = selectedVoucherNo?.value ?? null;

      const data = await getPettyCashList(orgId, branchId, pettyIdValue, expTypeValue, voucherNoValue);

      const transformed = data.map(item => ({
        voucherNo: item.VoucherNo,
        expDate: new Date(item.ExpDate),
        expenseType: item.ExpenseType,
        expenseTypename:item.ExpenseTypename,
        expenseDescription: item.ExpenseDescription || "-",
        expenseDescriptionId: item.ExpenseDescriptionId,
        glcode:item.glcode || "",
        CurrencyCode: item.CurrencyCode,
        billNumber: item.BillNumber,
        amountIDR: item.AmountIDR,
        amount: item.Amount,
        attachment: item.ExpenseFileName ? { name: item.ExpenseFileName } : null,
        status: item.IsSubmitted ? "Posted" : "Saved",
        pettyCashId: item.PettyCashId,
      }));

      setExpenses(transformed); // ✅ replace, don’t append

      // Populate dropdowns
      setPettyCashIdOptions(
        [...new Set(data.map(x => x.VoucherNo))].map(id => ({ value: id, label: `PC-${id}` }))
      );
      setExpTypeOptions(
        [...new Set(data.map(x => x.ExpenseDescription))].map(type => ({ value: type, label: type }))
      );

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

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2 justify-content-center">
      <Button
        color="link"
        size="sm"
        disabled={rowData.status !== "Saved"}
        onClick={() => handleEdit(rowData.pettyCashId)}
      >
        <i className="mdi mdi-pencil"></i>
      </Button>
    </div>
  );

  const handleEdit = async (pettyCashId) => {
    try {
      const data = await getPettyCashList(1, 1, pettyCashId, null, null);
      if (data && data.length > 0) {
        const pettyCashData = data[0];
        history.push(`/pettyCash/edit/${pettyCashId}`, { pettyCashData });
      } else {
        toast.error("No data found for selected Petty Cash ID");
      }
    } catch (error) {
      console.error("Error loading petty cash data:", error);
      toast.error("Failed to load data for editing");
    }
  };

  const exportToExcel = () => {
    const exportData = expenses.map((ex) => ({
      "Date": new Date(ex.expDate).toLocaleDateString(),
      "Expense Type": ex.expenseType,
      "Description": ex.expenseDescription,
      "GL Code":ex.glcode,
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
    setSelectedExpDescription(null);
    setSelectedVoucherNo(null);
  };

  const renderHeader = () => (
    <div className="row align-items-center g-3 clear-spa">
      <div className="col-12 col-lg-3"></div>
      <div className="col-12 col-lg-6 text-end">
        <span className="me-3">
          <Tag value="S" severity="danger" /> Saved
        </span>
        <span className="me-3">
          <Tag value="P" severity="success" /> Posted
        </span>
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

        <Row className="pt-2 pb-3 align-items-end">
          <Col md="3">
            <Select
              placeholder="Select Expense Desc"
              value={selectedExpDescription}
              onChange={(val) => setSelectedExpDescription(val)}
              options={expTypeOptions}
              isClearable
            />
          </Col>
          <Col md="3">
            <Select
              placeholder="Select Voucher No"
              value={selectedVoucherNo}
              onChange={(val) => setSelectedVoucherNo(val)}
              options={pettyCashIdOptions}
              isClearable
            />
          </Col>
          <Col md="6" className="d-flex justify-content-end gap-2">
            <button className="btn btn-primary me-2" onClick={fetchExpenses}>Search</button>
            <button className="btn btn-danger me-2" onClick={handleCancelFilters}>Cancel</button>
            <button className="btn btn-info me-2" onClick={dAddOrder} disabled={isSubmitting}>New</button>
            <button className="btn btn-secondary" onClick={exportToExcel}>
              <i className="bx bx-export me-2"></i> Export
            </button>
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
                    "status", "voucherNo","expenseTypename","glcode"
                  ]}
                  globalFilter={globalFilter}
                  emptyMessage="No expenses found."
                  showGridlines
                  header={renderHeader()}
                >
                  <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} />
                  <Column field="voucherNo" header="Sys Seq No." sortable />
                  <Column field="expDate" header="Date" body={(d) => new Date(d.expDate).toLocaleDateString()} sortable />
                  <Column field="expenseTypename" header="Type" sortable />
                  <Column field="expenseDescription" header="Description" sortable />
                  <Column field="glcode" header="GL Code" sortable />
                  
                  <Column field="CurrencyCode" header="Currency" sortable />
                  <Column field="amount" header="Amount" body={(d) => Number(d.amount).toLocaleString('en-US', {
                    style: 'decimal', minimumFractionDigits: 2
                  })} className="text-end" />
                  <Column field="amountIDR" header="Amount in IDR" body={(d) => Number(d.amountIDR).toLocaleString('en-US', {
                    style: 'decimal', minimumFractionDigits: 2
                  })} className="text-end" />
                  <Column field="attachment" header="Attachment" body={(d) => d.attachment ? d.attachment.name : "-"} />
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
    </div>
  );
};

export default ManageExpense;
