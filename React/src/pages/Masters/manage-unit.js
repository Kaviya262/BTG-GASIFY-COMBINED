import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Label, FormGroup, Modal, ModalBody, ModalHeader, Input } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
    GetAllUnits,
    SaveUnits,
} from "../../../src/common/data/mastersapi";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import "primereact/resources/themes/lara-light-blue/theme.css";
import { useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    UOMCode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    UOMDescription: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});

const ManageUnits = () => {
    const history = useHistory();

    const [units, setUnits] = useState([]);
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters());
    const [UOMId, setUOMId] = useState("");
    const [unitsCode, setUnitsCode] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [successmsg, setsuccessmsg] = useState();
    const [errormsg, seterrormsg] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const toggleModal2 = () => {
        setIsModalOpen2(!isModalOpen2);
    };

    useEffect(() => {
        debugger
        const ToDate = new Date();
        const FromDate = new Date();
        FromDate.setDate(ToDate.getDate() - 7);
        setFromDate(FromDate);
        setToDate(ToDate);
        // setUnits(getUnits());
        getUnits(FromDate, ToDate, "");
    }, []);

    useEffect(() => {
        if (successmsg || errormsg) {
            const timer = setTimeout(() => {
                setsuccessmsg(null);
                seterrormsg(null);
            }, 3000);
        }
    }, [successmsg, errormsg]);

    const getUnits = async (from, to, unitsCode) => {
        try {
            setLoading(true);
            const filter = {
                FromDate: from?.toISOString().split("T")[0],
                ToDate: to?.toISOString().split("T")[0],
                UnitsCode: unitsCode,
                OrgId: 1,
                BranchId: 1
            };

            const response = await GetAllUnits(filter);
            if (response?.status) {
                const unitsData = response.data || [];
                setUnits(unitsData);
                setFilteredUnits(unitsData);
                const initialSwitch = {};
                unitsData.forEach(unit => {
                    initialSwitch[unit.UOMCode] = unit.IsActive === 1;
                });
                setSwitchStates(initialSwitch);
            }
            else{
              setFilteredUnits([]);  
            }
        }
        catch (error) {
            console.error("Error fetching UOM's", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        getUnits(null, null, unitsCode);
    };
    const handleSearchCancel = () => {
        setUnitsCode("");
        getUnits(null, null, "");
    };

    const clearFilter = () => {
        setUnitsCode("");
        getUnits(null, null, "");
        setFilters(initFilters()); // Reset the filters state
        setGlobalFilterValue(""); // Clear the global filter value
    };

    const onGlobalFilterChange = (e) => {
        debugger
        const value = e.target.value.toLowerCase().trim();
        setGlobalFilterValue(value);
        if (!value) {
            setFilteredUnits(units);
            return;
        }
        const filtered = units.filter(unit =>
            ["UOMCode", "UOMDescription"].some(field =>
                unit[field] && String(unit[field]).toLowerCase().trim().includes(value)
            )
        );
        setFilteredUnits(filtered);
    };

    const handleNew = () => {
        setSelectedRow(null);
        setIsModalOpen2(true);
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
        console.log('Edit row:', rowData);
        setSelectedRow(rowData);
        setIsModalOpen2(true);
        //history.push("/units/add", {unitData:rowData});
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

    const onSwitchChange = async () => {
        debugger
        try {
            debugger
            if (!selectedRow) return;

            const newStatus = selectedRow.IsActive === 1 ? 0 : 1;
            const payload = {
                header: {
                    UOMId: selectedRow.UOMId,
                    UOMCode: selectedRow.UOMCode,
                    UOMDescription: selectedRow.UOMDescription,
                    IsActive: newStatus,
                    UserId: 1
                }
            };
            const response = await SaveUnits(payload);
            console.log("SaveUnits(payload) :", response);
            if (response?.status) {
                setSwitchStates(prevStates => ({
                    ...prevStates,
                    [selectedRow.UOMCode]: newStatus === 1,
                }));
                setsuccessmsg(`UOM ${newStatus === 1 ? 'Activated' : 'Deactivated'} successfully!`);
                getUnits(fromDate, toDate, unitsCode);
            }
            else {
                seterrormsg("Failed status update!");
            }
        }
        catch (error) {
            console.error("Update status error:", error);
            seterrormsg("Error updating unit status.");
        }
        finally {
            setIsModalOpen(false);
        }
    };

    const openModal = (rowData) => {
        const value = rowData.IsActive === 1 ? "deactive" : "active";
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen(true);
    };

    const actionBodyTemplate2 = (rowData) => {
        return (
            <div className="square-switch">
                <Input
                    type="checkbox"
                    id={`square-switch-${rowData.UOMCode}`}
                    switch="bool"
                    onChange={() => openModal(rowData)}
                    checked={switchStates[rowData.UOMCode] || false}
                />
                <label htmlFor={`square-switch-${rowData.UOMCode}`} data-on-label="Yes" data-off-label="No" style={{ margin: 0 }} />
            </div>
        );
    };

    const validationSchema = Yup.object().shape({
        uomCode: Yup.string()
            .trim()
            .required("UOM Code is required")
            .max(20, "UOM Code Should be atmost 20 characters")
            .test("unique", "UOM Code Must Be Unique!", function (value) {
                debugger
                if (!value) return true;
                const existCode = units.find(
                    unit => unit.UOMCode &&
                        unit.UOMCode.toLowerCase() === value.toLowerCase() &&
                        unit.UOMId !== (this.parent.uomId || 0)
                );
                return !existCode;
            }),
        uomDescription: Yup.string().trim()
        .required("UOM description is required")
        .max(50, "UOM Descriptions Should be atmost 50 characters"),
    });

    const handleSubmit = async (values, { resetForm }) => {
        debugger
        try {
            setIsSubmitting(true);
            const payload = {
                header: {
                    UOMId: values.uomId,
                    UOMCode: values.uomCode,
                    UOMDescription: values.uomDescription,
                    IsActive: values.uomId ? selectedRow?.IsActive : 1,
                    UserId: 1
                }
            };
            const response = await SaveUnits(payload);
            console.log("await SaveUnits(payload);", response);
            if (response?.status) {
                setsuccessmsg(values.uomId ? "UOM Updated Successfully!" : "UOM Created Successfully!");
                getUnits(fromDate, toDate, unitsCode);
                resetForm();
                setIsModalOpen2(false);
            }
            else {
                seterrormsg("Saving Units Failed!");
            }
        }
        catch (error) {
            console.error("Error msg: ", error);
            seterrormsg("Error Saving Units!");
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                {successmsg && <div className="alert alert-success">{successmsg}</div>}
                {errormsg && <div className="alert alert-danger">{errormsg}</div>}
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="UOM" />
                    <Row>
                        <Card className="search-top">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-8">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-6 col-lg-1 col-md-1 col-sm-1 text-left ms-1">
                                            <label htmlFor="userName" className="form-label mb-0">UOM Code</label>
                                        </div>
                                        <div className="col-12 col-lg-3 col-md-3 col-sm-3">
                                            <input id="name" type="text" className="form-control" value={unitsCode} onChange={(e) => setUnitsCode(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-4 text-end button-items d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-info" onClick={handleSearch}> <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>
                                    <button type="button" className="btn btn-danger" onClick={handleSearchCancel}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>

                                    <button type="button" className="btn btn-success" onClick={handleNew}>
                                        <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable value={filteredUnits} paginator showGridlines rows={10} loading={loading} dataKey="UOMCode" filters={filters} globalFilterFields={["UOMCode", "UOMDescription"]} header={header} emptyMessage="No unit's found." onFilter={(e) => setFilters(e.filters)} >
                                    <Column field="UOMCode" header="UOM Code" filter filterPlaceholder="Search by UOM Code" />
                                    <Column field="UOMDescription" header="UOM Description" filter filterPlaceholder="Search by UOM Description" />
                                    <Column field="IsActive" header="Active" showFilterMatchModes={false} body={actionBodyTemplate2} className="text-center" headerClassName="text-center" style={{ width: '8%' }} />
                                    <Column field="Action" header="Action" body={actionBodyTemplate} className="text-center" style={{ width: '8%' }} />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            {/* Confirmation Modal */}
            <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered tabIndex="-1">
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
                                <Button color="danger" size="lg" className="btn btn-danger" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            <Modal isOpen={isModalOpen2} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="1" toggle={toggleModal2}>
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal2} className="bg-model-hd">Unit Of Measurement</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <Formik enableReinitialize
                                            initialValues={{
                                                uomId: selectedRow?.UOMId || 0,
                                                uomCode: selectedRow?.UOMCode || "",
                                                uomDescription: selectedRow?.UOMDescription || "",
                                                userId: 1
                                            }}
                                            validationSchema={validationSchema} onSubmit={handleSubmit} >
                                            {({ errors, touched }) => (
                                                <Form>
                                                    <Row>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label className="required-label">UOM Code</Label>
                                                                <Field name="uomCode" className={`form-control ${errors.uomCode && touched.uomCode ? "is-invalid" : ""}`} />
                                                                <ErrorMessage name="uomCode" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label className="required-label">UOM Description</Label>
                                                                <Field name="uomDescription" as="textarea" className={`form-control ${errors.uomDescription && touched.uomDescription ? "is-invalid" : ""}`} />
                                                                <ErrorMessage name="uomDescription" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <div className="row align-items-center g-3 justify-content-end">
                                                        <div className="col-md-12 button-items">
                                                            <button type="button" className="btn btn-danger fa-pull-right" onClick={toggleModal2}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                                            <button type="submit" className="btn btn-info fa-pull-right"><i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>
                                                                {selectedRow?.UOMId && selectedRow.UOMId > 0 ? "Update" : "Save"}</button>
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
        </React.Fragment>
    );
};

export default ManageUnits;

