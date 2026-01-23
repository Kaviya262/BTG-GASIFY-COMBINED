import React, { useState, useEffect, useCallback } from "react";
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
  Tooltip,
  Modal,
  ModalBody,
  UncontrolledAlert,
} from "reactstrap";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import {
  fetchSalesInvoiceCustomerList,
  fetchSalesInvoiceDOList,
  getPackingDetails,
} from "../../../common/data/mastersapi";
import {
  GetInvoiceDetails,
  CreatenewInvoice,
  GetInvoiceSNo,
  UpdateInvoice,
} from "../../../common/data/invoiceapi";

const animatedComponents = makeAnimated();

const AddInvoice = () => {
  const history = useHistory();
  const { id } = useParams();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const minDate = new Date(currentYear, 0, 1);
  const maxDate = new Date(currentYear, 11, 31);
  const [branchId] = useState(1);
  const [submitType, setSubmitType] = useState(1);
  const [iscustomerchange, setIscustomerchange] = useState(0);
  const [customerList, setCustomerList] = useState([]);
  const [deliveryOrdersList, setDeliveryOrdersList] = useState([]);
  const [packingDetails, setPackingDetails] = useState([]);
  const [doDetail, setDoDetail] = useState([]);
  const [tooltipOpen, setTooltipOpen] = useState({});
  const [errorMsg, setErrorMsg] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [invoiceHeader, SetInvoiceHeader] = useState({
    doid: [],
    id: 0,
    salesInvoiceNbr: 0,
    customerId: "",
    salesInvoiceDate: currentDate,
    totalAmount: 1,
    totalQty: 1,
    isSubmitted: 0,
    orgId: 1,
    branchId: 1,
    userId: 1,
  });
  const [totalQty, setTotalQty] = useState();
  const [totalPrice, setTotalPrice] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Fetch customer list on initial load
  useEffect(() => {
    const getCustomerList = async () => {
      try {
        const data = await fetchSalesInvoiceCustomerList(branchId);
        if (Array.isArray(data) && data.length > 0) {
          setCustomerList(data);
        } else {
          setCustomerList([]);
        }
      } catch (err) {
        console.error("Error fetching customer list:", err.message);
      }
    };
    getCustomerList();

    const getInvoicesno = async () => {
      try {
        const data = await GetInvoiceSNo(branchId, 0);
        SetInvoiceHeader(prev => ({
          ...prev,
          salesInvoiceNbr: String(data.salesinvoicenbr),
        }));
      } catch (err) {
        console.error("Error fetching customer list:", err.message);
      }
    };

    if (id) {
      getInvoiceDetails(id);
    } else {
      getInvoicesno();
    }
  }, [branchId]);

  // Fetch delivery orders based on customer selection
  useEffect(() => {
    if (!invoiceHeader?.customerId) return;

    const getDeliveryOrders = async () => {
      try {
        const data = await fetchSalesInvoiceDOList(
          branchId,
          invoiceHeader.customerId
        );
        setDeliveryOrdersList(data || []);
      } catch (err) {
        console.error("Error fetching delivery orders:", err.message);
      }
    };
    getDeliveryOrders();
  }, [invoiceHeader?.customerId]);

  useEffect(() => {
    console.log(deliveryOrdersList);
    console.log("doDetail", doDetail);
  }, [deliveryOrdersList]);

  useEffect(() => {
    setDoDetail([]);
  }, [iscustomerchange]);

  useEffect(() => {
    setPackingDetails([]);
  }, [doDetail]);

  const handleCustomerSelectChange = options => {
    SetInvoiceHeader(prev => ({
      ...prev,
      customerId: options ? options.value : "",
    }));
    setIscustomerchange(!iscustomerchange);
  };

  const handleDOSelectChange = options => {
    console.log(options);
    setPackingDetails([]);
    if (options.length === 0) {
      setPackingDetails([]);
    }
    debugger;
    const updatedOptions = options.map((item, index) => ({
      ...item,
      id: item.id || 0,
      salesInvoicesId: id || 0,
      packingId: item.value,
    }));
    setDoDetail(updatedOptions);
    SetInvoiceHeader(prev => ({
      ...prev,
      doid: updatedOptions,
    }));
    updatedOptions.forEach(async item => {
      const data = await getPackingDetails(item.doid, branchId);
      if (data) {
        setPackingDetails(prev => [...prev, ...data]);
      }
    });
  };

  const toggleTooltip = tid => {
    setTooltipOpen(prev => ({
      ...prev,
      [tid]: !prev[tid],
    }));
  };

  const validationSchema = Yup.object().shape({
    salesInvoiceDate: Yup.string().required("Invoice date is required"),
    customerId: Yup.string().required("Customer is required"),
    doid: Yup.array()
      .of(Yup.mixed().required("Invalid delivery order"))
      .min(1, "At least one delivery order is required")
      .required("Delivery Orders are required"),
  });

  const validateForm = () => {
    // Validate invoiceHeader
    if (
      !invoiceHeader ||
      !invoiceHeader.salesInvoiceNbr ||
      !invoiceHeader.customerId ||
      !invoiceHeader.salesInvoiceDate ||
      invoiceHeader.totalAmount <= 0 ||
      invoiceHeader.totalQty <= 0
    ) {
      setErrorMsg(["Invoice header details are incomplete or invalid."]);
      return false;
    }
    // Validate packingDetails
    if (!packingDetails || packingDetails.length === 0) {
      setErrorMsg(["Packing details are required."]);
      return false;
    }
    // Validate doDetail
    if (!doDetail || doDetail.length === 0) {
      setErrorMsg(["Delivery orders are required."]);
      return false;
    }

    return true;
  };

  const handleSubmit = async values => {
    if (!validateForm) {
      return true;
    }
    if (!packingDetails || packingDetails.length == 0) {
      setErrorMsg(["Packing details are required."]);
      return false;
    }

    if (submitType === 1) {  // Post only (not save)
      const invalidItems = packingDetails.filter(
        item =>
          Number(item.unitPrice) === 0 ||
          Number(item.totalPrice) === 0 ||
          Number(item.priceIDR) === 0
      );

      if (invalidItems.length > 0) {
        setErrorMsg(["Unit Price, Total Price and Price (IDR) should not be 0 while posting."]);
        return false;
      }
    }

    const headerdetails = {
      ...invoiceHeader,
      isSubmitted: submitType,
      ismanual: 0
    };
    const updatedPackingDetails = packingDetails.map(item => ({
      ...item,
      id: item.id || 0,
      salesInvoicesId: id || 0,
      sqid: item.sqid || 0,
      sqnbr: item.sqnbr || 0,
      DOnumber: item.deliveryNumber || 0,
    }));
    const finalPayload = {
      header: headerdetails,
      details: updatedPackingDetails,
      doDetail: doDetail,
    };

    setIsSubmitting(true);
    try {
      let response;
      if (id > 0) {
        response = await UpdateInvoice(finalPayload);
      } else {
        response = await CreatenewInvoice(finalPayload);
      }
      if (response?.status) {
        setErrorMsg([]);
        setSuccessStatus(true);
        setSuccessMsg(
          `Sales Invoice ${submitType === 0 ? "Saved" : "Posted"} Successfully!`
        );
        setTimeout(() => {
          history.push("/sales-invoices");
        }, 1000);
      } else {
        setErrorMsg([response?.message || "Please Fill the Required Field"]);
      }
    } catch (err) {
      console.error("Error creating/updating invoice:", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInvoiceDetails = async id => {
    try {
      const data = await GetInvoiceDetails(id);
      const header = data.Header;
      SetInvoiceHeader(prev => ({
        ...prev,
        ...header,
      }));
      //setPackingDetails(data.Details);
      const Details = data.Details;
      const dodetailsfrmdb = data.DoDetail;
      setDoDetail(dodetailsfrmdb);
      const updatedOptions = dodetailsfrmdb.map(item => {
        return {
          ...item,
          value: item.packingId,
          label: item.packno,
        };
      });
      handleDOSelectChange(updatedOptions);
    } catch (err) {
      console.error("Error fetching invoice details:", err.message);
    }
  };
  useEffect(() => {
    SetInvoiceHeader(prev => ({
      ...prev,
      totalAmount: totalPrice,
      totalQty: totalQty,
    }));
  }, [totalPrice, totalQty]);

  useEffect(() => {
    console.log(invoiceHeader);
    console.log(packingDetails);
    const totalQtys = packingDetails.reduce(
      (acc, item) => acc + (item.pickedQty || 0),
      0
    );
    const totalPrices = packingDetails.reduce(
      (acc, item) => acc + (item.price || 0),
      0
    );
    setTotalQty(totalQtys);
    setTotalPrice(totalPrices);
  }, [invoiceHeader, packingDetails]);

  const openpopup = (e, submitype) => {

    const invalidItems = packingDetails.filter(
      item =>
        Number(item.unitPrice) === 0 ||
        Number(item.totalPrice) === 0 ||
        Number(item.priceIDR) === 0
    );

    if (invalidItems.length > 0) {
      setErrorMsg(["Unit Price, Total Price and Price (IDR) should not be 0 while posting."]);
      return false;
    }


    if (!validateForm) {
      return true;
    }
    if (!packingDetails || packingDetails.length == 0) {
      setErrorMsg(["Packing details are required."]);
      return false;
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Sales" breadcrumbItem="Sales Invoice" />
        <Row>
          <Col lg="12">
            <div
              className="content clearfix mt-1"
              style={{ minHeight: "560px" }}
            >
              <Card>
                <CardBody>
                  <Formik
                    key={JSON.stringify(invoiceHeader)}
                    initialValues={invoiceHeader}
                    validationSchema={validationSchema}
                    onSubmit={openpopup}
                  >
                    {({ errors, touched, setFieldValue }) => (
                      <Form>
                        <Row>
                          <Col md="8">
                            {errors && Object.keys(errors).length > 0 && (
                              <div className="alert alert-danger alert-new">
                                <ul className="mb-0">
                                  <li>{Object.values(errors)[0]}</li>
                                </ul>
                              </div>
                            )}
                            {errorMsg && Object.keys(errorMsg).length > 0 && (
                              <div className="alert alert-danger alert-new">
                                <ul className="mb-0">
                                  <li>{Object.values(errorMsg)[0]}</li>
                                </ul>
                              </div>
                            )}
                            {successStatus && (
                              <UncontrolledAlert color="success" role="alert">
                                {successMsg}
                              </UncontrolledAlert>
                            )}
                          </Col>
                          <Col md="4" className="text-end">
                            {/* <Button type="submit" color="info" className="me-2" onClick={() => setSubmitType(0)} disabled={isSubmitting}>
                                                            <i className="bx bx-comment-check me-2"></i>Save
                                                        </Button> */}
                            <Button
                              type="submit"
                              color="success"
                              onClick={() => setSubmitType(1)}
                              disabled={isSubmitting}
                            >
                              <i className="bx bxs-save me-2"></i>Post
                            </Button>
                            <Button
                              className="ms-2"
                              type="button"
                              color="danger"
                              onClick={() => history.push("/sales-invoices")}
                              disabled={isSubmitting}
                            >
                              <i className="bx bx-window-close me-2"></i>Cancel
                            </Button>
                          </Col>
                          <Col md="2">
                            <FormGroup>
                              <Label for="SalesInvoiceNum">
                                Invoice No.
                              </Label>
                              <Input
                                type="text"
                                id="SalesInvoiceNum"
                                value={invoiceHeader.salesInvoiceNbr}
                                name="SalesInvoiceNum"
                                disabled
                              />
                            </FormGroup>
                          </Col>

                          <Col md="2">
                            <FormGroup>
                              <Label>Date</Label>
                              <Flatpickr
                                className="form-control d-block"
                                placeholder="dd-mm-yyyy"
                                options={{
                                  altInput: true,
                                  altFormat: "d-M-Y",
                                  dateFormat: "Y-m-d",
                                  minDate: minDate,
                                  maxDate: maxDate,
                                  defaultDate: invoiceHeader.salesInvoiceDate,
                                }}
                                name="SalesInvoiceDate"
                                onChange={date =>
                                  setFieldValue("SalesInvoiceDate", date[0])
                                }
                              />
                              <ErrorMessage
                                name="SalesInvoiceDate"
                                component="div"
                                className="text-danger"
                              />
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label className="required-label">Customer</Label>
                              <Select
                                name="customerId"
                                classNamePrefix="select"
                                className={
                                  errors.customerId && touched.customerId
                                    ? "select-invalid"
                                    : ""
                                }
                                isClearable
                                isSearchable
                                options={customerList.map(cus => ({
                                  value: cus.customerid,
                                  label: cus.CustomerName,
                                }))}
                                onChange={handleCustomerSelectChange}
                                value={
                                  customerList.find(
                                    option =>
                                      option.value === invoiceHeader.customerId
                                  ) || null
                                }
                              />
                              {/* <ErrorMessage name="customerId" component="div" className="text-danger" /> */}
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label className="required-label">Delivery Orders</Label>
                              <Select
                                name="doid"
                                classNamePrefix="select"
                                className={
                                  errors.doid && touched.doid
                                    ? "select-invalid"
                                    : ""
                                }
                                isMulti
                                isClearable
                                isSearchable
                                options={deliveryOrdersList}
                                onChange={selected => {
                                  handleDOSelectChange(selected);
                                }}
                                value={doDetail}
                              />
                            </FormGroup>
                          </Col>
                          <Col md="12">
                            <PackingDetailsTable
                              packingDetails={packingDetails}
                              tooltipOpen={tooltipOpen}
                              toggleTooltip={toggleTooltip}
                              totalQty={totalQty}
                              totalPrice={totalPrice}
                            />
                          </Col>
                        </Row>
                      </Form>
                    )}
                  </Formik>
                </CardBody>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
      <Modal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        centered
        tabIndex="1"
      >
        <ModalBody className="py-3 px-5">
          <Row>
            <Col lg={12}>
              <div className="text-center">
                <i
                  className="mdi mdi-alert-circle-outline"
                  style={{ fontSize: "9em", color: "orange" }}
                />
                <h4>
                  Do you want to{" "}
                  {id > 0
                    ? submitType === 0
                      ? "Update"
                      : "Post"
                    : submitType === 0
                      ? "Save"
                      : "Post"}
                  ?
                </h4>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="text-center mt-3 button-items">
                <Button
                  className="btn btn-info"
                  color="success"
                  size="lg"
                  onClick={() => {
                    if (submitType === 1) {  // Post only (not save)
                      const invalidItems = packingDetails.filter(
                        item =>
                          Number(item.unitPrice) === 0 ||
                          Number(item.totalPrice) === 0 ||
                          Number(item.priceIDR) === 0
                      );

                      if (invalidItems.length > 0) {
                        setErrorMsg(["Unit Price, Total Price and Price (IDR) should not be 0 while posting."]);
                        return false;
                      }
                    }

                    handleSubmit(submitType);
                    setIsModalOpen(false);
                  }}
                >
                  Yes
                </Button>
                <Button
                  color="danger"
                  size="lg"
                  className="btn btn-danger"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </div>
  );
};

const PackingDetailsTable = ({
  packingDetails,
  tooltipOpen,
  toggleTooltip,
  totalQty,
  totalPrice,
}) => (
  <Table className="table mb-0">
    <thead style={{ backgroundColor: "#3e90e2" }}>
      <tr>
        <th className="text-center">PO No.</th>
        <th className="text-center">DO No.</th>
        <th className="text-center">SQ No.</th>
        <th className="text-center">Gas Code</th>
        <th className="text-center">Picked Qty</th>
        <th className="text-center">UOM</th>
        <th className="text-center">Currency</th>
        <th className="text-center">Unit Price</th>
        <th className="text-center">Total Price</th>
        <th className="text-center">Price (IDR)</th>
        <th className="text-center">Delivery Details</th>
      </tr>
    </thead>
    <tbody>
      {packingDetails.map((item, index) => {
        //console.log('packingDetails tr', item)
        const tooltipId = `gas-code-${index}`;
        const deliveryTooltipId = `delivery-${index}`;
        return (
          <tr key={index}>
            <td className="text-center">{item.poNumber}</td>
            <td className="text-center">{item.deliveryNumber}</td>
            <td className="text-center">{item.sqnbr}</td>
            <td className="text-left">
              <span
                id={tooltipId}
                className="btn-link"
                style={{ cursor: "pointer", color: "blue" }}
              >
                {item.GasName || ""}
              </span>
              <TooltipComponent
                isOpen={tooltipOpen[tooltipId] || false}
                target={tooltipId}
                toggle={() => toggleTooltip(tooltipId)}
                content={<GasTooltipContent item={item} />}
                style={{ maxWidth: "550px", wordWrap: "break-word" }}
              />
            </td>
            <td className="text-end">{item.pickedQty || ""}</td>
            <td className="text-center">{item.UOM || ""}</td>
            <td className="text-center">{item.CurrencyName || ""}</td>
            <td className="text-end">
              {new Intl.NumberFormat("en-US", {
                style: "decimal",
                currency: "IDR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(item.unitPrice || 0)}
            </td>
            <td className="text-end">
              {new Intl.NumberFormat("en-US", {
                style: "decimal",
                currency: "IDR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(item.totalPrice || 0)}
            </td>
            <td className="text-end">
              {new Intl.NumberFormat("en-US", {
                style: "decimal",
                currency: "IDR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(item.price || 0)}
            </td>

            <td className="text-center">
              <span
                id={deliveryTooltipId}
                className="btn-link"
                style={{ cursor: "pointer", color: "blue" }}
              >
                Details
              </span>
              <TooltipComponent
                isOpen={tooltipOpen[deliveryTooltipId] || false}
                target={deliveryTooltipId}
                toggle={() => toggleTooltip(deliveryTooltipId)}
                content={<DeliveryTooltipContent item={item} />}
              />
            </td>
          </tr>
        );
      })}
    </tbody>
    <tfoot>
      <tr>
        <td colSpan="4" className="text-end fw-bold">
          Total Qty:
        </td>
        <td className="text-end fw-bold">
          {new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(totalQty)}
        </td>
        <td colSpan="4" className="text-end fw-bold">
          Total Price
        </td>
        <td className="text-end fw-bold">
          {new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(totalPrice)}
        </td>
        <td></td>
      </tr>
    </tfoot>
  </Table>
);

const TooltipComponent = ({ isOpen, target, toggle, content }) => (
  <Tooltip
    isOpen={isOpen}
    target={target}
    toggle={toggle}
    style={{ maxWidth: "450px", wordWrap: "break-word" }}
  >
    {content}
  </Tooltip>
);

const GasTooltipContent = ({ item }) => (
  <div style={{ textAlign: "left" }} className="font-size-13">
    <div className="d-flex align-items-center gap-2">
      <div className="col-4 text-left">
        {" "}
        <strong>Volume:</strong>{" "}
      </div>
      <div className="col-8 text-left"> {item.Volume || ""}</div>
    </div>
    <div className="d-flex align-items-center gap-2">
      <div className="col-4 text-left">
        <strong>Pressure:</strong>
      </div>
      <div className="col-8 text-left">{item.Pressure || ""}</div>
    </div>
    <div className="d-flex align-items-center gap-2">
      <div className="col-4 text-left">
        <strong>Description:</strong>
      </div>
      <div className="col-8 text-left">{item.GasDescription || ""}</div>
    </div>
  </div>
);

const DeliveryTooltipContent = ({ item }) => (
  <div style={{ textAlign: "left" }} className="font-size-13">
    <div className="d-flex align-items-center gap-2">
      <div className="col-4 text-left">
        <strong>Delivery Address:</strong>
      </div>
      <div className="col-8 text-left">{item.deliveryAddress}</div>
    </div>
    <div className="d-flex align-items-center gap-2">
      <div className="col-4 text-left">
        <strong>Driver Name:</strong>
      </div>
      <div className="col-8 text-left">{item.driverName}</div>
    </div>
    <div className="d-flex align-items-center gap-2">
      <div className="col-4 text-left">
        <strong>Truck Name:</strong>
      </div>
      <div className="col-8 text-left">{item.truckName}</div>
    </div>
    <div className="d-flex align-items-center gap-2">
      <div className="col-4 text-left">
        <strong>Delivery Instruction:</strong>
      </div>
      <div className="col-8 text-left">{item.deliveryInstruction}</div>
    </div>
  </div>
);

export default AddInvoice;
