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
    <div className="page-title-box   d-sm-flex align-items-center justify-content-between">
        <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
        <div className="page-title-right">
            <ol className="breadcrumb m-0">
                <li className="breadcrumb-item"><a href="/#">{title}</a></li>
                <li className="breadcrumb-item active"><a href="/#">{breadcrumbItem}</a></li>
            </ol>
        </div>
    </div>
);

const GLCode = () => {
    const [formData, setFormData] = useState({
        glCodeCategory: "",
        glCodeType: "",
        glCode: "",
        glDescription: "",
    });

    const [glList, setGlList] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAdd = () => {
        if (!formData.glCodeCategory || !formData.glCode) return;
        const newEntry = {
            id: Date.now(),
            glCodeCategory: formData.glCodeCategory,
            glCodeType: formData.glCodeType,
            glCode: formData.glCode,
            glDescription: formData.glDescription,
            isActive: true,
            createdBy: "Admin",
            createdDate: new Date().toLocaleDateString(),
            modifiedBy: "Admin",
            modifiedDate: new Date().toLocaleDateString(),
        };
        setGlList([...glList, newEntry]);
        setFormData({
            glCodeCategory: "",
            glCodeType: "",
            glCode: "",
            glDescription: "",
        });
    };

    const toggleActive = (id) => {
        setGlList(
            glList.map((item) =>
                item.id === id ? { ...item, isActive: !item.isActive } : item
            )
        );
    };

    return (
        <React.Fragment>
            <div className="sidebar">&nbsp;</div>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="GL Code" />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    {/* Form Section */}
                                    <Row className="mb-3">
                                        <Col md="3">
                                            <FormGroup>
                                                <Label>GL Code Category</Label>
                                                <Input
                                                    type="select"
                                                    name="glCodeCategory"
                                                    value={formData.glCodeCategory}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">-- Select Category --</option>
                                                    <option value="Revenue">Revenue</option>
                                                    <option value="Expense">Expense</option>
                                                    <option value="Asset">Asset</option>
                                                    <option value="Liability">Liability</option>
                                                    <option value="Equity">Equity</option>
                                                </Input>
                                            </FormGroup>
                                        </Col>

                                        <Col md="3">
                                            <FormGroup>
                                                <Label>GL Code Type</Label>
                                                <Input
                                                    type="select"
                                                    name="glCodeType"
                                                    value={formData.glCodeType}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">-- Select Type --</option>
                                                    <option value="Direct">Direct</option>
                                                    <option value="Indirect">Indirect</option>
                                                    <option value="Fixed">Fixed</option>
                                                    <option value="Current">Current</option>
                                                </Input>
                                            </FormGroup>
                                        </Col>

                                        <Col md="3">
                                            <FormGroup>
                                                <Label>GL Code</Label>
                                                <Input
                                                    type="text"
                                                    name="glCode"
                                                    value={formData.glCode}
                                                    onChange={handleChange}
                                                    placeholder="Enter GL Code"
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3">
                                            <FormGroup>
                                                <Label>GL Description</Label>
                                                <Input
                                                    type="text"
                                                    name="glDescription"
                                                    value={formData.glDescription}
                                                    onChange={handleChange}
                                                    placeholder="Enter GL Description"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Button color="primary" onClick={handleAdd}>
                                        Add GL Code
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

export default GLCode;
