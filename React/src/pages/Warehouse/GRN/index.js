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

const WarehouseGRN = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grnFilter, setGrnFilter] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [bulkGas, setBulkGas] = useState(false);
  const [factorMap, setFactorMap] = useState({});
  const [editingAllocation, setEditingAllocation] = useState({});
  const [selectedRows, setSelectedRows] = useState({});

  // Apply DataTable header styling
  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .p-datatable .p-datatable-thead > tr > th {
        background-color: #0066cc;
        color: white;
        font-weight: bold;
        padding: 0.5rem 0.4rem;
        text-align: center;
        font-size: 0.85rem;
      }
      .p-datatable .p-datatable-tbody > tr > td {
        padding: 0.4rem 0.4rem;
        font-size: 0.85rem;
      }
      .search-top {
        padding: 0.5rem;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Initialize dates on component mount
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    setFromDate(formatDateForInput(weekAgo));
    setToDate(formatDateForInput(today));

    // Load GRNs with default dates
    loadGRNs(weekAgo, today);
  }, []);

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadGRNs = async (from, to) => {
    setLoading(true);
    try {
      // Mock data - Replace with actual API call
      const mockGRNs = [
        {
          id: 1,
          grnNumber: "GRN0000001",
          poNumber: "PO0000001",
          itemName: "Cylinder Type A",
          quantity: 50,
          allocationType: "In Stock",
          createdDate: "2026-01-20",
          createdBy: "Mery",
          isPRGenerated: true,
          status: "Posted",
        },
        {
          id: 2,
          grnNumber: "GRN0000002",
          poNumber: "PO0000002",
          itemName: "Cylinder Type B",
          quantity: 30,
          allocationType: "In Stock",
          createdDate: "2026-01-21",
          createdBy: "Lifi",
          isPRGenerated: true,
          status: "Posted",
        },
        {
          id: 3,
          grnNumber: "GRN0000003",
          poNumber: "PO0000003",
          itemName: "Safety Valve",
          quantity: 100,
          allocationType: "In Stock",
          createdDate: "2026-01-22",
          createdBy: "Hugo",
          isPRGenerated: false,
          status: "Saved",
        },
        {
          id: 4,
          grnNumber: "GRN0000004",
          poNumber: "PO0000004",
          itemName: "Pressure Gauge",
          quantity: 25,
          allocationType: "In Stock",
          createdDate: "2026-01-20",
          createdBy: "Mery",
          isPRGenerated: true,
          status: "Posted",
        },
      ];

      setRows(mockGRNs);
      setEditingAllocation({});
      // toast.success("GRN data loaded successfully");
    } catch (error) {
      console.error("Error loading GRNs:", error);
      toast.error("Failed to load GRN data");
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

    loadGRNs(from, to);
  };

  const handleClear = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setFromDate(formatDateForInput(weekAgo));
    setToDate(formatDateForInput(today));
    setGrnFilter("");
    setKeywordSearch("");
    setEditingAllocation({});
    loadGRNs(weekAgo, today);
  };

  const handleExport = () => {
    if (rows.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Prepare export data
      const exportData = rows.map((row) => ({
        "GRN Number": row.grnNumber,
        "PO Number": row.poNumber,
        "Item Name": row.itemName,
        "Quantity": row.quantity,
        "Created Date": row.createdDate,
        "Created By": row.createdBy,
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
      element.setAttribute("download", `GRN_Export_${new Date().getTime()}.csv`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("GRN data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export GRN data");
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
      const updatedGRNs = rows.map((row) => ({
        ...row,
        allocationType: editingAllocation[row.id] || row.allocationType,
      }));

      // Here you would call your API to save the changes
      console.log("Saving GRN allocations:", updatedGRNs);

      // Update the rows with the new allocation types
      setRows(updatedGRNs);
      setEditingAllocation({});

      toast.success("GRN allocations saved successfully");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save GRN data");
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
      const updatedGRNs = rows.map((row) => ({
        ...row,
        allocationType: editingAllocation[row.id] || row.allocationType,
        status: "Posted",
      }));

      // Here you would call your API to post the changes
      console.log("Posting GRN allocations:", updatedGRNs);

      // Update the rows with the new allocation types and status
      setRows(updatedGRNs);
      setEditingAllocation({});

      toast.success("GRN allocations posted successfully");
    } catch (error) {
      console.error("Error posting data:", error);
      toast.error("Failed to post GRN data");
    }
  };

  const handleAllocationChange = (rowData, newValue) => {
    setEditingAllocation({
      ...editingAllocation,
      [rowData.id]: newValue,
    });
  };

  const handleFactorChange = (rowId, value) => {
    setFactorMap(prev => ({
      ...prev,
      [rowId]: value
    }));
  };

  const factorBodyTemplate = (rowData) => {
    const val = factorMap[rowData.id] !== undefined ? factorMap[rowData.id] : "";
    return (
      <input
        type="number"
        className="form-control form-control-sm"
        value={val}
        onChange={(e) => handleFactorChange(rowData.id, e.target.value)}
        style={{ width: "100%", padding: "0.25rem 0.4rem", fontSize: "0.85rem" }}
      />
    );
  };

  const m3BodyTemplate = (rowData) => {
    const factor = parseFloat(factorMap[rowData.id]) || 0;
    const qty = parseFloat(rowData.quantity) || 0;
    const m3 = factor * qty;
    return (
      <span style={{ display: "inline-block", width: "100%", textAlign: "center", fontSize: "0.85rem" }}>
        {isNaN(m3) ? "" : m3.toFixed(3)}
      </span>
    );
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
      <Badge color={severity} style={{ fontSize: "0.8rem", fontWeight: "bold", minWidth: "24px", textAlign: "center" }}>
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
    const currentValue = editingAllocation[rowData.id] || rowData.allocationType;
    return (
      <select
        className="form-select form-select-sm"
        value={currentValue}
        onChange={(e) => handleAllocationChange(rowData, e.target.value)}
      >
        <option value="In Stock">In Stock</option>
        <option value="Direct Use">Direct Use</option>
        <option value="For Projects">For Projects</option>
      </select>
    );
  };

  const headerStyleObj = { backgroundColor: "#0066cc", color: "white" };

  document.title = "Warehouse GRN | BTG Gas & Dashboard Template";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Warehouse" breadcrumbItem="GRN&apos;s" />

          <Row>
            <Card className="search-top" style={{ padding: "0.5rem" }}>
              <div className="row align-items-end g-2 quotation-mid mb-4">
                {/* From Date and To Date */}
                <div className="col-lg-5">
                  <div className="d-flex align-items-center gap-2">
                    <div className="flex-grow-1 d-flex align-items-center gap-1">
                      <label htmlFor="fromDate" className="form-label mb-0 text-nowrap" style={{ fontSize: "0.85rem" }}>From:</label>
                      <input
                        type="date"
                        id="fromDate"
                        className="form-control form-control-sm"
                        style={{ height: "32px", fontSize: "0.85rem", flex: 1 }}
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div className="flex-grow-1 d-flex align-items-center gap-1">
                      <label htmlFor="toDate" className="form-label mb-0 text-nowrap" style={{ fontSize: "0.85rem" }}>To:</label>
                      <input
                        type="date"
                        id="toDate"
                        className="form-control form-control-sm"
                        style={{ height: "32px", fontSize: "0.85rem", flex: 1 }}
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-2" style={{ minWidth: "150px" }}>
                      <input
                        type="checkbox"
                        id="bulkGas"
                        className="form-check-input"
                        checked={bulkGas}
                        onChange={(e) => setBulkGas(e.target.checked)}
                        style={{ cursor: "pointer", width: "18px", height: "18px", marginTop: "0" }}
                      />
                      <label htmlFor="bulkGas" className="form-check-label mb-0 text-nowrap" style={{ fontSize: "0.85rem", cursor: "pointer" }}>Bulk Gas</label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-lg-7 d-flex justify-content-end flex-wrap gap-1 align-items-center">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSearch}
                    style={{ height: "32px", fontSize: "0.85rem", padding: "0.3rem 0.6rem" }}
                  >
                    <i className="bx bx-search-alt me-2"></i>Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleClear}
                    style={{ height: "32px", fontSize: "0.85rem", padding: "0.3rem 0.6rem" }}
                  >
                    <i className="bx bx-window-close me-2"></i>Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleExport}
                    style={{ height: "32px", fontSize: "0.85rem", padding: "0.3rem 0.6rem" }}
                  >
                    <i className="bx bx-export me-2"></i>Export
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSave}
                    style={{ height: "32px", fontSize: "0.85rem", padding: "0.3rem 0.6rem" }}
                  >
                    <i className="bx bx-check me-2"></i>Save
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success" 
                    onClick={handlePost}
                    style={{ height: "32px", fontSize: "0.85rem", padding: "0.3rem 0.6rem" }}
                  >
                    <i className="bx bxs-save me-2"></i>Post
                  </button>
                </div>
              </div>

              {/* Second Row: Clear, Status Badges, Keyword Search */}
              <div className="row align-items-center g-2 quotation-mid mb-3">
                <div className="col-lg-3">
                  <Button 
                    className="btn btn-danger" 
                    onClick={handleClear} 
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.85rem", height: "32px" }}
                  >
                    <i className="mdi mdi-filter-off me-2"></i>Clear
                  </Button>
                </div>
                <div className="col-lg-3"></div>
                <div className="col-lg-3 text-end d-flex align-items-center justify-content-end gap-2">
                  <span className="d-inline-flex align-items-center gap-1">
                    <Badge color="danger" style={{ fontSize: "0.75rem", fontWeight: "bold", minWidth: "20px", padding: "0.2rem 0.4rem" }}>
                      S
                    </Badge>
                    <span style={{ fontSize: "0.8rem" }}>Saved</span>
                  </span>
                  <span className="d-inline-flex align-items-center gap-1">
                    <Badge color="success" style={{ fontSize: "0.75rem", fontWeight: "bold", minWidth: "20px", padding: "0.2rem 0.4rem" }}>
                      P
                    </Badge>
                    <span style={{ fontSize: "0.8rem" }}>Posted</span>
                  </span>
                </div>
                <div className="col-lg-3">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    value={keywordSearch}
                    onChange={(e) => setKeywordSearch(e.target.value)}
                    placeholder="Keyword Search"
                    style={{ fontSize: "0.85rem", padding: "0.3rem 0.6rem", height: "32px" }}
                  />
                </div>
              </div>
            </Card>
          </Row>

          <Row className="mt-1">
            <Col lg="12">
              <Card style={{ padding: "0.5rem" }}>

                {/* Data Table */}
                {loading ? (
                  <div className="text-center p-3">
                    <Spinner color="primary" />
                    <div className="mt-2 text-muted" style={{ fontSize: "0.85rem" }}>Loading GRN data...</div>
                  </div>
                ) : rows.length > 0 ? (
                  <DataTable
                    value={rows}
                    paginator
                    showGridlines
                    rows={15}
                    loading={loading}
                    dataKey="id"
                    emptyMessage="No GRN records found."
                    style={{ width: "100%", fontSize: "0.85rem" }}
                  >
                    <Column
                      header="Select"
                      body={selectTemplate}
                      style={{ width: "8%", textAlign: "center", whiteSpace: "nowrap" }}
                      className="text-center"
                    />
                    <Column
                      field="grnNumber"
                      header="GRN Number"
                      sortable
                      style={{ width: "18%", textAlign: "center", whiteSpace: "nowrap" }}
                      body={(rowData) => (
                        <span style={{ cursor: "pointer", color: "#0066cc", fontWeight: "bold" }}>
                          {rowData.grnNumber}
                        </span>
                      )}
                      className="text-center"
                    />
                    <Column
                      field="poNumber"
                      header="PO Number"
                      sortable
                      style={{ width: "14%", textAlign: "center", whiteSpace: "nowrap" }}
                      className="text-center"
                    />
                    <Column
                      field="itemName"
                      header="Item Name"
                      sortable
                      style={{ width: "22%", textAlign: "left", whiteSpace: "nowrap" }}
                      className="text-left"
                    />
                    <Column
                      field="uom"
                      header="UOM"
                      style={{ width: "8%", textAlign: "center", whiteSpace: "nowrap" }}
                      className="text-center"
                    />
                    <Column
                      field="quantity"
                      header="Quantity"
                      sortable
                      style={{ width: "10%", textAlign: "center", whiteSpace: "nowrap" }}
                      className="text-center"
                    />
                    {bulkGas && (
                      <Column
                        header="Factor"
                        body={factorBodyTemplate}
                        style={{ width: "8%", textAlign: "center", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                    )}
                    {bulkGas && (
                      <Column
                        header="m3 Qty"
                        body={m3BodyTemplate}
                        sortable
                        style={{ width: "10%", textAlign: "center", whiteSpace: "nowrap" }}
                        className="text-center"
                      />
                    )}
                    <Column
                      field="allocationType"
                      header="Allocation Type"
                      body={allocationBodyTemplate}
                      style={{ width: "18%", textAlign: "center", whiteSpace: "nowrap" }}
                      className="text-center"
                    />
                    <Column
                      field="status"
                      header="Status"
                      body={statusTemplate}
                      sortable
                      style={{ width: "10%", textAlign: "center", whiteSpace: "nowrap" }}
                      className="text-center"
                    />
                  </DataTable>
                ) : (
                  <div className="alert alert-info mt-2 text-center" style={{ fontSize: "0.85rem", padding: "0.5rem" }}>
                    <p className="mb-0">No GRN records found. Please use the search filter to view data.</p>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default WarehouseGRN;
