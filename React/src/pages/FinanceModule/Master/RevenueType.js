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
    <div className="page-title-box  d-sm-flex align-items-center justify-content-between">
        <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
        <div className="page-title-right">
            <ol className="breadcrumb m-0">
                <li className="breadcrumb-item"><a href="/#">{title}</a></li>
                <li className="breadcrumb-item active"><a href="/#">{breadcrumbItem}</a></li>
            </ol>
        </div>
    </div>
);

const RevenueType = () => {
    const [formData, setFormData] = useState({
        systemNumber: "",
        revenueType: "",
    });
    const [revenueList, setRevenueList] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAdd = () => {
        if (!formData.revenueType) return;
        const newEntry = {
            id: Date.now(),
            systemNumber: formData.systemNumber || `REV-${revenueList.length + 1}`,
            revenueType: formData.revenueType,
            isActive: true,
            createdBy: "Admin",
            createdDate: new Date().toLocaleDateString(),
            modifiedBy: "Admin",
            modifiedDate: new Date().toLocaleDateString(),
        };
        setRevenueList([...revenueList, newEntry]);
        setFormData({ systemNumber: "", revenueType: "" });
    };

    const toggleActive = (id) => {
        setRevenueList(revenueList.map(item =>
            item.id === id ? { ...item, isActive: !item.isActive } : item
        ));
    };

    return (
        <React.Fragment>
            <div className="sidebar">&nbsp;</div>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Revenue Type" />
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
                                                    placeholder="Auto / Manual"
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="3">
                                            <FormGroup>
                                                <Label>Revenue Type</Label>
                                                <Input
                                                    type="text"
                                                    name="revenueType"
                                                    value={formData.revenueType}
                                                    onChange={handleChange}
                                                    placeholder="Enter Revenue Type"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Button color="primary" onClick={handleAdd}>
                                        Add Revenue Type
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

export default RevenueType;
