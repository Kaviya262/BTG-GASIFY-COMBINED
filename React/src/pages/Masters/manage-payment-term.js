import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Card, CardBody, Col, Container, Row, Label, FormGroup, Modal, ModalBody, ModalHeader, Input
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
    GetAllPaymentTerm,
    SaveTerms,
} from "../../../src/common/data/mastersapi";

const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    PaymentTermCode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    PaymentTermDesc: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    DueDays: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});

const ManagePaymentTerms = () => {
    const history = useHistory();

    const [paymentTerms, setPaymentTerms] = useState([]);
    const [filteredPayTerms, setFilteredPayTerms] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters());
    const [loading, setLoading] = useState(false);

    const [payTermCode, setPayTermCode] = useState("");
    const [fromdate, setFromDate] = useState(null);
    const [todate, setToDate] = useState(null);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [successmsg, setsuccessmsg] = useState();
    const [errormsg, seterrormsg] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const toggleModal = () => setIsModalOpen(prev => !prev);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const ToDate = new Date();
            const FromDate = new Date(new Date().setDate(ToDate.getDate() - 7));
            setToDate(ToDate);
            setFromDate(FromDate);
            await getPaymentTerms(FromDate, ToDate, "");
            setLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        if (successmsg || errormsg) {
            const timer = setTimeout(() => {
                setsuccessmsg(null);
                seterrormsg(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [successmsg, errormsg]);

    const validationSchema = useMemo(() => Yup.object().shape({
        paymentTermCode: Yup.string()
            .trim()
            .required("Payment Term Code is required")
            .max(60,"Payment Term Code is atmost 60 characters")
            .test("unique", "Payment Term Code should be Unique!", function (value) { debugger
                if (!value) return true;
                const existCode = paymentTerms.find(
                    Term => Term.PaymentTermCode?.trim().toLowerCase() === value.trim().toLowerCase() &&
                        Term.PaymentTermId !== (this.parent.paymentTermId || 0)
                );
                return !existCode;
            }),
        paymentTermDescription: Yup.string()
        .trim()
        .max(50,"Payment Term Description is atmost 50 characters"),
    }), [paymentTerms]);

    const getPaymentTerms = useCallback(async (from, to, code) => {
        try {
            setLoading(true);
            const filter = {
                FromDate: from?.toISOString().split("T")[0],
                ToDate: to?.toISOString().split("T")[0],
                PaymentTermCode: code,
                OrgId: 1,
                BranchId: 1
            };
            const response = await GetAllPaymentTerm(filter);
            if (response?.status) {
                const data = response.data || [];
                setPaymentTerms(data);
                setFilteredPayTerms(data);
                const switchState = {};
                data.forEach(term => {
                    switchState[term.PaymentTermCode] = term.IsActive === 1;
                });
                setSwitchStates(switchState);
            }
             else {
                setFilteredPayTerms([]);

            }
        } catch (error) {
            console.error("Error fetching Payment Terms:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = useCallback(() => {
        getPaymentTerms(null, null, payTermCode);
    }, [getPaymentTerms, payTermCode]);

    const handleSearchCancel = useCallback(() => {
        setPayTermCode("");
        getPaymentTerms(null, null, "");
    }, [getPaymentTerms]);

    const clearFilter = useCallback(() => {
        setPayTermCode("");
        setGlobalFilterValue("");
        setFilters(initFilters());
        getPaymentTerms(null, null, "");
    }, [getPaymentTerms]);

    const onGlobalFilterChange = useCallback((e) => {
        const value = e.target.value.toLowerCase().trim();
        setGlobalFilterValue(value);
        if (!value) {
            setFilteredPayTerms(paymentTerms);
            return;
        }
        const filtered = paymentTerms.filter(term =>
            ["PaymentTermCode", "PaymentTermDesc", "DueDays"].some(field =>
                term[field]?.toString().toLowerCase().includes(value)
            ));
        setFilteredPayTerms(filtered);
    }, [paymentTerms]);

    const handleNew = () => {
        setSelectedRow(null);
        setIsModalOpen(true);
    };

    const editRow = (rowData) => {
        debugger
        setSelectedRow(rowData);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values, { resetForm }) => {
        try {
            setIsSubmitting(true);
            const payload = {
                header: {
                    PaymentTermId: values.paymentTermId,
                    PaymentTermCode: values.paymentTermCode,
                    PaymentTermDesc: values.paymentTermDescription,
                    DueDays: values.dueDateCalculation,
                    IsActive: values.paymentTermId ? selectedRow?.IsActive : 1,
                    UserId: 1
                }
            };
            const response = await SaveTerms(payload);
            if (response?.status) {
                setsuccessmsg(values.paymentTermId ? "PaymentTerm Updated Successfully" : "PaymentTerm Created Successfully");
                await getPaymentTerms(null, null, "");
                resetForm();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Save error:", error);
            seterrormsg("Save Payment Terms Failed!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSwitchChange = async () => {
        debugger
        if (!selectedRow) return;
        const newStatus = selectedRow.IsActive === 1 ? 0 : 1;
        const payload = {
            header: {
                ...selectedRow,
                IsActive: newStatus
            }
        };
        try {
            const response = await SaveTerms(payload);
            if (response?.status) {
                setSwitchStates(prev => ({
                    ...prev,
                    [selectedRow.PaymentTermCode]: newStatus === 1
                }));
                setsuccessmsg(`Payment Term ${newStatus === 1 ? "Activated" : "Deactivated"} Successfully!`);

                await getPaymentTerms(fromdate, todate, payTermCode);

            } else {
                seterrormsg("Status update Failed!");
            }
        } catch (error) {
            console.error("Status change error:", error);
            seterrormsg("Error: Update Status Failed!");
        } finally {
            console.log("selectedRow : ", selectedRow);
            setIsModalOpen2(false);
            console.log("selectedRow : ", selectedRow);
        }
    };

    const openModal2 = (rowData) => {
        setTxtStatus(rowData.IsActive === 1 ? "deactivate" : "activate");
        setSelectedRow(rowData);
        setIsModalOpen2(true);
    };

    const actionBodyTemplate = (rowData) => {     
        debugger   
        console.log(selectedRow,"rowData :", rowData);
          if(rowData.IsActive==1){    
       return (
        <div className="actions">
            <span onClick={()=>{
                   editRow(rowData);
                    console.log("onClick :", rowData);
            }} 
            
             title= {"Edit"  }>
                <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
            </span>
        </div>
       )
       }
       else{
           return (
                    <div className="actions">

          <span  
            style={{ cursor :   'not-allowed',
                     opacity : 0.5,
                     pointerEvents :   'none'
             }} 
             title= { "Disabled" }>
                <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
            </span>
            </div>)
       }
    };

    const actionBodyTemplate2 = (rowData) => (
        <div className="square-switch">
            <Input type="checkbox" id={`square-switch-${rowData.PaymentTermCode}`} switch="bool"
                onChange={() => openModal2(rowData)} checked={switchStates[rowData.PaymentTermCode] || false} />
            <label htmlFor={`square-switch-${rowData.PaymentTermCode}`} data-on-label="Yes" data-off-label="No" style={{ margin: 0 }} />
        </div>
    );

    const header = useMemo(() => (
        <div className="row align-items-center g-3 clear-spa">
            <div className="col-12 col-lg-3">
                <Button className="btn btn-danger btn-label" onClick={clearFilter} outlined>
                    <i className="mdi mdi-filter-off label-icon" />
                    Clear
                </Button>
            </div>
            <div className="col-12 col-lg-3">
                <input className="form-control" type="text" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
            </div>
        </div>
    ), [clearFilter, globalFilterValue, onGlobalFilterChange]);

    return (
        <React.Fragment>
            <div className="page-content">
                {successmsg && <div className="alert alert-success">{successmsg}</div>}
                {errormsg && <div className="alert alert-danger">{errormsg}</div>}
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Payment Terms" />
                    <Row>
                        <Card className="search-top">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-8">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="text-left w-auto gap-2">
                                            <label htmlFor="name" className="form-label mb-0">Payment Term Code</label>
                                        </div>
                                        <div className="col-12 col-lg-3 col-md-3 col-sm-3">
                                            <input id="name" type="text" className="form-control" value={payTermCode} onChange={(e) => setPayTermCode(e.target.value)} maxLength={20}/>
                                        </div>

                                    </div>
                                </div>
                                <div className="col-12 col-lg-4 text-end button-items d-flex justify-content-end gap-2">
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
                                <DataTable value={filteredPayTerms} paginator showGridlines rows={10} loading={loading} dataKey="PaymentTermId" filters={filters} globalFilterFields={["PaymentTermCode", "PaymentTermDesc", "DueDays"]} header={header} emptyMessage="No payment terms found." onFilter={(e) => setFilters(e.filters)}>
                                    <Column field="PaymentTermCode" header="Code" filter filterPlaceholder="Search by Code" />
                                    <Column field="PaymentTermDesc" header="Description" filter filterPlaceholder="Search by Description" />
                                    <Column field="DueDays" filter header="Due Days" />
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
                    <ModalHeader toggle={toggleModal} className="bg-model-hd">Payment Term</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <Formik enableReinitialize
                                            initialValues={{
                                                paymentTermId: selectedRow?.PaymentTermId || 0,
                                                paymentTermCode: selectedRow?.PaymentTermCode || "",
                                                paymentTermDescription: selectedRow?.PaymentTermDesc || "",
                                                dueDateCalculation: selectedRow?.DueDays || "",
                                                userId: 1
                                            }}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit}
                                        >
                                            {({ errors, touched }) => (
                                                <Form>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="paymentTermCode" className="required-label">Code <span className="text-muted">(Max 60 characters)</span></Label>
                                                                <Field name="paymentTermCode" className={`form-control ${errors.paymentTermCode && touched.paymentTermCode ? "is-invalid" : ""}`} maxLength="60"/>
                                                                <ErrorMessage name="paymentTermCode" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label>Description</Label>
                                                                <Field name="paymentTermDescription" as="textarea"
                                                                    className={`form-control ${errors.paymentTermDescription && touched.paymentTermDescription ? "is-invalid" : ""}`} />
                                                                <ErrorMessage name="paymentTermDescription" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label>Due Days</Label>
                                                                <Field name="dueDateCalculation" className="form-control" />
                                                                <ErrorMessage name="dueDateCalculation" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <div className="row align-items-center g-3 justify-content-end">
                                                        <div className="col-md-12 text-end button-items">
                                                            <Button type="submit" className="btn btn-info" disabled={isSubmitting}>
                                                                <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>
                                                                {isSubmitting
                                                                    ? selectedRow ? "Updating..." : "Saving..."
                                                                    : selectedRow ? "Update" : "Save"}
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

export default ManagePaymentTerms;