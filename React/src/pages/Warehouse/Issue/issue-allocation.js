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
  UncontrolledTooltip,
} from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { toast } from "react-toastify";
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

const IssueAllocation = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState({});
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [selectedIssueItem, setSelectedIssueItem] = useState({});
  const [scanStatus, setScanStatus] = useState("Success");

  // Initialize dates on component mount
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    setFromDate(formatDateForInput(weekAgo));
    setToDate(formatDateForInput(today));

    // Load data with default dates
    loadIssueData(weekAgo, today);
  }, []);

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadIssueData = async (from, to) => {
    setLoading(true);
    try {
      // Mock data - Replace with actual API call
      const mockData = [
        {
          id: 1,
          irNumber: "IR000001",
          requestedDate: "2024-01-15",
          department: "Warehouse",
          user: "John Smith",
          items: "GL-10001 Cylinder Type A, GL-10002 Cylinder Type B",
          barcode: "BC001001",
          status: "Pending",
          issueStatus: "Issued",
          itemsData: [
            { glCode: "GL-10001", itemName: "Cylinder Type A", barcode: "BC001001", scanStatus: "Success" },
            { glCode: "GL-10002", itemName: "Cylinder Type B", barcode: "BC001002", scanStatus: "Success" },
          ],
        },
        {
          id: 2,
          irNumber: "IR000002",
          requestedDate: "2024-01-16",
          department: "Production",
          user: "Jane Doe",
          items: "GL-10003 Safety Valve",
          barcode: "BC002001",
          status: "Issued",
          issueStatus: "Pending",
          itemsData: [
            { glCode: "GL-10003", itemName: "Safety Valve", barcode: "BC002001", scanStatus: "Pending" },
          ],
        },
        {
          id: 3,
          irNumber: "IR000003",
          requestedDate: "2024-01-17",
          department: "Sales",
          user: "Mike Johnson",
          items: "GL-10004 Pressure Gauge",
          barcode: "BC003001",
          status: "Pending",
          issueStatus: "Issued",
          itemsData: [
            { glCode: "GL-10004", itemName: "Pressure Gauge", barcode: "BC003001", scanStatus: "Success" },
          ],
        },
        {
          id: 4,
          irNumber: "IR000004",
          requestedDate: "2024-01-18",
          department: "Maintenance",
          user: "Sarah Wilson",
          items: "GL-10001 Cylinder Type A",
          barcode: "BC004001",
          status: "Issued",
          issueStatus: "Pending",
          itemsData: [
            { glCode: "GL-10001", itemName: "Cylinder Type A", barcode: "BC004001", scanStatus: "Pending" },
          ],
        },
      ];

      setRows(mockData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load Issue data");
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

    loadIssueData(from, to);
  };

  const handleClear = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setFromDate(formatDateForInput(weekAgo));
    setToDate(formatDateForInput(today));
    setKeywordSearch("");
    loadIssueData(weekAgo, today);
  };

  const handleExport = () => {
    if (rows.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const exportData = rows.map((row) => ({
        "IR Number": row.irNumber,
        "Department": row.department,
        "User": row.user,
        "Items": row.items,
        "Barcode": row.barcode,
        "Issue Status": row.issueStatus,
      }));

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers.map((header) => `"${row[header]}"`).join(",")
        ),
      ].join("\n");

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
      );
      element.setAttribute("download", `Issue_Export_${new Date().getTime()}.csv`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("Issue data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export Issue data");
    }
  };

  const handleIssueClick = (rowData) => {
    setSelectedIssueItem(rowData);
    setScanStatus("Success");
    setIssueModalVisible(true);
  };

  const handleSaveIssue = () => {
    try {
      toast.success("Issue saved successfully");
      setIssueModalVisible(false);
    } catch (error) {
      console.error("Error saving issue:", error);
      toast.error("Failed to save issue");
    }
  };

  const handlePostIssue = () => {
    try {
      toast.success("Issue posted successfully");
      setIssueModalVisible(false);
    } catch (error) {
      console.error("Error posting issue:", error);
      toast.error("Failed to post issue");
    }
  };

  const handleShowDetails = (rowData) => {
    setSelectedDetail(rowData);
    setDetailVisible(true);
  };

  const handlePrint = (rowData) => {
    console.log("Printing issue:", rowData.irNumber);
    toast.info(`Printing Issue ${rowData.irNumber}...`);
  };

  const statusTemplate = (rowData) => {
    // For Status column: Pending -> S (Saved - red), Issued -> P (Posted - green)
    const severity = rowData.status === "Pending" ? "danger" : "success";
    const displayText = rowData.status === "Pending" ? "S" : "P";
    return (
      <Badge color={severity} style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
        {displayText}
      </Badge>
    );
  };

  const issueStatusTemplate = (rowData) => {
    const severity = rowData.issueStatus === "Pending" ? "success" : "info";
    const displayText = rowData.issueStatus === "Pending" ? "P" : "I";
    return (
      <Badge color={severity} style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
        {displayText}
      </Badge>
    );
  };

  const irNumberBodyTemplate = (rowData) => {
    return (
      <span
        style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
        onClick={() => handleShowDetails(rowData)}
      >
        {rowData.irNumber}
      </span>
    );
  };

  const itemsBodyTemplate = (rowData) => {
    return (
      <span
        id={`items-tooltip-${rowData.id}`}
        style={{ cursor: "pointer", color: "blue" }}
      >
        Items
        <UncontrolledTooltip placement="top" target={`items-tooltip-${rowData.id}`}>
          <div className="text-start">
            {rowData.itemsData && rowData.itemsData.map((item, idx) => (
              <div key={idx}>{item.glCode} - {item.itemName}</div>
            ))}
          </div>
        </UncontrolledTooltip>
      </span>
    );
  };

  const issueButtonTemplate = (rowData) => {
    return (
      <Button
        color="success"
        size="sm"
        onClick={() => handleIssueClick(rowData)}
        style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", color: "white", fontWeight: "bold" }}
      >
        ISSUE
      </Button>
    );
  };

  const printBodyTemplate = (rowData) => {
    return (
      <div className="d-flex align-items-center justify-content-center">
        <span
          onClick={() => handlePrint(rowData)}
          title="Print"
          style={{ cursor: "pointer" }}
        >
          <i className="mdi mdi-printer" style={{ fontSize: "1.5rem" }}></i>
        </span>
      </div>
    );
  };

  document.title = "Warehouse Issue Allocation | BTG Gas & Dashboard Template";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Warehouse" breadcrumbItem="Issue" />

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
                  <span className="d-inline-flex align-items-center gap-2">
                    <Badge color="info" style={{ fontSize: "0.9rem", fontWeight: "bold", minWidth: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      I
                    </Badge>
                    <span style={{ fontSize: "0.85rem" }}>Issued</span>
                  </span>
                  <span className="d-inline-flex align-items-center gap-2">
                    <Badge color="success" style={{ fontSize: "0.9rem", fontWeight: "bold", minWidth: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      P
                    </Badge>
                    <span style={{ fontSize: "0.85rem" }}>Pending</span>
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
                    <div className="mt-2 text-muted">Loading Issue data...</div>
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
                      emptyMessage="No Issue records found."
                      className="blue-bg"
                      style={{ width: "100%" }}
                    >
                      <Column
                        field="irNumber"
                        header="IR Number"
                        body={irNumberBodyTemplate}
                        sortable
                        style={{ width: "12%", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                      <Column
                        field="requestedDate"
                        header="Requested Date"
                        sortable
                        style={{ width: "12%", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                      <Column
                        field="department"
                        header="Dept"
                        sortable
                        style={{ width: "10%", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                      <Column
                        field="user"
                        header="User"
                        sortable
                        style={{ width: "10%", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                      <Column
                        header="Items"
                        body={itemsBodyTemplate}
                        style={{ width: "12%", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                      <Column
                        field="barcode"
                        header="Barcode"
                        sortable
                        style={{ width: "12%", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                      <Column
                        field="status"
                        header="Status"
                        body={statusTemplate}
                        sortable
                        style={{ width: "10%", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                      <Column
                        header="Issue"
                        body={issueButtonTemplate}
                        style={{ width: "10%", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                      <Column
                        field="issueStatus"
                        header="Issue Status"
                        body={issueStatusTemplate}
                        sortable
                        style={{ width: "12%", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                      <Column
                        header="Print"
                        body={printBodyTemplate}
                        style={{ width: "8%", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                    </DataTable>
                  </>
                ) : (
                  <div className="alert alert-info mt-3 text-center">
                    <p className="mb-0">No Issue records found. Please use the search filter to view data.</p>
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
          Issue Details
        </ModalHeader>
        <ModalBody style={{ padding: "1.5rem" }}>
          {/* General Information Section */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", width: "20%", backgroundColor: "#f8f9fa" }}>IR Number</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.irNumber}</td>
                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", width: "20%", backgroundColor: "#f8f9fa" }}>Requested Date</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.requestedDate}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Department</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.department}</td>
                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>User</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.user}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>Issue Status</td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>{selectedDetail.issueStatus}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <h6 style={{ fontWeight: "bold", marginBottom: "1rem", fontSize: "0.95rem" }}>Items Details</h6>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", border: "1px solid #e9ecef" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>GL Code</th>
                    <th style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Item Name</th>
                    <th style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>Barcode</th>
                    <th style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Scan Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDetail.itemsData && selectedDetail.itemsData.length > 0 ? (
                    selectedDetail.itemsData.map((item, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #e9ecef" }}>
                        <td style={{ padding: "0.6rem 0.8rem" }}>{item.glCode}</td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>{item.itemName}</td>
                        <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>{item.barcode}</td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>{item.scanStatus}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ padding: "1rem 0.8rem", textAlign: "center", color: "#6c757d" }}>
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

      {/* Issue Modal */}
      <Modal isOpen={issueModalVisible} toggle={() => setIssueModalVisible(false)} size="lg">
        <ModalHeader toggle={() => setIssueModalVisible(false)}>
          Issue Item
        </ModalHeader>
        <ModalBody style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h6 style={{ fontWeight: "bold", marginBottom: "1rem", fontSize: "0.95rem" }}>Items</h6>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", border: "1px solid #e9ecef" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0066cc", color: "white" }}>
                    <th style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>GL Code</th>
                    <th style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Item Name</th>
                    <th style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Barcode</th>
                    <th style={{ padding: "0.6rem 0.8rem", fontWeight: "bold", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Scan Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedIssueItem.itemsData && selectedIssueItem.itemsData.length > 0 ? (
                    selectedIssueItem.itemsData.map((item, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #e9ecef" }}>
                        <td style={{ padding: "0.6rem 0.8rem" }}>{item.glCode}</td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>{item.itemName}</td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>{item.barcode}</td>
                        <td style={{ padding: "0.6rem 0.8rem" }}>
                          <select
                            value={item.scanStatus || "Success"}
                            onChange={(e) => {
                              const updatedItems = [...selectedIssueItem.itemsData];
                              updatedItems[index].scanStatus = e.target.value;
                              setSelectedIssueItem({
                                ...selectedIssueItem,
                                itemsData: updatedItems
                              });
                            }}
                            className="form-control form-control-sm"
                            style={{ height: "32px", fontSize: "0.85rem" }}
                          >
                            <option value="Success">Success</option>
                            <option value="Failure">Failure</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ padding: "1rem 0.8rem", textAlign: "center", color: "#6c757d" }}>
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
          <Button color="primary" onClick={handleSaveIssue} style={{ fontSize: "0.9rem", padding: "0.4rem 1rem" }}>
            Save
          </Button>
          <Button color="success" onClick={handlePostIssue} style={{ fontSize: "0.9rem", padding: "0.4rem 1rem" }}>
            Post
          </Button>
          <Button color="secondary" onClick={() => setIssueModalVisible(false)} style={{ fontSize: "0.9rem", padding: "0.4rem 1rem" }}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default IssueAllocation;
