import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Label, FormGroup, InputGroup, Input, Table, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import "primereact/resources/themes/lara-light-blue/theme.css";
import { useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
    GetAllPaymentMethods,
    SaveMethods,
} from "../../../src/common/data/mastersapi";

const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    PaymentMethodCode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    PaymentMethodName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});

const ManagePaymentMethods = () => {
    const history = useHistory();
    const [methods, setMethods] = useState([]);
    const [filteredMethods, setFilteredMethods] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters());
    const [loading, setLoading] = useState(false);
    const [payMethodCode, setPayMethodCode] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [successmsg, setsuccessmsg] = useState();
    const [errormsg, seterrormsg] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    useEffect(() => {
        debugger
        setLoading(true);
        const ToDate = new Date();
        const FromDate = new Date();
        FromDate.setDate(ToDate.getDate() - 7);
        setFromDate(FromDate);
        setToDate(ToDate);
        getPaymentMethods(FromDate, ToDate, "");
        setLoading(false);
    }, []);

    useEffect(() => {
        if (successmsg || errormsg) {
            const timer = setTimeout(() => {
                setsuccessmsg(null);
                seterrormsg(null);
            }, 6000);
        }
    }, [successmsg, errormsg]);

    const getPaymentMethods = async (from, to, payMethodCode) => {
        debugger
        try {
            setLoading(true);
            const filter = {
                FromDate: from?.toISOString().split("T")[0],
                ToDate: to?.toISOString().split("T")[0],
                PaymentMethodCode: payMethodCode,
                OrgId: 1,
                BranchId: 1
            };
            const response = await GetAllPaymentMethods(filter);
            console.log("Getallpaymentmethod : ", response);
            if (response?.status) {
                const payMethods = response.data || [];
                setMethods(payMethods);
                setFilteredMethods(payMethods);
                console.log("setFilteredMethods : ", setFilteredMethods(payMethods));

                const initialSwitch = {};
                payMethods.forEach(method => {
                    initialSwitch[method.PaymentMethodCode] = method.IsActive === 1;
                });
                setSwitchStates(initialSwitch);
            }
            else {
                setFilteredMethods([]);
            }
        }
        catch (error) {
            console.error("Error fetching Payment Methods! ", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSearch = () => {
        debugger
        getPaymentMethods(null, null, payMethodCode);
    };
    const handleSearchCancel = () => {
        setPayMethodCode("");
        getPaymentMethods(null, null, "");
    }

    const clearFilter = () => {
        setMethods("");
        setPayMethodCode("");
        getPaymentMethods(null, null, "");
        setFilters(initFilters());
        setGlobalFilterValue("");
    };

    const onGlobalFilterChange = (e) => {
        debugger
        const value = e.target.value.toLowerCase().trim();
        setGlobalFilterValue(value);

        if (value === "") {
            setFilteredMethods(methods);
            return;
        }
        const filtered = methods.filter(method =>
            ["PaymentMethodCode", "PaymentMethodName"].some(field =>
                method[field] && String(method[field]).toLowerCase().trim().includes(value))
        );
        setFilteredMethods(filtered);
    };
    const handleNew = () => {
        setSelectedRow(null);
        setIsModalOpen(true);
    };


    const validationSchema = Yup.object().shape({
        paymentMethodCode: Yup.string()
            .trim()
            .required("Payment Method Code is required")
            .max(10, "Payment Method Code must be atmost 10 Characters")
            .test("unique", "Payment Method Code Should Be Unique", function (value) {
                debugger
                if (!value) return true;
                const existCode = methods.find(
                    method => method.PaymentMethodCode &&
                        method.PaymentMethodCode.toLowerCase() === value.toLowerCase() &&
                        method.Id !== (this.parent.paymentMethodId || 0)
                );
                console.log("!existCode :", !existCode);
                return !existCode;
            }),
        paymentMethodName: Yup.string()
            .trim()
            .max(20, "Payment Method Name must be atmost 20 Characters")
            .test("unique", "Payment Method Name Should Be Unique", function (value) {
                debugger
                if (!value) return true;
                const existCode = methods.find(
                    method => method.PaymentMethodName &&
                        method.PaymentMethodName.toLowerCase() === value.toLowerCase() &&
                        method.Id !== (this.parent.paymentMethodId || 0)
                );
                console.log("!existCode :", !existCode);
                return !existCode;
            }),
    });

    const renderHeader = () => (
        <div className="row align-items-center g-3 clear-spa">
            <div className="col-12 col-lg-3">
                <Button className="btn btn-danger btn-label" onClick={clearFilter} outlined>
                    <i className="mdi mdi-filter-off label-icon" /> Clear
                </Button>
            </div>
            <div className="col-12 col-lg-3">
                <input className="form-control" type="text" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
            </div>
        </div>
    );

    const header = renderHeader();
    const editRow = (rowData) => {
        console.log("Edit Data :", rowData);
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
                    PaymentMethodId: values.paymentMethodId,
                    PaymentMethodCode: values.paymentMethodCode,
                    PaymentMethodName: values.paymentMethodName,
                    IsActive: values.paymentMethodId ? selectedRow?.IsActive : 1,
                    UserId: values.userId
                }
            };
            const response = await SaveMethods(payload);
            debugger
            console.log("Savemethod submit : ", response);
            if (response?.status) {
                setsuccessmsg(values.paymentMethodId ? "Payment Method updated!" : "Payment Method created");
                getPaymentMethods(null, null, "");
                resetForm();
                setIsModalOpen(false);
            }

        }
        catch (error) {
            console.error("Error msg: ", error);
            seterrormsg("Error Saving Methods!");
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
                    PaymentMethodId: selectedRow.Id,
                    PaymentMethodCode: selectedRow.PaymentMethodCode,
                    PaymentMethodName: selectedRow.PaymentMethodName,
                    IsActive: newStatus,
                    UserId: selectedRow.UserId
                }
            };
            debugger
            const response = await SaveMethods(payload);
            console.log("Savemethod response : ", response);
            debugger
            if (response?.status) {
                setSwitchStates(prevStates => ({
                    ...prevStates,
                    [selectedRow.PaymentMethodCode]: newStatus === 1,
                }));
                setsuccessmsg(`Payment Method ${newStatus === 1 ? 'Activated' : 'DeActivated'} Successfully!`);
                getPaymentMethods(fromDate, toDate, payMethodCode);
            }
            else {
                seterrormsg("Failed status update!");
            }
        }
        catch (error) {
            console.error("Update status error:", error);
            seterrormsg("Error updating method status.");
        }
        finally {
            setIsModalOpen2(false);
        }
    };

    const clearMessages = () => {
        setsuccessmsg(null);
        seterrormsg(null);
    };
    const openModal2 = (rowData) => {
        const value = rowData.IsActive == 1 ? "deactivate" : "activate";
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen2(true);
    };

    const actionBodyTemplate2 = (rowData) => {
        return (
            <div className="square-switch">
                <Input
                    type="checkbox"
                    id={`square-switch-${rowData.PaymentMethodCode}`}
                    switch="bool"
                    onChange={() => openModal2(rowData)}
                    checked={switchStates[rowData.PaymentMethodCode] || false}
                />
                <label htmlFor={`square-switch-${rowData.PaymentMethodCode}`} data-on-label="Yes" data-off-label="No" style={{ margin: 0 }} />
            </div>
        );
    };

    return (
        <React.Fragment>
            <div className="page-content">
                {successmsg && <div className="alert alert-success">{successmsg}</div>}
                {errormsg && <div className="alert alert-danger">{errormsg}</div>}
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Payment Methods" />
                    <Row>
                        <Card className="search-top  ms-1 mt-2 mb-2">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-8">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="text-left   w-auto gap-2">
                                            <label htmlFor="name" className="form-label mb-0">Payment Method Code</label>
                                        </div>
                                        <div className="col-12 col-lg-3 col-md-3 col-sm-3">
                                            <input id="name" type="text" className="form-control" value={payMethodCode} onChange={(e) => setPayMethodCode(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-4  text-end button-items d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-info" onClick={handleSearch}> <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>
                                    <button type="button" className="btn btn-danger" onClick={handleSearchCancel}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>

                                    <button type="button" className="btn btn-success" onClick={handleNew}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
                                </div>
                            </div>
                        </Card>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable value={filteredMethods} paginator showGridlines rows={10} loading={loading} dataKey="PaymentMethodId" filters={filters} globalFilterFields={["PaymentMethodCode", "PaymentMethodName"]} header={header} emptyMessage="No payment methods found." onFilter={(e) => setFilters(e.filters)} >
                                    <Column field="PaymentMethodCode" header="Payment Method Code" filter filterPlaceholder="Search by Code" />
                                    <Column field="PaymentMethodName" header="Payment Method Name" filter filterPlaceholder="Search by Name" />
                                    <Column field="IsActive" header="Active" showFilterMatchModes={false} body={actionBodyTemplate2} className="text-center" headerClassName="text-center" style={{ width: '8%' }} />
                                    <Column field="Action" header="Action" body={actionBodyTemplate} className="text-center" style={{ width: '8%' }} />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal isOpen={isModalOpen} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="-1" toggle={toggleModal} >
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal} className="bg-model-hd">Payment Method</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <Formik enableReinitialize
                                            initialValues={{
                                                paymentMethodId: selectedRow?.Id || 0,
                                                paymentMethodCode: selectedRow?.PaymentMethodCode || "",
                                                paymentMethodName: selectedRow?.PaymentMethodName || "",
                                                userId: 1
                                            }}
                                            validationSchema={validationSchema} onSubmit={handleSubmit} >
                                            {({ errors, touched }) => (
                                                <Form>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="paymentMethodCode" className="required-label">Payment Method Code</Label>
                                                                <Field name="paymentMethodCode" className={`form-control ${errors.paymentMethodCode && touched.paymentMethodCode ? "is-invalid" : ""} `} />
                                                                <ErrorMessage name="paymentMethodCode" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label>Payment Method Name</Label>
                                                                <Field name="paymentMethodName" as="textarea" className={`form-control ${errors.paymentMethodName && touched.paymentMethodName ? "is-invalid" : ""} `} />
                                                                <ErrorMessage name="paymentMethodName" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <div className="row align-items-center g-3 justify-content-end">
                                                        <div className="col-md-12 text-end button-items">
                                                            <Button type="submit" className="btn btn-info">
                                                                <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>
                                                                {selectedRow?.Id && selectedRow.Id > 0 ? "Update" : "Save"}
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
                    <ModalFooter>
                        {/* <Button type="submit" className="btn btn-info">
                            <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>Save
                        </Button>
                        <Button type="button" className="btn btn-danger" onClick={toggleModal}>
                            <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel
                        </Button> */}
                    </ModalFooter>
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

export default ManagePaymentMethods;

