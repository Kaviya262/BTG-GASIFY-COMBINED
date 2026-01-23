import React from "react";
import Select from "react-select";
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Label, Input } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "react-datepicker/dist/react-datepicker.css";

const validationSchema = Yup.object().shape({
    uomCode: Yup.string().required("UOM Code is required"),
});

const AddUnit = () => {
    const handleSubmit = (values) => {
        console.log("Submitted Data:", values);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Add Unit" />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <Formik
                                        initialValues={{
                                            uomCode: "",
                                            uomDescription: "",
                                        }}
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                    >
                                        {({ setFieldValue, values }) => (
                                            <Form>
                                                <div className="row align-items-center g-3 justify-content-end"> 
                                                    <div className="col-md-12 button-items"> 
                                                        <button type="button" className="btn btn-danger fa-pull-right"><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                                        <button type="submit" className="btn btn-info fa-pull-right" ><i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>Save</button>
                                                    </div>
                                                </div>
                                                <Row>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label>UOM Code</Label>
                                                            <Field name="uomCode" className="form-control" />
                                                            <ErrorMessage name="uomCode" component="div" className="text-danger" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label>UOM Description</Label>
                                                            <Field
                                                                name="uomDescription"
                                                                as="textarea"
                                                                className="form-control"
                                                            />
                                                            <ErrorMessage name="uomDescription" component="div" className="text-danger" />
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

export default AddUnit;
