import React from "react";
import { Container, Row, Col, Card, CardBody, FormGroup, Label, Button } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    paymentTermCode: Yup.string().required("Payment Term Code is required"),
});

const AddPaymentTerm = () => {
    const handleSubmit = (values) => {
        console.log("Submitted Data:", values);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Add Payment Term" />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <Formik
                                        initialValues={{
                                            paymentTermCode: "",
                                            paymentTermDescription: "",
                                            dueDateCalculation: "",
                                        }}
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                    >
                                        {({ values }) => (
                                            <Form>
                                                <div className="row align-items-center g-3 justify-content-end"> 
                                                    <div className="col-md-12 button-items"> 
                                                        <Button type="button" color="danger" className="fa-pull-right">
                                                            <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel
                                                        </Button>
                                                        <Button type="submit" color="info" className="fa-pull-right">
                                                            <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>Save
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Row>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label>Payment Term Code *</Label>
                                                            <Field name="paymentTermCode" className="form-control" />
                                                            <ErrorMessage name="paymentTermCode" component="div" className="text-danger" />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label>Payment Term Description</Label>
                                                            <Field name="paymentTermDescription" as="textarea" className="form-control" />
                                                            <ErrorMessage name="paymentTermDescription" component="div" className="text-danger" />
                                                        </FormGroup>
                                                    </Col>                                                   
                                                </Row>
                                                <Row>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label>Payment Term Due Date Calculation</Label>
                                                            <Field name="dueDateCalculation" className="form-control" />
                                                            <ErrorMessage name="dueDateCalculation" component="div" className="text-danger" />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        )}
                                    </Formik>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default AddPaymentTerm;