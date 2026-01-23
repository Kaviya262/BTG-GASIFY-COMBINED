import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Modal,
  ModalBody,
  FormGroup,
  InputGroup, Input
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Select from "react-select";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { UncontrolledAlert } from "reactstrap";
import { Tag } from "primereact/tag";
import {
  GetAllUsers,
  GetUserById,
  UpdateStatus as UpdateUserStatus,
} from "../../../src/common/data/mastersapi";
import nodatafound from "assets/images/no-data.png";
import { useHistory } from "react-router-dom";

const renderValueOrDash = value =>
  value !== null && value !== undefined && value !== "" ? value : "-";

const initFilters = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  Id: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  UserName: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  Role: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  Email: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  Department: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  Remarks: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
});

const ManageGRN = () => {
  const history = useHistory();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(initFilters());
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [userName, setUserName] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [switchStates, setSwitchStates] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [txtStatus, setTxtStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [successmsg, setSuccessmsg] = useState();
  const [errormsg, setErrormsg] = useState();

  const selectedProductionNo = { value: 12 };
  const quotefilter = { BranchId: 5 };

  useEffect(() => {
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);
    setFromDate(oneWeekAgo);
    setToDate(currentDate);
    fetchUsers(oneWeekAgo, currentDate, "");
  }, []);
  const currentDate = new Date();
  const currentYear = new Date().getFullYear();
  const formatDate = date => date.toISOString().split("T")[0];
  const today = new Date();
  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(today.getDate() - 7);
  const fetchUsers = async (from, to, name = "") => {
    try {
      setLoading(true);
      const filter = {
        FromDate: formatDate(sevenDaysAgo),
        ToDate: formatDate(new Date()),
        UserName: name,
        ProdId: selectedProductionNo?.value || 0,
        BranchId: 1,
      };
      debugger
      // const response = await GetAllUsers(filter);
      // if (response?.status) {
      //   const userData = response.data || [];
      //   setUsers(userData);

      //   const initialSwitch = {};
      //   userData.forEach(user => {
      //     initialSwitch[user.userId] = user.IsActive === 1;
      //   });
      //   setSwitchStates(initialSwitch);
      // }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers(fromDate, toDate, userName);
  };

  const handleCancel = () => {
    const currentDate = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);

    setFromDate(oneWeekAgo);
    setToDate(currentDate);
    setUserName("");
    setFilters(initFilters());
    setGlobalFilterValue("");
    fetchUsers(oneWeekAgo, currentDate, "");
  };

  const handleStatusUpdate = async () => {
    if (!selectedRow) return;
    const userId = selectedRow.Id;
    const isActive = selectedRow.IsActive ? 1 : 0;

    const payload = { userId, remark, isActive };

    try {
      const response = await UpdateUserStatus(payload);
      if (response?.statusCode === 0) {
        debugger
        setSuccessmsg(response.message)
        setIsModalOpen(false);
        await fetchUsers(fromDate, toDate, userName);
      } else {
        setErrormsg(response.message)
        console.error("Failed to update status:", res);
      }
    } catch (err) {
      console.error("An error occurred while updating status:", err);
    }
  };

  const onGlobalFilterChange = e => {
    const value = e.target.value || "";
    setFilters(prev => ({ ...prev, global: { ...prev.global, value } }));
    setGlobalFilterValue(value);
  };

  const openModal = rowData => {
    setTxtStatus(rowData.IsActive === 1 ? "deactivate" : "activate");
    setSelectedRow(rowData);
    setRemark(rowData.Remarks || "");
    setIsModalOpen(true);
  };
  useEffect(() => {
    if (successmsg || errormsg) {
      const timer = setTimeout(() => {
        setSuccessmsg(null);
        setErrormsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successmsg, errormsg]);

  const linkEditUser = async rowData => {
    const userId = rowData.Id;
    const branchId = rowData.BranchId;
    try {
      const userDetails = await GetUserById(userId, branchId);
      history.push({ pathname: "/add-user", state: { userData: userDetails } });
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  };

  const linkAddGRN = () => history.push("/add-grn");

  const actionBodyTemplate = rowData => (
    <div className="actions">
      <span
        onClick={() => linkEditUser(rowData)}
        title="Edit"
        style={{ cursor: "pointer" }}
      >
        <i
          className="mdi mdi-square-edit-outline"
          style={{ fontSize: "1.5rem" }}
        />
      </span>
    </div>
  );
  const demousers = [
    {
      id: "GRN1",
      grnDate: "23-May-25",
      supplier: "Supplier 1",
      totalAmount: 77057,
      status: "Posted"
    },
    {
      id: "GRN2",
      grnDate: "25-May-25",
      supplier: "Supplier 2",
      totalAmount: 1000,
      status: "Posted"
    },
    {
      id: "GRN3",
      grnDate: "6-Jun-25",
      supplier: "Supplier 1",
      totalAmount: 4000,
      status: "Saved"
    },
    {
      id: "GRN4",
      grnDate: "16-Jun-25",
      supplier: "Supplier 3",
      totalAmount: 7000,
      status: "Saved"
    },
    {
      id: "GRN5",
      grnDate: "21-Jun-25",
      supplier: "Supplier 4",
      totalAmount: 15000,
      status: "Saved"
    }
  ];

const actionBodyTemplate2 = (rowData) => {
        return (
            <div className="d-flex align-items-center justify-content-center gap-3">
                <span onClick={() => editRow(rowData)} title="Edit">
                    <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
                </span>

               
            </div>
        );
    };

  const renderHeader = () => {
    return (
      <div className="row align-items-center g-3 clear-spa">
        <div className="col-12 col-lg-6">
          <Button className="btn btn-danger btn-label" >
            <i className="mdi mdi-filter-off label-icon" /> Clear
          </Button>
        </div>
        <div className="col-12 col-lg-3 text-end">
          <span className="me-4">
            <Tag value="S" /> Saved
          </span>
          <span className="me-1">
            <Tag value="P" severity="success" /> Posted
          </span>
        </div>
        <div className="col-12 col-lg-3">
          <input
            className="form-control"
            type="text"
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Procurement" breadcrumbItem="GRN" />

        {/* Filters/Search Area */}
        <Row>
          {errormsg && (
            <UncontrolledAlert color="danger">
              {errormsg}
            </UncontrolledAlert>
          )}
          {successmsg && (
            <UncontrolledAlert color="success">

              {successmsg}
            </UncontrolledAlert>
          )}
          <Card className="search-top">
            <div className="row align-items-end g-3 quotation-mid p-3">
              {/* User Name */}
              <div className="col-12 col-lg-4 mt-1">
                <div className="d-flex align-items-center gap-2">
                  <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                    <label htmlFor="SQID" className="form-label mb-0">
                      Search by:
                    </label>
                  </div>
                  <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                    {/* <Input type="text" name="SQID" id="SQID" onChange={handleInputChange} maxLength={20} className="form-control" /> */}
                    <select defaultValue="0" className="form-select">
                      <option value="">Choose...</option>
                      <option value="1">Supplier</option>
                    </select>
                  </div>
                </div>
              </div>


              {/* Action Buttons */}
              <div
                className="col-12 col-lg-8 text-end"
              >
                <div className="d-flex justify-content-end gap-2 align-items-center h-100">
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={handleSearch}
                  >
                    <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i>{" "}
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleCancel}
                  >
                    <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>{" "}
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                  >
                    {" "}
                    <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i>{" "}
                    Export
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={linkAddGRN}
                  >
                    <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>{" "}
                    New
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </Row>

        {/* Users Table */}
        <Row>
          <Col lg="12">
            <Card className="p-3">
              <DataTable
                value={demousers}
                paginator
                rows={10}
                loading={loading}
                dataKey="id"
                filters={filters}
                globalFilterFields={["id", "grnDate", "supplier", "totalAmount", "status"]}
                header={renderHeader()}
                emptyMessage={
                  <div className="text-center p-4">
                    <img
                      src={nodatafound}
                      alt="No Data"
                      style={{ maxWidth: "47px", marginBottom: "1rem" }}
                    />
                    <div className="font-size-14 fw-bold">No GRNs Found</div>
                  </div>
                }
                onFilter={(e) => setFilters(e.filters)}
              >
                {/* S.No. Column */}
                <Column
                  header="S.No."
                  body={(rowData, { rowIndex }) => rowIndex + 1}
                  style={{ width: "80px" }}
                />

                <Column field="id" header="GRN No" filter style={{ minWidth: "120px" }} />

                <Column
                  field="grnDate"
                  header="GRN Date"
                  filter
                  style={{ minWidth: "160px" }}
                />

                <Column
                  field="supplier"
                  header="Supplier"
                  filter
                  style={{ minWidth: "140px" }}
                />

                <Column
                  field="totalAmount"
                  header="Total Amount"
                  filter
                  style={{ minWidth: "140px" }}
                />

                <Column
                  field="status"
                  header="Status"
                  filter
                  className="text-center"
                  style={{ minWidth: "120px" }}
                />

                <Column
                  header="Action"
                    body={actionBodyTemplate2}
                  exportable={false}
                  className="text-center"
                  style={{ width: "100px" }}
                />
              </DataTable>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
        <ModalBody className="py-3 px-5">
          <Row>
            <Col className="text-center">
              <i
                className="mdi mdi-alert-circle-outline"
                style={{ fontSize: "9em", color: "orange" }}
              />
              <h4>Do you want to {txtStatus} this account?</h4>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <FormGroup>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Remarks"
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                />
              </FormGroup>
              <div className="text-center mt-3 button-items">
                <Button
                  className="btn btn-info"
                  color="success"
                  size="lg"
                  onClick={handleStatusUpdate}
                >
                  Yes
                </Button>
                <Button
                  color="danger"
                  size="lg"
                  className="btn btn-danger"
                  onClick={() => {
                    setIsModalOpen(false);
                    setRemark("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ManageGRN;
