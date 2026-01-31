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

const AddInStockAllocation = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    grnNumber: "",
    items: "",
    isNumber: "IS000001",
    date: "",
    description: "",
    floor: "",
    positionRack: "",
    rackNumber: "",
    height: "",
    barcode: "",
    quantity: "",
    shelfNumber: "",
    finalName: "",
  });

  // Initialize with auto-generated values
  useEffect(() => {
    generateBarcode();
    document.title = "In Stock Allocation | BTG Gas & Dashboard Template";
  }, []);

  const generateShelfNumber = (floor, position, rack, height) => {
    if (!floor || !position || !rack || !height) return "";
    const positionMap = { Left: "L", Right: "R", Middle: "M" };
    const heightMap = { Bottom: "B", Middle: "M", Top: "T" };
    return `F${floor}${positionMap[position] || ""}${rack}${heightMap[height] || ""}`;
  };

  const generateBarcode = () => {
    const shelfNum = generateShelfNumber(formData.floor, formData.positionRack, formData.rackNumber, formData.height);
    setFormData((prev) => ({
      ...prev,
      barcode: shelfNum || ("BAR" + Date.now().toString().slice(-6)),
      shelfNumber: shelfNum,
      finalName: prev.items && shelfNum ? `${prev.items} - ${shelfNum}` : "",
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value,
    };
    
    if (["floor", "positionRack", "rackNumber", "height"].includes(name)) {
      const shelfNum = generateShelfNumber(updatedData.floor, updatedData.positionRack, updatedData.rackNumber, updatedData.height);
      updatedData.shelfNumber = shelfNum;
      if (updatedData.items) {
        updatedData.finalName = `${updatedData.items} - ${shelfNum}`;
      }
    }
    
    if (name === "items" && updatedData.shelfNumber) {
      updatedData.finalName = `${value} - ${updatedData.shelfNumber}`;
    }
    
    setFormData(updatedData);
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.grnNumber) {
      toast.error("GRN Number is required");
      return;
    }
    if (!formData.items) {
      toast.error("Items is required");
      return;
    }
    if (!formData.floor) {
      toast.error("Floor is required");
      return;
    }
    if (!formData.positionRack) {
      toast.error("Position Rack is required");
      return;
    }
    if (!formData.rackNumber) {
      toast.error("Rack Number is required");
      return;
    }
    if (!formData.height) {
      toast.error("Height is required");
      return;
    }

    try {
      setLoading(true);
      // Here you would call your API to save the In Stock allocation
      console.log("Saving In Stock Allocation:", formData);
      toast.success("In Stock Allocation saved successfully");
      setTimeout(() => {
        history.push("/warehouse-in-stock");
      }, 1000);
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save In Stock Allocation");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = () => {
    // Validate required fields
    if (!formData.grnNumber) {
      toast.error("GRN Number is required");
      return;
    }
    if (!formData.items) {
      toast.error("Items is required");
      return;
    }
    if (!formData.floor) {
      toast.error("Floor is required");
      return;
    }
    if (!formData.positionRack) {
      toast.error("Position Rack is required");
      return;
    }
    if (!formData.rackNumber) {
      toast.error("Rack Number is required");
      return;
    }
    if (!formData.height) {
      toast.error("Height is required");
      return;
    }

    try {
      setLoading(true);
      // Here you would call your API to post the In Stock allocation
      console.log("Posting In Stock Allocation:", formData);
      toast.success("In Stock Allocation posted successfully");
      setTimeout(() => {
        history.push("/warehouse-in-stock");
      }, 1000);
    } catch (error) {
      console.error("Error posting data:", error);
      toast.error("Failed to post In Stock Allocation");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    history.push("/warehouse-in-stock");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Warehouse" breadcrumbItem="In Stock Allocation" />

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  {/* Header with Buttons */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <CardTitle className="mb-0 h4">In Stock Allocation Form</CardTitle>
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
                      {/* Row 1: Auto-Number, Date, GRN Number */}
                      <Row className="mb-3">
                        <Col lg="4">
                          <FormGroup>
                            <Label htmlFor="isNumber" className="form-label">
                              IS Number <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="text"
                              id="isNumber"
                              name="isNumber"
                              value={formData.isNumber}
                              disabled
                              className="form-control bg-light"
                              placeholder="IS000001"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="4">
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
                        <Col lg="4">
                          <FormGroup>
                            <Label htmlFor="grnNumber" className="form-label">
                              GRN Number <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="select"
                              id="grnNumber"
                              name="grnNumber"
                              value={formData.grnNumber}
                              onChange={handleInputChange}
                              className="form-control"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            >
                              <option value="">Select GRN Number</option>
                              <option value="GRN0000001">GRN0000001</option>
                              <option value="GRN0000002">GRN0000002</option>
                              <option value="GRN0000003">GRN0000003</option>
                              <option value="GRN0000004">GRN0000004</option>
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>

                      {/* Row 2: Items, Floor, Position Rack */}
                      <Row className="mb-3">
                        <Col lg="4">
                          <FormGroup>
                            <Label htmlFor="items" className="form-label">
                              Items <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="select"
                              id="items"
                              name="items"
                              value={formData.items}
                              onChange={handleInputChange}
                              className="form-control"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            >
                              <option value="">Select Items</option>
                              <option value="GL-10001 Cylinder Type A">GL-10001 Cylinder Type A</option>
                              <option value="GL-10002 Cylinder Type B">GL-10002 Cylinder Type B</option>
                              <option value="GL-10003 Safety Valve">GL-10003 Safety Valve</option>
                              <option value="GL-10004 Pressure Gauge">GL-10004 Pressure Gauge</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup>
                            <Label htmlFor="floor" className="form-label">
                              Floor <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="select"
                              id="floor"
                              name="floor"
                              value={formData.floor}
                              onChange={handleInputChange}
                              className="form-control"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            >
                              <option value="">Select Floor</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup>
                            <Label htmlFor="positionRack" className="form-label">
                              Position Rack <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="select"
                              id="positionRack"
                              name="positionRack"
                              value={formData.positionRack}
                              onChange={handleInputChange}
                              className="form-control"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            >
                              <option value="">Select Position</option>
                              <option value="Left">Left</option>
                              <option value="Right">Right</option>
                              <option value="Middle">Middle</option>
                            </Input>
                          </FormGroup>
                        </Col>
                      </Row>

                      {/* Row 3: Rack Number, Height, Description */}
                      <Row className="mb-3">
                        <Col lg="4">
                          <FormGroup>
                            <Label htmlFor="rackNumber" className="form-label">
                              Rack Number <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="text"
                              id="rackNumber"
                              name="rackNumber"
                              value={formData.rackNumber}
                              onChange={handleInputChange}
                              className="form-control"
                              placeholder="Physical rack identifier"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup>
                            <Label htmlFor="height" className="form-label">
                              Height <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="select"
                              id="height"
                              name="height"
                              value={formData.height}
                              onChange={handleInputChange}
                              className="form-control"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            >
                              <option value="">Select Height</option>
                              <option value="Bottom">Bottom</option>
                              <option value="Middle">Middle</option>
                              <option value="Top">Top</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup className="mb-0">
                            <Label htmlFor="description" className="form-label">
                              Description
                            </Label>
                            <Input
                              type="textarea"
                              id="description"
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              className="form-control"
                              placeholder="Additional item description"
                              rows="1"
                              style={{ height: "38px", fontSize: "0.95rem", resize: "none" }}
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      {/* Row 4: Quantity, Shelf Number, Final Name */}
                      <Row className="mb-3">
                        <Col lg="4">
                          <FormGroup className="mb-0">
                            <Label htmlFor="quantity" className="form-label">
                              Quantity <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="number"
                              id="quantity"
                              name="quantity"
                              value={formData.quantity}
                              disabled
                              className="form-control bg-light"
                              placeholder="Auto-populated from GRN"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup className="mb-0">
                            <Label htmlFor="shelfNumber" className="form-label">
                              Shelf Number <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="text"
                              id="shelfNumber"
                              name="shelfNumber"
                              value={formData.shelfNumber}
                              disabled
                              className="form-control bg-light"
                              placeholder="Auto-generated"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="4">
                          <FormGroup className="mb-0">
                            <Label htmlFor="finalName" className="form-label">
                              Final Name <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="text"
                              id="finalName"
                              name="finalName"
                              value={formData.finalName}
                              disabled
                              className="form-control bg-light"
                              placeholder="Auto-generated"
                              style={{ height: "38px", fontSize: "0.95rem" }}
                            />
                          </FormGroup>
                        </Col>
                      </Row>

                      {/* Row 5: Barcode */}
                      <Row className="mb-0">
                        <Col lg="4">
                          <FormGroup className="mb-0">
                            <Label htmlFor="barcode" className="form-label">
                              Barcode <span className="text-danger">*</span>
                            </Label>
                            <div className="d-flex" style={{ gap: "5px" }}>
                              <Input
                                type="text"
                                id="barcode"
                                name="barcode"
                                value={formData.barcode}
                                disabled
                                className="form-control bg-light"
                                placeholder="Auto-generated"
                                style={{ height: "38px", fontSize: "0.95rem", flex: "0.6" }}
                              />
                              <Button
                                color="info"
                                onClick={generateBarcode}
                                style={{ whiteSpace: "nowrap", padding: "0.4rem 1rem", fontSize: "0.9rem", minWidth: "120px" }}
                                title="Generate Barcode"
                              >
                                <i className="bx bx-barcode me-2"></i>Generate
                              </Button>
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>

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

export default AddInStockAllocation;
