import React, { useState, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Badge,
    Spinner,
    UncontrolledTooltip,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";

const Breadcrumbs = ({ title, breadcrumbItem }) => (
    <div className="page-title-box d-sm-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
        <div className="page-title-right">
            <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                    <a href="/#">{title}</a>
                </li>
                <li className="breadcrumb-item active">
                    <a href="/#">{breadcrumbItem}</a>
                </li>
            </ol>
        </div>
    </div>
);

const WarehouseDirect = () => {
    const history = useHistory();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keywordSearch, setKeywordSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState({});

    // Initialize dates on component mount
    useEffect(() => {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        setFromDate(formatDateForInput(weekAgo));
        setToDate(formatDateForInput(today));

        // Load data with default dates
        loadDirectData(weekAgo, today);
    }, []);

    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return "";
        const parts = dateString.split("-");
        if (parts.length === 3) {
            const [year, month, day] = parts;
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthIndex = parseInt(month, 10) - 1;
            return `${day}-${monthNames[monthIndex]}-${year}`;
        }
        return dateString;
    };

    const dateBodyTemplate = (rowData) => formatDateDisplay(rowData.date);

    const loadDirectData = async (from, to) => {
        setLoading(true);
        try {
            // Mock data adjusted for Direct Allocation
            const mockData = [
                {
                    id: 1,
                    autoNumber: "DR000001",
                    date: "2023-10-25",
                    grnNumber: "GRN0000001",
                    items: [
                        { glCode: "GL10001", itemName: "Bolt" },
                        { glCode: "GL10002", itemName: "Safety Valve" },
                        { glCode: "GL10003", itemName: "Pressure Gauge" },
                        { glCode: "GL10002", itemName: "Safety Valve" }
                    ],
                    quantity: 50,
                    department: "Production",
                    consumer: "John Doe",
                    description: "Routine restock",
                    status: "Posted",
                },
                {
                    id: 2,
                    autoNumber: "DR000002",
                    date: "2023-10-26",
                    grnNumber: "GRN0000002",
                    items: [
                        { glCode: "GL10002", itemName: "Safety Valve" },
                        { glCode: "GL10003", itemName: "Pressure Gauge" },
                        { glCode: "GL10001", itemName: "Bolt" }
                    ],
                    quantity: 20,
                    department: "Maintenance",
                    consumer: "Jane Smith",
                    description: "Urgent replacement",
                    status: "Posted",
                },
                {
                    id: 3,
                    autoNumber: "DR000003",
                    date: "2023-10-27",
                    grnNumber: "GRN0000003",
                    items: [
                        { glCode: "GL10003", itemName: "Pressure Gauge" },
                        { glCode: "GL10002", itemName: "Safety Valve" },
                        { glCode: "GL10002", itemName: "Safety Valve" },
                        { glCode: "GL10001", itemName: "Bolt" }
                    ],
                    quantity: 15,
                    department: "Quality Control",
                    consumer: "Mike Johnson",
                    description: "Lab testing",
                    status: "Saved",
                },
                {
                    id: 4,
                    autoNumber: "DR000004",
                    date: "2023-10-28",
                    grnNumber: "GRN0000004",
                    items: [
                        { glCode: "GL10002", itemName: "Safety Valve" },
                        { glCode: "GL10001", itemName: "Bolt" },
                        { glCode: "GL10002", itemName: "Safety Valve" }
                    ],
                    quantity: 30,
                    department: "Production",
                    consumer: "Sarah Williams",
                    description: "Project Alpha",
                    status: "Posted",
                },
            ];

            setRows(mockData);
            // toast.success("Direct data loaded successfully");
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load Direct data");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!fromDate || !toDate) {
            toast.error("Please select both From Date and To Date");
            return;
        }
        const from = new Date(fromDate);
        const to = new Date(toDate);
        if (from > to) {
            toast.error("From Date must be less than or equal to To Date");
            return;
        }
        loadDirectData(from, to);
    };

    const handleClear = () => {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        setFromDate(formatDateForInput(weekAgo));
        setToDate(formatDateForInput(today));
        setKeywordSearch("");
        loadDirectData(weekAgo, today);
    };

    const handleNew = () => {
        history.push("/warehouse-direct/add");
    };

    const handleExport = () => {
        if (rows.length === 0) {
            toast.error("No data to export");
            return;
        }
        // Export logic here...
        toast.success("Direct data exported successfully");
    };

    const statusTemplate = (rowData) => {
        const statusShort = rowData.status === "Saved" ? "S" : rowData.status === "Posted" ? "P" : rowData.status;
        const severity = rowData.status === "Saved" ? "danger" : "success";
        return (
            <Badge color={severity} style={{ fontSize: "0.9rem", fontWeight: "bold", minWidth: "28px", textAlign: "center" }}>
                {statusShort}
            </Badge>
        );
    };

    const itemsBodyTemplate = (rowData) => {
        return (
            <>
                <span id={`itemsTooltip-${rowData.id}`} style={{ cursor: "pointer", color: "#556ee6", fontWeight: "bold" }}>
                    Items
                </span>
                <UncontrolledTooltip placement="top" target={`itemsTooltip-${rowData.id}`}>
                    <div className="text-start">
                        {Array.isArray(rowData.items) ? (
                            rowData.items.map((item, index) => (
                                <div key={index}>{item.glCode} - {item.itemName}</div>
                            ))
                        ) : (
                            rowData.items
                        )}
                    </div>
                </UncontrolledTooltip>
            </>
        );
    };

    const handleShowDetails = (rowData) => {
        setSelectedDetail(rowData);
        setDetailVisible(true);
    };

    const handleEdit = (rowData) => {
        history.push(`/warehouse-direct/edit/${rowData.id}`, { directData: rowData });
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="d-flex align-items-center justify-content-center gap-2">
                <span
                    onClick={() => handleEdit(rowData)}
                    title="Edit"
                    style={{ cursor: "pointer" }}
                >
                    <i className="mdi mdi-square-edit-outline" style={{ fontSize: "1.5rem" }}></i>
                </span>
            </div>
        );
    };

    const autoNumberBodyTemplate = (rowData) => {
        return (
            <span
                style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                onClick={() => handleShowDetails(rowData)}
            >
                {rowData.autoNumber}
            </span>
        );
    };

    const printBodyTemplate = (rowData) => {
        return (
            <div className="d-flex align-items-center justify-content-center">
                <Button
                    size="sm"
                    onClick={() => handleExport()}
                    title="Print"
                    style={{
                        padding: "0.4rem 0.5rem",
                        border: "1px solid #dee2e6",
                        backgroundColor: "white",
                        color: "#495057",
                        cursor: "pointer",
                        borderRadius: "4px"
                    }}
                >
                    <i className="mdi mdi-printer" style={{ fontSize: "1.2rem", color: "#495057" }}></i>
                </Button>
            </div>
        );
    };

    document.title = "Warehouse Direct | BTG Gas & Dashboard Template";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Warehouse" breadcrumbItem="Direct Use Allocation" />

                    <Row>
                        <Card className="search-top">
                            <div className="row align-items-end g-1 quotation-mid mb-4">
                                {/* From Date and To Date */}
                                <div className="col-12 col-lg-5 mt-1">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
                                            <label htmlFor="fromDate" className="form-label mb-0 text-nowrap">From:</label>
                                            <input
                                                type="date"
                                                id="fromDate"
                                                className="form-control form-control-sm"
                                                style={{ height: "33px", fontSize: "0.9rem" }}
                                                value={fromDate}
                                                onChange={(e) => setFromDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
                                            <label htmlFor="toDate" className="form-label mb-0 text-nowrap">To:</label>
                                            <input
                                                type="date"
                                                id="toDate"
                                                className="form-control form-control-sm"
                                                style={{ height: "33px", fontSize: "0.9rem" }}
                                                value={toDate}
                                                onChange={(e) => setToDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="col-12 col-lg-7 d-flex justify-content-end flex-wrap gap-2">
                                    <div className="d-flex justify-content-end gap-2 align-items-center h-100">
                                        <button type="button" className="btn btn-info" onClick={handleSearch}>
                                            <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i>Search
                                        </button>
                                        <button type="button" className="btn btn-danger" onClick={handleClear}>
                                            <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={handleExport}>
                                            <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i>Export
                                        </button>
                                        <button type="button" className="btn btn-success" onClick={handleNew}>
                                            <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Second Row: Clear, Status Badges, Keyword Search */}
                            <div className="row align-items-center g-1 quotation-mid mb-3">
                                <div className="col-12 col-lg-3">
                                    <Button className="btn btn-danger btn-label" onClick={handleClear} style={{ padding: "0.48rem 0.96rem", fontSize: "0.8rem", height: "32px", display: "flex", alignItems: "center" }}>
                                        <i className="mdi mdi-filter-off label-icon me-2" style={{ fontSize: "1rem" }} /> Clear
                                    </Button>
                                </div>
                                <div className="col-12 col-lg-3"></div>
                                <div className="col-12 col-lg-3 text-end d-flex align-items-center justify-content-end gap-3">
                                    <span className="d-inline-flex align-items-center gap-2">
                                        <Badge color="danger" style={{ fontSize: "0.9rem", fontWeight: "bold", minWidth: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            S
                                        </Badge>
                                        <span style={{ fontSize: "0.85rem" }}>Saved</span>
                                    </span>
                                    <span className="d-inline-flex align-items-center gap-2">
                                        <Badge color="success" style={{ fontSize: "0.9rem", fontWeight: "bold", minWidth: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            P
                                        </Badge>
                                        <span style={{ fontSize: "0.85rem" }}>Posted</span>
                                    </span>
                                </div>
                                <div className="col-12 col-lg-3">
                                    <input
                                        className="form-control form-control-sm"
                                        type="text"
                                        value={keywordSearch}
                                        onChange={(e) => setKeywordSearch(e.target.value)}
                                        placeholder="Keyword Search"
                                        style={{ fontSize: "0.8rem", padding: "0.48rem 0.75rem", height: "32px" }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </Row>

                    <Row>
                        <Col lg="12">
                            <Card>
                                {loading ? (
                                    <div className="text-center p-5">
                                        <Spinner color="primary" />
                                        <div className="mt-2 text-muted">Loading Direct data...</div>
                                    </div>
                                ) : rows.length > 0 ? (
                                    <>
                                        <style>{`
                                            .blue-bg .p-datatable-thead > tr > th {
                                                padding: 1.00rem !important;
                                            }
                                        `}</style>
                                        <DataTable
                                            value={rows}
                                            paginator
                                            showGridlines
                                            rows={20}
                                            loading={loading}
                                            dataKey="id"
                                            emptyMessage="No Direct records found."
                                            className="blue-bg"
                                            style={{ width: "100%" }}
                                        >
                                            <Column
                                                field="autoNumber"
                                                header="DR Number"
                                                body={autoNumberBodyTemplate}
                                                sortable
                                                style={{ width: "12%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                            <Column
                                                field="date"
                                                header="Date"
                                                body={dateBodyTemplate}
                                                sortable
                                                style={{ width: "10%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                            <Column
                                                field="grnNumber"
                                                header="GRN Number"
                                                sortable
                                                style={{ width: "12%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                            <Column
                                                field="items"
                                                header="Items"
                                                body={itemsBodyTemplate}
                                                sortable
                                                style={{ width: "12%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                            <Column
                                                field="quantity"
                                                header="Quantity"
                                                sortable
                                                style={{ width: "10%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                            <Column
                                                field="department"
                                                header="Department"
                                                sortable
                                                style={{ width: "14%", whiteSpace: "nowrap" }}
                                                className="text-left"
                                            />
                                            <Column
                                                field="consumer"
                                                header="Consumer"
                                                sortable
                                                style={{ width: "14%", whiteSpace: "nowrap" }}
                                                className="text-left"
                                            />
                                            <Column
                                                field="description"
                                                header="Description"
                                                sortable
                                                style={{ width: "16%", whiteSpace: "nowrap" }}
                                                className="text-left"
                                            />
                                            <Column
                                                field="status"
                                                header="Status"
                                                body={statusTemplate}
                                                sortable
                                                style={{ width: "8%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                            <Column
                                                header="Action"
                                                body={actionBodyTemplate}
                                                style={{ width: "6%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                            <Column
                                                header="Print"
                                                body={printBodyTemplate}
                                                style={{ width: "6%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                        </DataTable>
                                    </>
                                ) : (
                                    <div className="alert alert-info mt-3 text-center">
                                        <p className="mb-0">No Direct records found. Please use the search filter to view data.</p>
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Detail Modal */}
            <Modal isOpen={detailVisible} toggle={() => setDetailVisible(false)} size="lg">
                <ModalHeader toggle={() => setDetailVisible(false)}>
                    Direct Use Allocation Details
                </ModalHeader>
                <ModalBody style={{ padding: "1rem" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                            <tbody>
                                <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", width: "20%", backgroundColor: "#f8f9fa" }}>Auto-Number</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.autoNumber}</td>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", width: "20%", backgroundColor: "#f8f9fa" }}>GRN Number</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.grnNumber}</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Quantity</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.quantity}</td>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Department</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.department}</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Consumer</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.consumer}</td>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Description</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.description}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Items Section */}
                    <div className="mt-4">
                        <h6 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Items Details</h6>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", border: "1px solid #e9ecef" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                                        <th style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>GL Code</th>
                                        <th style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Item</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDetail.items && selectedDetail.items.length > 0 ? (
                                        selectedDetail.items.map((item, index) => (
                                            <tr key={index} style={{ borderBottom: "1px solid #e9ecef" }}>
                                                <td style={{ padding: "0.6rem 0.8rem" }}>{item.glCode}</td>
                                                <td style={{ padding: "0.6rem 0.8rem" }}>{item.itemName}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" style={{ padding: "1rem 0.8rem", textAlign: "center", color: "#6c757d" }}>
                                                No items found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setDetailVisible(false)} style={{ fontSize: "0.9rem", padding: "0.4rem 1rem" }}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
};

export default WarehouseDirect;
