import React, { useState, useEffect } from "react";
import {
    Card, CardBody, Col, Container, Row, Label, FormGroup, Modal,
    ModalBody, ModalHeader, Table, Input
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import Select from "react-select";
import "primereact/resources/themes/lara-light-blue/theme.css";
import { useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Tag } from "primereact/tag";

const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    Palletname: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    ContainerType: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    GasCode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
});

const ManagePurchaseOrder = () => {
    const history = useHistory();

    // State
    const [gas, setGas] = useState([]); // Purchase orders
    const [pallet, setPallet] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters());
    const [switchStates, setSwitchStates] = useState({});
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [cylinderTableData, setCylinderTableData] = useState([]);

    // Select props for react-select
    const [isClearable] = useState(true);
    const [isSearchable] = useState(true);
    const [isDisabled] = useState(false);
    const [isLoading] = useState(false);
    const [isRtl] = useState(false);

    // Static data for Gas Codes and Container Types
    const [GasCodeList] = useState([
        { label: "AIR47L", value: "1", code: "1", description: "AIR 47L" },
        { label: "AMMONIA", value: "2", code: "2", description: "AMMONIA GAS" },
        { label: "AR 99.999%", value: "3", code: "3", description: "Pure Ar Grade 99.999%" },
        { label: "BLNGAS", value: "4", code: "4", description: "Balloon Gas General" },
        { label: "CGARHE", value: "5", code: "5", description: "Comp Gas Argon 25% Helium SG " },
    ]);

    const [ContainerList] = useState([
        { label: "G-PLTCYL40-16", value: "1", description: "G PLTCYL40 16" },
        { label: "G-PLTCYL47-12", value: "2", description: "G PLTCYL4 12" },
        { label: "G-PLTCYL47-15", value: "3", description: "G PLTCYL47 15" },
        { label: "G-PLTCYL47-16", value: "4", description: "G PLTCYL47 16" },
        { label: "G-PLTCYL47-17", value: "5", description: "G PLTCYL47 17" },
    ]);

    // On component mount - load purchase orders and pallets
    useEffect(() => {
        const purchaseOrders = [
            { poNo: "PO1", poDate: "3-May-25", requestor: "Anwar", department: "Prod", supplier: "Supplier 1", totalAmount: 77057, status: "Posted" },
            { poNo: "PO2", poDate: "5-May-25", requestor: "Saravanan", department: "Prod", supplier: "Supplier 2", totalAmount: 1000, status: "Posted" },
            { poNo: "PO3", poDate: "17-May-25", requestor: "Vignesh", department: "Prod", supplier: "Supplier 1", totalAmount: 4000, status: "Saved" },
            { poNo: "PO4", poDate: "27-May-25", requestor: "Akash", department: "Eng", supplier: "Supplier 3", totalAmount: 7000, status: "Saved" },
            { poNo: "PO5", poDate: "1-Jun-25", requestor: "Raman", department: "IT", supplier: "Supplier 4", totalAmount: 15000, status: "Saved" },
        ];
        setGas(purchaseOrders);

        const palletsData = getPallet();
        setPallet(palletsData);

        const initialSwitchStates = {};
        palletsData.forEach(item => {
            initialSwitchStates[item.Code] = item.Active === 1;
        });
        setSwitchStates(initialSwitchStates);
    }, []);

    // Pallet static data function
    const getPallet = () => {
        return [
            { Code: "00001", Palletname: "New Pallet", ContainerType: "G-PLTCYL40-16", GasCode: "AIR47L, BLNGAS, AMMONIA, CGARHE", Active: 1 },
            { Code: "00002", Palletname: "New Pallet 2", ContainerType: "G-PLTCYL40-16", GasCode: "BLNGAS, PAR 7.2M3, AR 99.999%", Active: 0 },
            { Code: "00003", Palletname: "New Pallet 3", ContainerType: "PLTCYL65-4", GasCode: "PAR 7.2M3, AMMONIA, CGARHE", Active: 1 },
            { Code: "00004", Palletname: "New Pallet 4", ContainerType: "G-PLTCYL50-4", GasCode: "CO2-GAS-25KG, AIR47L, BLNGAS, AMMONIA", Active: 0 },
        ];
    };

    // Clear filters
    const clearFilter = () => {
        setFilters(initFilters());
        setGlobalFilterValue('');
    };

    // Global filter change handler
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            global: { ...prev.global, value },
        }));
        setGlobalFilterValue(value);
    };

    // Render header above table (search input + clear + tag legend)
    const renderHeader = () => (
        <div className="row align-items-center g-3 clear-spa">
            <div className="col-12 col-lg-6">
                <Button className="btn btn-danger btn-label" onClick={clearFilter}>
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

    const header = renderHeader();

    // Navigate to Add Purchase Order page
    const linkAddPurchaseOrder = () => {
        history.push("/add-purchaseorder");
    };
    // Handle toggle switch change confirmation
    const onSwitchChange = () => {
        if (!selectedRow) return;

        const newStatus = !switchStates[selectedRow.Code];
        setSwitchStates(prevStates => ({
            ...prevStates,
            [selectedRow.Code]: newStatus,
        }));

        // Update pallet Active status locally
        setPallet(prevPallet =>
            prevPallet.map(p =>
                p.Code === selectedRow.Code ? { ...p, Active: newStatus ? 1 : 0 } : p
            )
        );

        console.log(`Pallet ${selectedRow.Code} Active Status:`, newStatus ? 1 : 0);
        setIsModalOpen2(false);
    };

    // Open confirmation modal for toggling Active status
    const openModal2 = (rowData) => {
        const value = rowData.Active === 1 ? "deactivate" : "activate";
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen2(true);
    };

    // Switch toggle in the table row
    const actionBodyTemplate2 = (rowData) => (
        <input
            type="checkbox"
            className="form-check-input"
            checked={switchStates[rowData.Code] || false}
            onChange={() => openModal2(rowData)}
        />
    );

    // Modal toggle for new pallet
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // Validation Schema for formik
    const validationSchema = Yup.object({
        palletname: Yup.string().required("Pallet Name is required"),
        containerType: Yup.string().required("Container Type is required"),
        gasCode: Yup.string().required("Gas Code is required"),
    });

    // Submit handler for new pallet form
    const handleSubmit = (values, { resetForm }) => {
        console.log("Submitted pallet:", values);
        // Optionally add pallet to state or call API here
        resetForm();
        toggleModal();
    };

    // Handle container type change (if any side effect needed)
    const handleContainerTypeChange = (option) => {
        // Your logic here if needed
    };

    return (
        <>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Master" breadcrumbItem="Purchase Order" />

                    <Row>
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
                                                <option value="2">Requestor</option>
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
                                        >
                                            <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i>{" "}
                                            Search
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
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
                                        <button type="button" className="btn btn-success" onClick={linkAddPurchaseOrder}>
                                            <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i> New
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Row>

                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable
                                    value={gas}
                                    paginator
                                    rows={10}
                                    showGridlines
                                    header={header}
                                    dataKey="poNo"
                                    filters={filters}
                                    globalFilterFields={["poNo", "poDate", "requestor", "department", "supplier", "totalAmount"]}
                                    filterDisplay="menu"
                                >
                                    <Column field="poNo" header="PO No" />
                                    <Column field="poDate" header="PO Date" />
                                    <Column field="requestor" header="Requestor" />
                                    <Column field="department" header="Department" />
                                    <Column field="supplier" header="Supplier" />
                                    <Column field="totalAmount" header="Total Amount" />
                                    <Column field="status" header="Status" />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Confirmation Modal */}
            <Modal isOpen={isModalOpen2} toggle={() => setIsModalOpen2(false)} centered tabIndex="1">
                <ModalBody className="py-3 px-5">
                    <Row>
                        <Col lg={12}>
                            <div className="text-center">
                                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />
                                <h2>Are you sure?</h2>
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

            {/* New Pallet Modal */}
            <Modal isOpen={isModalOpen} role="dialog" autoFocus centered className="exampleModal" tabIndex="-1" toggle={toggleModal} size="xl">
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal} className="bg-model-hd">New Pallet</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <Formik
                                            initialValues={{ gasCode: "", containerType: "", palletname: "" }}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit}
                                        >
                                            {({ errors, touched, setFieldValue, setFieldTouched, values }) => (
                                                <Form>
                                                    <Row>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label htmlFor="palletname" className="required-label">Pallet Name</Label>
                                                                <Field
                                                                    name="palletname"
                                                                    className={`form-control ${errors.palletname && touched.palletname ? "is-invalid" : ""}`}
                                                                />
                                                                <ErrorMessage name="palletname" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label htmlFor="containerType" className="required-label">Container Type</Label>
                                                                <Select
                                                                    name="containerType"
                                                                    options={ContainerList}
                                                                    value={ContainerList.find(option => option.value === values.containerType)}
                                                                    onChange={option => {
                                                                        setFieldValue("containerType", option ? option.value : "");
                                                                        setFieldTouched("containerType", true);
                                                                        handleContainerTypeChange(option);
                                                                    }}
                                                                    onBlur={() => setFieldTouched("containerType", true)}
                                                                    className={errors.containerType && touched.containerType ? "select-invalid" : ""}
                                                                    classNamePrefix="select"
                                                                    isDisabled={isDisabled}
                                                                    isLoading={isLoading}
                                                                    isClearable={isClearable}
                                                                    isRtl={isRtl}
                                                                    isSearchable={isSearchable}
                                                                />
                                                                <ErrorMessage name="containerType" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label htmlFor="gasCode" className="required-label">Gas Code</Label>
                                                                <Select
                                                                    name="gasCode"
                                                                    options={GasCodeList}
                                                                    value={GasCodeList.find(option => option.value === values.gasCode)}
                                                                    onChange={option => {
                                                                        setFieldValue("gasCode", option ? option.value : "");
                                                                        setFieldTouched("gasCode", true);
                                                                    }}
                                                                    onBlur={() => setFieldTouched("gasCode", true)}
                                                                    className={errors.gasCode && touched.gasCode ? "select-invalid" : ""}
                                                                    classNamePrefix="select"
                                                                    isDisabled={isDisabled}
                                                                    isLoading={isLoading}
                                                                    isClearable={isClearable}
                                                                    isRtl={isRtl}
                                                                    isSearchable={isSearchable}
                                                                />
                                                                <ErrorMessage name="gasCode" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="12">
                                                            <Table className="table-nowrap mb-0">
                                                                <thead style={{ backgroundColor: "#3e90e2" }}>
                                                                    <tr>
                                                                        <th>S.No</th>
                                                                        <th>Cylinder Name</th>
                                                                        <th>Ownership</th>
                                                                        <th>Bar code</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {cylinderTableData.length > 0 ? (
                                                                        cylinderTableData.map((row, index) => (
                                                                            <tr key={index}>
                                                                                <td>{row.id}</td>
                                                                                <td>
                                                                                    <Field name={`cylinders[${index}].category`} as="select" className="form-control">
                                                                                        <option>Paid</option>
                                                                                        <option>Chargeback</option>
                                                                                        <option>Refund</option>
                                                                                    </Field>
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        value={row.ownership}
                                                                                        readOnly
                                                                                    />
                                                                                </td>
                                                                                <td>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="form-control"
                                                                                        value={row.barCode}
                                                                                        readOnly
                                                                                    />
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="4" className="text-center">No data available</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </Table>
                                                        </Col>
                                                    </Row>

                                                    <div className="row align-items-center g-3 justify-content-end">
                                                        <div className="col-md-12 text-end button-items">
                                                            <Button type="submit" className="btn btn-info">
                                                                <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i> Save
                                                            </Button>
                                                            <Button type="button" className="btn btn-danger" onClick={toggleModal}>
                                                                <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i> Cancel
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
        </>
    );
};

export default ManagePurchaseOrder;
