import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Label, FormGroup, Modal, ModalBody, ModalHeader, Input } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import "flatpickr/dist/themes/material_blue.css";
import * as Yup from "yup";
import Flatpickr from "react-flatpickr";
import {
    GetAllProjects, SaveProject
} from "../../../src/common/data/mastersapi";
import { isDisabled } from "@testing-library/user-event/dist/utils";
const initFilters = () => ({

    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    projectid: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    projectcode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    projectname: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    projectaddress: {operator: FilterOperator.AND, constraints:[{value:null, matchMode:FilterMatchMode.STARTS_WITH}]},

});
const ManageProjects = () => {
    const history = useHistory();

    const [project, setProject] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(false);

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [filters, setFilters] = useState(initFilters());
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [txtName, setTxtName] = useState(null);
    const [successmsg, setSuccessmsg] = useState("");
    const [errormsg, setErrorMsg] = useState("");

    const [projectCode, setProjectCode] = useState("");
    const [projectName, setProjectName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    useEffect(() => {
        debugger
        setLoading(true);
        const [ToDate, FromDate] = [new Date(), new Date(new Date().setDate(new Date().getDate() - 7))];
        getProject(projectCode, projectName);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (successmsg || errormsg) {
            const timer = setTimeout(() => {
                setSuccessmsg(null);
                setErrorMsg(null);
            }, 3000);
        }
    }, [successmsg, errormsg]);

    const validationSchema = Yup.object().shape({
        projectcode: Yup.string().trim()
            .required("Project Code is required")
            .max(10, "Project Code must be at most 10 Characters")
            .test("unique", "Project Code Should Be Unique!",
                function (value) {
                    debugger
                    if (!value) return true;

                    const existCode = project.find(
                        code => (code.projectcode &&
                            code.projectcode.toLowerCase() === value.toLowerCase()) &&
                            code.projectid !== (this.parent.projectid || 0)
                    );
                    return !existCode;
                }),
        projectname: Yup.string()
            .trim()
            .required("Project Name is required")
            .max(50, "Project Name must be atmost 50 Characters")
            .test("unique", "Project Name Should Be Unique",
                function (value) {
                    if (!value) return true;

                    const existCode = project.find(
                        code => (code.projectname &&
                            code.projectname.toLowerCase() === value.toLowerCase()) &&
                            code.projectid !== (this.parent.projectid || 0)
                    );
                    return !existCode;
                }),
                projectaddress: Yup.string()
                .required("Project Address is required"),
    });

    const getProject = async (projectCode, projectName) => {
        debugger
        try {
            setLoading(true);
            const filter = {
                //FromDate: from?.toISOString().split("T")[0],
                //ToDate: to?.toISOString().split("T")[0],
                projectCode: projectCode,
                projectName: projectName,
                userid: 1,
                orgid: 1,
                branchid: 1
            };
            const response = await GetAllProjects(filter);
            if (response?.status) {
                const projectdetail = response.data || [];

                setProject(projectdetail);
                setFilteredProjects(projectdetail);

                const initialSwitch = {};
                projectdetail.forEach(detail => {
                    initialSwitch[detail.projectcode] = detail.isactive === 1;
                });
                setSwitchStates(initialSwitch);
            }
            else{
                setFilteredProjects([]);
            }
        }
        catch (error) {
            console.log("getProject Error : ", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        getProject(projectCode, projectName);
    };

    const handleSearchCancel = () => {
        setProjectCode("");
        setProjectName("");
        getProject("", "");
    };

    const clearFilter = () => {
        setProjectCode("");
        setProjectName("");
        setGlobalFilterValue("");
        getProject("", "");
        setFilters(initFilters());
    };

    const onGlobalFilterChange = (e) => {
        debugger
        const value = e.target.value.toLowerCase().trim();
        setGlobalFilterValue(value);

        if (value === "") {
            setFilteredProjects(project);
            return;
        }
        const filtered = project.filter(detail =>
            ["projectcode", "projectname"].some(field =>
                detail[field] && String(detail[field]).toLowerCase().trim().includes(value)));
        setFilteredProjects(filtered);
    };

    const handleNew = () => {
        setSelectedRow(null);
        setIsModalOpen(true);
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

    const editRow = (rowData) => {
        setSelectedRow(rowData);
        setIsModalOpen(true);
    };

    const actionBodyTemplate = (rowData) => {

        console.log(selectedRow, "rowData :", rowData);
        if (rowData.isactive == 1) {
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
                    {/* <span onClick={() => deleteRow(rowData)} title="Delete">
                <i className="mdi mdi-trash-can-outline label-icon" style={{ fontSize: '1.5rem' }}></i> </span> */}
                </div>
            )
        }
 
    };

    const handleSubmit = async (values, { resetForm }) => {
        debugger
        try {
            setIsSubmitting(true);
            const payload = {
                command : selectedRow?.projectid? "Update":"Create",
                Project : {
                    projectid: values.projectid,
                    projectcode: values.projectcode,
                    projectname: values.projectname,
                    projectaddress : values.projectaddress,
                    isactive: values.projectid ? Boolean(selectedRow?.isactive) : true,
                    userid: 1,
                    createdip: "127.0.0.1",
                    modifiedip: "127.0.0.1",
                    branchid:1,
                    orgid:1,
                }
            };
            const response = await SaveProject(payload);
            console.log("SaveProject response: ", response);
            setTxtName(values.projectname);
            setSuccessmsg(values.projectid ? "Project Details Updated!" : "New Project Details Created!");
            getProject("", "");
            resetForm();
            setIsModalOpen(false);
            setTxtName(null);
        }
        catch (error) {
            console.log("handleSubmit Error : ", error);
            setErrorMsg("Saving Project Failed Error!");
        }
        finally {
            setIsSubmitting(false);
        }
    };


    const onSwitchChange = async () => {
        debugger
        try {
            if (!selectedRow) return;

            const newStatus = !selectedRow.isactive;
            const payload = {
                Project :{
                    projectid: selectedRow.projectid,
                    projectcode: selectedRow.projectcode,
                    projectname: selectedRow.projectname,
                    projectaddress : selectedRow.projectaddress,
                    isactive: newStatus,                    
                    userid: 1,
                    createdip:"127.0.0.1",
                    modifiedip:"127.0.0.1",
                    orgid:1,
                    branchid:1,
                }
            };
            const response = await SaveProject(payload);
            console.log("onSwitchChange : ", response);
            if (response?.status) {
                setSwitchStates(prevStates => ({
                    ...prevStates, [selectedRow.projectcode]: newStatus === 1,
                }));
                setSuccessmsg(`Project Status Is ${newStatus === 1 ? "Activated" : "DeActivated"} Successfully!`);
                getProject(projectCode, projectName);
            }
            else {
                setErrorMsg("Failed status update!");
            }
        }
        catch (error) {
            console.error("Update status error:", error);
            setErrorMsg("Error updating method status.");
        }
        finally {
            setIsModalOpen2(false);
        }
    };

    const openModal2 = async (rowData) => {
        const value = rowData.isactive === 1 ? "Deactivate" : "Activate";
        const cName = rowData.projectname;
        setTxtName(cName);
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen2(true);
    };

    const actionBodyTemplate2 = (rowData) => {
        return (
            <div className="square-switch">
                <Input type="checkbox" id={`square-switch-${rowData.projectcode}`} switch="bool"
                    onChange={() => openModal2(rowData)} checked={switchStates[rowData.projectcode] || false} />
                <label htmlFor={`square-switch-${rowData.projectcode}`} data-on-label="Yes" data-off-label="No" style={{ margin: 0 }} />
            </div>
        );
    };

    return (
        <React.Fragment>
            <div className="page-content">
                {successmsg && <div className="alert alert-success">{successmsg}</div>}
                {errormsg && <div className="alert alert-danger">{errormsg}</div>}
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Project" />
                    <Row>
                        <Card className="search-top">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="text-left w-auto">
                                            <label htmlFor="ProjectCode" className="form-label mb-0">Project Code</label>
                                        </div>
                                        <div >
                                            <input id="projectCode" value={projectCode} onChange={(e) => setProjectCode(e.target.value)} type="text" className="form-control" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-5">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="text-left w-auto">
                                            <label htmlFor="ProjectName" className="form-label mb-0">Project Name</label>
                                        </div>
                                        <div >
                                            <input id="projectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="form-control" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-4 text-end button-items">
                                    <button type="button" className="btn btn-info" onClick={handleSearch} > <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>
                                    <button type="button" className="btn btn-danger" onClick={handleSearchCancel}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>

                                    <button type="button" className="btn btn-success" onClick={handleNew}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
                                </div>
                            </div>
                        </Card>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable value={filteredProjects} paginator showGridlines rows={10} loading={loading} dataKey="projectid" 
                                filters={filters} globalFilterFields={["projectcode", "projectname"]} header={header} 
                                emptyMessage="No Project found." onFilter={(e) => setFilters(e.filters)}>
                                    <Column field="projectcode" header="Project Code" filter filterPlaceholder="Search by Code" />
                                    <Column field="projectname" header="Project Name" filter filterPlaceholder="Search by Name" />
                                    <Column field="projectaddress" header="Project Address" filter filterPlaceholder="Search by Address" />
                                    <Column field="isactive" header="Active" showFilterMatchModes={false} body={actionBodyTemplate2} className="text-center" headerClassName="text-center" style={{ width: '8%' }} />

                                    <Column field="id" header="Action" body={actionBodyTemplate} className="text-center" style={{ width: '8%' }} />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal isOpen={isModalOpen} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="-1" toggle={toggleModal} >
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal} className="bg-model-hd">Projects </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <Formik enableReinitialize
                                            initialValues={{
                                                projectid: selectedRow?.projectid || 0,
                                                projectcode: selectedRow?.projectcode || "",
                                                projectname: selectedRow?.projectname || "",
                                                projectaddress: selectedRow?.projectaddress || "",
                                                userid: 1
                                            }}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit} 
                                            context = {{project}}>
                                            {({ errors, touched }) => (
                                                <Form>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>

                                                                <Label htmlFor="ProjectCode" className="required-label">Project Code</Label>
                                                                <Field name="projectcode" className={`form-control ${errors.projectcode && touched.projectcode ? "is-invalid" : ""}`} />
                                                                <ErrorMessage name="projectcode" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="ProjectName" className="required-label">Project Name</Label>
                                                                <Field name="projectname" className={`form-control ${errors.projectname && touched.projectname ? "is-invalid" : ""} `} />
                                                                <ErrorMessage name="projectname" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                      <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="ProjectAddress" className="required-label">Project Address</Label>
                                                                <Field name="projectaddress" className={`form-control ${errors.projectaddress && touched.projectaddress ? "is-invalid" : ""} `} />
                                                                <ErrorMessage name="projectaddress" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <div className="row align-items-center g-3 justify-content-end">
                                                        <div className="col-md-12 text-end button-items">
                                                            <Button type="submit" className="btn btn-info">
                                                                <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>
                                                                {selectedRow?.projectid && selectedRow.projectid > 0 ? "Update" : "Save"}
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

                                <h4>Do you want to {txtStatus} this item ?</h4>
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

export default ManageProjects;
