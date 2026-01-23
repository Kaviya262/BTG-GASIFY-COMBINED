import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Label, FormGroup, Modal, ModalBody, ModalHeader, Input } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { isSubmitting } from "redux-form";
import {
    GetAllDepartments, SaveDepartment
} from "../../../src/common/data/mastersapi";
const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    DepartmentCode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    DepartmentName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});

const ManageDepartment = () => {
    const history = useHistory();
    const [department, setDepartment] = useState([]);
    const [filteredDepart, setFilteredDepart] = useState([]);
    const [departCode, setDepartCode] = useState("");
    const [departName, setDepartName] = useState("");
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters());
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [successmsg, setSuccessmsg] = useState("");
    const [errormsg, setErrorMsg] = useState("");

    useEffect(() => {
        setLoading(true);
        getDepartment("", "");
    }, []);

    useEffect(() => {
        if (successmsg || errormsg) {
            const timer = setTimeout(() => {
                setSuccessmsg(null);
                setErrorMsg(null);
            }, 3000);
        }
    }, [successmsg, errormsg]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };
    const validationSchema = Yup.object().shape({
        DepartmentCode: Yup.string()
            .trim()
            .required("Department Code is required")
            .max(10, "Department Code must be atmost 10 Characters")
            .test("unique", "Department Code Should Be Unique!",
                function (value) {
                    debugger
                    if (!value) return true;

                    const existCode = department.find(
                        code => (code.DepartmentCode &&
                            code.DepartmentCode.toLowerCase() === value.toLowerCase()) &&
                            code.DepartmentId !== (this.parent.DepartmentId || 0)
                    );
                    return !existCode;
                }),
        DepartmentName: Yup.string()
            .trim()
            .required("Department Name is required")
            .max(30, "Department Name must be atmost 30 Characters")
            .test("unique", "Department Name Should Be Unique!",
                function (value) {
                    debugger
                    if (!value) return true;

                    const existName = department.find(
                        name => (name.DepartmentName &&
                            name.DepartmentName.toLowerCase() === value.toLowerCase()) &&
                            name.DepartmentId !== (this.parent.DepartmentId || 0)
                    );
                    return !existName;
                }),
        DepartmentRemark: Yup.string()
            .trim()
            .required("Department Remark is required")
            .max(50, "Department Remark must be atmost 50 Characters"),
    });

    const getDepartment = async (departCode, departName) => {
        debugger
        try {
            setLoading(true);
            const filter = {
                DepartmentCode: departCode,
                DepartmentName: departName,
                UserId: 1,
                OrgId: 1,
                BranchId: 1
            };
            const response = await GetAllDepartments(filter);
            if (response?.status) {
                const departdata = response.data || [];
                setDepartment(departdata);
                setFilteredDepart(departdata);

                const initialSwitch = {};
                departdata.forEach(data => {
                    initialSwitch[data.DepartmentCode] = data.IsActive === 1;
                });
                setSwitchStates(initialSwitch);
            }
            else {
            setFilteredDepart([]);
            }
        }
        catch (error) {
            console.log("getDepartment Error : ", error);
        }
        finally {
            setLoading(false);
        }

    };

    const handleSearch = () => {
        console.log("Search button clicked");
        getDepartment(departCode, departName);
    };

    const handleSearchCancel = () => {
        setDepartCode("");
        setDepartName("");
        getDepartment("", "");
    };

    const clearFilter = () => {
        setFilters(initFilters());
        setGlobalFilterValue('');
        setDepartCode("");
        setDepartName("");
        getDepartment("", "");
    };

    const onGlobalFilterChange = (e) => {
        debugger
        const value = e.target.value.toLowerCase().trim();
        setGlobalFilterValue(value);

        if (value === "") {
            setFilteredDepart(department);
            return;
        }
        const filtered = department.filter(detail =>
            ["DepartmentCode", "DepartmentName"].some(field =>
                detail[field] && String(detail[field]).toLowerCase().trim().includes(value)));
        setFilteredDepart(filtered);
    };

    const editRow = (rowData) => {
        setSelectedRow(rowData);
        setIsModalOpen(true);
    };

    const actionBodyTemplate = (rowData) => {
        debugger
        console.log(selectedRow, "rowData :", rowData);
        if (rowData.IsActive == 1) {
            return (
                <div className="actions">
                    <span onClick={() => {
                        editRow(rowData);
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
                </div>)
        }
    };

    const renderHeader = () => {
        return (
            <div className="row align-items-center g-3 clear-spa">
                <div className="col-12 col-lg-3">
                    <Button className="btn btn-danger btn-label" onClick={clearFilter} outlined >
                        <i className="mdi mdi-filter-off label-icon" />
                        Clear
                    </Button>
                </div>
                <div className="col-12 col-lg-3">
                    <input className="form-control" type="text" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </div>
            </div>
        );
    };

    const header = renderHeader();

    const linkAddPaymentTerm = () => {
        history.push("/add-payment-term");
    };

    const handleNew = () => {
        setSelectedRow(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values, { resetForm }) => {
        debugger
        try {
            console.log("Submitted Data:", values);
            setIsSubmitting(true);
            const payload = {
                header: {
                    DepartmentId: values.DepartmentId,
                    DepartmentCode: values.DepartmentCode,
                    DepartmentName: values.DepartmentName,
                    DepartmentRemark: values.DepartmentRemark,
                    IsActive: values.DepartmentId ? selectedRow?.IsActive : 1,
                    UserId: 1,
                    OrgId: 1,
                    BranchId: 1
                }
            };
            const response = await SaveDepartment(payload);
            console.log("SaveDepartment response: ", response);
            setSuccessmsg(values.DepartmentId ? "Department Details Updated!" : "New Department Created!");
            getDepartment("", "");
            resetForm();
            setIsModalOpen(false);
        }
        catch (error) {
            console.log("handleSubmit Error : ", error);
            setErrorMsg("Saving Department Failed Error!");
        }
        finally {
            toggleModal();
            setIsSubmitting(false);
        }

    };

    const onSwitchChange = async () => {
        debugger
        try {
            if (!selectedRow) return;
            const newStatus = selectedRow?.IsActive === 1 ? 0 : 1;
            const payload = {
                header: {
                    ...selectedRow,
                    IsActive: newStatus
                }
            };

            const response = await SaveDepartment(payload);
            if (response?.status) {
                setSwitchStates(prev => ({
                    ...prev,
                    [selectedRow.DepartmentCode]: newStatus === 1
                }));
                setSuccessmsg(`Department ${newStatus === 1 ? "Activated" : "Deactivated"} Successfully!`);

                await getDepartment("", "");

            } else {
                setErrorMsg("Status update Failed!");
            }
        } catch (error) {
            console.error("Status change error:", error);
            setErrorMsg("Error: Update Status Failed!");
        } finally {
            console.log("selectedRow : ", selectedRow);
            setIsModalOpen2(false);
            console.log("selectedRow-switchchange : ", selectedRow);
        }

    };

    const openModal2 = (rowData) => {
        const value = rowData.Active == 1 ? "deactivate" : "activate";
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen2(true);
    };

    const actionBodyTemplate2 = (rowData) => {
        return (
            <div className="square-switch">
                <Input type="checkbox" id={`square-switch-${rowData.DepartmentCode}`} switch="bool" onChange={() => openModal2(rowData)} checked={switchStates[rowData.DepartmentCode] || false} />
                <label htmlFor={`square-switch-${rowData.DepartmentCode}`} data-on-label="Yes" data-off-label="No" style={{ margin: 0 }} />
            </div>
        );
    };

    return (
        <React.Fragment>
            <div className="page-content">
                {successmsg && <div className="alert alert-success">{successmsg}</div>}
                {errormsg && <div className="alert alert-danger">{errormsg}</div>}
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Departments" />
                    <Row>
                        <Card className="search-top">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="text-left w-auto">
                                            <label htmlFor="code" className="form-label mb-0">Department Code</label>
                                        </div>
                                        <div>
                                            <input id="DepartmentCode" value={departCode} onChange={(e) => setDepartCode(e.target.value)} type="text" className="form-control" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-5">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="text-left w-auto">
                                            <label htmlFor="name" className="form-label mb-0">Department Name</label>
                                        </div>
                                        <div>
                                            <input id="DepartmentName" value={departName} onChange={(e) => setDepartName(e.target.value)} type="text" className="form-control" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-4 text-end button-items">
                                    <button type="button" className="btn btn-info" onClick={handleSearch}>
                                        <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>
                                    <button type="button" className="btn btn-danger" onClick={handleSearchCancel}>
                                        <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                
                                    <button type="button" className="btn btn-success" onClick={handleNew}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
                                </div>
                            </div>
                        </Card>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable value={filteredDepart} paginator showGridlines rows={10} loading={loading} dataKey="DepartmentCode" filters={filters} globalFilterFields={["DepartmentCode", "DepartmentName"]} header={header} emptyMessage="No Department found." onFilter={(e) => setFilters(e.filters)}>
                                    <Column field="DepartmentCode" header="Department Code" filter filterPlaceholder="Search by Code" />
                                    <Column field="DepartmentName" header="Department Name" filter filterPlaceholder="Search by Name" />
                                    <Column field="Actionstatus" header="Active" showFilterMatchModes={false} body={actionBodyTemplate2} className="text-center" headerClassName="text-center" style={{ width: '8%' }} />
                                    <Column field="Action" header="Action" body={actionBodyTemplate} className="text-center" style={{ width: '8%' }} />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal isOpen={isModalOpen} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="-1" toggle={toggleModal} >
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal} className="bg-model-hd">New Department </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <Formik enableReinitialize
                                            initialValues={{
                                                DepartmentId: selectedRow?.DepartmentId || 0,
                                                DepartmentCode: selectedRow?.DepartmentCode || "",
                                                DepartmentName: selectedRow?.DepartmentName || "",
                                                DepartmentRemark: selectedRow?.DepartmentRemark || "",
                                            }}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit}
                                        >
                                            {({ errors, touched }) => (
                                                <Form>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="DepartmentCode" className="required-label">Department  Code</Label>
                                                                <Field name="DepartmentCode"
                                                                    className={`form-control ${errors.DepartmentCode && touched.DepartmentCode ? "is-invalid" : ""} `} />
                                                                <ErrorMessage name="DepartmentCode" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="DepartmentName" className="required-label">Department Name</Label>
                                                                <Field name="DepartmentName" className={`form-control ${errors.DepartmentName && touched.DepartmentName ? "is-invalid" : ""} `} />
                                                                <ErrorMessage name="DepartmentName" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="DepartmentRemark">Remarks</Label>
                                                                <Field as="textarea" name="DepartmentRemark" className="form-control" />
                                                                <ErrorMessage name="DepartmentRemark" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <div className="row align-items-center g-3 justify-content-end">
                                                        <div className="col-md-12 text-end button-items">
                                                            <Button type="submit" className="btn btn-info" disabled={isSubmitting}>
                                                                <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>
                                                                {isSubmitting
                                                                    ? selectedRow?.DepartmentId && selectedRow.DepartmentId > 0 ? "Updating..." : "Saving..."
                                                                    : selectedRow?.DepartmentId && selectedRow.DepartmentId > 0 ? "Update" : "Save"}
                                                            </Button>
                                                            <Button type="button" className="btn btn-danger" onClick={toggleModal}>
                                                                <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </ModalBody>
                </div>
            </Modal>
            {/* Confirmation Modal */}
            <Modal isOpen={isModalOpen2} toggle={() => setIsModalOpen2(false)} centered tabIndex="1">
                <ModalBody className="py-3 px-5">
                    <Row>
                        <Col lg={12}>
                            <div className="text-center">
                                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />

                                <h4>Do you want to {txtStatus} this item?</h4>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="text-center mt-3 button-items">
                                <Button className="btn btn-info" color="success" size="lg" onClick={onSwitchChange}>
                                    Yes
                                </Button>
                                <Button color="danger" size="lg" className="btn btn-danger" onClick={() => setIsModalOpen2(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default ManageDepartment;
