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
import { FilterMatchMode, FilterOperator } from "primereact/api";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { UncontrolledAlert } from "reactstrap";
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
  RoleName: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  Email: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  DepartmentName: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  Remarks: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
});

const ManageUser = () => {
  const history = useHistory();
  const [users, setUsers] = useState([]);
  const [roleDepartment,setRoleDepartment] = useState([]);
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
      const response = await GetAllUsers(filter);
      if (response?.status) {
        const userData = response.data || [];
        debugger
        
        setRoleDepartment(userData);
        setUsers(userData);

        const initialSwitch = {};
        userData.forEach(user => {
          initialSwitch[user.userId] = user.IsActive === 1;
        });
        setSwitchStates(initialSwitch);
      }
      else{
        setUsers([]);
      }
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
    fetchUsers(oneWeekAgo, currentDate, "");
  };

   const clearFilter = () =>{
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
     debugger
    if (!selectedRow) return;
    const userId = selectedRow.Id;
    const isActive = selectedRow.IsActive===0 ? 1 : 0;

    const payload = { userId, remark, isActive };

    try {
      const response = await UpdateUserStatus(payload);
      if (response?.statusCode === 0) {
        debugger        
        setSuccessmsg(`User Status ${isActive ===1 ?"activated" : "deactivated" } successfully`);
        setIsModalOpen(false);
        await fetchUsers(fromDate, toDate, userName);
      } else {
        setErrormsg(response.message)
        console.error("Failed to update status:", response);
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
    debugger
    const userId = rowData.Id;
    const branchId = rowData.BranchId;
    try {
      const userDetails = await GetUserById(userId, branchId);
      history.push({ pathname: "/add-user", state: { userData:{ ...userDetails, roleName:rowData.RoleName }, allUsers : users } });
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  };

  const linkAddUser = () =>{ 
    debugger   
    history.push({
      pathname : "/add-user", state :{allUsers : users}
    });
  };

  const actionBodyTemplate = rowData => { 
    console.log(selectedRow, "rowData :", rowData);
        if (rowData.IsActive == 1) {
            return (
                <div className="actions">
                    <span onClick={() => {
                      linkEditUser(rowData);
                        console.log("onClick :", rowData);
                    }}
 
                        title={"Edit"}>
                        <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
                    </span>
                </div>
            )
        }
        else { 
            return (
                <div className="actions">
 
                    <span
                        style={{
                            cursor: 'not-allowed',
                            opacity: 0.5,
                            pointerEvents: 'none'
                        }}
                        title={"Disabled"}>
                        <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
                    </span>
                    {/* <span onClick={() => deleteRow(rowData)} title="Delete">
                <i className="mdi mdi-trash-can-outline label-icon" style={{ fontSize: '1.5rem' }}></i> </span> */}
                </div>
            )
        }
 
      };

  const actionBodyTemplate2 = rowData => {
    debugger
    const isChecked = rowData.IsActive === 1;
    return (
      <div className="square-switch">
        <Input
          type="checkbox"
          id={`square-switch-${rowData.Id}`}
          checked={isChecked}
          onChange={() => openModal(rowData)}
          switch="bool"
        />
        <label
          htmlFor={`square-switch-${rowData.Id}`}
          data-on-label="Yes"
          data-off-label="No"
          style={{ margin: 0 }}
        />
      </div>
    );
  };

  const renderHeader = () => (
    <div className="row align-items-center g-3 clear-spa">
      <div className="col-lg-3">
        <Button
          className="btn btn-danger btn-label"
          onClick={clearFilter}
        >
          <i className="mdi mdi-filter-off label-icon" /> Clear
        </Button>
      </div>
      <div className="col-lg-3">
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
 

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Masters" breadcrumbItem="Users" />

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
              <div className="col-12 col-lg-4">
                <FormGroup className="mb-0">
                  <label htmlFor="userName" className="form-label">
                    User Name
                  </label>
                  <input
                    id="userName"
                    type="text"
                    className="form-control"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="Enter user name"
                  />
                </FormGroup>
              </div>

              {/* From Date */}
              <div className="col-12 col-lg-2">
                <FormGroup className="mb-0">
                  <label htmlFor="fromDate" className="form-label">
                    From
                  </label>
                  <Flatpickr
                    id="fromDate"
                    className="form-control"
                    placeholder="dd-mm-yyyy"
                    value={fromDate}
                    options={{
                      altInput: true,
                      altFormat: "d-M-Y",
                      dateFormat: "Y-m-d",
                    }}
                    onChange={([selectedDate]) => setFromDate(selectedDate)}
                  />
                </FormGroup>
              </div>

              {/* To Date */}
              <div className="col-12 col-lg-2">
                <FormGroup className="mb-0">
                  <label htmlFor="toDate" className="form-label">
                    To
                  </label>
                  <Flatpickr
                    id="toDate"
                    className="form-control"
                    placeholder="dd-mm-yyyy"
                    value={toDate}
                    options={{
                      altInput: true,
                      altFormat: "d-M-Y",
                      dateFormat: "Y-m-d",
                    }}
                    onChange={([selectedDate]) => setToDate(selectedDate)}
                  />
                </FormGroup>
              </div>

              {/* Action Buttons */}
              <div
                className="col-12 col-lg-4 text-end"
                style={{ height: "70px" }}
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
                    className="btn btn-success"
                    onClick={linkAddUser}
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
                value={users}
                paginator
                rows={10}
                loading={loading}
                dataKey="userId"
                filters={filters}
                globalFilterFields={[
                  "Id",
                  "UserName",
                  "RoleName",
                  "Email",
                  "DepartmentName",
                  "Remarks",
                ]}
                header={renderHeader()}
                emptyMessage={
                  <div className="text-center p-4">
                    <img
                      src={nodatafound}
                      alt="No Data"
                      style={{ maxWidth: "47px", marginBottom: "1rem" }}
                    />
                    <div className="font-size-14 fw-bold">No Users Found</div>
                  </div>
                }
                onFilter={e => setFilters(e.filters)}
              >
                <Column
                  field="Id"
                  header="User ID"
                  filter
                  style={{ minWidth: "100px" }}
                />
                <Column
                  field="UserName"
                  header="User Name"
                  filter
                  body={rowData => renderValueOrDash(rowData.UserName)}
                  style={{ minWidth: "160px" }}
                />
                <Column
                  field="RoleName"
                  header="Role Name"
                  filter
                  body={rowData => renderValueOrDash(rowData.RoleName)}
                  style={{ minWidth: "140px" }}
                />
                <Column
                  field="Email"
                  header="Email ID"
                  filter
                  body={rowData => renderValueOrDash(rowData.Email)}
                  style={{ minWidth: "180px" }}
                />
                <Column
                  field="DepartmentName"
                  header="Department"
                  filter
                  body={rowData => renderValueOrDash(rowData.DepartmentName)}
                  style={{ minWidth: "180px" }}
                />
                <Column
                  field="Remarks"
                  header="Remarks"
                  filter
                  body={rowData => renderValueOrDash(rowData.Remarks)}
                  style={{ minWidth: "160px" }}
                />
                <Column
                  field="Actionstatus"
                  header="Active"
                  body={actionBodyTemplate2}
                  className="text-center"
                  headerClassName="text-center"
                  style={{ width: "90px" }}
                />
                <Column
                  field="Action"
                  header="Action"
                  body={actionBodyTemplate}
                  className="text-center"
                  style={{ width: "90px" }}
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

export default ManageUser;
