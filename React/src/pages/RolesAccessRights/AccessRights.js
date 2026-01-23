import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
  Input,
  Label,
  FormGroup
} from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "components/Common/Breadcrumb";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { useHistory } from "react-router-dom";

const AddAccessForm = () => {
    const history = useHistory();   

    const initialValues = {
    role: "",              
    department: "",        
    effectiveDate: null,   
    isHOD: false,          
    modules: [
        {
        moduleName: "User Management",
        screens: [
            {
            screenName: "Users",
            permissions: {
                view: true,
                edit: false,
                delete: false,
                post: true,
                save: true,
                print: false,
                viewRate: true,
                sendMail: false,
                viewDetails: true,
                recordsPerPage: 10,
            },
            },
            {
            screenName: "Roles",
            permissions: {
                view: true,
                edit: true,
                delete: false,
                post: false,
                save: true,
                print: true,
                viewRate: false,
                sendMail: true,
                viewDetails: true,
                recordsPerPage: 20,
            },
            },
        ],
        },
        {
        moduleName: "Reports",
        screens: [
            {
            screenName: "Sales Report",
            permissions: {
                view: true,
                edit: false,
                delete: false,
                post: true,
                save: false,
                print: true,
                viewRate: true,
                sendMail: true,
                viewDetails: false,
                recordsPerPage: 15,
            },
            },
            {
            screenName: "Inventory Report",
            permissions: {
                view: true,
                edit: false,
                delete: false,
                post: false,
                save: false,
                print: true,
                viewRate: false,
                sendMail: false,
                viewDetails: true,
                recordsPerPage: 25,
            },
            },
        ],
        },
    ],
    };


    const validationSchema = Yup.object().shape({
    role: Yup.string().nullable().required("Role is required"),
    department: Yup.string().nullable().required("Department is required"),
    effectiveDate: Yup.date().nullable().required("Effective Date is required"),
    //   userName: Yup.string().required("User Name is required"),
    // HOD is optional, so no validation needed
    });

    const handleSubmit = (values) => {
        console.log("Form submitted:", values);
        // your save logic here
    };

  const [accordionOpen, setAccordionOpen] = useState("");

  const toggleAccordion = (id) => {
    setAccordionOpen(accordionOpen === id ? "" : id);
  };

  const handleCancel = () => {
    history.push("/admin-roles");
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Access Hub" breadcrumbItem="Access Hub" />
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <Formik initialValues={initialValues} validationSchema={validationSchema}   onSubmit={(values) => handleSubmit(values)}>
                    {({ values, setFieldValue }) => (
                      <Form>
                        <div className="row align-items-center g-3 justify-content-end">
                            <div className="col-md-12 button-items">
                                <button type="button" className="btn btn-danger fa-pull-right" onClick={handleCancel}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                
                                <button type="submit" className="btn btn-info fa-pull-right"><i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>Save</button>
                            </div>
                        </div>
                        <Row>
                            {/* Role Select */}
                            <Col md="3">
                                <FormGroup>
                                <Label>Role</Label>
                                <Select
                                    name="role"
                                    value={values.role ? { label: values.role, value: values.role } : null}
                                    options={[
                                    { value: "Admin", label: "Admin" },
                                    { value: "Manager", label: "Manager" },
                                    { value: "User", label: "User" }
                                    ]}
                                    onChange={(option) => setFieldValue("role", option ? option.value : "")}
                                    isClearable
                                />
                                <ErrorMessage name="role" component="div" className="text-danger" />
                                </FormGroup>
                            </Col>

                            {/* Department Select */}
                            <Col md="3">
                                <FormGroup>
                                <Label>Department</Label>
                                <Select
                                    name="department"
                                    value={values.department ? { label: values.department, value: values.department } : null}
                                    options={[
                                    { value: "IT", label: "IT" },
                                    { value: "Finance", label: "Finance" },
                                    { value: "Purchase", label: "Purchase" }
                                    ]}
                                    onChange={(option) => setFieldValue("department", option ? option.value : "")}
                                    isClearable
                                />
                                <ErrorMessage name="department" component="div" className="text-danger" />
                                </FormGroup>
                            </Col>

                            {/* Effective Date Picker */}
                            <Col md="3">
                                <FormGroup>
                                <Label>Effective Date</Label>
                                <Flatpickr
                                    name="effectiveDate"
                                    className="form-control"
                                    value={values.effectiveDate || null}
                                    onChange={(date) => setFieldValue("effectiveDate", date[0])}
                                    options={{
                                    altInput: true,
                                    altFormat: "d-M-Y",
                                    dateFormat: "Y-m-d",
                                    }}
                                />
                                <ErrorMessage name="effectiveDate" component="div" className="text-danger" />
                                </FormGroup>
                            </Col>

                            {/* HOD Checkbox */}
                            <Col md="3" className="d-flex align-items-center">
                                <FormGroup check>
                                <Label check>
                                    <Field type="checkbox" name="isHOD" />
                                    {" "}HOD
                                </Label>
                                </FormGroup>
                            </Col>
                            </Row>                   

                        {/* Modules Accordion */}
                        <Row className="mt-4">
                        <Col>
                            <Accordion open={accordionOpen} toggle={toggleAccordion}>
                            {values.modules.map((module, moduleIndex) => (
                                <AccordionItem key={moduleIndex} className="mb-3 border">
                                <AccordionHeader
                                    targetId={moduleIndex.toString()}
                                    className={`fw-bold ${accordionOpen === moduleIndex.toString() ? "bg-primary text-white" : "bg-light text-dark"}`}
                                >
                                    {module.moduleName}
                                </AccordionHeader>
                                <AccordionBody accordionId={moduleIndex.toString()}>
                                    
                                    <div className="table-responsive">
                                    <table className="table table-hover table-bordered align-middle text-center">
                                        <thead className="table-primary">
                                        {/* First Header Row: Labels */}
                                        <tr>
                                            <th className="text-start">Screen</th>
                                            {Object.keys(module.screens[0].permissions)
                                            .filter((permKey) => permKey !== "recordsPerPage")
                                            .map((permKey) => {
                                                const label = permKey
                                                .replace(/([A-Z])/g, " $1") // split camelCase
                                                .trim()
                                                .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word
                                                return <th key={permKey}>{label}</th>;
                                            })}
                                            <th>Records Count</th>
                                        </tr>

                                        {/* Second Header Row: Bulk Checkboxes */}
                                        <tr>
                                            <th className="text-start">
                                            <div className="form-check">
                                                <Input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={module.screens.every((screen) =>
                                                    Object.keys(screen.permissions).every((permKey) =>
                                                    permKey === "recordsPerPage" ? true : screen.permissions[permKey]
                                                    )
                                                )}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    module.screens.forEach((screen, screenIndex) => {
                                                    Object.keys(screen.permissions).forEach((permKey) => {
                                                        if (permKey !== "recordsPerPage") {
                                                        setFieldValue(
                                                            `modules.${moduleIndex}.screens.${screenIndex}.permissions.${permKey}`,
                                                            checked
                                                        );
                                                        }
                                                    });
                                                    });
                                                }}
                                                />
                                                <Label className="form-check-label ms-2 small fw-bold">
                                                Select All
                                                </Label>
                                            </div>
                                            </th>
                                            {Object.keys(module.screens[0].permissions)
                                            .filter((permKey) => permKey !== "recordsPerPage")
                                            .map((permKey) => (
                                                <th key={permKey}>
                                                <Input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={module.screens.every(
                                                    (screen) => screen.permissions[permKey]
                                                    )}
                                                    onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    module.screens.forEach((screen, screenIndex) => {
                                                        setFieldValue(
                                                        `modules.${moduleIndex}.screens.${screenIndex}.permissions.${permKey}`,
                                                        checked
                                                        );
                                                    });
                                                    }}
                                                />
                                                </th>
                                            ))}
                                            <th>-</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {module.screens.map((screen, screenIndex) => (
                                            <tr key={screenIndex}>
                                            <td className="text-start fw-semibold">{screen.screenName}</td>
                                            {Object.keys(screen.permissions).map((permKey) => {
                                                if (permKey !== "recordsPerPage") {
                                                return (
                                                    <td key={permKey}>
                                                    <Input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={screen.permissions[permKey]}
                                                        onChange={() =>
                                                        setFieldValue(
                                                            `modules.${moduleIndex}.screens.${screenIndex}.permissions.${permKey}`,
                                                            !screen.permissions[permKey]
                                                        )
                                                        }
                                                    />
                                                    </td>
                                                );
                                                }
                                                return null;
                                            })}
                                            <td>
                                                <Field
                                                type="number"
                                                min="1"
                                                className="form-control text-center"
                                                name={`modules.${moduleIndex}.screens.${screenIndex}.permissions.recordsPerPage`}
                                                />
                                            </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    </div>
                                </AccordionBody>
                                </AccordionItem>
                            ))}
                            </Accordion>
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

export default AddAccessForm;
