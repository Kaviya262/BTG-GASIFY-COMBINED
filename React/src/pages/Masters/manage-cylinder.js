import React, { useState, useEffect } from "react";
import {
    Card, Col, Container, Row, Modal, ModalBody,
    FormGroup, Input, InputGroup, Button as StrapButton
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import Flatpickr from "react-flatpickr";
import { useHistory } from "react-router-dom";
import "primereact/resources/themes/lara-light-blue/theme.css";
import {
    GetFilteredCylinders, GetCylinderById, UpdateCylinderStatus
} from "../../../src/common/data/mastersapi";
import { UncontrolledAlert } from "reactstrap";
// Dummy API Function
const GetAllCylinder = async () => {
    return {
        status: true,
        data: [
            { Code: "00001", cylindername: "CYL6010 A", ContainerType: "G-PLTCYL40-16", GasCode: "AIR47L", Status: "Empty-In", Active: 1, NextTestDate: '19-Jan-2025' },
            { Code: "00002", cylindername: "CYL5540 A2", ContainerType: "G-PLTCYL40-16", GasCode: "BLNGAS", Status: "Refilling", Active: 1, NextTestDate: '29-Jul-2025' },
            { Code: "00003", cylindername: "CYL8370 A3", ContainerType: "PLTCYL65-4", GasCode: "PAR 7.2M3", Status: "Maint-In", Active: 1, NextTestDate: '11-Oct-2026' },
            { Code: "00004", cylindername: "CYL4070 A4", ContainerType: "G-PLTCYL50-4", GasCode: "CO2-GAS-25KG", Status: "Maint-Out", Active: 1, NextTestDate: '10-Sep-2029' },
        ]
    };
};


// Initialize filters
const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    GasCodeId: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    cylindername: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    cylindertypeid: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    GasCode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    location: {operator:FilterOperator.AND, constraints:[{value:null, matchMode:FilterMatchMode.STARTS_WITH}]},
    Status: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    nexttestdateStr: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] }
});

