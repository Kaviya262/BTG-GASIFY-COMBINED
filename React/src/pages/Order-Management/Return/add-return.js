import React, { useState, useEffect, useMemo } from "react";
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
  Modal,
  ModalBody,
  UncontrolledAlert,
} from "reactstrap";
import { Tooltip, InputGroup, InputGroupText } from "reactstrap";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import {
  fetchSalesInvoiceCustomerList,
  GetReturnOrderGasCodeList,
  GetReturnOrderPDLs,
  GetPDLDetailsByGas,
  GetPDLDetailsByPD,
  GetROCylinderDetails,
  CreateReturnOrder,
  GetReturnOrderSeqNo,
  ReturnOrderDetail,
  UpdateReturnOrder,
} from "../../../common/data/mastersapi";
import { toast } from "react-toastify";

const animatedComponents = makeAnimated();

const AddReturn = () => {
  const history = useHistory();
  const { id } = useParams();
  const [isClearable] = useState(true);
  const [isSearchable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState(1);
  const [preCustomerId, setPreCustomerId] = useState(null);
  const [tooltipOpen, setTooltipOpen] = useState({});
  const [customerList, setCustomerList] = useState([]);
  const [branchId] = useState(1);
  const [errorMsg, setErrorMsg] = useState([]);
  const [successStatus, setSuccessStatus] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gasCodeLists, setGasCodeLists] = useState([]);
  const [DOList, setDOList] = useState([]);
  const [returnOrderDetails, setReturnOrderDetails] = useState([]);
  const [savedDetail, setSavedDetail] = useState([]);
  const [isEditLoaded, setIsEditLoaded] = useState(false);
  const [barcodeData, setBarcodeData] = useState("");
  const [originalOrderDetails, setOriginalOrderDetails] = useState([]);
  const [selectedBarcodes, setSelectedBarcodes] = useState([]);



  const formatDate = (date) => date.toISOString().split("T")[0];

  const [roheader, setRoheader] = useState({
    rtnno: "",
    rtndate: formatDate(new Date()),
    customerid: "",
    categoryid: 1,
    issubmitted: 0,
    userId: 1,
    branchId: 1,
    orgId: 1,
    id: 0,
    doids: [],
    gasids: [],
    CustomerName: "",
  });

  const toggleTooltip = (id) => {
    setTooltipOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const validationSchema = Yup.object().shape({
    rtndate: Yup.date().required("Invoice date is required"),
    customerid: Yup.mixed().required("Customer is required"),
    categoryid: Yup.string().required("Category is required"),
    doids: Yup.array().when("categoryid", {
      is: "1",
      then: Yup.array().min(1, "At least one Delivery Order is required"),
      otherwise: Yup.array().nullable(),
    }),
    gasids: Yup.array().when("categoryid", {
      is: "2",
      then: Yup.array().min(1, "At least one Gas Code is required"),
      otherwise: Yup.array().nullable(),
    }),
  });

  // Only fetch seq no for NEW records
  useEffect(() => {
    const getInvoicesnoload = async () => {
      if (id > 0) return; // Skip for edit
      try {
        const data = await GetReturnOrderSeqNo(branchId);
        setRoheader((prev) => ({
          ...prev,
          rtnno: String(data.Returnorder),
          customerid: String(data.customerid || ""),
        }));
      } catch (err) {
        console.error("Error fetching sequence:", err.message);
      }
    };
    getInvoicesnoload();
  }, [id, branchId]);

  // Load customer list
  useEffect(() => {
    const getCustomerList = async () => {
      try {
        const data = await fetchSalesInvoiceCustomerList(branchId);
        setCustomerList(data || []);
      } catch (err) {
        console.error("Error fetching customers:", err.message);
        setCustomerList([]);
      }
    };
    getCustomerList();

    if (id > 0) {
      getRetOrderDetails(id);
    }
  }, [branchId, id]);

  // Fetch edit data
  const getRetOrderDetails = async (editId) => {
    try {
      const data = await ReturnOrderDetail(editId);
      const header = data.Header;

      setRoheader(header);
      setPreCustomerId(header.customerid);

      const gasidsarr = data.GasDetail || [];
      const gasdetails = gasidsarr.map((item) => ({
        value: item.GasCodeId,
        label: item.gascode,
      }));

      const doDetailarr = data.DODetail || [];
      const dodetails = doDetailarr.map((item) => ({
        value: item.DOID,
        label: item.DONO,
      }));

      // Deduplicate
      const uniqueGas = Array.from(new Map(gasdetails.map((g) => [g.value, g])).values());
      const uniqueDO = Array.from(new Map(dodetails.map((d) => [d.value, d])).values());

      setSavedDetail(data.Details || []);

      setRoheader((prev) => ({
        ...prev,
        gasids: uniqueGas,
        doids: uniqueDO,
        CustomerName: header.CustomerName,
      }));

      setIsEditLoaded(true); // Mark edit loaded
    } catch (err) {
      console.error("Error fetching details:", err.message);
    }
  };

  // Fetch Gas Codes / DOs based on customer & category
  useEffect(() => {
    const fetchReturnOrderData = async () => {
      if (!roheader.customerid || roheader.customerid <= 0) return;
      if (id > 0 && isEditLoaded) return; // Skip if edit already loaded

      try {
        if (preCustomerId !== roheader.customerid) {
          setRoheader((prev) => ({ ...prev, gasids: [], doids: [] }));
          setIsEditLoaded(false);
        }

        if (roheader.categoryid > 1) {
          const gasCodeData = await GetReturnOrderGasCodeList(roheader.customerid, branchId);
          setGasCodeLists(gasCodeData || []);
        } else {
          const doData = await GetReturnOrderPDLs(roheader.customerid, branchId);
          setDOList(doData || []);
        }
      } catch (err) {
        console.error("Error fetching list:", err.message);
      }
    };
    fetchReturnOrderData();
  }, [roheader.customerid, roheader.categoryid, id, isEditLoaded, preCustomerId, branchId]);

  // Fetch PDL details when gasids/doids change
  useEffect(() => {
    const fetchPDLOrderDetails = async () => {
      if (!roheader.customerid || roheader.customerid <= 0) return;

      let allDetails = [];
      try {
        if (roheader.categoryid > 1 && roheader.gasids.length > 0) {
          for (const obj of roheader.gasids) {
            const data = await GetPDLDetailsByGas(obj.value);
            if (data) allDetails = [...allDetails, ...data];
          }
        } else if (roheader.categoryid === 1 && roheader.doids.length > 0) {
          for (const obj of roheader.doids) {
            const data = await GetPDLDetailsByPD(obj.value);
            if (data) allDetails = [...allDetails, ...data];
          }
        }

        if (id > 0) {
          const updatedDetails = allDetails.map((detail) => {
            const matched = savedDetail.find((item) => item.DelDtlId === detail.DelDtlId);
            return {
              ...detail,
              cylinderid: matched?.cylinderid || detail.cylinderid,
              cylindername: matched?.cylindername || detail.cylindername,
              rtn_Gas_ID: matched?.rtn_Gas_ID || detail.rtn_Gas_ID,
              rtn_DO_ID: matched?.rtn_DO_ID || detail.rtn_DO_ID,
              id: matched?.id || detail.id,
              rtn_ID: matched?.rtn_ID || detail.rtn_ID,
              ischeck: matched?.IsChecked === 1 || false,
            };
          });
          setReturnOrderDetails(updatedDetails);
          setOriginalOrderDetails(updatedDetails); // <-- Save original
        } else {
          setReturnOrderDetails(allDetails);
          setOriginalOrderDetails(allDetails); // <-- Save original
        }
      } catch (err) {
        console.error("Error fetching PDL details:", err.message);
      }
    };

    fetchPDLOrderDetails();
  }, [roheader.gasids, roheader.doids, id, savedDetail, roheader.customerid, roheader.categoryid]);

  // Stable Select values
  const selectedGasOptions = useMemo(() => roheader.gasids || [], [roheader.gasids]);
  const selectedDoOptions = useMemo(() => roheader.doids || [], [roheader.doids]);

  const handleCylinderChange = (index, cylinderdet, isChecked) => {
    setReturnOrderDetails((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        cylinderid: cylinderdet.cylinderid || updated[index].cylinderid,
        cylindername: cylinderdet.cylindername || updated[index].cylindername,
        ischeck: isChecked,
      };
      return updated;
    });
  };

  const openpopup = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {

    const checkedCylinders = returnOrderDetails.filter(item => item.ischeck);
    if (checkedCylinders.length === 0) {
      setErrorMsg(["Please select at least one cylinder."]);
      setIsModalOpen(false);
      return;
    }
    let seqData;
    if (id <= 0) {
      seqData = await GetReturnOrderSeqNo(branchId);
    }

    const headerdetails = {
      ...roheader,
      issubmitted: submitType,
      rtnno: id > 0 ? roheader.rtnno : seqData?.Returnorder || roheader.rtnno,
    };

    const details = returnOrderDetails
      .filter((item) => item.ischeck && item.cylinderid > 0)
      .map((item) => ({
        ...item,
        rtn_Gas_ID: item.rtn_Gas_ID || 0,
        rtn_DO_ID: item.rtn_DO_ID || 0,
        id: item.id || 0,
        rtn_ID: id || 0,
      }));

    const gasdetails = (roheader.gasids || []).map((item) => ({
      id: item.id || 0,
      gasCodeId: item.value,
      rtn_ID: id > 0 ? id : 0,
      gascode: item.label,
    }));

    const dodetails = (roheader.doids || []).map((item) => ({
      id: item.id || 0,
      doid: item.value,
      rtn_ID: id > 0 ? id : 0,
      dono: item.label,
    }));

    const finalPayload = {
      header: headerdetails,
      details,
      gasDetail: roheader.categoryid > 1 ? gasdetails : [],
      doDetail: roheader.categoryid > 1 ? [] : dodetails,
    };

    setIsSubmitting(true);
    try {
      let response;
      if (id > 0) {
        response = await UpdateReturnOrder(finalPayload);
      } else {
        response = await CreateReturnOrder(finalPayload);
      }

      if (response.status) {
        setErrorMsg([]);
        setSuccessStatus(true);
        setSuccessMsg(`Return order ${submitType === 0 ? "Saved" : "Posted"} Successfully!`);
        setTimeout(() => history.push("/sales-return"), 1000);
      } else {
        setErrorMsg([response.message]);
      }
    } catch (err) {
      setErrorMsg([err.message]);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const handleBarcodeEnter = () => {
    if (!barcodeData.trim()) return;

    const enteredBarcodes = barcodeData
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b);

    if (enteredBarcodes.length === 0) return;

    const updatedList = returnOrderDetails.map((item) => ({
      ...item,
      ischeck: item.ischeck || enteredBarcodes.includes(item.barcode),
    }));

    const matchedItems = updatedList.filter((item) =>
      enteredBarcodes.includes(item.barcode)
    );

    if (matchedItems.length === 0) {
      toast.error("No matching barcodes found.");
      setBarcodeData("");
      return;
    }

    // Update selected barcodes state
    setSelectedBarcodes((prev) => {
      const newBarcodes = [...prev, ...matchedItems.map((i) => i.barcode)];
      // Remove duplicates
      return Array.from(new Set(newBarcodes));
    });

    setReturnOrderDetails(updatedList);
    setBarcodeData("");

    toast.success(`Added ${matchedItems.length} barcode(s).`);
  };


  const handleCancel = () => history.push("/sales-return");

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Sales" breadcrumbItem="Return Order" />
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <Formik
                    initialValues={roheader}
                    enableReinitialize={true}
                    validationSchema={validationSchema}
                    onSubmit={openpopup}
                  >
                    {({ errors, touched, setFieldValue, values }) => (
                      <Form>
                        <Row>
                          <Col md="8">
                            {errorMsg.length > 0 && (
                              <div className="alert alert-danger">
                                <ul className="mb-0">
                                  {errorMsg.map((msg, i) => (
                                    <li key={i}>{msg}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {successStatus && (
                              <UncontrolledAlert color="success">{successMsg}</UncontrolledAlert>
                            )}
                          </Col>
                          <Col md="4" className="text-end">
                            <Button
                              type="submit"
                              color="info"
                              onClick={() => setSubmitType(0)}
                              disabled={isSubmitting}
                            >
                              Save
                            </Button>{" "}
                            <Button
                              type="submit"
                              color="success"
                              onClick={() => setSubmitType(1)}
                              disabled={isSubmitting}
                            >
                              Post
                            </Button>{" "}
                            <Button color="danger" onClick={handleCancel} disabled={isSubmitting}>
                              Cancel
                            </Button>
                          </Col>

                          <Col md="4">
                            <FormGroup>
                              <Label>Return Seq No.</Label>
                              <Input value={roheader.rtnno} disabled />
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label className="required-label">Date</Label>
                              <Flatpickr
                                className="form-control"
                                options={{ dateFormat: "Y-m-d", altInput: true, altFormat: "d-M-Y" }}
                                value={roheader.rtndate}
                                onChange={([date]) => {
                                  const formatted = formatDate(date);
                                  setFieldValue("rtndate", formatted);
                                  setRoheader((prev) => ({ ...prev, rtndate: formatted }));
                                }}
                              />
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label className="required-label">Customers</Label>
                              <Select
                                name="customerid"
                                options={customerList}
                                className={errors.customerid && touched.customerid ? "select-invalid" : ""}
                                onChange={(option) => {
                                  if (!option) {
                                    // Reset dependent fields
                                    setRoheader((prev) => ({
                                      ...prev,
                                      customerid: "",
                                      CustomerName: "",
                                      gasids: [],
                                      doids: [],
                                    }));

                                    // Clear dependent data
                                    setGasCodeLists([]);
                                    setDOList([]);
                                    setReturnOrderDetails([]);
                                    setPreCustomerId(null);

                                    // Reset Formik values too
                                    setFieldValue("customerid", "");
                                    setFieldValue("gasids", []);
                                    setFieldValue("doids", []);
                                  } else {
                                    // When a valid customer is selected
                                    setFieldValue("customerid", option.value);
                                    setRoheader((prev) => ({
                                      ...prev,
                                      customerid: option.value,
                                      CustomerName: option.label,
                                      gasids: [],
                                      doids: [],
                                    }));

                                    // Also clear dependent data
                                    setGasCodeLists([]);
                                    setDOList([]);
                                    setReturnOrderDetails([]);
                                    setPreCustomerId(option.value);
                                  }
                                }}
                                value={{ value: roheader.customerid, label: roheader.CustomerName }}
                                isSearchable
                                isClearable
                                styles={{
                                  menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999,
                                    maxHeight: 300,
                                    overflowY: 'auto'
                                  }),
                                  menuList: (provided) => ({
                                    ...provided,
                                    maxHeight: 300,
                                    overflowY: 'auto'
                                  })
                                }}
                              />
                            </FormGroup>
                          </Col>

                          <Col md="4">
                            <FormGroup>
                              <Label className="required-label">Sales Invoice Based On</Label>
                              <div className="d-flex gap-4">
                                {[{ value: 1, label: "Delivery Orders" }, { value: 2, label: "Gas" }].map(
                                  ({ value, label }) => (
                                    <div key={value} className="form-check">
                                      <Input
                                        type="radio"
                                        name="categoryid"
                                        value={value}
                                        className="form-check-input"
                                        checked={roheader.categoryid === value}
                                        onChange={() => {
                                          setFieldValue("categoryid", value);
                                          setRoheader((prev) => ({ ...prev, categoryid: value }));
                                        }}
                                      />
                                      <label className="form-check-label">{label}</label>
                                    </div>
                                  )
                                )}
                              </div>
                            </FormGroup>
                          </Col>

                          {roheader.categoryid > 1 ? (
                            <Col md="4">
                              <FormGroup>
                                <Label className="required-label">Gas Code</Label>
                                <Select
                                  name="gasids"
                                  options={gasCodeLists}
                                  isMulti
                                  value={selectedGasOptions}
                                  onChange={(option) => {
                                    setFieldValue("gasids", option || []);
                                    setRoheader((prev) => ({ ...prev, gasids: option || [] }));
                                  }}
                                  isSearchable
                                  isClearable
                                  menuPortalTarget={document.body}
                                  styles={{
                                    menu: (provided) => ({
                                      ...provided,
                                      zIndex: 9999,
                                      maxHeight: 300,
                                      overflowY: 'auto'
                                    }),
                                    menuList: (provided) => ({
                                      ...provided,
                                      maxHeight: 300,
                                      overflowY: 'auto'
                                    })
                                  }}
                                />
                              </FormGroup>
                            </Col>
                          ) : (
                            <Col md="4">
                              <FormGroup>
                                <Label className="required-label">Delivery Orders</Label>
                                <Select
                                  name="doids"
                                  options={DOList}
                                  isMulti
                                  value={selectedDoOptions}
                                  onChange={(option) => {
                                    setFieldValue("doids", option || []);
                                    setRoheader((prev) => ({ ...prev, doids: option || [] }));
                                  }}
                                  isSearchable
                                  isClearable
                                  styles={{
                                    menu: (p) => ({ ...p, overflow: "visible" }),
                                    menuList: (p) => ({ ...p, maxHeight: 150, overflowY: "auto" }),
                                  }}
                                />
                              </FormGroup>
                            </Col>
                          )}

                          {/* Barcode field commented
                          <div className="col-md-3">
                            <label htmlFor="barcode">Barcode</label>
                            <InputGroup>
                              <Input
                                type="textarea"
                                name="BarcodeScanner"
                                id="BarcodeScanner"
                                autoFocus
                                style={{ flexGrow: 1 }}
                                value={barcodeData}
                                maxLength={90}
                                onChange={(e) => setBarcodeData(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleBarcodeEnter();
                                  }
                                }}
                              />
                              <InputGroupText>
                                <Button
                                  // color="primary"
                                  size="sm"
                                  onClick={handleBarcodeEnter}
                                >
                                  Enter
                                </Button>
                              </InputGroupText>
                            </InputGroup>
                          </div>
                          */}


                          <Col md="12">
                            <Table className="table mb-0">
                              <thead style={{ backgroundColor: "#3e90e2" }}>
                                <tr>
                                  <th className="text-center">#</th>
                                  <th className="text-center" style={{ width: "20%" }}>Cylinder</th>
                                  <th className="text-center">BarCode</th>
                                  <th className="text-center">PO No.</th>
                                  <th className="text-center">DO No.</th>
                                  <th className="text-center">Gas Code</th>
                                  <th className="text-center" style={{ width: "8%" }}>UOM</th>
                                  <th className="text-center">Delivery Details</th>
                                </tr>
                              </thead>
                              <tbody>
                                {returnOrderDetails.length > 0 ? (
                                  <>
                                    {/* Selected items */}
                                    {returnOrderDetails
                                      .map((item, index) => ({ ...item, originalIndex: index })) // add original index
                                      .filter((item) => item.ischeck)
                                      .map((item) => {
                                        const tooltipId = `gas-code-${item.originalIndex}`;
                                        const tooltipId2 = `delivery-${item.originalIndex}`;
                                        return (
                                          <tr key={`sel-${item.originalIndex}`} style={{ backgroundColor: "#e6f7ff" }}>
                                            <td className="text-center align-middle">
                                              <Input
                                                type="checkbox"
                                                checked={!!item.ischeck}
                                                onChange={(e) =>
                                                  handleCylinderChange(item.originalIndex, item, e.target.checked)
                                                }
                                              />
                                            </td>
                                            <td className="text-center">{item.cylindername}</td>
                                            <td className="text-center">{item.barcode}</td>
                                            <td className="text-center">{item.PONumber}</td>
                                            <td className="text-center">{item.packno}</td>
                                            <td className="text-center">
                                              <span id={tooltipId} style={{ cursor: "pointer", color: "blue" }}>
                                                {item.GasCode}
                                              </span>
                                              <Tooltip isOpen={tooltipOpen[tooltipId]} target={tooltipId} toggle={() => toggleTooltip(tooltipId)}>
                                                <div style={{ textAlign: "left" }}>
                                                  <div><strong>Volume:</strong> {item.Volume}</div>
                                                  <div><strong>Pressure:</strong> {item.Pressure}</div>
                                                  <div><strong>Description:</strong> {item.GasDescription}</div>
                                                </div>
                                              </Tooltip>
                                            </td>
                                            <td className="text-center">CYL</td>
                                            <td className="text-center">
                                              <span id={tooltipId2} style={{ cursor: "pointer", color: "blue" }}>
                                                Details
                                              </span>
                                              <Tooltip isOpen={tooltipOpen[tooltipId2]} target={tooltipId2} toggle={() => toggleTooltip(tooltipId2)}>
                                                <div style={{ textAlign: "left" }}>
                                                  <div><strong>Address:</strong> {item.Address}</div>
                                                  <div><strong>Driver:</strong> {item.DriverName}</div>
                                                  <div><strong>Truck:</strong> {item.TruckName}</div>
                                                </div>
                                              </Tooltip>
                                            </td>
                                          </tr>
                                        );
                                      })}

                                    {/* Unselected items */}
                                    {returnOrderDetails
                                      .map((item, index) => ({ ...item, originalIndex: index }))
                                      .filter((item) => !item.ischeck)
                                      .map((item) => {
                                        const tooltipId = `gas-code-unsel-${item.originalIndex}`;
                                        const tooltipId2 = `delivery-unsel-${item.originalIndex}`;
                                        return (
                                          <tr key={`unsel-${item.originalIndex}`}>
                                            <td className="text-center align-middle">
                                              <Input
                                                type="checkbox"
                                                checked={!!item.ischeck}
                                                onChange={(e) =>
                                                  handleCylinderChange(item.originalIndex, item, e.target.checked)
                                                }
                                              />
                                            </td>
                                            <td className="text-center">{item.cylindername}</td>
                                            <td className="text-center">{item.barcode}</td>
                                            <td className="text-center">{item.PONumber}</td>
                                            <td className="text-center">{item.packno}</td>
                                            <td className="text-center">
                                              <span id={tooltipId} style={{ cursor: "pointer", color: "blue" }}>
                                                {item.GasCode}
                                              </span>
                                              <Tooltip isOpen={tooltipOpen[tooltipId]} target={tooltipId} toggle={() => toggleTooltip(tooltipId)}>
                                                <div style={{ textAlign: "left" }}>
                                                  <div><strong>Volume:</strong> {item.Volume}</div>
                                                  <div><strong>Pressure:</strong> {item.Pressure}</div>
                                                  <div><strong>Description:</strong> {item.GasDescription}</div>
                                                </div>
                                              </Tooltip>
                                            </td>
                                            <td className="text-center">CYL</td>
                                            <td className="text-center">
                                              <span id={tooltipId2} style={{ cursor: "pointer", color: "blue" }}>
                                                Details
                                              </span>
                                              <Tooltip isOpen={tooltipOpen[tooltipId2]} target={tooltipId2} toggle={() => toggleTooltip(tooltipId2)}>
                                                <div style={{ textAlign: "left" }}>
                                                  <div><strong>Address:</strong> {item.Address}</div>
                                                  <div><strong>Driver:</strong> {item.DriverName}</div>
                                                  <div><strong>Truck:</strong> {item.TruckName}</div>
                                                </div>
                                              </Tooltip>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </>
                                ) : (
                                  <tr>
                                    <td colSpan="8" className="text-center text-muted py-4">
                                      No data available
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
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

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
        <ModalBody className="py-3 px-5 text-center">
          <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />
          <h4>
            Do you want to {id > 0 ? (submitType === 0 ? "Update" : "Post") : (submitType === 0 ? "Save" : "Post")}?
          </h4>
          <div className="mt-3">
            <Button color="success" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
              Yes
            </Button>{" "}
            <Button color="danger" size="lg" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default AddReturn;