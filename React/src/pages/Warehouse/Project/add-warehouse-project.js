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

const AddWarehouseProject = () => {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        autoNumber: "PJ000001",
        grnNumber: "",
        date: "",
        items: [],
        quantity: "", // Auto-populated from GRN (mock)
        projectNumber: "",
        description: "",
    });

    useEffect(() => {
        document.title = "Add Project Allocation | BTG Gas & Dashboard Template";
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, selectedOptions } = e.target;

        if (type === "select-multiple") {
            const values = Array.from(selectedOptions, option => option.value);
            setFormData((prev) => ({
                ...prev,
                [name]: values,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));

            // Mock auto-population for Quantity when GRN is selected (if needed logic here)
            if (name === "grnNumber") {
                // Mock quantity
                const mockQty = Math.floor(Math.random() * 100) + 1;
                setFormData(prev => ({ ...prev, quantity: mockQty }));
            }
        }
    };

    const handleSave = () => {
        validateAndSubmit("Saved");
    };

    const handlePost = () => {
        validateAndSubmit("Posted");
    };

    const validateAndSubmit = (status) => {
        if (!formData.grnNumber) {
            toast.error("GRN Number is required");
            return;
        }
        if (!formData.projectNumber) {
            toast.error("Project Number is required");
            return;
        }
        if (!formData.items || formData.items.length === 0) {
            toast.error("Items are required");
            return;
        }
        // Quantity is read-only but required; checks if it was populated
        if (!formData.quantity) {
            toast.error("Quantity is missing (select GRN first)");
            return;
        }

        setLoading(true);
        try {
            console.log(`${status} Project Allocation:`, formData);
            toast.success(`Project Allocation ${status} successfully`);
            setTimeout(() => {
                history.push("/warehouse-project");
            }, 1000);
        } catch (error) {
            console.error("Error:", error);
            toast.error(`Failed to ${status} Project Allocation`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        history.push("/warehouse-project");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Warehouse" breadcrumbItem="Add Project Allocation" />

                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    {/* Header with Buttons */}
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <CardTitle className="mb-0 h4">Project Allocation Form</CardTitle>
                                        <div className="d-flex gap-2">
                                            <Button color="primary" onClick={handleSave} disabled={loading}>
                                                <i className="bx bx-check me-2"></i>Save
                                            </Button>
                                            <Button color="success" onClick={handlePost} disabled={loading}>
                                                <i className="bx bx-lock me-2"></i>Post
                                            </Button>
                                            <Button color="danger" onClick={handleClose} disabled={loading}>
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
                                            {/* Row 1: Auto-Number, GRN Number, Project Number, Items */}
                                            <Row className="mb-3">
                                                <Col lg="3">
                                                    <FormGroup className="mb-0">
                                                        <Label htmlFor="autoNumber" className="form-label">
                                                            Auto-Number <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            id="autoNumber"
                                                            name="autoNumber"
                                                            value={formData.autoNumber}
                                                            readOnly
                                                            className="form-control bg-light"
                                                            placeholder="PJ000001"
                                                            style={{ height: "38px", fontSize: "0.95rem" }}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="3">
                                                    <FormGroup className="mb-0">
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
                                                <Col lg="3">
                                                    <FormGroup className="mb-0">
                                                        <Label htmlFor="projectNumber" className="form-label">
                                                            Project Number <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            id="projectNumber"
                                                            name="projectNumber"
                                                            value={formData.projectNumber}
                                                            onChange={handleInputChange}
                                                            className="form-control"
                                                            style={{ height: "38px", fontSize: "0.95rem" }}
                                                        >
                                                            <option value="">Select Project Number</option>
                                                            <option value="PROJ-2023-001">PROJ-2023-001</option>
                                                            <option value="PROJ-2023-002">PROJ-2023-002</option>
                                                            <option value="PROJ-2023-003">PROJ-2023-003</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="3">
                                                    <FormGroup className="mb-0">
                                                        <Label htmlFor="items" className="form-label">
                                                            Items <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            id="items"
                                                            name="items"
                                                            value={formData.items}
                                                            onChange={(e) => {
                                                              const values = Array.from(e.target.selectedOptions, option => option.value);
                                                              setFormData(prev => ({ ...prev, items: values }));
                                                            }}
                                                            multiple
                                                            disabled={!formData.projectNumber}
                                                            className="form-control"
                                                            style={{ 
                                                              height: "100px",
                                                              fontSize: "0.95rem",
                                                              opacity: !formData.projectNumber ? "0.6" : "1",
                                                              cursor: formData.projectNumber ? "pointer" : "not-allowed"
                                                            }}
                                                        >
                                                            <option value="GL-10001 Cylinder Type A">GL-10001 Cylinder Type A</option>
                                                            <option value="GL-10002 Cylinder Type B">GL-10002 Cylinder Type B</option>
                                                            <option value="GL-10003 Safety Valve">GL-10003 Safety Valve</option>
                                                            <option value="GL-10004 Pressure Gauge">GL-10004 Pressure Gauge</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* Row 2: Date, Quantity, Description */}
                                            <Row className="mb-3">
                                                <Col lg="3">
                                                    <FormGroup className="mb-0">
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
                                                <Col lg="3">
                                                    <FormGroup className="mb-0">
                                                        <Label htmlFor="quantity" className="form-label">
                                                            Quantity <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            id="quantity"
                                                            name="quantity"
                                                            value={formData.quantity}
                                                            readOnly
                                                            className="form-control bg-light"
                                                            placeholder="Auto-populated"
                                                            style={{ height: "38px", fontSize: "0.95rem" }}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="6">
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
                                                            placeholder="Allocation remarks"
                                                            rows="1"
                                                            style={{ height: "38px", fontSize: "0.95rem", resize: "none" }}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

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

export default AddWarehouseProject;
