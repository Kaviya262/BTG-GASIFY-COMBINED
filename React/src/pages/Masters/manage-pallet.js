import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Label, FormGroup, Modal, ModalBody, ModalHeader, Table, Input } from "reactstrap";
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
import {
    GetPalletById,
    GetPalletList,
    GetPalletType,
    togglePalletStatus
} from "../../../src/common/data/mastersapi";
import { AutoComplete } from "primereact/autocomplete";
import { GetgasCodeData } from "common/data/invoiceapi";
import Swal from 'sweetalert2';

const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    PalletTypeName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    GasCodeName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    PalletNumber: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    GasCode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
});

const ManagePallet = () => {
    const history = useHistory();
    const [cylinderTableData, setCylinderTableData] = useState([]);
    const [gas, setPallet] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters()); // Initialize with the filters
    const [loading, setLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const[selectedGasCode,setselectedGasCode]=useState(null);
    const[FilterGasList,setFilterGasList]=useState([])
    const [pallettypelist, setPalletTypeList] = useState([]);
    const [selectedPalletType, setSelectedPalletType] = useState(null);

    useEffect(() => {
        setPallet(getPallet());
    }, []);

    const getPallet = () => {
        return [
            { Code: "00001", Palletname: "New Pallet", ContainerType: "G-PLTCYL40-16", GasCode: "AIR47L, BLNGAS, AMMONIA, CGARHE", Active: 1 },
            { Code: "00002", Palletname: "New Pallet 2", ContainerType: "G-PLTCYL40-16", GasCode: "BLNGAS, PAR 7.2M3, AR 99.999%", Active: 0 },
            { Code: "00003", Palletname: "New Pallet 3", ContainerType: "PLTCYL65-4", GasCode: "PAR 7.2M3, AMMONIA, CGARHE", Active: 1 },
            { Code: "00004", Palletname: "New Pallet 4", ContainerType: "G-PLTCYL50-4", GasCode: "CO2-GAS-25KG, AIR47L, BLNGAS, AMMONIA", Active: 0 },
        ];
    };
    useEffect(() => {
        const department = getPallet();
        setPallet(department);
        const initialSwitchStates = {};
        department.forEach(method => {
            initialSwitchStates[method.Code] = method.Active === 1;
        });
        setSwitchStates(initialSwitchStates);
    }, []);

    const clearFilter = () => {
        setFilters(initFilters()); // Reset the filters state
        setGlobalFilterValue(''); // Clear the global filter value
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setGlobalFilterValue(value);
        setFilters((prevFilters) => ({
            ...prevFilters,
            global: { value, matchMode: FilterMatchMode.CONTAINS }
        }));
    };

    const [pallets, setPallets] = useState([]);

    useEffect(() => {
        fetchPallets(0,0);
    }, []);

    const fetchPallets = async (gasCodeId = 0, palletTypeId = 0) => {
        try {
            const orgId = 1;
            const branchId = 1;
            // debugger
            const response = await GetPalletList({
                orgId: orgId,
                branchId: branchId,
                gasCodeId,
                palletTypeId
            });
            const data = response.data || [];
            setPallets(data);
            const switchStateMap = {};
            data.forEach(p => {
                switchStateMap[p.Code] = p.Active === 1;
            });
            setSwitchStates(switchStateMap);
        } catch (error) {
            console.error("Failed to load pallet data", error);
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

    const filterClearTemplate = (options) => {
        return <Button type="button" icon="pi pi-times" onClick={options.filterClearCallback} severity="secondary"></Button>;
    };

    const filterApplyTemplate = (options) => {
        return <Button type="button" icon="pi pi-check" onClick={options.filterApplyCallback} severity="success"></Button>;
    };

    const filterFooterTemplate = () => {
        return <div className="px-3 pt-0 pb-3 text-center">Filter by ContainerType</div>;
    };

    const linkAddcustomer = () => {
        history.push("/add-pallet");
    };

    const editRow = async (rowData) => {
        history.push(`/edit-pallet/${rowData?.PalletId}`);
    };

    const deleteRow = (rowData) => {
        console.log('Delete row:', rowData);
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <span onClick={() => editRow(rowData)} style={{ marginRight: '0.5rem' }} title="Edit">
                    <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i></span>

                {/* <span onClick={() => deleteRow(rowData)} title="Delete"> 
                <i className="mdi mdi-delete" style={{ fontSize: '1.5rem' }}></i> </span> */}
            </div>
        )
    };

    const onSwitchChange = async () => {
        if (!selectedRow) return;

        const newStatus = selectedRow.IsActive === 0 ? true : false;

        const payload = {
            palletId: selectedRow.PalletId,
            orgId: selectedRow.OrgId,
            branchId: selectedRow.BranchId,
            isActive: newStatus
        };

        try {
            const response = await togglePalletStatus(payload);

            if (response?.status) {
                setSwitchStates(prev => ({
                    ...prev,
                    [selectedRow.Code]: newStatus,
                }));
                setIsModalOpen2(false);

                const gasCodeId = selectedGasCode?.GasCodeId || 0;
                const palletTypeId = selectedPalletType || 0;
                fetchPallets(gasCodeId, palletTypeId);

                // Optional: Success alert
                Swal.fire("Updated", `Pallet is now ${newStatus ? 'Active' : 'Inactive'}`, "success");
            } else {
                Swal.fire("Error", response?.message || "Status update failed!", "error");
            }
        } catch (err) {
            Swal.fire("Error", err.message || "API call failed", "error");
        }
    };

    const openModal2 = (row, index) => {
        const value = row.IsActive === 1 ? "deactive" : "active";
        setTxtStatus(value);
        setSelectedRow(row);
        setSelectedRowIndex(index); 
        setIsModalOpen2(true);
    };

    const actionBodyTemplate2 = (rowData, { rowIndex }) => {
        return (
            <div className="square-switch">
                <Input
                    type="checkbox"
                    id={`square-switch-${rowIndex}`}
                    switch="bool"
                    onChange={() => openModal2(rowData, rowIndex)} // pass index
                    checked={rowData.IsActive === 1}
                />
                <label
                    htmlFor={`square-switch-${rowIndex}`}
                    data-on-label="Yes"
                    data-off-label="No"
                    style={{ margin: 0 }}
                />
            </div>
        );
    };

    const validationSchema = Yup.object().shape({
        gasCode: Yup.string().required("Gas Code is required"),
        containerType: Yup.string().required("Container Type is required"),
        palletname: Yup.string().required("Pallet Name is required")
    });

    const handleSubmit = (values) => {
        toggleModal()
    };

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

    const CylinderTable = () => {
        return (
            <>
                {Array.from({ length: 18 }, (_, i) => (
                    <tr key={i}>
                        <td>{i + 1}</td>
                        <td>Cylinder {i + 1}</td>
                        <td>Ownership {i + 1}</td>
                        <td>Barcode {i + 1000}</td>
                    </tr>
                ))}
            </>
        );
    };

    const handleContainerTypeChange = (option) => {
        if (option) {
            const rows = Array.from({ length: 18 }, (_, index) => ({
                id: index + 1,
                cylinderName: "",
                ownership: "",
                barCode: "",
            }));
            setCylinderTableData(rows);
        } else {
            setCylinderTableData([]);
        }
    };
    const handleSearch = () => {
        fetchPallets(selectedGasCode?.GasCodeId,selectedPalletType);
    };

    const handleCancel = () => {
        setselectedGasCode(null)
        setSelectedPalletType(null)
        fetchPallets(0,0);
    };

    const linkAddpallet = () => {
        history.push("/add-pallet");
    };

    const loadGasLoad =  async (ev) => {
        let FilteredText=ev.query;
        let _filteredGas=await GetgasCodeData(1,FilteredText);
        setFilterGasList(Array.isArray(_filteredGas) ? _filteredGas : []);
    };

    const loadPalletType = async () => {
        try {
            const branchId = 1;
            const res = await GetPalletType(branchId);
            if (res && Array.isArray(res.data)) {
                const formatted = res.data.map(dep => ({
                    value: dep.id,
                    label: dep.pallettype,
                    code: dep.pallettypecode
                }));
                setPalletTypeList(formatted);
            } else {
                console.error('Expected an array but got:', res.data);
            }
        } catch (error) {
            console.error('Error loading pallet types:', error);
        }
    };
    useEffect(() => {
        loadPalletType();
    }, []);

    const handlePalletChange = (selectedOption) => {
        setSelectedPalletType(selectedOption?.value || null);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Master" breadcrumbItem="Pallets" />
                    <Row>
                        <Card className="search-top">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-8">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-12 col-lg-2 col-md-2 col-sm-3 text-left ms-2">
                                            <label htmlFor="code" className="form-label mb-0">Gas Code</label>
                                        </div>
                                        <div className="col-12 col-lg-3 col-md-3 col-sm-3">
                                            {/* <input id="code" type="text" className="form-control" /> */}
                                            <AutoComplete field="GasCode" value={selectedGasCode}
                                                suggestions={FilterGasList} 
                                                completeMethod={loadGasLoad} 
                                                onChange={(e) =>{ setselectedGasCode(e.value);}}

                                                style={{ width: "100%" }}
                                                />
                                        </div>
                                        <div className="col-12 col-lg-2 col-md-2 col-sm-3 text-left ms-2">
                                            <label htmlFor="type" className="form-label mb-0">Pallet Type</label>
                                        </div>
                                        <div className="col-12 col-lg-3 col-md-3 col-sm-3">
                                            {/* <input id="type" type="text" className="form-control" /> */}
                                            <Select
                                                name="pallettype"
                                                id="pallettype"
                                                options={pallettypelist}
                                                placeholder="Select Pallet Type"
                                                value={pallettypelist.find(option => option.value === selectedPalletType) || null}
                                                classNamePrefix="select"
                                                isDisabled={isDisabled}
                                                isLoading={isLoading}
                                                isClearable={isClearable}
                                                isRtl={isRtl}
                                                isSearchable={isSearchable} 
                                                onChange={handlePalletChange}
                                            /> 
                                        </div>
                                        {/* <div className="col-12 col-lg-6 col-md-6 col-sm-6 text-left button-items">
                                            <button type="button" className="btn btn-info me-2" onClick={handleSearch}>
                                                <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={handleCancel}
                                            >
                                                <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                                                Cancel
                                            </button>
                                        </div> */}
                                    </div>
                                </div>
                                <div className="col-12 col-lg-4 text-end button-items">
                                    {/* <button type="button" className="btn btn-success" onClick={toggleModal}> */}
                                   
                                    <button type="button" className="btn btn-info me-2" onClick={handleSearch}>
                                        <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleCancel}
                                    >
                                        <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-success me-2" onClick={linkAddpallet}>
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
                                    value={pallets}
                                    paginator
                                    showGridlines
                                    rows={10}
                                    loading={loading}
                                    dataKey="PalletId"
                                    filters={filters}
                                    globalFilterFields={["PalletTypeName", "GasCodeName", "PalletNumber"]}
                                    header={header}
                                    emptyMessage="No Pallet found."
                                    onFilter={(e) => setFilters(e.filters)}
                                >
                                    <Column field="PalletNumber" filter filterPlaceholder="Search by Pallet Number" header="Pallet Number" />
                                    <Column field="GasCodeName" filter filterPlaceholder="Search by Gas Code" header="Gas Code" />
                                    <Column field="PalletTypeName" filter filterPlaceholder="Search by Pallet Type" header="Pallet Type" />
                                    <Column field="IsActive" header="Active" body={actionBodyTemplate2} />
                                    <Column header="Action" body={actionBodyTemplate} />
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

            <Modal isOpen={isModalOpen} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="-1" toggle={toggleModal} size="xl">
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal} className="bg-model-hd">New Pallet </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col lg="12">
                                <Card>
                                    <CardBody>
                                        <Formik
                                            initialValues={{ gasCode: "", containerType: "", dueDateCalculation: "", palletname: "" }}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit}
                                        >
                                            {({ errors, touched, setFieldValue, setFieldTouched, values }) => (
                                                <Form>
                                                    <Row>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label htmlFor="palletname" className="required-label">Pallet Name</Label>
                                                                <Field name="palletname" className={`form-control ${errors.palletname && touched.palletname ? "is-invalid" : ""}`} />
                                                                <ErrorMessage name="palletname" component="div" className="text-danger" />
                                                            </FormGroup>
                                                        </Col>

                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label htmlFor="containerType" className="required-label">Container Type</Label>
                                                                <Select
                                                                    name="containerType"
                                                                    options={ContainerList}
                                                                    //value={ContainerList.find(option => option.value === values.containerType)}
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
                                                                <Label htmlFor="gasCode" className="required-label"> Gas Code </Label>
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
                                                                                    <Field name="category" as="select" className="form-control">
                                                                                        <option>Paid</option>
                                                                                        <option>Chargeback</option>
                                                                                        <option>Refund</option>
                                                                                    </Field>


                                                                                </td>
                                                                                <td><input type="text" className="form-control" value={row.ownership} /></td>
                                                                                <td><input type="text" className="form-control" value={row.barCode} /></td>
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
                                                                <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>Save
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
        </React.Fragment>
    );
};

export default ManagePallet;
