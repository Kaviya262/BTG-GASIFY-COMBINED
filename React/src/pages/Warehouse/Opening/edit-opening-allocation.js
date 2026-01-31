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

const EditOpeningAllocation = () => {
    const history = useHistory();
    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: id,
        autoNumber: "00001",
        items: "",
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

    // Initialize with data from location state or API
    useEffect(() => {
        const openingData = location.state?.openingData;
        if (openingData) {
            setFormData({
                id: openingData.id,
                autoNumber: openingData.autoNumber || "00001",
                items: openingData.description || "",
                date: openingData.date || "",
                description: openingData.description || "",
                floor: openingData.floor || "",
                positionRack: openingData.positionRack || "",
                rackNumber: openingData.rackNumber || "",
                height: openingData.height || "",
                barcode: openingData.barcode || "",
                quantity: openingData.quantity || "",
                shelfNumber: openingData.shelfNumber || "",
                finalName: openingData.finalName || "",
            });
        }
        document.title = "Opening Allocation | BTG Gas & Dashboard Template";
    }, [location]);

    const generateShelfNumber = (floor, position, rack, height) => {
        const positionMap = { Left: "L", Right: "R", Middle: "M" };
        const heightMap = { Bottom: "B", Middle: "M", Top: "T" };
        
        if (floor && position && rack && height) {
            return `F${floor}${positionMap[position]}${rack}${heightMap[height]}`;
        }
        return "";
    };

    const generateBarcode = () => {
        // Generate a simple barcode
        const barcode = "BAR" + Date.now().toString().slice(-6);
        const newShelfNumber = generateShelfNumber(
            formData.floor,
            formData.positionRack,
            formData.rackNumber,
            formData.height
        );
        const newFinalName = formData.items && newShelfNumber ? `${formData.items} - ${newShelfNumber}` : "";
        
        setFormData((prev) => ({
            ...prev,
            barcode: barcode,
            shelfNumber: newShelfNumber,
            finalName: newFinalName,
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedData = {
            ...formData,
            [name]: value,
        };

        // Auto-generate shelf number when location fields change
        if (["floor", "positionRack", "rackNumber", "height"].includes(name)) {
            updatedData.shelfNumber = generateShelfNumber(
                updatedData.floor,
                updatedData.positionRack,
                updatedData.rackNumber,
                updatedData.height
            );
        }

        // Auto-generate final name when shelf number or items change
        if (["items", "shelfNumber"].includes(name) || ["floor", "positionRack", "rackNumber", "height"].includes(name)) {
            updatedData.finalName = updatedData.items && updatedData.shelfNumber
                ? `${updatedData.items} - ${updatedData.shelfNumber}`
                : "";
        }

        setFormData(updatedData);
    };

    const handleSave = () => {
        // Validate required fields
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
            // Here you would call your API to update the Opening allocation
            console.log("Saving Opening Allocation:", formData);
            toast.success("Opening Allocation saved successfully");
            setTimeout(() => {
                history.push("/warehouse-opening");
            }, 1000);
        } catch (error) {
            console.error("Error saving data:", error);
            toast.error("Failed to save Opening Allocation");
        } finally {
            setLoading(false);
        }
    };

    const handlePost = () => {
        // Validate required fields
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
            // Here you would call your API to post the Opening allocation
            console.log("Posting Opening Allocation:", formData);
            toast.success("Opening Allocation posted successfully");
            setTimeout(() => {
                history.push("/warehouse-opening");
            }, 1000);
        } catch (error) {
            console.error("Error posting data:", error);
            toast.error("Failed to post Opening Allocation");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        history.push("/warehouse-opening");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Warehouse" breadcrumbItem="Opening Allocation" />

                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    {/* Header with Buttons */}
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <CardTitle className="mb-0 h4">Opening Allocation Form</CardTitle>
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
                                            {/* Row 1: Auto-Number, Date, Items */}
                                            <Row className="mb-3">
                                                <Col lg="4">
                                                    <FormGroup>
                                                        <Label htmlFor="autoNumber" className="form-label">
                                                            Auto-Number <span className="text-danger">*</span>
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            id="autoNumber"
                                                            name="autoNumber"
                                                            value={formData.autoNumber}
                                                            disabled
                                                            className="form-control bg-light"
                                                            placeholder="00001"
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
                                            </Row>

                                            {/* Row 2: Floor, Position Rack, Rack Number */}
                                            <Row className="mb-3">
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
                                            </Row>

                                            {/* Row 3: Height, Description, Quantity */}
                                            <Row className="mb-3">
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
                                                            onChange={handleInputChange}
                                                            className="form-control"
                                                            placeholder="Enter quantity"
                                                            style={{ height: "38px", fontSize: "0.95rem" }}
                                                        />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* Row 4: Barcode, Shelf Number, Final Name */}
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

export default EditOpeningAllocation;
