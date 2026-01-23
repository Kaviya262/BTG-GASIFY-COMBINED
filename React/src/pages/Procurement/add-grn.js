import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Label,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useHistory } from "react-router-dom";

const AddGRN = () => {
  const history = useHistory();
  const [successmsg, setSuccessmsg] = useState("");
  const [errormsg, setErrormsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    poNo: "",
    supplier: "",
    grnNo: "",
    grnDate: null,
    doNo: "",
    doDate: null,
    invNo: "",
    invDate: null,
  };

  const itemsData = [
    {
      itemType: "GS",
      itemDescription:
        "Japan BBB Neriki HW w/o Safety Device, Inlet 25E Outlet BS#3 WP:200B, Model:G-1 IN-337-1",
      itemCode: "CV-0001",
      dept: "Str",
      uom: "Pc",
      poQty: 150,
      alRecQty: 100,
      balQty: 50,
      actRecQty: "",
      cntrNo: "",
    },
    {
      itemType: "PRJ",
      itemDescription:
        "BBB HW Type CO2+EO (Fumigas) Valve c/w Safety Device, Inlet 25E Outlet DIN 477 No.1, WP:200B, Model:G-1 IN-407-3",
      itemCode: "CV-0002",
      dept: "Eng",
      uom: "Pc",
      poQty: 1200,
      alRecQty: 1000,
      balQty: 200,
      actRecQty: "",
      cntrNo: "",
    },
    {
      itemType: "PRJ",
      itemDescription:
        "Explosion Proof Weighing Scale - Size:500mmx500mmx150mm(H), Model ADPW200-B, Capacity: 150kg x 0.01 kg, Class: Ex Ia II",
      itemCode: "MAC-0001",
      dept: "Eng",
      uom: "Unit",
      poQty: 4,
      alRecQty: 0,
      balQty: 4,
      actRecQty: "",
      cntrNo: "",
    },
    {
      itemType: "PRJ",
      itemDescription:
        'BE-10 Water Softener, 1" Inlet/Outlet F65/69 Multiport Controller',
      itemCode: "BG-0001",
      dept: "Eng",
      uom: "Unit",
      poQty: 1,
      alRecQty: 1,
      balQty: 0,
      actRecQty: "",
      cntrNo: "",
    },
  ];

  const [items, setItems] = useState(itemsData);

  const handleInputChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const validationSchema = Yup.object().shape({
    poNo: Yup.string().required("PO No. is required"),
    supplier: Yup.string().required("Supplier is required"),
    grnNo: Yup.string().required("GRN No. is required"),
    grnDate: Yup.date().required("GRN Date is required"),
    doNo: Yup.string().required("DO No. is required"),
    doDate: Yup.date().required("DO Date is required"),
    invNo: Yup.string().required("Invoice No. is required"),
    invDate: Yup.date().required("Invoice Date is required"),
  });

  const handleCancel = () => {
    history.push("/manage-grn");
  };

  const handleSubmit = (values, { setSubmitting }) => {
    setIsSubmitting(true);
    // Combine form data + items table data here before submitting
    const payload = {
      ...values,
      items,
    };
    console.log("Form submitted:", payload);

    setTimeout(() => {
      setSuccessmsg("GRN successfully submitted.");
      setErrormsg("");
      setSubmitting(false);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Procurement" breadcrumbItem="Add GRN" />
        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, setFieldValue, handleSubmit }) => (
                    <Form onSubmit={handleSubmit}>
                      <div className="row align-items-center g-3 justify-content-end mb-3">
                        <div className="col-md-12 button-items d-flex gap-2 justify-content-end">

                          <button
                            type="button"
                            className="btn btn-info"
                            onClick={() => alert("Save clicked!")}
                          >
                            <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleCancel}
                          >
                            <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                            Cancel
                          </button>

                        </div>
                      </div>

                      <Row className="mb-3">
                        <Col md="4">
                          <FormGroup>
                            <Label>PO No.</Label>
                            <Field
                              as="select"
                              name="poNo"
                              className={`form-select ${errors.poNo && touched.poNo ? "is-invalid" : ""
                                }`}
                            >
                              <option value="">Choose...</option>
                              <option value="1523">1523</option>
                              <option value="123">123</option>
                            </Field>
                            {errors.poNo && touched.poNo && (
                              <div className="text-danger">{errors.poNo}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Supplier</Label>
                            <Field
                              as="select"
                              name="supplier"
                              className={`form-select ${errors.supplier && touched.supplier
                                ? "is-invalid"
                                : ""
                                }`}
                            >
                              <option value="">Choose...</option>
                              <option value="Local">Local</option>
                              <option value="Overseas">Overseas</option>
                            </Field>
                            {errors.supplier && touched.supplier && (
                              <div className="text-danger">{errors.supplier}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>GRN No.</Label>
                            <Field
                              name="grnNo"
                              className={`form-control ${errors.grnNo && touched.grnNo ? "is-invalid" : ""
                                }`}
                            />
                            {errors.grnNo && touched.grnNo && (
                              <div className="text-danger">{errors.grnNo}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>GRN Date</Label>
                            <Flatpickr
                              name="grnDate"
                              className="form-control"
                              value={values.grnDate}
                              onChange={(date) => setFieldValue("grnDate", date[0])}
                              options={{
                                altInput: true,
                                altFormat: "d-M-Y",
                                dateFormat: "Y-m-d",
                              }}
                            />
                            {errors.grnDate && touched.grnDate && (
                              <div className="text-danger">{errors.grnDate}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>DO No.</Label>
                            <Field
                              name="doNo"
                              className={`form-control ${errors.doNo && touched.doNo ? "is-invalid" : ""
                                }`}
                            />
                            {errors.doNo && touched.doNo && (
                              <div className="text-danger">{errors.doNo}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>DO Date</Label>
                            <Flatpickr
                              name="doDate"
                              className="form-control"
                              value={values.doDate}
                              onChange={(date) => setFieldValue("doDate", date[0])}
                              options={{
                                altInput: true,
                                altFormat: "d-M-Y",
                                dateFormat: "Y-m-d",
                              }}
                            />
                            {errors.doDate && touched.doDate && (
                              <div className="text-danger">{errors.doDate}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Inv. No.</Label>
                            <Field
                              name="invNo"
                              className={`form-control ${errors.invNo && touched.invNo ? "is-invalid" : ""
                                }`}
                            />
                            {errors.invNo && touched.invNo && (
                              <div className="text-danger">{errors.invNo}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label>Invoice Date</Label>
                            <Flatpickr
                              name="invDate"
                              className="form-control"
                              value={values.invDate}
                              onChange={(date) => setFieldValue("invDate", date[0])}
                              options={{
                                altInput: true,
                                altFormat: "d-M-Y",
                                dateFormat: "Y-m-d",
                              }}
                            />
                            {errors.invDate && touched.invDate && (
                              <div className="text-danger">{errors.invDate}</div>
                            )}
                          </FormGroup>
                        </Col>
                      </Row>

                      <div className="table-responsive">
                        <table className="table table-bordered table-hover table-sm">
                          <thead>
                            <tr>
                              <th>S.No.</th>
                              <th>Item Type</th>
                              <th>Item Description</th>
                              <th>Item Code</th>
                              <th>Dept</th>
                              <th>UOM</th>
                              <th>PO Qty</th>
                              <th>Al Rec Qty</th>
                              <th>Bal Qty</th>
                              <th>Act Rec Qty</th>
                              <th>Cntr No.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td> {/* Serial Number */}
                                <td>{item.itemType}</td>
                                <td>{item.itemDescription}</td>
                                <td>{item.itemCode}</td>
                                <td>{item.dept}</td>
                                <td>{item.uom}</td>
                                <td>{item.poQty}</td>
                                <td>{item.alRecQty}</td>
                                <td>{item.balQty}</td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={item.actRecQty}
                                    onChange={(e) =>
                                      handleInputChange(index, "actRecQty", e.target.value)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={item.cntrNo}
                                    onChange={(e) =>
                                      handleInputChange(index, "cntrNo", e.target.value)
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                      </div>
                      {successmsg && (
                        <div className="alert alert-success mt-3">{successmsg}</div>
                      )}
                      {errormsg && (
                        <div className="alert alert-danger mt-3">{errormsg}</div>
                      )}
                    </Form>
                  )}
                </Formik>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddGRN;
