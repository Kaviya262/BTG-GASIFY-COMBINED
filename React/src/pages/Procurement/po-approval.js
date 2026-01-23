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
import { Checkbox } from "primereact/checkbox";


// Move the initFilters function definition above
const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    Code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    Name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Country: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    Contactperson: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});

const ManagePOApproval = () => {
    const history = useHistory();
    // Suppliers with added 'Active' property (for switch toggle)
    const initialSuppliers = [
        {
            "PO No": "PO0001",
            "PO Date": "22-May-25",
            "PR No": "PR0001",
            Requestor: "Anwar",
            "Req. Department": "Eng",
            Supplier: "Supplier1",
            "Item Name": "Item A",
            "Delivery Date": "10-Jun-25",
            UOM: "Pcs",
            Qty: 10,
            Rate: 5,
            Amount: 50,
            "Approver 1": "",
            "Approver 2": "",
            Approval: false,
            Rejection: false,
            Discuss: false,
            Remarks: "",
        },
        {
            "PO No": "PO0001",
            "PO Date": "25-May-25",
            "PR No": "PR0001",
            Requestor: "Akash",
            "Req. Department": "IT",
            Supplier: "Supplier2",
            "Item Name": "Item B",
            "Delivery Date": "15-Jun-25",
            UOM: "Kg",
            Qty: 20,
            Rate: 10,
            Amount: 200,
            "Approver 1": "Sam",
            "Approver 2": "",
            Approval: false,
            Rejection: false,
            Discuss: false,
            Remarks: "",
        },
        {
            "PO No": "PO0002",
            "PO Date": "27-May-25",
            "PR No": "PR0002",
            Requestor: "Ram",
            "Req. Department": "Prod",
            Supplier: "Supplier1",
            "Item Name": "Item C",
            "Delivery Date": "17-Jun-25",
            UOM: "Ltr",
            Qty: 30,
            Rate: 10,
            Amount: 300,
            "Approver 1": "Alex",
            "Approver 2": "",
            Approval: false,
            Rejection: false,
            Discuss: false,
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
    const handleApprovalChange = (prNo, approver) => {
        setSuppliers((prevSuppliers) =>
            prevSuppliers.map((supplier) =>
                supplier["PR No"] === prNo
                    ? { ...supplier, "Approval 1": approver }
                    : supplier
            )
        );
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
                    <Breadcrumbs title="Procurement" breadcrumbItem="PO Approval" />
                    <Row>
                        <Card className="search-top">
                            <div className="row align-items-end g-3 quotation-mid p-3">
                                {/* Action Buttons */}
                                <div
                                    className="col-12 col-lg-12 text-end"
                                >
                                    <div className="d-flex justify-content-end gap-2 align-items-center h-100">
                                        <button type="button" className="btn btn-success" onClick={linkAddPurchaseRequisition}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>Save</button>
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
                                    {/* PO No */}
                                    <Column field="PO No" header="PO No" 
                                    body={(rowData) => (
                                            <Link to={`/pr-details/${rowData["PO No"]}`}>{rowData["PO No"]}</Link>
                                        )}/>

                                    {/* PO Date */}
                                    <Column field="PO Date" header="PO Date" style={{ width: '20%' }} />

                                    {/* PR No */}
                                    <Column
                                        field="PR No"
                                        header="PR No."
                                        body={(rowData) => (
                                            <Link to={`/pr-details/${rowData["PR No"]}`}>{rowData["PR No"]}</Link>
                                        )}
                                    />

                                    {/* Requestor */}
                                    <Column field="Requestor" header="Requestor" />

                                    {/* Req. Department */}
                                    <Column field="Req. Department" header="Req. Dept." />

                                    {/* Supplier */}
                                    <Column field="Supplier" header="Supplier" />

                                    {/* Item Name */}
                                    <Column field="Item Name" header="Item Name" />

                                    {/* Del. Date */}
                                    <Column field="Delivery Date" header="Del. Date" />

                                    {/* UOM */}
                                    <Column field="UOM" header="UOM" />

                                    {/* Qty */}
                                    <Column field="Qty" header="Qty" className="text-end" />

                                    {/* Rate */}
                                    <Column field="Rate" header="Rate" className="text-end" />

                                    {/* Amount */}
                                    <Column field="Amount" header="Amount" className="text-end" />

                                    {/* Approver 1 */}
                                    <Column field="Approver 1" header="Approver-1" />

                                    {/* Approver 2 */}
                                    <Column field="Approver 2" header="Approver-2" />

                                    {/* Approval Checkbox */}
                                    <Column
                                        header="Approval"
                                        body={(rowData) => (
                                            <Checkbox
                                                inputId={`approval-${rowData["PR No"]}`}
                                                checked={rowData["Approval 1"] === "Sam"}
                                                onChange={(e) =>
                                                    handleApprovalChange(rowData["PR No"], e.checked ? "Sam" : "")
                                                }
                                            />
                                        )}
                                        className="text-center"
                                        style={{ width: "7%" }}
                                    />

                                    {/* Rejection Checkbox */}
                                    <Column
                                        header="Rejection"
                                        body={(rowData) => (
                                            <Checkbox
                                                inputId={`reject-${rowData["PR No"]}`}
                                                checked={rowData["Approval 2"] === "Alex"}
                                                onChange={(e) =>
                                                    handleRejectionChange(rowData["PR No"], e.checked ? "Alex" : "")
                                                }
                                            />
                                        )}
                                        className="text-center"
                                        style={{ width: "7%" }}
                                    />

                                    {/* Discuss Checkbox */}
                                    <Column
                                        header="Discuss"
                                        body={(rowData) => (
                                            <Checkbox
                                                inputId={`discuss-${rowData["PR No"]}`}
                                                checked={rowData["Approval 3"] === "John"}
                                                onChange={(e) =>
                                                    handleDiscussChange(rowData["PR No"], e.checked ? "John" : "")
                                                }
                                            />
                                        )}
                                        className="text-center"
                                        style={{ width: "7%" }}
                                    />

                                    {/* Remarks */}
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

export default ManagePOApproval;
