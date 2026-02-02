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
} from "reactstrap";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

const Breadcrumbs = ({ title, breadcrumbItem }) => (
  <div className="page-title-box d-sm-flex align-items-center justify-content-between">
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

const AddDirectIssueAllocation = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    drNumber: "DR000001",
    department: "Warehouse", // Auto-filled with default value
    user: "Current User",
    date: "",
    glCode: "",
    itemName: "",
    itemsData: [], // Store selected items with glCode, itemName, qty, purpose
    notes: "",
  });

  // Initialize with auto-generated values
  useEffect(() => {
    document.title = "Direct Issue | BTG Gas & Dashboard Template";
  }, []);

  const handleDepartmentChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      department: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    if (!formData.glCode || !formData.itemName) {
      toast.error("Please select both GL Code and Item");
      return;
    }

    // Add new item if not already selected
    if (!formData.itemsData.find((item) => item.glCode === formData.glCode && item.itemName === formData.itemName)) {
      const newItem = {
        glCode: formData.glCode,
        itemName: formData.itemName,
        quantity: "",
        purpose: "",
      };
      setFormData((prev) => ({
        ...prev,
        itemsData: [...prev.itemsData, newItem],
        glCode: "",
        itemName: "",
      }));
    } else {
      toast.warn("Item already added to list");
    }
  };

  const handleItemDataChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.itemsData];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
      return {
        ...prev,
        itemsData: updatedItems,
      };
    });
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      itemsData: prev.itemsData.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.department) {
      toast.error("Department is required");
      return;
    }
    if (!formData.requiredDate) {
      toast.error("Required Date is required");
      return;
    }
    if (formData.itemsData.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    // Validate each item
    for (let item of formData.itemsData) {
      if (!item.quantity) {
        toast.error(`Quantity is required for ${item.glCode}-${item.itemName}`);
        return;
      }
      if (!item.purpose) {
        toast.error(`Purpose is required for ${item.glCode}-${item.itemName}`);
        return;
      }
    }

    try {
      setLoading(true);
      console.log("Saving Direct Issue:", formData);
      toast.success("Direct Issue saved successfully");
      setTimeout(() => {
        history.push("/warehouse-direct-issue");
      }, 1000);
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save Direct Issue");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = () => {
    // Validate required fields
    if (!formData.department) {
      toast.error("Department is required");
      return;
    }
    if (!formData.requiredDate) {
      toast.error("Required Date is required");
      return;
    }
    if (formData.itemsData.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    // Validate each item
    for (let item of formData.itemsData) {
      if (!item.quantity) {
        toast.error(`Quantity is required for ${item.glCode}-${item.itemName}`);
        return;
      }
      if (!item.purpose) {
        toast.error(`Purpose is required for ${item.glCode}-${item.itemName}`);
        return;
      }
    }

    try {
      setLoading(true);
      console.log("Posting Direct Issue:", formData);
      toast.success("Direct Issue posted successfully");
      setTimeout(() => {
        history.push("/warehouse-direct-issue");
      }, 1000);
    } catch (error) {
      console.error("Error posting data:", error);
      toast.error("Failed to post Direct Issue");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    history.push("/warehouse-direct-issue");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Warehouse" breadcrumbItem="Direct Issue" />

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  {/* Header with Buttons */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <CardTitle className="mb-0 h4">Direct Issue</CardTitle>
                    <div className="d-flex gap-2">
                      <Button
                        color="primary"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        <i className="bx bx-check me-2"></i>Save
                      </Button>
                      <Button
                        color="success"
                        onClick={handlePost}
                        disabled={loading}
                      >
                        <i className="bx bx-lock me-2"></i>Post
                      </Button>
                      <Button
                        color="danger"
                        onClick={handleClose}
                        disabled={loading}
                      >
                        <i className="bx bx-x me-2"></i>Close
                      </Button>
                    </div>
                  </div>

                  {loading && (
                    <div className="text-center p-3">
                      <Spinner color="primary" />
                    </div>
                  )}

                  {!loading && (
                    <Form>
                      {/* Row 1: DR Number, Department, User, Date */}
                      <Row className="mb-3">
                        <Col lg="3">
                          <FormGroup>
                            <Label htmlFor="drNumber" className="form-label">
                              DR Number <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="text"
                              id="drNumber"
                              name="drNumber"
                              value={formData.drNumber}
                              disabled
                              className="form-control bg-light"
                              placeholder="DR000001"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="3">
                          <FormGroup>
                            <Label htmlFor="department" className="form-label">
                              Department <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="select"
                              id="department"
                              name="department"
                              value={formData.department}
                              onChange={handleDepartmentChange}
                              className="form-control"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            >
                              <option value="">Select Department</option>
                              <option value="Warehouse">Warehouse</option>
                              <option value="Production">Production</option>
                              <option value="Sales">Sales</option>
                              <option value="Administration">Administration</option>
                              <option value="Finance">Finance</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col lg="2">
                          <FormGroup>
                            <Label htmlFor="user" className="form-label">
                              User
                            </Label>
                            <Input
                              type="select"
                              id="user"
                              name="user"
                              value={formData.user}
                              onChange={(e) => setFormData((prev) => ({ ...prev, user: e.target.value }))}
                              className="form-control"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            >
                              <option value="">Select User</option>
                              <option value="Current User">Current User</option>
                              <option value="John Smith">John Smith</option>
                              <option value="Jane Doe">Jane Doe</option>
                              <option value="Mike Johnson">Mike Johnson</option>
                              <option value="Sarah Wilson">Sarah Wilson</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col lg="2">
                          <FormGroup>
                            <Label htmlFor="date" className="form-label">
                              Date <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="date"
                              id="date"
                              name="date"
                              value={formData.date}
                              onChange={handleInputChange}
                              className="form-control"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      {/* Items Section Header */}
                      <div className="mb-3">
                        <h6 className="card-title mb-3">Items Details</h6>
                      </div>

                      {/* Add Item Row */}
                      <Row className="mb-3">
                        <Col lg="4">
                          <FormGroup>
                            <Label htmlFor="glCode" className="form-label">
                              GL Code <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="select"
                              id="glCode"
                              name="glCode"
                              value={formData.glCode}
                              onChange={handleInputChange}
                              className="form-control"
                              style={{ height: "40px", fontSize: "0.95rem" }}
                            >
                              <option value="">Select GL Code</option>
                              <option value="GL10001">GL10001</option>
                              <option value="GL10002">GL10002</option>
                              <option value="GL10003">GL10003</option>
                              <option value="GL10004">GL10004</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup>
                            <Label htmlFor="itemName" className="form-label">
                              Item <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="select"
                              id="itemName"
                              name="itemName"
                              value={formData.itemName}
                              onChange={handleInputChange}
                              className="form-control"
                              style={{ height: "40px", fontSize: "0.95rem" }}
                            >
                              <option value="">Select Item</option>
                              <option value="Cylinder Type A">Cylinder Type A</option>
                              <option value="Cylinder Type B">Cylinder Type B</option>
                              <option value="Safety Valve">Safety Valve</option>
                              <option value="Pressure Gauge">Pressure Gauge</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col lg="4" className="d-flex align-items-end mb-3">
                          <Button color="primary" onClick={handleAddItem} style={{ height: "40px" }}>
                            Add Item
                          </Button>
                        </Col>
                      </Row>

                      {/* Items Table */}
                      {formData.itemsData.length > 0 && (
                        <Row className="mb-3">
                          <Col lg="12">
                            <div style={{ overflowX: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                                <thead>
                                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                    <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>GL Code</th>
                                    <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Item</th>
                                    <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Qty</th>
                                    <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Purpose</th>
                                    <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: "600", width: "80px" }}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {formData.itemsData.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: "1px solid #dee2e6" }}>
                                      <td style={{ padding: "0.75rem" }}>{item.glCode}</td>
                                      <td style={{ padding: "0.75rem" }}>{item.itemName}</td>
                                      <td style={{ padding: "0.75rem" }}>
                                        <Input
                                          type="number"
                                          value={item.quantity}
                                          onChange={(e) => handleItemDataChange(index, "quantity", e.target.value)}
                                          placeholder="Qty"
                                          className="form-control form-control-sm"
                                          style={{ height: "32px", fontSize: "0.85rem" }}
                                        />
                                      </td>
                                      <td style={{ padding: "0.75rem" }}>
                                        <Input
                                          type="text"
                                          value={item.purpose}
                                          onChange={(e) => handleItemDataChange(index, "purpose", e.target.value)}
                                          placeholder="Purpose"
                                          className="form-control form-control-sm"
                                          style={{ height: "32px", fontSize: "0.85rem" }}
                                        />
                                      </td>
                                      <td style={{ padding: "0.75rem", textAlign: "center" }}>
                                        <Button
                                          color="danger"
                                          size="sm"
                                          onClick={() => handleRemoveItem(index)}
                                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                        >
                                          <i className="bx bx-trash" style={{ fontSize: "0.9rem" }}></i>
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </Col>
                        </Row>
                      )}

                      {/* Divider */}
                      <hr className="my-4" />
                    </Form>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AddDirectIssueAllocation;
