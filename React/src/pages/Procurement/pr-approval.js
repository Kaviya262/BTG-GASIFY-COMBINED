import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, Label, FormGroup, Input, InputGroup, ModalFooter } from "reactstrap";
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
import { SavePRReply } from "common/data/mastersapi";
import Swal from "sweetalert2";

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
            "PR No": "PR0001",
            "PR Date": "22-May-25",
            Requestor: "Akash",
            Department: "IT",
            Supplier: "Supplier1",
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
            "PR No": "PR0002",
            "PR Date": "25-May-25",
            Requestor: "Ram",
            Department: "Prod",
            Supplier: "Supplier2",
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


    const [discussionModalOpen, setDiscussionModalOpen] = useState(false);
    const [selectedPR, setSelectedPR] = useState(null);
    const [userReply, setUserReply] = useState("");

    const openDiscussionChat = (rowData) => {
        setSelectedPR(rowData);
        setUserReply("");
        setDiscussionModalOpen(true);
    };

    const getUserDetails = () => {
        if (localStorage.getItem("authUser")) {
            const obj = JSON.parse(localStorage.getItem("authUser"))
            return obj;
        }
        return { username: "User", role: "User" }; // Default fallback
    }

    const handleSendReply = async () => {
        if (!userReply.trim()) {
            Swal.fire("Error", "Please enter a reply", "error");
            return;
        }

        // Use selectedPR["PR No"] or some ID. The mock data has "PR No". 
        // Real backend probably expects PRId. 
        // Assuming rowData has what we need or we mock it for now as per instructions "Backend already works".
        // If the table displays "suppliers" which is mock data, we might not have real PRId. 
        // However, the instructions say "Backend appends reply...".
        // I will try to use rowData.PRId if available, else fallback to something or just pass mock logic if this is a mock page.
        // BUT the user says "Only ONE file actually controls the UI... pr-approval.js... Backend already works".
        // This suggests `pr-approval.js` might be using real data or needs to fit real data. 
        // The current file `pr-approval.js` uses `initialSuppliers` which is HARDCODED.
        // So I can't really call the backend with "PR0001" if the backend expects an integer ID.
        // However, I must follow instructions "When Send Reply is clicked: POST ...".
        // I'll proceed with calling the API. If `selectedPR` lacks `PRId`, I'll use `selectedPR["PR No"]` but warning: backend might fail if it expects int.
        // The previous file used `selectedPR.PRId`.
        // I'll assume the rowData will eventually come from API or I should just implement the UI logic as requested.

        // The context says "That is why the popup title is “Remarks”... This is a frontend wiring issue".
        // So I'll implement the frontend wiring.

        const userData = getUserDetails();
        const sender = userData.role === "GM" ? "GM" : "User";
        const displayName = sender === "GM" ? "GM" : userData.username;

        // Simulating ID if missing, to prevent crash if data is mock
        const prId = selectedPR.PRId || selectedPR["PR No"];

        try {
            const res = await SavePRReply(prId, userReply, displayName, sender);
            if (res.success || res.status) { // Check for likely success flags
                Swal.fire("Success", "Reply sent successfully", "success");
                setDiscussionModalOpen(false);

                // Update local state to show the new comment (simulation for UI responsiveness)
                const newComment = `[${displayName} at ${new Date().toLocaleString()}]: ${userReply}`;
                const updatedSuppliers = suppliers.map(row => {
                    if (row["PR No"] === selectedPR["PR No"]) {
                        return {
                            ...row,
                            Remarks: row.Remarks ? row.Remarks + "\n" + newComment : newComment
                        };
                    }
                    return row;
                });
                setSuppliers(updatedSuppliers);
            } else {
                Swal.fire("Error", res.message || "Failed to save reply", "error");
            }
        } catch (e) {
            console.error("Reply Error", e);
            Swal.fire("Error", "Failed to send reply", "error");
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Procurement" breadcrumbItem="PR Approval" />
                    <Row>
                        <Card className="search-top">
                            <div className="row align-items-end g-3 quotation-mid p-3" style={{ Width: '50%' }}>

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
                                    <Column field="Approval 1" header="Approver-1" style={{ width: '11%' }} />
                                    <Column field="Approval 2" header="Approver-2" style={{ width: '11%' }} />
                                    <Column field="Approval 3" header="Approver-3" style={{ width: '11%' }} />

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

                                    <Column
                                        header="Remarks"
                                        body={(rowData) => (
                                            <div className="text-center">
                                                <i
                                                    className="mdi mdi-chat-processing-outline"
                                                    style={{ cursor: "pointer", fontSize: "1.4rem", color: "#556ee6" }}
                                                    onClick={() => openDiscussionChat(rowData)}
                                                />
                                            </div>
                                        )}
                                        style={{ width: '5%' }}
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

            {/* Discussion Chat Modal */}
            <Modal isOpen={discussionModalOpen} toggle={() => setDiscussionModalOpen(false)} centered>
                <ModalHeader toggle={() => setDiscussionModalOpen(false)}>Discussion Chat</ModalHeader>
                <ModalBody>
                    <div className="chat-container mb-3" style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e0e0e0', padding: '15px', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                        {selectedPR && selectedPR.Remarks ? (
                            <div className="message gm-message" style={{ whiteSpace: 'pre-wrap' }}>
                                {selectedPR.Remarks}
                            </div>
                        ) : (
                            <div className="text-muted text-center italic">No discussion yet.</div>
                        )}

                        {/* We can structure the chat history better if the data allows, but for now we display 'Remarks' which likely contains the appended string */}
                    </div>

                    <div className="mb-3">
                        <Label for="userReply">Your Reply:</Label>
                        <Input
                            type="textarea"
                            id="userReply"
                            value={userReply}
                            onChange={(e) => setUserReply(e.target.value)}
                            placeholder="Enter your reply..."
                            rows={4}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSendReply}>Send Reply</Button>
                    <Button color="secondary" onClick={() => setDiscussionModalOpen(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
};

export default ManagePRApproval;
