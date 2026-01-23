import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, Label,FormGroup, Input, InputGroup } from "reactstrap"; 
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

const ManageItemsIssue = () => {
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
        const value = rowData.Active==1 ? "deactive": "active";
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
                <label htmlFor={`square-switch-${rowData.Code}`} data-on-label="Yes" data-off-label="No"  style={{margin:0}} />
            </div> 
        );
    };


    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Master" breadcrumbItem="ItemIssued" /> 
                    <Row>  
                        <Card className="search-top"> 
                            <div className="row align-items-center g-1 quotation-mid"> 
                                <div className="col-12 col-lg-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center"> 
                                            <label htmlFor="name" className="form-label mb-0">Name</label>
                                        </div>
                                        <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                                            <input id="name" type="text" className="form-control" /> 
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-12 col-lg-3 col-md-4 col-sm-4 text-center">
                                            <label htmlFor="fromDate" className="form-label mb-0">From</label>
                                        </div>
                                        <div className="col-12 col-lg-9 col-md-8 col-sm-8">
                                            <FormGroup>
                                                <Label></Label>
                                                <InputGroup>
                                                    <Flatpickr className="form-control d-block" placeholder="dd-mm-yyyy" options={{ altInput: true, altFormat: "d-M-Y", dateFormat: "Y-m-d" }} />
                                                </InputGroup>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </div> 
                                <div className="col-12 col-lg-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-12 col-lg-3 col-md-4 col-sm-4 text-center">
                                            <label htmlFor="toDate" className="form-label mb-0">To</label>
                                        </div>
                                        <div className="col-12 col-lg-9 col-md-8 col-sm-8">
                                        <FormGroup>
                                            <Label></Label>
                                            <InputGroup>
                                                <Flatpickr className="form-control d-block" placeholder="dd-mm-yyyy" options={{
                                                    altInput: true,
                                                    altFormat: "d-M-Y",
                                                    dateFormat: "Y-m-d"
                                                }} />
                                            </InputGroup>
                                        </FormGroup>
                                        </div>
                                    </div>
                                </div> 
                                <div className="col-12 col-lg-4 text-end button-items">
                                    <button type="button" className="btn btn-info"> <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>                
                                    <button type="button" className="btn btn-danger"><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>                
                                    <button type="button" className="btn btn-success" onClick={linkAddsupplier}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
                                </div>
                            </div>
                        </Card>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable value={suppliers} paginator showGridlines rows={10} loading={loading} dataKey="Code" filters={filters} globalFilterFields={["Code", "Name", "Country", "Contactperson"]} header={header} emptyMessage="No suppliers found." onFilter={(e) => setFilters(e.filters)}>
                                    <Column field="Code" header="Code" filter filterPlaceholder="Search by code" filterClear={filterClearTemplate} filterApply={filterApplyTemplate} filterFooter={filterFooterTemplate} style={{ width: '10%' }} className="text-center"/>
                                    <Column field="Name" header="Name" filter filterPlaceholder="Search by name" />
                                    <Column field="Country" header="Country" filter filterPlaceholder="Search by country"/>
                                    <Column field="Contactperson" filter header="Contact Person"/>
                                    <Column field="Actionstatus" header="Active" showFilterMatchModes={false} body={actionBodyTemplate2} className="text-center" headerClassName="text-center" style={{ width: '8%' }}/>
                                    <Column field="actions" header="Action" showFilterMatchModes={false} body={actionBodyTemplate} className="text-center" headerClassName="text-center" style={{ width: '8%' }}/>
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

export default ManageItemsIssue;