const ManageCylinder = () => {
    const history = useHistory();

    const [gas, setGas] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters());
    const [loading, setLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [remark, setRemark] = useState("");
    const [fromDate, setFromDate] = useState([]);
    const [toDate, setToDate] = useState([]);
    const [name, setName] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrormsg] = useState("");
    useEffect(() => {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        setFromDate([oneWeekAgo]);
        setToDate([today]);
    }, []);


    useEffect(() => {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        setFromDate([oneWeekAgo]);
        setToDate([today]);

        fetchFilteredData();
    }, []);

    const fetchFilteredData = async () => {
    const result = await GetFilteredCylinders({ fromDate: "", toDate: "", name: "" });
    if (result.status) {
        setGas(result.data.map(item => ({
            ...item,
            nexttestdateStr: item.nexttestdate
                ? (() => {
                    const d = new Date(item.nexttestdate);
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    return `${yyyy}-${mm}-${dd}`;
                })()
                : null
        })));
    } else {
        setGas([]);
    }
 };


    const clearFilter = () => {
        setFilters(initFilters());
        setName("");
        setGlobalFilterValue('');
        fetchFilteredData("", "", "");
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setGlobalFilterValue(value);

        setFilters((prev) => ({
            ...prev,
            global: { value, matchMode: FilterMatchMode.CONTAINS },
        }));
    };


    const renderHeader = () => (
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

    const header = renderHeader();

    const linkAddCylinder = () => {
        history.push("/add-cylinder");
    };

    const editRow = (rowData) => {
        console.log('Edit row:', rowData);
    };

    const openModal = (rowData) => {
        const value = rowData.IsActive === 1 ? "deactivate" : "activate";
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen(true);
    };
    const GasCodeList = [
        { label: "AIR47L", value: "1", code: "1", description: "AIR 47L" },
        { label: "AMMONIA", value: "2", code: "2", description: "AMMONIA GAS" },
        { label: "AR 99.999%", value: "3", code: "3", description: "Pure Ar Grade 99.999%" },
        { label: "BLNGAS", value: "4", code: "4", description: "Balloon Gas General" },
        { label: "CGARHE", value: "5", code: "5", description: "Comp Gas Argon 25% Helium SG" }
    ];
    const cylinderTypeList = [
        { label: "Part of Pallet", value: "1" },
        { label: "Stand alone", value: "2" },
    ];
    const handleCancel = () => {
        debugger
        setFilters(initFilters());
        setName("");
        fetchFilteredData("", "", "");
    };


    const handleStatusUpdate = async () => {
        debugger
        if (!selectedRow) return;
        debugger
        const updatedStatus = selectedRow.IsActive === 1 ? 0 : 1;
        const payload = {
            cylinderid: selectedRow.cylinderid,
            isActive: updatedStatus
        };

        try {
            debugger
            const res = await UpdateCylinderStatus(payload);
            if (res?.statusCode === 0) {
                setIsModalOpen(false);
                setSuccessMsg(res.message);
                const updatedGas = gas.map(item =>
                    item.Code === selectedRow.Code ? { ...item, Active: updatedStatus } : item
                );
                setGas(updatedGas);
                setSwitchStates(prev => ({ ...prev, [selectedRow.Code]: updatedStatus === 1 }));
                setTimeout(() => {
                    window.location.reload();
                }, 500)

            } else {
                console.error(res.message);
                setErrormsg("An unexpected error occurred. Please try again.");
            }
        } catch (err) {
            console.error("An error occurred while updating status:", err);
            setErrormsg("An unexpected error occurred. Please try again.");
        }
    };

    const actionBodyTemplate = rowData => {
        debugger
        console.log(selectedRow, "rowData :", rowData);
        if (rowData.IsActive == 1) {
            return (
                <div className="actions">
                    <span onClick={() => {
                        linkEditCylinder(rowData);
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


    const linkEditCylinder = async rowData => {
        debugger
        const cylinderID = rowData.cylinderid;
        try {
            debugger
            const userDetails = await GetCylinderById(cylinderID);
            history.push({ pathname: "/add-cylinder", state: { userData: userDetails } });
        } catch (err) {
            console.error("Failed to fetch cylinder details:", err);
        }
    };
    debugger
    const actionBodyTemplate2 = (rowData) => (
        <div className="square-switch">
            <Input
                type="checkbox"
                id={`square-switch-${rowData.cylinderid}`}
                switch="bool"
                onChange={() => openModal(rowData)}
                checked={switchStates[rowData.cylinderid] ?? rowData.IsActive === 1}
            />
            <label
                htmlFor={`square-switch-${rowData.cylinderid}`}
                data-on-label="Yes"
                data-off-label="No"
                style={{ margin: 0 }}
            />
        </div>
    );


    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Master" breadcrumbItem="Cylinder" />
                    <Row>  {errorMsg && (
                        <UncontrolledAlert color="danger">
                            {errorMsg}
                        </UncontrolledAlert>
                    )}
                        {successMsg && (
                            <UncontrolledAlert color="success">

                                {successMsg}
                            </UncontrolledAlert>
                        )}
                        <Card className="search-top">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-3 text-left ms-2">
                                            <label htmlFor="name" className="form-label mb-0">Code</label>
                                        </div>
                                        <div className="col-8">
                                            <input
                                                id="name"
                                                type="text"
                                                className="form-control"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />

                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-4 text-center">
                                            <label className="form-label mb-0">From</label>
                                        </div>
                                        <div className="col-8">
                                            <FormGroup>
                                                <InputGroup>
                                                    <Flatpickr
                                                        className="form-control d-block"
                                                        placeholder="dd-mm-yyyy"
                                                        options={{
                                                            altInput: true,
                                                            altFormat: "d-M-Y",
                                                            dateFormat: "Y-m-d",
                                                        }}
                                                        value={fromDate}
                                                        onChange={date => setFromDate(date)}
                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-4 text-center">
                                            <label className="form-label mb-0">To</label>
                                        </div>
                                        <div className="col-8">
                                            <FormGroup>
                                                <InputGroup>
                                                    <Flatpickr
                                                        className="form-control d-block"
                                                        placeholder="dd-mm-yyyy"
                                                        options={{
                                                            altInput: true,
                                                            altFormat: "d-M-Y",
                                                            dateFormat: "Y-m-d",
                                                        }}
                                                        value={toDate}
                                                        onChange={date => setToDate(date)}
                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-4 text-end button-items">
                                    <StrapButton
                                        className="btn btn-info"
                                        onClick={async () => {
                                            const from = fromDate.length ? fromDate[0].toISOString().split('T')[0] : "";
                                            const to = toDate.length ? toDate[0].toISOString().split('T')[0] : "";
                                            const result = await GetFilteredCylinders({ fromDate: "", toDate: "", name });
                                            if (result.status) {
                                                setGas(result.data);
                                            } else {
                                                setGas([]);
                                            }
                                        }}
                                    >
                                        <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search
                                    </StrapButton>

                                    <StrapButton className="btn btn-danger" onClick={handleCancel}>
                                        <i className="bx bx-window-close label-icon font-size-14 align-middle me-2" ></i>Cancel
                                    </StrapButton>
                                    <StrapButton className="btn btn-success" onClick={linkAddCylinder}>
                                        <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i> New
                                    </StrapButton>
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
                                    showGridlines
                                    rows={10}
                                    loading={loading}
                                    dataKey="Code"
                                    filters={filters}
                                    globalFilterFields={["Code", "cylindername", "ContainerType", "GasCode", "nexttestdate", "Status", "location"]}
                                    header={header}
                                    emptyMessage="No Cylinder found."
                                    onFilter={(e) => setFilters(e.filters)}
                                >
                                    <Column field="cylindername" header="Cylinder Code" filter filterPlaceholder="Search by cylindername" />
                                    <Column
                                        field="cylindertypeid"
                                        header="Container Type"
                                        filter
                                        filterFunction={(value, filter) => {
                                            debugger
                                            const label = cylinderTypeList.find(ct => ct.value === String(value))?.label || "";
                                            console.log('value:', value, 'filter:', filter, 'label:', label);
                                            return label.toLowerCase().includes(filter.toLowerCase());
                                        }}
                                        filterPlaceholder="Search by container type"
                                        body={(rowData) => {
                                            const match = cylinderTypeList.find(g => g.value === String(rowData.cylindertypeid));
                                            return match ? match.label : '';
                                        }}
                                    />


                                    <Column
                                        field="GasCode"
                                        header="Gas Code"
                                        filter
                                        filterPlaceholder="Search by gas code"
                                    />
                                    <Column field="location" header="Location" filter filterPlaceholder="Search by location"
                                        style={{ width: '11%' }} />

                                    <Column field="Status" header="Status" filter filterPlaceholder="Search by status"
                                        style={{ width: '11%' }} />
                                    <Column
                                        field="nexttestdateStr"
                                        header="Next Test Date"
                                        filter
                                        filterPlaceholder="Search by next test date"                                        
                                        style={{ width: '15%' }}
                                       
                                    />
                                    <Column
                                        field="IsActive"
                                        header="Active"
                                        showFilterMatchModes={false}
                                        body={actionBodyTemplate2}
                                        className="text-center"
                                        headerClassName="text-center"
                                        style={{ width: '8%' }}
                                    />
                                    <Column field="Systemseqno" header="Action" showFilterMatchModes={false} body={actionBodyTemplate} style={{ width: '8%' }} className="text-center" />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
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
                                <StrapButton color="success" size="lg" onClick={handleStatusUpdate}>
                                    Yes
                                </StrapButton>
                                <StrapButton color="danger" size="lg" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </StrapButton>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default ManageCylinder;
