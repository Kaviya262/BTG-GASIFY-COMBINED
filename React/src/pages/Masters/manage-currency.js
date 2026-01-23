import React, { useState, useEffect } from "react";
import {
    Card, CardBody, Col, Container, Row, Label, FormGroup, Modal, ModalBody,
    ModalHeader, Input, Button as StrapButton
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { UncontrolledAlert } from "reactstrap";
import {
    GetAllCurrencies, SaveCurrency, GetCurrencyById,
    UpdateCurrencyStatus
} from "../../../src/common/data/mastersapi";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { startOfToday } from 'date-fns';

const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    CurrencyCode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    CurrencyName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    CurrencySymbol: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    ExchangeRate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    EffectiveFromdate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});

const ManageCurrency = () => {
    const history = useHistory();
    const [currency, setCurrency] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters());
    const [filteredCurrency, setFilteredCurrency] = useState([]);
    const [loading, setLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [searchCode, setSearchCode] = useState("");
    const [searchName, setSearchName] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrormsg] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues = {
        CurrencyCode: "",
        CurrencyName: "",
        CurrencySymbol: "",
        ExchangeRate: "",
        EffectiveFromdate: new Date()
    };

    const [formInitialValues, setFormInitialValues] = useState(initialValues);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const validationSchema = Yup.object().shape({
        CurrencyCode: Yup.string().trim()
            .required("Currency Code is required")
            .matches(/^[A-Z]{3}$/, "Must be 3 uppercase letters (e.g., USD)")
            .test("unique", "Currency Code Should Be Unique",
                function (value) {
                    if (!value) return true;

                    const existCode = currency.find(
                        code => (code.CurrencyCode &&
                            code.CurrencyCode.toLowerCase() === value.toLowerCase()) &&
                            code.CurrencyId !== (this.parent.CurrencyId || 0)
                    );
                    return !existCode;
                }),
        CurrencyName: Yup.string().trim()
            .required("Currency Name is required")
            .test("unique", "Currency Name Should Be Unique",
                function (value) {
                    if (!value) return true;

                    const existCode = currency.find(
                        code => (code.CurrencyName &&
                            code.CurrencyName.toLowerCase() === value.toLowerCase()) &&
                            code.CurrencyId !== (this.parent.CurrencyId || 0)
                    );
                    return !existCode;
                }),
        CurrencySymbol: Yup.string().trim()
            .required("Currency Symbol is required")
            .matches(/^[^\w\s]{1,3}$/, "Use a valid symbol (1–3 non-alphanumeric characters)"),
        ExchangeRate: Yup.number()
            .typeError("Must be a valid number")
            .required("Exchange Rate is required")
            .min(0.0001, "Exchange Rate must be greater than 0")
            .max(1000000, "Exchange Rate is too large"),
        EffectiveFromdate: Yup.date()
            .required("Effective From Date is required")
            .min(startOfToday(), "Effective date cannot be in the past"),
    });

    const getAllCurrencies = async (currencyCode = "", currencyName = "") => {
        setLoading(true);
        debugger
        try {
            const result = await GetAllCurrencies({ currencyCode, currencyName });
            console.log("result of getallcurrencies", result);
            if (result.status) {
                const data = result.data || [];
                setCurrency(data);
                setFilteredCurrency(data);
                const initialSwitchStates = {};
                data.forEach(item => {
                    initialSwitchStates[item.CurrencyCode] = item.IsActive === 1;
                });
                setSwitchStates(initialSwitchStates);
            } else {
                setCurrency([]);
                setFilteredCurrency([]);
                setSwitchStates({});
            }
        } catch (err) {
            console.error("Error fetching currencies:", err);
            setCurrency([]);
            setFilteredCurrency([]);
            setSwitchStates({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllCurrencies();
    }, []);

    useEffect(() => {
        if (errorMsg || successMsg) {
            const timer = setTimeout(() => {
                setErrormsg(null);
                setSuccessMsg(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMsg, successMsg]);

    const clearFilter = () => {
        setSearchCode("");
        setSearchName("");
        setGlobalFilterValue("");
        setFilters(initFilters());
        getAllCurrencies("", "");
    };

    const handleSearchCancel = () => {
        setSearchCode("");
        setSearchName("");
        getAllCurrencies();
    };

    const handleSearch = () => {
        debugger
        getAllCurrencies(searchCode, searchName);
    };

    const handleSubmit = async (values) => {
        debugger
        const date = new Date(values.EffectiveFromdate);
        date.setHours(0, 0, 0, 0);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth()
            + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T00:00:00`;

        const payload = {
            header: {
                CurrencyId: editMode ? values.CurrencyId : 0,
                CurrencyCode: values.CurrencyCode,
                CurrencyName: values.CurrencyName,
                CurrencySymbol: values.CurrencySymbol,
                ExchangeRate: parseFloat(values.ExchangeRate),
                EffectiveFromdate: formattedDate,
                IsActive: 1,
                UserId: 1,
                BranchId: 1,
                OrgId: 1,
                CreatedIP: "",
                IsBaseCurrency: false,
            }

        };
        try {
            debugger
            setIsSubmitting(true);
            const response = await SaveCurrency(payload);
            debugger
            if (response.status) {
                setIsModalOpen(false);
                setIsModalOpen2(false);
                setSuccessMsg(response.message);
                setTimeout(() => {
                    window.location.reload();
                }, 500)
                toggleModal();
                getAllCurrencies();
            } else {
                setErrormsg(response.message);
                toast.error("Failed to save currency.");
            }
        } catch (error) {
            console.error("Error saving currency:", error);
            toast.error("An error occurred while saving.");
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const onGlobalFilterChange = (e) => {
        debugger
        const value = e.target.value.toLowerCase().trim();
        setGlobalFilterValue(value);

        if (value === "") {
            setFilteredCurrency(currency);
            return;
        }
        const filtered = currency.filter(detail =>
            ["CurrencyCode", "CurrencyName"].some(field =>
                detail[field] && String(detail[field]).toLowerCase().trim().includes(value)));
        setFilteredCurrency(filtered);

    };

    const openModal2 = (rowData) => {
        setSelectedRow(rowData);
        setTxtStatus(rowData.IsActive === 1 ? "deactivate" : "activate");
        setIsModalOpen2(true);
    };

    const onSwitchChange = async () => {
        debugger
        try {
            if (!selectedRow) return;

            const newStatus = selectedRow.IsActive === 1 ? 0 : 1;
            const payload = {
                detail: {
                    CurrencyId: selectedRow.CurrencyId,
                    IsActive: newStatus,
                    UserId: 1
                }
            };
            const response = await UpdateCurrencyStatus(payload);
            console.log("onSwitchChange : ", response);
            if (response?.status) {
                setSwitchStates(prevStates => ({
                    ...prevStates, [selectedRow.CurrencyCode]: newStatus === 1,
                }));
                setSuccessMsg(`Currency Status Is ${newStatus === 1 ? "Activated" : "Deactivated"} Successfully!`);
                getAllCurrencies("", "");
            }
            else {
                setErrormsg("Failed status update!");
            }
        }
        catch (error) {
            console.error("Update status error:", error);
            setErrormsg("Error updating currency status.");
        }
        finally {
            setIsModalOpen2(false);
        }
    };

    const actionBodyTemplate = (rowData) => { 
        console.log(selectedRow, "rowData :", rowData);
        if (rowData.IsActive == 1) {
            return (
                <div className="actions">
                    <span onClick={() => {
                        handleEdit(rowData.CurrencyId);
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

    const parseDateWithoutTimezone = (dateStr) => {
        if (!dateStr) return new Date();
        const [year, month, day] = dateStr.split('T')[0].split('-');
        return new Date(Number(year), Number(month) - 1, Number(day));
    };

    const handleEdit = async (id) => {
        try {
            debugger
            const result = await GetCurrencyById(id);
            console.log("currencybyid result :", result);
            if (result) {
                const localDate = parseDateWithoutTimezone(result.EffectiveFromdate);

                setFormInitialValues({
                    CurrencyId: result.CurrencyId,
                    CurrencyCode: result.CurrencyCode,
                    CurrencyName: result.CurrencyName,
                    CurrencySymbol: result.CurrencySymbol,
                    ExchangeRate: result.ExchangeRate,
                    EffectiveFromdate: localDate,
                    IsActive: result.IsActive ? result.IsActive : 1
                });

                setEditMode(true);
                setIsModalOpen(true);
            } else {
                setErrormsg("Currency not found");
            }
        } catch (error) {
            console.error("Failed to fetch currency by ID:", error);
        }
    };

    const formatDateToYMD = (inputDate) => {
        if (!inputDate) return "";
        const date = new Date(inputDate);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const actionBodyTemplate2 = (rowData) => (
        <div className="square-switch">
            <Input
                type="checkbox"
                id={`square-switch-${rowData.CurrencyId}`}
                switch="bool"
                onChange={() => openModal2(rowData)}
                checked={switchStates[rowData.CurrencyId] ?? rowData.IsActive === 1}
            />
            <label
                htmlFor={`square-switch-${rowData.CurrencyId}`}
                data-on-label="Yes"
                data-off-label="No"
                style={{ margin: 0 }}
            />
        </div>
    );
    const openNewCurrencyModal = () => {
        setFormInitialValues(initialValues);
        setEditMode(false);
        setIsModalOpen(true);
    };

    const renderHeader = () => (
        <div className="row align-items-center g-3">
            <div className="col-lg-3">
                <Button className="btn btn-danger" onClick={clearFilter} outlined>
                    <i className="mdi mdi-filter-off label-icon" /> Clear
                </Button>
            </div>
            <div className="col-lg-3" style={{ marginLeft: '50%' }}>
                <Input
                    type="text"
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Keyword Search"
                />
            </div>
        </div>
    );
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Currency " />
                    <Row>
                        {errorMsg && (
                            <UncontrolledAlert color="danger" fade={{ timeout: 300 }}>
                                {errorMsg}
                            </UncontrolledAlert>
                        )}
                        {successMsg && (
                            <UncontrolledAlert color="success" fade={{ timeout: 300 }}>

                                {successMsg}
                            </UncontrolledAlert>
                        )}
                        <Card className="search-top">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-8">
                                    <div className="d-flex align-items-center gap-0">
                                        <div className="col-12 col-lg-2 col-md-2 col-sm-3 text-left ms-2" style={{ marginLeft: '10%' }}>
                                            <label htmlFor="code" className="form-label mb-0">Currency  Code</label>
                                        </div>
                                        <div className="col-12 col-lg-3 col-md-3 col-sm-3">
                                            <Input type="text" value={searchCode} onChange={e => setSearchCode(e.target.value)} />
                                        </div>

                                        <div className="col-12 col-lg-2 col-md-3 col-sm-3 text-left ms-2">
                                            <label htmlFor="name" className="form-label mb-0">Currency Name</label>
                                        </div>
                                        <div className="col-12 col-lg-4 col-md-3 col-sm-3">
                                            <Input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-4 col-md-3 col-sm-3  button-items" style={{ textAlign: "right" }}>
                                    <button type="button" className="btn btn-info" onClick={handleSearch}> <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>
                                    <button type="button" className="btn btn-danger" onClick={handleSearchCancel}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                    <button type="button" className="btn btn-success" onClick={openNewCurrencyModal}>
                                        <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New
                                    </button>

                                </div>
                            </div>
                        </Card>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable
                                    value={filteredCurrency} paginator rows={10}
                                    loading={loading} dataKey="CurrencyId" filters={filters}
                                    globalFilterFields={["CurrencyCode", "CurrencyName", "CurrencySymbol"]}
                                    header={renderHeader()}
                                    emptyMessage="No currencies found." onFilter={(e) => setFilters(e.filters)}>

                                    <Column field="CurrencyCode" header="Currency Code" filter filterPlaceholder="Search By Code" />
                                    <Column field="CurrencyName" header="Currency Name" filter filterPlaceholder="Search By Name" />
                                    <Column field="CurrencySymbol" header="Symbol" />
                                    <Column field="ExchangeRate" header="Exchange Rate" />
                                    <Column
                                        field="EffectiveFromdate"
                                        header="Effective Date"
                                        body={(rowData) => formatDateToYMD(rowData.EffectiveFromdate)}
                                    />

                                    <Column field="IsActive" header="Active" body={actionBodyTemplate2} style={{ textAlign: 'center' }} />
                                    <Column body={actionBodyTemplate} header="Action" style={{ textAlign: 'center' }} />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div >

            <Modal isOpen={isModalOpen} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="-1" toggle={toggleModal}>
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal} className="bg-model-hd">
                        {editMode ? "Edit Currency" : "New Currency"}
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <Formik
                                            enableReinitialize
                                            initialValues={formInitialValues}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit}
                                        >
                                            {({ errors, touched, setFieldValue, setFieldTouched, values }) => (
                                                <Form>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="CurrencyCode" className="required-label">Currency Code</Label>
                                                                <Field name="CurrencyCode" className="form-control" />
                                                                <ErrorMessage name="CurrencyCode" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="CurrencyName" className="required-label">Currency Name</Label>
                                                                <Field name="CurrencyName" className="form-control" />
                                                                <ErrorMessage name="CurrencyName" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="CurrencySymbol" className="required-label">Currency Symbol</Label>
                                                                <Field name="CurrencySymbol" className="form-control" />
                                                                <ErrorMessage name="CurrencySymbol" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="ExchangeRate" className="required-label">Currency Exchange Rate</Label>
                                                                <Field name="ExchangeRate" className="form-control" />
                                                                <ErrorMessage name="ExchangeRate" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="EffectiveFromdate" className="required-label">Effective From Date</Label>
                                                                <DatePicker
                                                                    selected={values.EffectiveFromdate}
                                                                    dateFormat="yyyy-MM-dd"
                                                                    className={`form-control ${errors.EffectiveFromdate && touched.EffectiveFromdate ? "is-invalid" : ""}`}
                                                                    onChange={(date) => setFieldValue("EffectiveFromdate", date)}
                                                                    onBlur={() => setFieldTouched("EffectiveFromdate", true)}
                                                                />
                                                                <ErrorMessage name="EffectiveFromdate" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <div className="row align-items-center g-3 justify-content-end">
                                                        <div className="col-md-12 text-end button-items">
                                                            <Button type="submit" className="btn btn-info" disabled={isSubmitting}>
                                                                <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>
                                                                {isSubmitting ? editMode ? "Updating" : "Saving" :
                                                                    editMode ? "Update" : "Save"}
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
        </React.Fragment >
    );
};

export default ManageCurrency;
