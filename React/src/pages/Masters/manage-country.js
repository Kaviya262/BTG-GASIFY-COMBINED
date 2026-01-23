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
    GetAllCountries, SaveCountry
} from "../../../src/common/data/mastersapi";
import { isDisabled } from "@testing-library/user-event/dist/utils";
const initFilters = () => ({

    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    CountryId: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    CountryCode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    CountryName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },

});
const ManageCountry = () => {
    const history = useHistory();

    const [country, setCountry] = useState([]);
    const [filteredCountry, setFilteredCountry] = useState([]);
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

    const [countryCode, setCountryCode] = useState("");
    const [countryName, setCountryName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    useEffect(() => {
        debugger
        setLoading(true);
        const [ToDate, FromDate] = [new Date(), new Date(new Date().setDate(new Date().getDate() - 7))];
        getCountry(FromDate, ToDate, countryCode, countryName);
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
        CountryCode: Yup.string().trim()
            .required("Country Code is required")
            .max(10, "Country Code must be at most 10 Characters")
            .test("unique", "Country Code Should Be Unique!",
                function (value) {
                    debugger
                    if (!value) return true;

                    const existCode = country.find(
                        code => (code.CountryCode &&
                            code.CountryCode.toLowerCase() === value.toLowerCase()) &&
                            code.CountryId !== (this.parent.CountryId || 0)
                    );
                    return !existCode;
                }),
        CountryName: Yup.string()
            .trim()
            .required("Country Name is required")
            .max(50, "Country Name must be atmost 50 Characters")
            .test("unique", "Country Name Should Be Unique",
                function (value) {
                    if (!value) return true;

                    const existCode = country.find(
                        code => (code.CountryName &&
                            code.CountryName.toLowerCase() === value.toLowerCase()) &&
                            code.CountryId !== (this.parent.CountryId || 0)
                    );
                    return !existCode;
                }),
    });

    const getCountry = async (from, to, countryCode, countryName) => {
        debugger
        try {
            setLoading(true);
            const filter = {
                FromDate: from?.toISOString().split("T")[0],
                ToDate: to?.toISOString().split("T")[0],
                CountryCode: countryCode,
                CountryName: countryName,
                UserId: 1,
                OrgId: 1,
                BranchId: 1
            };
            const response = await GetAllCountries(filter);
            if (response?.status) {
                const countrydetail = response.data || [];

                setCountry(countrydetail);
                setFilteredCountry(countrydetail);

                const initialSwitch = {};
                countrydetail.forEach(detail => {
                    initialSwitch[detail.CountryCode] = detail.IsActive === 1;
                });
                setSwitchStates(initialSwitch);
            }
            else{
                setFilteredCountry([]);
            }
        }
        catch (error) {
            console.log("getCountry Error : ", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        getCountry(null, null, countryCode, countryName);
    };

    const handleSearchCancel = () => {
        setCountryCode("");
        setCountryName("");
        getCountry(null, null, "", "");
    };

    const clearFilter = () => {
        setCountryCode("");
        setCountryName("");
        setGlobalFilterValue("");
        getCountry(null, null, "", "");
        setFilters(initFilters());
    };

    const onGlobalFilterChange = (e) => {
        debugger
        const value = e.target.value.toLowerCase().trim();
        setGlobalFilterValue(value);

        if (value === "") {
            setFilteredCountry(country);
            return;
        }
        const filtered = country.filter(detail =>
            ["CountryCode", "CountryName"].some(field =>
                detail[field] && String(detail[field]).toLowerCase().trim().includes(value)));
        setFilteredCountry(filtered);
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
                header: {
                    CountryId: values.CountryId,
                    CountryCode: values.CountryCode,
                    CountryName: values.CountryName,
                    IsActive: values.CountryId ? selectedRow?.IsActive : 1,
                    UserId: 1
                }
            };
            const response = await SaveCountry(payload);
            console.log("SaveCountry response: ", response);
            setTxtName(values.CountryName);
            setSuccessmsg(values.CountryId ? "Country Details Updated!" : "New Country Details Created!");
            getCountry(null, null, "", "");
            resetForm();
            setIsModalOpen(false);
            setTxtName(null);
        }
        catch (error) {
            console.log("handleSubmit Error : ", error);
            setErrorMsg("Saving Country Failed Error!");
        }
        finally {
            setIsSubmitting(false);
        }
    };


    const onSwitchChange = async () => {
        debugger
        try {
            if (!selectedRow) return;

            const newStatus = selectedRow.IsActive === 1 ? 0 : 1;
            const payload = {
                header: {
                    CountryId: selectedRow.CountryId,
                    CountryCode: selectedRow.CountryCode,
                    CountryName: selectedRow.CountryName,
                    IsActive: newStatus,
                    UserId: 1
                }
            };
            const response = await SaveCountry(payload);
            console.log("onSwitchChange : ", response);
            if (response?.status) {
                setSwitchStates(prevStates => ({
                    ...prevStates, [selectedRow.CountryCode]: newStatus === 1,
                }));
                setSuccessmsg(`Country Status Is ${newStatus === 1 ? "Activated" : "DeActivated"} Successfully!`);
                getCountry(fromDate, toDate, countryCode, countryName);
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
        const value = rowData.IsActive === 1 ? "Deactivate" : "Activate";
        const cName = rowData.CountryName;
        setTxtName(cName);
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen2(true);
    };

    const actionBodyTemplate2 = (rowData) => {
        return (
            <div className="square-switch">
                <Input type="checkbox" id={`square-switch-${rowData.CountryCode}`} switch="bool"
                    onChange={() => openModal2(rowData)} checked={switchStates[rowData.CountryCode] || false} />
                <label htmlFor={`square-switch-${rowData.CountryCode}`} data-on-label="Yes" data-off-label="No" style={{ margin: 0 }} />
            </div>
        );
    };

    return (
        <React.Fragment>
            <div className="page-content">
                {successmsg && <div className="alert alert-success">{successmsg}</div>}
                {errormsg && <div className="alert alert-danger">{errormsg}</div>}
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Country" />
                    <Row>
                        <Card className="search-top">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="text-left w-auto">
                                            <label htmlFor="CountryCode" className="form-label mb-0">Country Code</label>
                                        </div>
                                        <div >
                                            <input id="CountryCode" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} type="text" className="form-control" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-5">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="text-left w-auto">
                                            <label htmlFor="CountryName" className="form-label mb-0">Country Name</label>
                                        </div>
                                        <div >
                                            <input id="CountryName" type="text" value={countryName} onChange={(e) => setCountryName(e.target.value)} className="form-control" />
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
                                <DataTable value={filteredCountry} paginator showGridlines rows={10} loading={loading} dataKey="CountryId" 
                                filters={filters} globalFilterFields={["CountryCode", "CountryName"]} header={header} 
                                emptyMessage="No Country found." onFilter={(e) => setFilters(e.filters)}>
                                    <Column field="CountryCode" header="Country Code" filter filterPlaceholder="Search by Code" />
                                    <Column field="CountryName" header="Country Name" filter filterPlaceholder="Search by Name" />
                                    <Column field="IsActive" header="Active" showFilterMatchModes={false} body={actionBodyTemplate2} className="text-center" headerClassName="text-center" style={{ width: '8%' }} />

                                    <Column field="id" header="Action" body={actionBodyTemplate} className="text-center" style={{ width: '8%' }} />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal isOpen={isModalOpen} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="-1" toggle={toggleModal} >
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal} className="bg-model-hd">Country </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <Formik enableReinitialize
                                            initialValues={{
                                                CountryId: selectedRow?.CountryId || 0,
                                                CountryCode: selectedRow?.CountryCode || "",
                                                CountryName: selectedRow?.CountryName || "",
                                                UserId: 1
                                            }}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit} >
                                            {({ errors, touched }) => (
                                                <Form>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>

                                                                <Label htmlFor="CountryCode" className="required-label">Country Code</Label>
                                                                <Field name="CountryCode" className={`form-control ${errors.CountryCode && touched.CountryCode ? "is-invalid" : ""}`} />
                                                                <ErrorMessage name="CountryCode" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="CountryName" className="required-label">Country Name</Label>
                                                                <Field name="CountryName" className={`form-control ${errors.CountryCode && touched.CountryCode ? "is-invalid" : ""} `} />
                                                                <ErrorMessage name="CountryName" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>

                                                    <div className="row align-items-center g-3 justify-content-end">
                                                        <div className="col-md-12 text-end button-items">
                                                            <Button type="submit" className="btn btn-info">
                                                                <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>
                                                                {selectedRow?.CountryId && selectedRow.CountryId > 0 ? "Update" : "Save"}
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

export default ManageCountry;
