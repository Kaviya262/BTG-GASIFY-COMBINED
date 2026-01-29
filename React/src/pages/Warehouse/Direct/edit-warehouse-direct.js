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

const EditWarehouseDirect = () => {
    const history = useHistory();
    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: id,
        autoNumber: "DR000001",
        grnNumber: "",
        date: "",
        items: [],
        department: "",
        consumer: "",
        description: "",
    });

    useEffect(() => {
        if (location.state && location.state.directData) {
            const directData = location.state.directData;
            setFormData({
                id: directData.id,
                autoNumber: directData.autoNumber || "DR000001",
                grnNumber: directData.grnNumber || "",
                date: directData.date || "",
                items: Array.isArray(directData.items) ? directData.items : (directData.items ? [directData.items] : []),
                department: directData.department || "",
                consumer: directData.consumer || "",
                description: directData.description || "",
            });
        }
        document.title = "Edit Direct Allocation | BTG Gas & Dashboard Template";
    }, [location]);

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
        if (!formData.items || formData.items.length === 0) {
            toast.error("Items are required");
            return;
        }
        if (!formData.department) {
            toast.error("Department is required");
            return;
        }
        if (!formData.consumer) {
            toast.error("Consumer is required");
            return;
        }

        setLoading(true);
        try {
            console.log(`${status} Direct Allocation:`, formData);
            toast.success(`Direct Allocation ${status} successfully`);
            setTimeout(() => {
                history.push("/warehouse-direct");
            }, 1000);
        } catch (error) {
            console.error("Error:", error);
            toast.error(`Failed to ${status} Direct Allocation`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        history.push("/warehouse-direct");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Warehouse" breadcrumbItem="Edit Direct Allocation" />

                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    {/* Header with Buttons */}
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <CardTitle className="mb-0 h4">Direct Allocation Form</CardTitle>
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
                                            {/* Row 1: Auto-Number, GRN Number, Items (Multi), Quantity */}
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
                                                            placeholder="DR000001"
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
                                                <Col lg="6">
                                                    <FormGroup className="mb-0">
                                                        <Label htmlFor="items" className="form-label">
                                                            Items-Quantity <span className="text-danger">*</span>
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
                                                            disabled={!formData.grnNumber}
                                                            className="form-control"
                                                            style={{
                                                                height: "100px",
                                                                fontSize: "0.95rem",
                                                                opacity: !formData.grnNumber ? "0.6" : "1",
                                                                cursor: formData.grnNumber ? "pointer" : "not-allowed"
                                                            }}
                                                        >
                                                            <option value="GL-10001 Cylinder Type A - 10">GL-10001 Cylinder Type A - 10</option>
                                                            <option value="GL-10002 Cylinder Type B - 20">GL-10002 Cylinder Type B - 20</option>
                                                            <option value="GL-10003 Safety Valve - 15">GL-10003 Safety Valve - 15</option>
                                                            <option value="GL-10004 Pressure Gauge - 5">GL-10004 Pressure Gauge - 5</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* Row 2: Date, Department, Consumer, Description */}
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
                                                        <Label htmlFor="department" className="form-label">
                                                            Department <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            id="department"
                                                            name="department"
                                                            value={formData.department}
                                                            onChange={handleInputChange}
                                                            className="form-control"
                                                            style={{ height: "38px", fontSize: "0.95rem" }}
                                                        >
                                                            <option value="">Select Department</option>
                                                            <option value="Production">Production</option>
                                                            <option value="Maintenance">Maintenance</option>
                                                            <option value="Quality Control">Quality Control</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="3">
                                                    <FormGroup className="mb-0">
                                                        <Label htmlFor="consumer" className="form-label">
                                                            Consumer <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            id="consumer"
                                                            name="consumer"
                                                            value={formData.consumer}
                                                            onChange={handleInputChange}
                                                            className="form-control"
                                                            style={{ height: "38px", fontSize: "0.95rem" }}
                                                        >
                                                            <option value="">Select Consumer</option>
                                                            <option value="John Doe">John Doe</option>
                                                            <option value="Jane Smith">Jane Smith</option>
                                                            <option value="Mike Johnson">Mike Johnson</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="3">
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
                                                            placeholder="Usage / consumption remarks"
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

export default EditWarehouseDirect;
