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

const ManageCompany = () => {
    const history = useHistory();

    const [suppliers, setCustomers] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters()); // Initialize with the filters

    const [loading, setLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    useEffect(() => {
        const customerData = getCustomers();
        setCustomers(customerData);

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

    useEffect(() => {
        setCustomers(getCustomers());
    }, []);

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
        return <div className="px-3 pt-0 pb-3 text-center">Filter by Country</div>;
    };

    const linkAddsupplier = () => {
        history.push("/add-supplier");
    };

    const editRow = (rowData) => {
        console.log('Edit row:', rowData);
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <span onClick={() => editRow(rowData)} title="Edit">
                    <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
                </span>
            </div>
        )
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
                <Container fluid style={{ position: "relative", height: "100vh", padding: 0 }}>
                    <img
                        src="backgroundImage"
                        alt="Full Screen Background"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            zIndex: 0
                        }}
                    />
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <Breadcrumbs title="Master" breadcrumbItem="Suppliers" />
                       
                    </div>
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

export default ManageCompany;
