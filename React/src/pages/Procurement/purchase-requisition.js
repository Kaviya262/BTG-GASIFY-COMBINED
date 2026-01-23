import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, Label, FormGroup, Input, InputGroup } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { classNames } from 'primereact/utils';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Slider } from 'primereact/slider';
import { Tag } from 'primereact/tag';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import "primereact/resources/themes/lara-light-blue/theme.css";
import { useHistory } from "react-router-dom";
import Flatpickr from "react-flatpickr"

// Move the initFilters function definition above
const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    Name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Country: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Contactperson: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});

const ManagePurchaseRequistion = () => {
    const history = useHistory();
    // Suppliers with added 'Active' property (for switch toggle)
    const initialSuppliers = [
        {
            "PR No": "PR1",
            "PR Date": "1-May-25",
            Requestor: "Anwar",
            Department: "Prod",
            Supplier: "Supplier 1",
            "Total Amount": 77057,
            Status: "Posted",
            SQ_Nbr: "Action1",
            Active: true,
        },
        {
            "PR No": "PR2",
            "PR Date": "3-May-25",
            Requestor: "Saravanan",
            Department: "Prod",
            Supplier: "Supplier 2",
            "Total Amount": 1000,
            Status: "Posted",
            SQ_Nbr: "Action2",
            Active: true,
        },
        {
            "PR No": "PR3",
            "PR Date": "15-May-25",
            Requestor: "Vignesh",
            Department: "Prod",
            Supplier: "Supplier 1",
            "Total Amount": 4000,
            Status: "Saved",
            SQ_Nbr: "Action3",
            Active: false,
        },
        {
            "PR No": "PR4",
            "PR Date": "25-May-25",
            Requestor: "Akash",
            Department: "Eng",
            Supplier: "Supplier 3",
            "Total Amount": 7000,
            Status: "Saved",
            SQ_Nbr: "Action4",
            Active: false,
        },
        {
            "PR No": "PR5",
            "PR Date": "30-May-25",
            Requestor: "Raman",
            Department: "IT",
            Supplier: "Supplier 4",
            "Total Amount": 15000,
            Status: "Saved",
            SQ_Nbr: "Action5",
            Active: false,
        },
    ];

    const [suppliers, setSuppliers] = useState(initialSuppliers);

    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters()); // Initialize with the filters

    const [loading, setLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);



    useEffect(() => {
        const customerData = getCustomers();
        const initialSwitchStates = {};
        customerData.forEach(customer => {
            initialSwitchStates[customer.Code] = customer.Active === 1;
        });
        setSwitchStates(initialSwitchStates);
    }, []);

    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const toggleModal2 = () => {
        setIsModalOpen2(!isModalOpen2);
    };

    const getCustomers = () => {
        return [
            { Code: "SUP000491", Name: "PT HALO HALO BANDUNG", Country: "Indonesia", Contactperson: "Muthu" },
            { Code: "SUP000500", Name: "RAVIKUMAR", Country: "China", Contactperson: "Kevin" },
            { Code: "SUP000492", Name: "SASIKALA", Country: "Indonesia", Contactperson: "Mark" },
            { Code: "SUP000498", Name: "Jane", Country: "Indonesia", Contactperson: "Sophia" },
        ];
    };

    const clearFilter = () => {
        setFilters(initFilters()); // Reset the filters state
        setGlobalFilterValue(''); // Clear the global filter value
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters((prevFilters) => ({
            ...prevFilters,
            global: { ...prevFilters.global, value },
        }));
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="row align-items-center g-3 clear-spa">
                <div className="col-12 col-lg-6">
                    <Button className="btn btn-danger btn-label" >
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
    };

    const header = renderHeader();

    const filterClearTemplate = (options) => {
        return <Button type="button" icon="pi pi-times" onClick={options.filterClearCallback} severity="secondary"></Button>;
    };

    const filterApplyTemplate = (options) => {
        return <Button type="button" icon="pi pi-check" onClick={options.filterApplyCallback} severity="success"></Button>;
    };

    const filterFooterTemplate = () => {
        return <div className="px-3 pt-0 pb-3 text-center">Filter by Country</div>;
    };

    const linkAddPurchaseRequisition = () => {
        history.push("/add-purchaserequisition");
    };
    const editRow = (rowData) => {
        console.log("Edit row:", rowData);
        history.push("/add-purchaserequisition/" + rowData.prId);
    };


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="d-flex align-items-center justify-content-center gap-3">
                <span onClick={() => editRow(rowData)} title="Edit">
                    <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
                </span>

                <span title="Copy">
                    <i className="mdi mdi-content-copy" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}></i>
                </span>
            </div>
        );
    };


    const onSwitchChange = () => {
        if (!selectedRow) return;

        const newStatus = !switchStates[selectedRow.Code];
        setSwitchStates(prevStates => ({
            ...prevStates,
            [selectedRow.Code]: newStatus,
        }));

        setCustomers(prevCustomers =>
            prevCustomers.map(customer =>
                customer.Code === selectedRow.Code ? { ...customer, Active: newStatus ? 1 : 0 } : customer
            )
        );
        console.log(`Customer ${selectedRow.Code} Active Status:`, newStatus ? 1 : 0);
        setIsModalOpen(false);
    };

    const openModal = (rowData) => {
        const value = rowData.Active == 1 ? "deactive" : "active";
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen(true);
    };
    const actionBodyTemplate2 = (rowData) => {
        return (
            <div className="square-switch">
                <Input
                    type="checkbox"
                    id={`square-switch-${rowData.Code}`}
                    switch="bool"
                    onChange={() => openModal(rowData)}
                    checked={switchStates[rowData.Code] || false}
                />
                <label htmlFor={`square-switch-${rowData.Code}`} data-on-label="Yes" data-off-label="No" style={{ margin: 0 }} />
            </div>
        );
    };


    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Procurement" breadcrumbItem="Purchase Requisition" />
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
                                        <button type="button" className="btn btn-success" onClick={linkAddPurchaseRequisition}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable
                                    value={suppliers}
                                    paginator
                                    rows={10}
                                    loading={loading}
                                    dataKey="PR No"
                                    emptyMessage="No suppliers found."
                                    header={header}

                                >
                                    <Column
                                        field="PR No"
                                        header="PR No"
                                        className="text-center"
                                        style={{ width: "10%" }}


                                    />
                                    <Column
                                        field="PR Date"
                                        header="PR Date"

                                    />
                                    <Column
                                        field="Requestor"
                                        header="Requestor"

                                    />
                                    <Column
                                        field="Department"
                                        header="Department"

                                    />
                                    <Column
                                        field="Supplier"
                                        header="Supplier"

                                    />
                                    <Column
                                        field="Total Amount"
                                        header="Total Amount"
                                        className="text-end"
                                        style={{ width: "15%" }}
                                    />
                                    <Column
                                        field="Status"
                                        header="Status"
                                        className="text-center"

                                    />
                                    <Column
                                        header="Active"
                                        body={actionBodyTemplate2}
                                        className="text-center"
                                        style={{ width: "10%" }}
                                    />
                                    <Column
                                        header="Action"
                                        body={actionBodyTemplate}
                                        className="text-center"
                                        style={{ width: "8%" }}
                                    />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            {/* Confirmation Modal */}
            <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
                <ModalBody className="py-3 px-5">
                    <Row>
                        <Col lg={12}>
                            <div className="text-center">
                                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />
                                <h2>Are you sure?</h2>
                                <h4>Do you want to {txtStatus} this account?</h4>
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
        </React.Fragment>
    );
};

export default ManagePurchaseRequistion;
