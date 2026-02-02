import React, { useState, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    CardTitle,
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Spinner,
    Badge,
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

const OpeningAllocation = () => {
    const history = useHistory();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [grnFilter, setGrnFilter] = useState("");
    const [keywordSearch, setKeywordSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [editingAllocation, setEditingAllocation] = useState({});
    const [selectedRows, setSelectedRows] = useState({});
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState({});

    // Initialize dates on component mount
    useEffect(() => {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        setFromDate(formatDateForInput(weekAgo));
        setToDate(formatDateForInput(today));

        // Load data with default dates
        loadOpeningData(weekAgo, today);
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

    const loadOpeningData = async (from, to) => {
        setLoading(true);
        try {
            // Mock data - Replace with actual API call
            const mockData = [
                {
                    id: 1,
                    autoNumber: "00001",
                    date: "2024-01-01",
                    glCode: "GL-10001",
                    itemName: "Cylinder storage",
                    description: "Cylinder storage",
                    floor: "1",
                    positionRack: "Left",
                    rackNumber: "RACK-001",
                    height: "Top",
                    barcode: "BAR123456",
                    status: "Posted",
                },
                {
                    id: 2,
                    autoNumber: "00002",
                    date: "2024-01-02",
                    glCode: "GL-10003",
                    itemName: "Valve storage",
                    description: "Valve storage",
                    floor: "2",
                    positionRack: "Right",
                    rackNumber: "RACK-002",
                    height: "Middle",
                    barcode: "BAR123457",
                    status: "Posted",
                },
                {
                    id: 3,
                    autoNumber: "00003",
                    date: "2024-01-03",
                    glCode: "GL-10004",
                    itemName: "Gauge storage",
                    description: "Gauge storage",
                    floor: "1",
                    positionRack: "Middle",
                    rackNumber: "RACK-003",
                    height: "Bottom",
                    barcode: "BAR123458",
                    status: "Saved",
                },
                {
                    id: 4,
                    autoNumber: "00004",
                    date: "2024-01-04",
                    glCode: "GL-10002",
                    itemName: "Safety equipment",
                    description: "Safety equipment",
                    floor: "2",
                    positionRack: "Left",
                    rackNumber: "RACK-004",
                    height: "Top",
                    barcode: "BAR123459",
                    status: "Posted",
                },
            ];

            setRows(mockData);
            setEditingAllocation({});
            // toast.success("Opening data loaded successfully");
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load Opening data");
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

        loadOpeningData(from, to);
    };

    const handleClear = () => {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        setFromDate(formatDateForInput(weekAgo));
        setToDate(formatDateForInput(today));
        setGrnFilter("");
        setKeywordSearch("");
        setEditingAllocation({});
        loadOpeningData(weekAgo, today);
    };

    const handleNew = () => {
        history.push("/warehouse/opening/add");
    };

    const handleExport = () => {
        if (rows.length === 0) {
            toast.error("No data to export");
            return;
        }

        try {
            // Prepare export data
            const exportData = rows.map((row) => ({
                "Auto-Generated Number": row.autoNumber,
                "Description": row.description,
                "Floor": row.floor,
                "Position Rack": row.positionRack,
                "Rack Number": row.rackNumber,
                "Height": row.height,
                "Barcode": row.barcode,
                "Status": row.status,
            }));

            // Convert to CSV
            const headers = Object.keys(exportData[0]);
            const csvContent = [
                headers.join(","),
                ...exportData.map((row) =>
                    headers.map((header) => `"${row[header]}"`).join(",")
                ),
            ].join("\n");

            // Download CSV
            const element = document.createElement("a");
            element.setAttribute(
                "href",
                "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
            );
            element.setAttribute("download", `Opening_Export_${new Date().getTime()}.csv`);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);

            toast.success("Opening data exported successfully");
        } catch (error) {
            console.error("Error exporting data:", error);
            toast.error("Failed to export Opening data");
        }
    };

    const handleSave = () => {
        try {
            // Check if any allocation types have been edited
            const hasChanges = Object.keys(editingAllocation).length > 0;

            if (!hasChanges) {
                toast.warning("No changes to save");
                return;
            }

            // Prepare data for saving
            const updatedData = rows.map((row) => ({
                ...row,
                allocationType: editingAllocation[row.id] || row.allocationType,
            }));

            // Here you would call your API to save the changes
            console.log("Saving Opening allocations:", updatedData);

            // Update the rows with the new allocation types
            setRows(updatedData);
            setEditingAllocation({});

            toast.success("Opening allocations saved successfully");
        } catch (error) {
            console.error("Error saving data:", error);
            toast.error("Failed to save Opening data");
        }
    };

    const handlePost = () => {
        try {
            // Check if any allocation types have been edited
            const hasChanges = Object.keys(editingAllocation).length > 0;

            if (!hasChanges) {
                toast.warning("No changes to post");
                return;
            }

            // Prepare data for posting
            const updatedData = rows.map((row) => ({
                ...row,
                allocationType: editingAllocation[row.id] || row.allocationType,
                status: "Posted",
            }));

            // Here you would call your API to post the changes
            console.log("Posting Opening allocations:", updatedData);

            // Update the rows with the new allocation types and status
            setRows(updatedData);
            setEditingAllocation({});

            toast.success("Opening allocations posted successfully");
        } catch (error) {
            console.error("Error posting data:", error);
            toast.error("Failed to post Opening data");
        }
    };

    const handleAllocationChange = (rowData, newValue) => {
        setEditingAllocation({
            ...editingAllocation,
            [rowData.id]: newValue,
        });
    };

    const handleSelectRow = (rowId) => {
        setSelectedRows((prevSelected) => ({
            ...prevSelected,
            [rowId]: !prevSelected[rowId],
        }));
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

    const selectTemplate = (rowData) => {
        return (
            <input
                type="checkbox"
                checked={selectedRows[rowData.id] || false}
                onChange={() => handleSelectRow(rowData.id)}
                style={{ cursor: "pointer", width: "18px", height: "18px" }}
            />
        );
    };

    const allocationBodyTemplate = (rowData) => {
        const currentValue = editingAllocation[rowData.id] || rowData.description;
        return (
            <span>{currentValue}</span>
        );
    };

    const handleShowDetails = (rowData) => {
        setSelectedDetail(rowData);
        setDetailVisible(true);
    };

    const handleEdit = (rowData) => {
        history.push(`/warehouse/opening/edit/${rowData.id}`, { openingData: rowData });
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

    const finalItemNameTemplate = (rowData) => {
        return `${rowData.itemName} – ${rowData.barcode}`;
    };

    const headerStyleObj = { backgroundColor: "#0066cc", color: "white" };

    document.title = "Warehouse Opening Allocation | BTG Gas & Dashboard Template";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Warehouse" breadcrumbItem="Opening Allocation" />

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
                                        <button
                                            type="button"
                                            className="btn btn-info"
                                            onClick={handleSearch}
                                        >
                                            <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i>Search
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={handleClear}
                                        >
                                            <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleExport}
                                        >
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

                                {/* Data Table */}
                                {loading ? (
                                    <div className="text-center p-5">
                                        <Spinner color="primary" />
                                        <div className="mt-2 text-muted">Loading Opening data...</div>
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
                                            emptyMessage="No Opening records found."
                                            className="blue-bg"
                                            style={{ width: "100%" }}
                                        >
                                            <Column
                                                field="autoNumber"
                                                header="Opening Number"
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
                                                field="glCode"
                                                header="GL Code"
                                                sortable
                                                style={{ width: "10%", whiteSpace: "nowrap" }}
                                                className="text-left"
                                            />
                                            <Column
                                                field="itemName"
                                                header="Item"
                                                sortable
                                                style={{ width: "15%", whiteSpace: "nowrap" }}
                                                className="text-left"
                                            />
                                            <Column
                                                field="floor"
                                                header="Floor"
                                                sortable
                                                style={{ width: "10%", whiteSpace: "nowrap" }}
                                                className="text-left"
                                            />
                                            <Column
                                                field="positionRack"
                                                header="Position Rack"
                                                sortable
                                                style={{ width: "13%", whiteSpace: "nowrap" }}
                                                className="text-left"
                                            />
                                            <Column
                                                field="rackNumber"
                                                header="Rack Number"
                                                sortable
                                                style={{ width: "12%", whiteSpace: "nowrap" }}
                                                className="text-left"
                                            />
                                            <Column
                                                field="height"
                                                header="Height"
                                                sortable
                                                style={{ width: "10%", whiteSpace: "nowrap" }}
                                                className="text-left"
                                            />
                                            <Column
                                                field="barcode"
                                                header="Barcode"
                                                sortable
                                                style={{ width: "12%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                            <Column
                                                header="Final Item Name"
                                                body={finalItemNameTemplate}
                                                style={{ width: "20%", whiteSpace: "nowrap" }}
                                                className="text-left"
                                            />
                                            <Column
                                                field="status"
                                                header="Status"
                                                body={statusTemplate}
                                                sortable
                                                style={{ width: "9%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                            <Column
                                                header="Action"
                                                body={actionBodyTemplate}
                                                style={{ width: "10%", whiteSpace: "nowrap" }}
                                                className="text-center"
                                            />
                                        </DataTable>
                                    </>
                                ) : (
                                    <div className="alert alert-info mt-3 text-center">
                                        <p className="mb-0">No Opening records found. Please use the search filter to view data.</p>
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
                    Opening Allocation Details
                </ModalHeader>
                <ModalBody style={{ padding: "1rem" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                            <tbody>
                                <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", width: "15%", backgroundColor: "#f8f9fa" }}>Auto-Number</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.autoNumber}</td>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", width: "15%", backgroundColor: "#f8f9fa" }}>GL Code</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.glCode}</td>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", width: "15%", backgroundColor: "#f8f9fa" }}>Item</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.itemName}</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Floor</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.floor}</td>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Position Rack</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.positionRack}</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Rack Number</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.rackNumber}</td>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Height</td>
                                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.height}</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Barcode</td>
                                    <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>{selectedDetail.barcode}</td>
                                </tr>
                            </tbody>
                        </table>
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

export default OpeningAllocation;
