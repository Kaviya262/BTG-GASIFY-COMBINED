import React, { useState } from "react";
import {
    Card,
    CardBody,
    Col,
    Container,
    Row,
    Button,
    FormGroup,
    Label,
    Input,
    Table,
} from "reactstrap";

const Breadcrumbs = ({ title, breadcrumbItem }) => (
    <div className="page-title-box d-sm-flex align-items-center justify-content-between">
        <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
        <div className="page-title-right">
            <ol className="breadcrumb m-0">
                <li className="breadcrumb-item"><a href="/#">{title}</a></li>
                <li className="breadcrumb-item active"><a href="/#">{breadcrumbItem}</a></li>
            </ol>
        </div>
    </div>
);

const AssetType = () => {
    const [formData, setFormData] = useState({
        systemNumber: "",
        assetType: "",
        assetName: "",
    });
    const [assetList, setAssetList] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAdd = () => {
        if (!formData.assetType || !formData.assetName) return;
        const newEntry = {
            id: Date.now(),
            systemNumber: formData.systemNumber || `SYS-${assetList.length + 1}`,
            assetType: formData.assetType,
            assetName: formData.assetName,
            isActive: true,
            createdBy: "Admin",
            createdDate: new Date().toLocaleDateString(),
            modifiedBy: "Admin",
            modifiedDate: new Date().toLocaleDateString(),
        };
        setAssetList([...assetList, newEntry]);
        setFormData({ systemNumber: "", assetType: "", assetName: "" });
    };

    const toggleActive = (id) => {
        setAssetList(assetList.map(item =>
            item.id === id ? { ...item, isActive: !item.isActive } : item
        ));
    };

    return (
        <React.Fragment>
            <div className="sidebar">&nbsp;</div>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Asset Type" />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    {/* Form Section */}
                                    <Row className="mb-3">
                                        <Col md="3">
                                            <FormGroup>
                                                <Label>System Generated Number</Label>
                                                <Input
                                                    type="text"
                                                    name="systemNumber"
                                                    value={formData.systemNumber}
                                                    onChange={handleChange}
                                                    placeholder="000SER001"
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3">
                                            <FormGroup>
                                                <Label>Asset Type</Label>
                                                <Input
                                                    type="select"
                                                    name="assetType"
                                                    value={formData.assetType}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">-- Select Asset Type --</option>
                                                    <option value="Vehicle">Type 1</option>
                                                    <option value="Building">Type 2</option>
                                                    <option value="Furniture">Type 3</option>
                                                   
                                                </Input>
                                            </FormGroup>

                                        </Col>
                                        <Col md="3">
                                            <FormGroup>
                                                <Label>Asset Name</Label>
                                                <Input
                                                    type="text"
                                                    name="assetName"
                                                    value={formData.assetName}
                                                    onChange={handleChange}
                                                    placeholder="Enter Asset Name"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Button color="primary" onClick={handleAdd}>
                                        Add Asset Type
                                    </Button>

                                  
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default AssetType;
