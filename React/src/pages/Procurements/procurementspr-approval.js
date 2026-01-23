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
import { Link } from "react-router-dom";

// Move the initFilters function definition above
const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    Name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Country: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Contactperson: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});

const ManagePRApproval = () => {
    const history = useHistory();
    // Suppliers with added 'Active' property (for switch toggle)
    const initialSuppliers = [
        {
            "PR No": "PR0001",
            "PR Date": "20-May-25",
            Requestor: "Anwar",
            Department: "Eng",
            Supplier: "Supplier1",
            "Item Name": "Item A",
            "Delivery Date": "10-Jun-25",
            UOM: "Pcs",
            Quantity: 10,
            Rate: 5,
            Currency: "SGD",
            Amount: 50,
            "Approval 1": "",
            "Approval 2": "",
            "Approval 3": "",
            Remarks: "",
        },
        {
            "PR No": "PR0002",
            "PR Date": "22-May-25",
            Requestor: "Akash",
            Department: "IT",
            Supplier: "Supplier2",
            "Item Name": "Item B",
            "Delivery Date": "15-Jun-25",
            UOM: "Kg",
            Quantity: 20,
            Rate: 10,
            Currency: "SGD",
            Amount: 200,
            "Approval 1": "John",
            "Approval 2": "",
            "Approval 3": "",
            Remarks: "",
        },
        {
            "PR No": "PR0003",
            "PR Date": "25-May-25",
            Requestor: "Ram",
            Department: "Prod",
            Supplier: "Supplier1",
            "Item Name": "Item C",
            "Delivery Date": "17-Jun-25",
            UOM: "Ltr",
            Quantity: 30,
            Rate: 10,
            Currency: "SGD",
            Amount: 300,
            "Approval 1": "John",
            "Approval 2": "Alex",
            "Approval 3": "",
            Remarks: "",
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
    const [approvalSelections, setApprovalSelections] = useState({});
    const [rejectSelections, setRejectSelections] = useState({});
    const [discussSelections, setDiscussSelections] = useState({});

    const [selectAllApproval, setSelectAllApproval] = useState(false);
    const [selectAllReject, setSelectAllReject] = useState(false);
    const [selectAllDiscuss, setSelectAllDiscuss] = useState(false);


    const handleApprove = (rowData) => {
        setSuppliers(prev =>
            prev.map(item =>
                item["PR No"] === rowData["PR No"]
                    ? { ...item, "Approval 1": item["Approval 1"] === "Approved" ? "" : "Approved" }
                    : item
            )
        );
    };



    useEffect(() => {
        const customerData = getCustomers();
        const initialSwitchStates = {};
        customerData.forEach(customer => {
            initialSwitchStates[customer.Code] = customer.Active === 1;
        });
        setSwitchStates(initialSwitchStates);
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
        // return (
        // <div className="row align-items-center g-3 clear-spa">
        //     <div className="col-12 col-lg-6">
        //         <Button className="btn btn-danger btn-label" >
        //             <i className="mdi mdi-filter-off label-icon" /> Clear
        //         </Button>
        //     </div>
        //     <div className="col-12 col-lg-3 text-end">
        //         <span className="me-4">
        //             <Tag value="S" /> Saved
        //         </span>
        //         <span className="me-1">
        //             <Tag value="P" severity="success" /> Posted
        //         </span>
        //     </div>
        //     <div className="col-12 col-lg-3">
        //         <input
        //             className="form-control"
        //             type="text"
        //             value={globalFilterValue}
        //             onChange={onGlobalFilterChange}
        //             placeholder="Keyword Search"
        //         />
        //     </div>
        // </div>
        // );
    };

    const header = renderHeader();

    const handleReject = (rowData) => {
        console.log("Rejected:", rowData["PR No"]);
    };

    const handleDiscuss = (rowData) => {
        console.log("Discussed:", rowData["PR No"]);
    };

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
        console.log('Edit row:', rowData);
    };
    const toggleAllCheckboxes = (type, isChecked) => {
        const newSelections = {};
        suppliers.forEach(supplier => {
            newSelections[supplier["PR No"]] = isChecked;
        });

        if (type === "approval") {
            setApprovalSelections(newSelections);
            setSelectAllApproval(isChecked);
        } else if (type === "reject") {
            setRejectSelections(newSelections);
            setSelectAllReject(isChecked);
        } else if (type === "discuss") {
            setDiscussSelections(newSelections);
            setSelectAllDiscuss(isChecked);
        }
    };


    const approveCheckboxTemplate = (rowData) => (
        <input
            type="checkbox"
            checked={approvalSelections[rowData["PR No"]] || false}
            onChange={(e) => {
                setApprovalSelections(prev => ({
                    ...prev,
                    [rowData["PR No"]]: e.target.checked,
                }));
            }}
        />
    );

    const rejectCheckboxTemplate = (rowData) => (
        <input
            type="checkbox"
            checked={rejectSelections[rowData["PR No"]] || false}
            onChange={(e) => {
                setRejectSelections(prev => ({
                    ...prev,
                    [rowData["PR No"]]: e.target.checked,
                }));
            }}
        />
    );

    const discussCheckboxTemplate = (rowData) => (
        <input
            type="checkbox"
            checked={discussSelections[rowData["PR No"]] || false}
            onChange={(e) => {
                setDiscussSelections(prev => ({
                    ...prev,
                    [rowData["PR No"]]: e.target.checked,
                }));
            }}
        />
    );



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
                    <Breadcrumbs title="Master" breadcrumbItem="PR Approval" />
                    <Row>
                        <Card className="search-top">
                            <div className="row align-items-end g-3 quotation-mid p-3">
                                {/* Action Buttons */}
                                <div
                                    className="col-12 col-lg-8 text-end"
                                >
                                    <div className="d-flex justify-content-end gap-2 align-items-center h-100">
                                        <button type="button" className="btn btn-success" onClick={linkAddPurchaseRequisition}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                        >
                                            <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>{" "}
                                            Cancel
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
                                    value={suppliers}
                                    paginator
                                    rows={10}
                                    dataKey="PR No"
                                    className="p-datatable-sm"
                                    emptyMessage="No PR found"
                                >
                                    <Column
                                        field="PR No"
                                        header="PR No."
                                        body={(rowData) => (
                                            <Link to={`/pr-details/${rowData["PR No"]}`}>{rowData["PR No"]}</Link>
                                        )}
                                    />
                                    <Column field="PR Date" header="PR Date" style={{ width: '10%' }} />

                                    <Column field="Requestor" header="Requestor" />
                                    <Column field="Department" header="Req. Dept." />
                                    <Column field="Supplier" header="Supplier" />
                                    <Column field="Item Name" header="Item Name" />
                                    <Column field="Delivery Date" header="Del. Date" />
                                    <Column field="UOM" header="UOM" />
                                    <Column field="Quantity" header="Qty" className="text-end" />
                                    <Column field="Rate" header="Rate" className="text-end" />
                                    {/* <Column field="Currency" header="Currency" /> */}
                                    <Column field="Amount" header="Amount" className="text-end" />
                                    <Column field="Approval 1" header="Approval-1" />
                                    <Column field="Approval 2" header="Approval-2" />
                                    <Column field="Approval 3" header="Approval-3" />

                                    {/* Action Columns with Icons Only */}
                                    <Column
                                        header={
                                            <div className="d-flex flex-column align-items-center">
                                                <span>Approval</span>
                                                <input
                                                    type="checkbox"
                                                    checked={selectAllApproval}
                                                    onChange={(e) => toggleAllCheckboxes("approval", e.target.checked)}
                                                />
                                            </div>
                                        }
                                        body={approveCheckboxTemplate}
                                        className="text-center"
                                        style={{ width: '7%' }}
                                    />

                                    <Column
                                        header={
                                            <div className="d-flex flex-column align-items-center">
                                                <span>Reject</span>
                                                <input
                                                    type="checkbox"
                                                    checked={selectAllReject}
                                                    onChange={(e) => toggleAllCheckboxes("reject", e.target.checked)}
                                                />
                                            </div>
                                        }
                                        body={rejectCheckboxTemplate}
                                        className="text-center"
                                        style={{ width: '7%' }}
                                    />

                                    <Column
                                        header={
                                            <div className="d-flex flex-column align-items-center">
                                                <span>Discuss</span>
                                                <input
                                                    type="checkbox"
                                                    checked={selectAllDiscuss}
                                                    onChange={(e) => toggleAllCheckboxes("discuss", e.target.checked)}
                                                />
                                            </div>
                                        }
                                        body={discussCheckboxTemplate}
                                        className="text-center"
                                        style={{ width: '7%' }}
                                    />

                                    <Column field="Remarks" header="Remarks" />
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

export default ManagePRApproval;
