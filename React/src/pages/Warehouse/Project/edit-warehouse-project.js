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

const EditWarehouseProject = () => {
    const history = useHistory();
    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: id,
        pjNumber: "PJ000001",
        date: "",
        projectNumber: "",
        description: "",
        grnNumber: [],
        glCodes: [],
        itemNames: [],
    });
    const [gridRows, setGridRows] = useState([]);

    useEffect(() => {
        if (location.state && location.state.projectData) {
            const projectData = location.state.projectData;
            setFormData({
                id: projectData.id,
                pjNumber: projectData.pjNumber || "PJ000001",
                date: projectData.date || "",
                projectNumber: projectData.projectNumber || "",
                description: projectData.description || "",
                grnNumber: Array.isArray(projectData.grnNumber) ? projectData.grnNumber : (projectData.grnNumber ? [projectData.grnNumber] : []),
                glCodes: Array.isArray(projectData.glCodes) ? projectData.glCodes : (projectData.glCodes ? [projectData.glCodes] : []),
                itemNames: Array.isArray(projectData.itemNames) ? projectData.itemNames : (projectData.itemNames ? [projectData.itemNames] : []),
            });
        }
        document.title = "Project Allocation | BTG Gas & Dashboard Template";
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

    const addToGrid = () => {
        const selectedGrns = Array.isArray(formData.grnNumber) ? formData.grnNumber : (formData.grnNumber ? [formData.grnNumber] : []);
        const selectedGlCodes = Array.isArray(formData.glCodes) ? formData.glCodes : (formData.glCodes ? [formData.glCodes] : []);
        const selectedItemNames = Array.isArray(formData.itemNames) ? formData.itemNames : (formData.itemNames ? [formData.itemNames] : []);

        if (selectedGrns.length === 0) {
            toast.error("Select at least one GRN to add");
            return;
        }
        if (selectedGlCodes.length === 0) {
            toast.error("Select at least one GL Code to add");
            return;
        }
        if (selectedItemNames.length === 0) {
            toast.error("Select at least one Item to add");
            return;
        }

        const newRows = [];
        selectedGrns.forEach((g) => {
            selectedGlCodes.forEach((gl) => {
                selectedItemNames.forEach((it) => {
                    newRows.push({ id: `${g}__${gl}__${it}`, grnNumber: g, glCode: gl, itemName: it, qty: 1 });
                });
            });
        });

        setGridRows((prev) => {
            const map = {};
            prev.forEach(r => { map[r.id] = r; });
            newRows.forEach(r => { map[r.id] = r; });
            return Object.values(map);
        });

        setFormData(prev => ({ ...prev, glCodes: [], itemNames: [] }));
    };

    const removeGridRow = (id) => {
        setGridRows(prev => prev.filter(r => r.id !== id));
    };

    const updateGridQty = (id, value) => {
        setGridRows(prev => prev.map(r => r.id === id ? { ...r, qty: value } : r));
    };

    const handleSave = () => {
        validateAndSubmit("Saved");
    };

    const handlePost = () => {
        validateAndSubmit("Posted");
    };

    const validateAndSubmit = (status) => {
        if (!formData.grnNumber || formData.grnNumber.length === 0) {
            toast.error("GRN Number is required");
            return;
        }
        if (!formData.projectNumber) {
            toast.error("Project Number is required");
            return;
        }
        if (gridRows.length === 0) {
            toast.error("Please add at least one GRN-item row in the grid");
            return;
        }

        setLoading(true);
        try {
            console.log(`${status} Project Allocation:`, formData, gridRows);
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

    const handleCancel = () => {
        history.push("/warehouse-project");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Warehouse" breadcrumbItem="Project Allocation" />

                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    {/* Header with Buttons */}
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <CardTitle className="mb-0 h4">Project Allocation Form</CardTitle>
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
                                            {/* Row 1: PJ Number, Date, Project Number */}
                                            <Row className="mb-3">
                                                <Col lg="4">
                                                    <FormGroup className="mb-0">
                                                        <Label htmlFor="pjNumber" className="form-label">
                                                            PJ Number <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            id="pjNumber"
                                                            name="pjNumber"
                                                            value={formData.pjNumber}
                                                            readOnly
                                                            className="form-control bg-light"
                                                            placeholder="PJ000001"
                                                            style={{ height: "38px", fontSize: "0.95rem" }}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="4">
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
                                                <Col lg="4">
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
                                                            placeholder="Allocation remarks"
                                                            rows="2"
                                                            style={{ fontSize: "0.95rem", resize: "none" }}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* Row 3: GRN (multi), Items (multi), Add */}
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
                                                <Col lg="3">
                                                    <FormGroup className="mb-0">
                                                        <Label htmlFor="glCodes" className="form-label">
                                                            GL Codes <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            id="glCodes"
                                                            name="glCodes"
                                                            value={formData.glCodes}
                                                            onChange={handleInputChange}
                                                            multiple
                                                            className="form-control"
                                                            style={{ height: "100px", fontSize: "0.95rem" }}
                                                        >
                                                            <option value="GL-10001">GL-10001</option>
                                                            <option value="GL-10002">GL-10002</option>
                                                            <option value="GL-10003">GL-10003</option>
                                                            <option value="GL-10004">GL-10004</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="3">
                                                    <FormGroup className="mb-0">
                                                        <Label htmlFor="itemNames" className="form-label">
                                                            Items <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="select"
                                                            id="itemNames"
                                                            name="itemNames"
                                                            value={formData.itemNames}
                                                            onChange={handleInputChange}
                                                            multiple
                                                            className="form-control"
                                                            style={{ height: "100px", fontSize: "0.95rem" }}
                                                        >
                                                            <option value="Bolt">Bolt</option>
                                                            <option value="Safety Valve">Safety Valve</option>
                                                            <option value="Pressure Gauge">Pressure Gauge</option>
                                                            <option value="Cylinder Type A">Cylinder Type A</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                                <Col lg="2" className="d-flex align-items-center">
                                                    <Button color="secondary" onClick={addToGrid} style={{ height: "38px", width: "100%" }}>
                                                        Add Items
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
                                                                    <th>GL Code</th>
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
                                                                            <td>{r.glCode}</td>
                                                                            <td>{r.itemName}</td>
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

export default EditWarehouseProject;
