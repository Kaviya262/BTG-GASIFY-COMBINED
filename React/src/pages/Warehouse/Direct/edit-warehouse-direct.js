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
        drNumber: "DR000001",
        grnNumber: [],
        date: "",
        items: [],
        department: "",
        consumer: "",
        description: "",
    });
    const [gridRows, setGridRows] = useState([]);

    useEffect(() => {
        if (location.state && location.state.directData) {
            const directData = location.state.directData;
            setFormData({
                id: directData.id,
                drNumber: directData.drNumber || "DR000001",
                grnNumber: Array.isArray(directData.grnNumber) ? directData.grnNumber : (directData.grnNumber ? [directData.grnNumber] : []),
                date: directData.date || "",
                items: Array.isArray(directData.items) ? directData.items : (directData.items ? [directData.items] : []),
                department: directData.department || "",
                consumer: directData.consumer || "",
                description: directData.description || "",
            });
        }
        document.title = "Direct Allocation | BTG Gas & Dashboard Template";
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
        if (!formData.grnNumber || formData.grnNumber.length === 0) {
            toast.error("At least one GRN Number is required");
            return;
        }
        if (gridRows.length === 0) {
            toast.error("Please add at least one GRN-item row in the grid");
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

    const addToGrid = () => {
        const selectedGrns = Array.isArray(formData.grnNumber) ? formData.grnNumber : (formData.grnNumber ? [formData.grnNumber] : []);
        const selectedItems = Array.isArray(formData.items) ? formData.items : (formData.items ? [formData.items] : []);
        if (selectedGrns.length === 0) {
            toast.error("Select at least one GRN to add");
            return;
        }
        if (selectedItems.length === 0) {
            toast.error("Select at least one Item to add");
            return;
        }

        const newRows = [];
        selectedGrns.forEach((g) => {
            selectedItems.forEach((it) => {
                newRows.push({ id: `${g}__${it}`, grnNumber: g, item: it, qty: 1 });
            });
        });

        setGridRows((prev) => {
            const map = {};
            prev.forEach(r => { map[r.id] = r; });
            newRows.forEach(r => { map[r.id] = r; });
            return Object.values(map);
        });

        setFormData(prev => ({ ...prev, items: [] }));
    };

    const removeGridRow = (id) => {
        setGridRows(prev => prev.filter(r => r.id !== id));
    };

    const updateGridQty = (id, value) => {
        setGridRows(prev => prev.map(r => r.id === id ? { ...r, qty: value } : r));
    };

    const handleCancel = () => {
        history.push("/warehouse-direct");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Warehouse" breadcrumbItem="Direct Allocation" />

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
                                            {/* Row 1: Auto-Number, Date, Department, Consumer */}
                                            <Row className="mb-3">
                                                <Col lg="3">
                                                    <FormGroup className="mb-0">
                                                        <Label htmlFor="drNumber" className="form-label">
                                                            DR Number <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            id="drNumber"
                                                            name="drNumber"
                                                            value={formData.drNumber}
                                                            readOnly
                                                            className="form-control bg-light"
                                                            placeholder="DR000001"
                                                            style={{ height: "38px", fontSize: "0.95rem" }}
                                                        />
                                                    </FormGroup>
                                                </Col>
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
                                            </Row>

                                            {/* Row 2: Description only */}
                                            <Row className="mb-3">
                                                <Col lg="12">
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
                                                            rows="2"
                                                            style={{ fontSize: "0.95rem", resize: "none" }}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* Row 3: GRN (multi), Items (multi), Qty + Add */}
                                            <Row className="mb-3">
                                                <Col lg="4">
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
                                                            multiple
                                                            className="form-control"
                                                            style={{ height: "100px", fontSize: "0.95rem" }}
                                                        >
                                                            <option value="GRN0000001">GRN0000001</option>
                                                            <option value="GRN0000002">GRN0000002</option>
                                                            <option value="GRN0000003">GRN0000003</option>
                                                            <option value="GRN0000004">GRN0000004</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="4">
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
                                                            className="form-control"
                                                            style={{ height: "100px", fontSize: "0.95rem" }}
                                                        >
                                                            <option value="GL-10001 Bolt">GL-10001 Bolt</option>
                                                            <option value="GL-10002 Safety Valve">GL-10002 Safety Valve</option>
                                                            <option value="GL-10003 Pressure Gauge">GL-10003 Pressure Gauge</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="4" className="d-flex align-items-center">
                                                    <Button color="secondary" onClick={addToGrid} style={{ height: "38px", width: "50%" }}>
                                                        Add
                                                    </Button>
                                                </Col>
                                            </Row>

                                            {/* Grid: GRN | Item | Qty */}
                                            <Row className="mb-3">
                                                <Col lg="12">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr>
                                                                    <th>GRN Number</th>
                                                                    <th>Item</th>
                                                                    <th style={{ width: "140px" }}>Quantity</th>
                                                                    <th style={{ width: "80px" }}></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {gridRows.length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan="4" className="text-center text-muted">No items added yet</td>
                                                                    </tr>
                                                                ) : (
                                                                    gridRows.map((r) => (
                                                                        <tr key={r.id}>
                                                                            <td>{r.grnNumber}</td>
                                                                            <td>{r.item}</td>
                                                                            <td>
                                                                                <Input type="number" value={r.qty} onChange={(e) => updateGridQty(r.id, e.target.value)} style={{ height: "36px" }} />
                                                                            </td>
                                                                            <td className="text-center">
                                                                                <span onClick={() => removeGridRow(r.id)} style={{ cursor: "pointer", color: "#dc3545" }} title="Delete">
                                                                                    <i className="bx bx-trash" style={{ fontSize: "1.3rem" }}></i>
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </Col>
                                            </Row>

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
