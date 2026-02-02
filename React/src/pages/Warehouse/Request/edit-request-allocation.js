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
import { useHistory, useParams, useLocation } from "react-router-dom";

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

const EditRequestAllocation = () => {
  const history = useHistory();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: id,
    irNumber: "IR000001",
    department: "Warehouse",
    user: "Current User",
    date: "",
    requiredDate: "",
    glCode: "",
    itemName: "",
    itemsData: [],
    notes: "",
  });

  // Initialize with data from location state
  useEffect(() => {
    if (location.state && location.state.requestData) {
      setFormData({
        id: location.state.requestData.id,
        irNumber: location.state.requestData.irNumber || "IR000001",
        department: location.state.requestData.department || "Warehouse",
        user: location.state.requestData.user || "Current User",
        date: location.state.requestData.date || "",
        requiredDate: location.state.requestData.requiredDate || "",
        itemsData: location.state.requestData.itemsData || [],
        notes: location.state.requestData.notes || "",
      });
    }
    document.title = "Edit Request | BTG Gas & Dashboard Template";
  }, [location]);

  const handleRequiredDateChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      requiredDate: value,
    }));
  };

  const handleDepartmentChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      department: value,
    }));
  };

  const handleAddItem = () => {
    const { glCode, itemName } = formData;

    if (!glCode || !itemName) {
      toast.error("Please select both GL Code and Item");
      return;
    }

    if (!formData.itemsData.find((item) => item.glCode === glCode && item.itemName === itemName)) {
      const newItem = {
        glCode: glCode,
        itemName: itemName,
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
      toast.warning("Item already added");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      console.log("Saving Request:", formData);
      toast.success("Request saved successfully");
      setTimeout(() => {
        history.push("/warehouse-request");
      }, 1000);
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save Request");
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
      console.log("Posting Request:", formData);
      toast.success("Request posted successfully");
      setTimeout(() => {
        history.push("/warehouse-request");
      }, 1000);
    } catch (error) {
      console.error("Error posting data:", error);
      toast.error("Failed to post Request");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push("/warehouse-request");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Warehouse" breadcrumbItem="Edit Request" />

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  {/* Header with Buttons */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <CardTitle className="mb-0 h4">Request</CardTitle>
                    <div className="d-flex gap-2">
                      <Button
                        color="primary"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>Save
                      </Button>
                      <Button
                        color="success"
                        onClick={handlePost}
                        disabled={loading}
                      >
                        <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>Post
                      </Button>
                      <Button
                        color="danger"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Close
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
                      {/* Row 1: IR Number, Department, User, Date */}
                      <Row className="mb-3">
                        <Col lg="3">
                          <FormGroup>
                            <Label htmlFor="irNumber" className="form-label">
                              IR Number <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="text"
                              id="irNumber"
                              name="irNumber"
                              value={formData.irNumber}
                              disabled
                              className="form-control bg-light"
                              placeholder="IR000001"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="3">
                          <FormGroup>
                            <Label htmlFor="department" className="form-label">
                              Department <span className="text-danger">*</span>
                            </Label>
                            <div
                              id="department"
                              className="form-control bg-light d-flex align-items-center"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            >
                              {formData.department}
                            </div>
                          </FormGroup>
                        </Col>
                        <Col lg="2">
                          <FormGroup>
                            <Label htmlFor="user" className="form-label">
                              User
                            </Label>
                            <div
                              id="user"
                              className="form-control bg-light d-flex align-items-center"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            >
                              {formData.user}
                            </div>
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

                      {/* Row 2: Required Date */}
                      <Row className="mb-3">
                        <Col lg="3">
                          <FormGroup>
                            <Label htmlFor="requiredDate" className="form-label">
                              Required Date <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="date"
                              id="requiredDate"
                              name="requiredDate"
                              value={formData.requiredDate}
                              onChange={handleRequiredDateChange}
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

                      {/* Add Item Section */}
                      <Row className="mb-3">
                        <Col lg="5">
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
                              <option value="GL-10001">GL-10001</option>
                              <option value="GL-10002">GL-10002</option>
                              <option value="GL-10003">GL-10003</option>
                              <option value="GL-10004">GL-10004</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col lg="5">
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
                        <Col lg="2" className="d-flex align-items-end">
                          <FormGroup className="w-100">
                            <Button
                              color="info"
                              onClick={handleAddItem}
                              className="w-100"
                              style={{ height: "40px" }}
                            >
                              <i className="bx bx-plus me-2"></i>Add
                            </Button>
                          </FormGroup>
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
                                    <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Item Name</th>
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

export default EditRequestAllocation;
