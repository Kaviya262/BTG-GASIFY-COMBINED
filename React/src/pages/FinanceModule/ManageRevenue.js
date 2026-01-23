import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap"; 
import { Tag } from "primereact/tag";
import Select from "react-select";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useHistory } from "react-router-dom";
import { getRevenueList } from "../../../src/common/data/mastersapi";
import { toast } from "react-toastify";

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

const columnOptions = [
  { value: "revenueType", label: "Revenue Type" },
  { value: "whom", label: "From Whom" },
  { value: "voucherNo", label: "Sys Seq No" },
];

const ManageRevenues = () => {
  const history = useHistory();
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [valueOptions, setValueOptions] = useState([]);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [globalFilter, setGlobalFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitType, setSubmitType] = useState(1);

  useEffect(() => {
    fetchRevenues();
  }, []);

  useEffect(() => {
    if (selectedColumn) {
      const uniqueValues = [...new Set(revenues.map(r => r[selectedColumn.value]))];
      setValueOptions(uniqueValues.map(v => ({ value: v, label: v })));
      setSelectedValue(null);
    } else {
      setValueOptions([]);
    }
  }, [selectedColumn, revenues]);

  const fetchRevenues = async () => {
    try {
      setLoading(true);
      const data = await getRevenueList(1, 1, 0, null, null);
      const transformed = data.map(item => ({
        voucherNo: item.VoucherNo,
        receivedDate: new Date(item.ReceivedDate),
        revenueTypeId: item.RevenueTypeId,
        description: item.Description || "-",
        revenueType: item.RevenueTypeDescription,
        whom: item.Whom,
        amountIDR: item.AmountIDR,
        amount: item.Amount,
        currencyCode:item.CurrencyCode,
        remarks: item.Remarks || "-",
        status: item.IsSubmitted ? "Posted" : "Saved",
        revenueId: item.RevenueId,
      }));
      setRevenues(transformed);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch revenues");
      console.error(error);
      setLoading(false);
    }
  };

  const handleEdit =  async(revenueId) => {
try{
  const data = await getRevenueList(1, 1, revenueId, null, null);
   //  const data = await getPettyCashList(1, 1, pettyCashId, null, null);
          if (data && data.length > 0) {
            const revenueData = data[0];
            history.push(`/revenue/edit/${revenueId}`, { revenueData });
          } else {
            toast.error("No data found for selected revenue ID");
          }
        } catch (error) {
          console.error("Error loading revenue data:", error);
          toast.error("Failed to load data for editing");
        }
   // history.push(`/revenue/edit/${revenueId}`);
  };

  const applyColumnFilter = (column, value) => {
    if (column && value) {
      setFilters(prev => ({
        ...prev,
        [column.value]: { value: value.value, matchMode: FilterMatchMode.EQUALS },
      }));
    }
  };

  const clearColumnFilter = () => {
    setFilters({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
    setSelectedColumn(null);
    setSelectedValue(null);
    setGlobalFilter("");
  };

  const exportToExcel = () => {
    const exportData = revenues.map(r => ({
      "Revenue Type": r.revenueType,
      "Description": r.description,
      "Amount": r.amountIDR,
      "Received Date": r.receivedDate.toLocaleDateString(),
      "From Whom": r.whom,
      "Remarks": r.remarks,
      "Status": r.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Revenues");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `OtherRevenues-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const dAddOrder = () => history.push("/revenue/add");


  const getSeverity = (Status) => {
    switch (Status) {
      case 'NotApproved': return 'danger';
      case 'Approved': return 'success';
      case 'Posted': return 'success';
      case 'Saved': return 'danger';
      case 'Closed': return 'info';
      case 'Cancelled': return 'tag-lightred';
      case 'renewal': return null;
      case 'Pending': return 'danger';
      case 'Director Approved': return 'success';
      case 'GM Approved': return 'success';
      case 'GM Discussed': return 'warning';
      case 'Director Discussed': return 'warning';
      case 'Yes': return 'success';
      case 'No': return 'danger';
      default: return 'secondary';
    }
  };
      const statusBodyTemplate = (rowData) => {
        const statusShort = rowData.status === "Saved" ? "S" : rowData.status === "Posted" ? "P" : rowData.status;
        return <Tag value={statusShort} severity={getSeverity(rowData.status)} />;
      };

  // const statusBodyTemplate = rowData => {
  //   const className =
  //     rowData.status === "Posted"
  //       ? "badge bg-success"
  //       : "badge bg-primary";
  //   return <span className={className}>{rowData.status}</span>;
  // };

  const actionBodyTemplate = rowData => (
    <div className="d-flex justify-content-center gap-2">
      <button className="btn btn-sm btn-link" onClick={() => handleEdit(rowData.revenueId)}>
        <i className="mdi mdi-pencil"></i>
      </button>
      <button className="btn btn-sm btn-link text-danger">
        <i className="mdi mdi-delete"></i>
      </button>
    </div>
  );

    const renderHeader = () => {
      return (
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
    };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Finance" breadcrumbItem="Revenue" />

          {/* Filter & Buttons */}
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
                onChange={val => {
                  setSelectedValue(val);
                  applyColumnFilter(selectedColumn, val);
                }}
                options={valueOptions}
                isClearable
                isDisabled={!selectedColumn}
              />
            </Col>
            <Col md="6" className="d-flex justify-content-end gap-2">
              <button className="btn btn-danger" onClick={clearColumnFilter}>Cancel</button>
              <button className="btn btn-info" onClick={dAddOrder}>New</button>
              <button className="btn btn-secondary" onClick={exportToExcel}>
                <i className="bx bx-export me-2"></i> Export
              </button>
            </Col>
          </Row>

          {/* DataTable with Global Search */}
          <Row>
            <Col lg="12">
              <Card>
                 
                  <DataTable
                    value={revenues}
                    paginator
                    rows={20}
                    dataKey="revenueId"
                    filters={filters}
                    onFilter={e => setFilters(e.filters)}
                    globalFilterFields={["currencyCode","revenueType","amountIDR","amount","receivedDate", "description", "whom", "status", "voucherNo","remarks"]}
                    emptyMessage="No revenues found."
                    showGridlines
                    filterDisplay="menu"
                    loading={loading}
                    header={renderHeader()}    
                  >
                    <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} />
                    <Column field="voucherNo" header="Sys Seq No." />
                    <Column field="revenueType" header="Revenue Type" />
                    <Column field="description" header="Description" />
                    <Column field="currencyCode" header="Currency" />
                    <Column field="amount" header="Currency Amount" body={d => Number(d.amount).toLocaleString('en-US', {
                                                style: 'decimal',
                                                minimumFractionDigits: 2
                                            })} className="text-end" />
                    <Column field="amountIDR" header="Amount" body={d => Number(d.amountIDR).toLocaleString('en-US', {
                                                style: 'decimal',
                                                minimumFractionDigits: 2
                                            })} className="text-end" />
                                             
                    <Column field="receivedDate" header="Received Date" body={d => new Date(d.receivedDate).toLocaleDateString()} />
                    <Column field="whom" header="From Whom" />
                    <Column field="remarks" header="Remarks" />
                    <Column field="status" header="Status" body={statusBodyTemplate} />
                    <Column header="Action" body={actionBodyTemplate} />
                  </DataTable>
               
              </Card>
            </Col>
          </Row>

          {/* Confirmation Modal */}
          <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
            <ModalHeader toggle={() => setIsModalOpen(false)}>Confirm Action</ModalHeader>
            <ModalBody className="py-3 px-5 text-center">
              <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "6em", color: "orange" }} />
              <h4>Do you want to {submitType === 0 ? "Save" : "Post"}?</h4>
              <div className="mt-3 d-flex justify-content-center gap-3">
                <button className="btn btn-success btn-lg" onClick={() => setIsModalOpen(false)}>Yes</button>
                <button className="btn btn-danger btn-lg" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </ModalBody>
          </Modal>

        </Container>
      </div>
    </React.Fragment>
  );
};

export default ManageRevenues;
