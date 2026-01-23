import React, { useState, useEffect } from "react";
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
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "flatpickr/dist/themes/material_blue.css";
import { useHistory, useLocation } from 'react-router-dom';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Tag } from "primereact/tag";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getExpenseDescriptions, saveOrUpdatePettyCash,GetPettyCashSeqNum,GetClaimAndPaymentTransactionCurrency } from "../../../src/common/data/mastersapi";
import makeAnimated from "react-select/animated";

import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

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
const animatedComponents = makeAnimated();
 
const AddExpense = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [expenseOptions, setExpenseOptions] = useState([]);
  const history = useHistory();
  const location = useLocation();
  const pettyCashData = location.state?.pettyCashData || null;
  const [localPettyCashData, setLocalPettyCashData] = useState([]);
  const [generatedVoucherNo, setGeneratedVoucherNo] = useState("");
  const [currencySuggestions, setCurrencySuggestions] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);


  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  useEffect(() => {
    debugger
    console.log("pettyCashData received on Add Page:", pettyCashData);
    // if (pettyCashData) {
    //  setLocalPettyCashData(pettyCashData);
    // }


  //   setSelectedCurrency({
  //     Currency: pettyCashData?.currencyCode,
  //     currencyid: pettyCashData?.currencyid,
  //     ExchangeRate: pettyCashData?.exchangeRate,
  //     value: pettyCashData?.currencyid,
  //     label: pettyCashData?.currencyCode
  // });

    fetchSeqNo();
    fetchDropdownData();
    loadExpenseDescriptions();
  }, []);



  const fetchDropdownData = async () => {
              const [ cuurencydtl] = await Promise.all([
               
                  GetClaimAndPaymentTransactionCurrency(0, 1, 1, "%"),
                
  
              ]);
            
              setCurrencySuggestions(cuurencydtl);
            
          };     
         
         

  const fetchSeqNo = async () => {
  try { debugger
    //GetPettyCashSeqNum(branchId, orgId, userid);
    const res = await GetPettyCashSeqNum(1, 1, 1);
    console.log("voucher-response :", res.data.VoucherNo);
    if (res?.data?.VoucherNo) {
      setGeneratedVoucherNo(res.data.VoucherNo);
      console.log("voucher-response :", generatedVoucherNo);
    }
  } catch (err) {
    console.error("Failed to fetch voucher number", err);
  }
};

// useEffect(() => {
//   if (generatedVoucherNo) {
//     setFieldValue("voucherNo", generatedVoucherNo);
//   }
// }, [generatedVoucherNo]);



  const loadExpenseDescriptions = async () => {
    try {
      debugger
      const data = await getExpenseDescriptions(1, 1);

      const formatted = data.map(item => ({
        value: item.ExpenseDescriptionId,
        label: item.ExpenseDescription
      }));
      
      console.log("formatted :", formatted);
      setExpenseOptions(formatted);
    } catch (err) {
      console.log("err :", err);
      toast.error("Failed to load expense descriptions");
    }
  };


  const handleSaveOrUpdate = async (values, resetForm, type) => {
    try {
      debugger
      setIsSubmitting(true);

      const isEdit = !!pettyCashData?.PettyCashId;

      let filePath = "";
      if (values.attachment) {
        try {
          filePath = await uploadFile(values.attachment);
        } catch (err) {
          toast.error("File upload failed");
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        VoucherNo: values.voucherNo,
        ExpDate: formatDate(values.expDate),
        ExpenseType: values.expenseType,
        ExpenseDescriptionId: values.expenseDescription, // map based on selection
        BillNumber: values.billNumber,
        ExpenseFileName: "default.pdf",
        ExpenseFilePath: "",
        FileUpdatedDate: new Date().toISOString(),
        Who: values.who,
        Whom: values.whom,
        AmountIDR: parseFloat(values.amountIDR),
        Amount: parseFloat(values.amount),
        currencyid:  values.currencyid || 0,
        IsSubmitted: type === 1 ? true : false,
        exchangeRate:values.exchangeRate,
        OrgId: 1,
        BranchId: 1,
        IsActive: true,
        ...(isEdit
          ? {
            PettyCashId: pettyCashData.PettyCashId,
            userid: 1,
            CreatedIP: "127.0.0.1",
            ModifiedIP: "127.0.0.1",
          }
          : {
            userid: 1,
            CreatedIP: "127.0.0.1",
            ModifiedIP: "127.0.0.1",
          }),
      };     
      const body = { 
        command: isEdit ? "Update" : "Insert",
        Header: payload, 
      };
       console.log("Payload being sent:", body);
      await saveOrUpdatePettyCash(body, isEdit);

      toast.success(`Petty Cash ${isEdit ? "updated" : "saved"} successfully`);
      resetForm();
      setIsModalOpen(false);
      history.push("/pettyCash");
    } catch (error) {
      toast.error("Failed to save or update petty cash");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/Upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    return response.data.filePath; // Adjust based on your backend response
  };


  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const clearFilter = () => {
    setFilters({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
    setGlobalFilterValue("");
  };

  const exportToExcel = () => {
    const exportData = expenses.map((ex) => ({
      "Date": new Date(ex.expDate).toLocaleDateString(),
      "Expense Type": ex.expenseType,
      "Description": ex.expenseDescription,
      // "Bill Number": ex.billNumber,
      "Amount(IDR)": ex.amountIDR,
      "Attachment": ex.attachment ? ex.attachment.name : "",
      "Status": ex.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, `Expenses-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <Button color="danger" onClick={clearFilter}>
          <i className="mdi mdi-filter-off me-1"></i> Clear
        </Button>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Global Search"
          />
        </span>
      </div>
    );
  };
  const formatToTwoDecimals = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
};


const formatDisplay = (val) => {
  if (val === undefined || val === null) return "";
  const strVal = String(val); // Convert number to string
  const [integer, decimal] = strVal.split(".");
  const withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal !== undefined ? `${withCommas}.${decimal}` : withCommas;
};


  const validationSchema = Yup.object().shape({
    voucherNo: Yup.string().required("Voucher No is required"),
    expDate: Yup.date().required("Date is required"),
    expenseType: Yup.string().required("Expense Type is required"),
    expenseDescription: Yup.string()
    .max(100, "Expense Description cannot exceed 100 characters")
    .required("Expense Description is required"),
    // billNumber: Yup.string().required("Bill Number is required"),
    amount: Yup.number().typeError("Enter a valid amount").positive("Amount must be positive").required("Amount is required"),
    attachment: Yup.mixed().nullable(),
    who: Yup.string().required("Please select who"),
    whom: Yup.string().required("Whom field is required"),
  });

  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  };



  const statusBodyTemplate = (rowData) => (
    <Tag value={rowData.status} severity={rowData.status === "Posted" ? "success" : "info"} />
  );

  const actionBodyTemplate = () => (
    <div className="d-flex gap-2 justify-content-center">
      <Button color="link" size="sm"><i className="mdi mdi-pencil"></i></Button>
      <Button color="link" size="sm"><i className="mdi mdi-delete"></i></Button>
    </div>
  );

  const header = renderHeader();

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Finance" breadcrumbItem="PettyCash" />
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  {   (
                    <Formik
                      initialValues={{
                        voucherNo: pettyCashData?.VoucherNo || generatedVoucherNo,
                        expDate: pettyCashData?.ExpDate ? new Date(pettyCashData.ExpDate) : new Date(),
                        expenseType: pettyCashData?.ExpenseType || 0,
                        expenseDescription: pettyCashData?.ExpenseDescriptionId || "",
                        billNumber: pettyCashData?.BillNumber || "",
                        amountIDR: pettyCashData?.AmountIDR || "",
                        currencyid: pettyCashData?.currencyid || 0,
                        amount: pettyCashData?.Amount || "",
                        attachment: pettyCashData?.Attachment || null,
                        who: pettyCashData?.Who || "Payer",
                        whom: pettyCashData?.Whom || "",
                        exchangeRate:pettyCashData?.ExchangeRate || 0
                      }}

                      enableReinitialize={true}
                      validationSchema={validationSchema}                    
                     
                    >
                      {({ errors, touched, setFieldValue, values, resetForm }) => {
                        console.log("Formik values:", values);
                        return (
                          <Form>
                            <Row>
                              <Col md="8"></Col>
                              <Col md="4" className="text-end mb-3">
                                <div className="button-items">
                                  <button type="submit" className="btn btn-info me-2" onClick={() => handleSaveOrUpdate(values, resetForm, 0)}>
                                    <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2" ></i>{pettyCashData? "Update" : "Save"}
                                    </button>
                                  <button type="submit" className="btn btn-success me-2" onClick={() => handleSaveOrUpdate(values, resetForm, 1)} >Post</button>
                                  <button type="button" className="btn btn-danger" onClick={() => history.push("/pettyCash")} disabled={isSubmitting}>Cancel</button>
                                </div>
                              </Col>
                              <Col md="4">
                                <FormGroup>
                                  <Label className="required-label">Voucher No</Label>
                                  <Input
                                    type="text"
                                    name="voucherNo"
                                    placeholder="Enter Voucher No"
                                    value={values.voucherNo}
                                    onChange={e => setFieldValue("voucherNo", e.target.value)}
                                    readOnly
                                  />
                                  {errors.voucherNo && touched.voucherNo && (
                                    <div className="text-danger small mt-1">{errors.voucherNo}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md="4">
                                <FormGroup>
                                  <Label className="required-label">Date</Label>
                                  <Flatpickr
  name="expDate"
  className="form-control d-block"
  options={{
    dateFormat: "d-m-Y", // keep the format
  }}
  value={values.expDate}
  onChange={([date]) => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Only restrict user when selecting/changing date
    if (date < twoDaysAgo) {
      alert("Date cannot be more than 2 days in the past.");
      setFieldValue("expDate", twoDaysAgo); // or leave unchanged
    } else {
      setFieldValue("expDate", date);
    }
  }}
/>


                                  {errors.expDate && touched.expDate && <div className="text-danger small mt-1">{errors.expDate}</div>}
                                </FormGroup>
                              </Col>

                              <Col md="4">
                                <FormGroup>
                                  <Label className="required-label">Expense Type</Label>
                                  {/* <Input
                                    type="text"
                                    name="expenseType"
                                    value={values.expenseType}
                                    onChange={e => setFieldValue("expenseType", e.target.value)}
                                  /> */}


                                   <Select
                                    name="expenseType"
                                    options={expenseOptions}
                                    value={expenseOptions.find(o => o.value === values.expenseType) || null}
                                    onChange={selectedOption => setFieldValue("expenseType", selectedOption?.value || "")}
                                    placeholder="Select ExpenseType"
                                  />


                                  {errors.expenseType && touched.expenseType && <div className="text-danger small mt-1">{errors.expenseType}</div>}
                                </FormGroup>
                              </Col>

                              <Col md="4">
                                <FormGroup>
                                  <Label className="required-label">Expense Description</Label>
                                  {/* <Select
                                    name="expenseDescription"
                                    options={expenseOptions}
                                    value={expenseOptions.find(o => o.value === values.expenseDescription) || null}
                                    onChange={selectedOption => setFieldValue("expenseDescription", selectedOption?.value || "")}
                                    placeholder="Select Description"
                                  /> */}

<Input
                                    type="text" maxLength={100}
                                    name="expenseDescription"
                                    value={values.expenseDescription}
                                    onChange={e => setFieldValue("expenseDescription", e.target.value)}
                                  />

                                  {errors.expenseDescription && touched.expenseDescription && <div className="text-danger small mt-1">{errors.expenseDescription}</div>}
                                </FormGroup>
                              </Col>

                              <Col md="4">
                                <FormGroup>
                                  <Label className="required-label">Who</Label>
                                  <div className="d-flex gap-3">
                                    <FormGroup check inline>
                                      <Input
                                        type="radio"
                                        name="who"
                                        value="Payer"
                                        checked={values.who === "Payer"}
                                        onChange={() => setFieldValue("who", "Payer")}
                                      />{" "}
                                      <Label check>Payer</Label>
                                    </FormGroup>
                                    <FormGroup check inline>
                                      <Input
                                        type="radio"
                                        name="who"
                                        value="Receiver"
                                        checked={values.who === "Receiver"}
                                        onChange={() => setFieldValue("who", "Receiver")}
                                      />{" "}
                                      <Label check>Receiver</Label>
                                    </FormGroup>
                                  </div>
                                  {errors.who && touched.who && (
                                    <div className="text-danger small mt-1">{errors.who}</div>
                                  )}
                                </FormGroup>
                              </Col>

                              <Col md="4">
                                <FormGroup>
                                  <Label className="required-label">Whom</Label>
                                  <Input
                                    type="text"
                                    name="whom"
                                    placeholder="Enter Whom"
                                    value={values.whom}
                                    onChange={e => setFieldValue("whom", e.target.value)}
                                  />
                                  {errors.whom && touched.whom && (
                                    <div className="text-danger small mt-1">{errors.whom}</div>
                                  )}
                                </FormGroup>
                              </Col>
                              <Col md={4}>   <FormGroup>
                                                                <Label for="currency">Currency <span className="text-danger">*</span></Label>

                                                                <Select
                                                                    name="currencyid"
                                                                    id="currencyid"
                                                                    options={currencySuggestions.map(category => ({
                                                                        value: category.currencyid,
                                                                        label: category.Currency,
                                                                        currencyid: category.currencyid,
                                                                        Currency: category.Currency,
                                                                        ExchangeRate: category.ExchangeRate
                                                                    }))}
                                                                    value={currencySuggestions.find((option) => option.currencyid === values?.currencyid) || null}
                                                                  
                                                                  
                                                                  
                                                                    onChange={(option) => {
                                                                      setFieldValue("currencyid", option?.currencyid || "");
                                                                      setFieldValue("exchangeRate", option?.ExchangeRate || 0);
                                                                      const AmountIDR = formatToTwoDecimals(parseFloat(values.amount || 0) * parseFloat(option?.ExchangeRate || 0));
                                                                      setFieldValue("amountIDR", AmountIDR);
                                                                    }}
                                                                    //   onChange={(option) => {
                                                                    //     const selected = option;
                                                                    //     setSelectedCurrency(selected);

                                                                    //     setFieldValue("currencyid", selected?.currencyid || "");
                                                                        


                                                                    //     const exchangeRate = parseFloat(selected?.ExchangeRate);
                                                                    //     const AmountIDR = formatToTwoDecimals(parseFloat(values.amount)    * exchangeRate);
                                                                    
                                                                    //     setFieldValue("amountIDR", AmountIDR);
                                                                    // }}
                                                                    classNamePrefix="select"
                                                                    isDisabled={false}
                                                                    menuPortalTarget={document.body} 
                                                                    isClearable={true}

                                                                    isSearchable={true}

                                                                    components={animatedComponents}
                                                                    placeholder="Select Transaction Currency"
                                                                />
                                                                </FormGroup>
                                                            </Col>

                              <Col md="4">
                                <FormGroup>
                                  <Label className="required-label">Amount </Label>
                                  {/* <Input type="number" name="amount" placeholder="Enter Amount" value={values.amount} onChange={e =>
                                    { 
                                      
                                      setFieldValue("amount", e.target.value);
                                      debugger;
                                      const exchangeRate = parseFloat(values?.exchangeRate);
                                      
                                      const AmountIDR = formatToTwoDecimals(parseFloat(e.target.value)   * exchangeRate);
                                  
                                      setFieldValue("amountIDR", AmountIDR);
                                    }
                                   } /> */}
 <Input
  type="text"
  name="amount"
  placeholder="Enter Amount"
  value={values.amount ? formatDisplay(values.amount) : ""}
  onChange={(e) => {
    debugger;
    let val = e.target.value;

    // Remove all characters except digits and dot
    val = val.replace(/[^0-9.]/g, "");

    // Only allow the first dot
    const firstDotIndex = val.indexOf(".");
    if (firstDotIndex !== -1) {
      // Keep only the first dot
      val = val.substring(0, firstDotIndex + 1) + val.substring(firstDotIndex + 1).replace(/\./g, "");
    }

    // Split integer and decimal parts
    const [integerPart, decimalPart] = val.split(".");

    // Limit integer to 12 digits
    const limitedInteger = integerPart.slice(0, 12);

  // decimalPart can be "" if user typed a dot but no digits yet
const limitedDecimal =
decimalPart !== undefined ? decimalPart.slice(0, 2) : undefined;

// Combine
let cleanNumber;
if (decimalPart !== undefined) {
// user typed dot, even if empty
cleanNumber = `${limitedInteger}${decimalPart !== "" ? "." + limitedDecimal : "."}`;
} else {
// no dot typed yet
cleanNumber = limitedInteger;
}

    // Store clean number
    setFieldValue("amount", cleanNumber);

    // Calculate IDR
    const exchangeRate = parseFloat(values?.exchangeRate || 0);
    const amountValue = parseFloat(cleanNumber || 0);
    const AmountIDR = formatToTwoDecimals(amountValue * exchangeRate);
    setFieldValue("amountIDR", AmountIDR);
  }}
/>




                                  {errors.amount && touched.amount && <div className="text-danger small mt-1">{errors.amount}</div>}
                                </FormGroup>
                              </Col>

                              <Col md="4">
                                <FormGroup>
                                  <Label className="required-label">Amount(IDR)</Label>
                                  <Input disabled={true} type="text" name="amountIDR" placeholder="Enter Amount"
                         
                                   
                                   value={values.amountIDR ? formatDisplay(values.amountIDR) : ""}
                                   onChange={e => setFieldValue("amountIDR", e.target.value)} />
                                  {errors.amountIDR && touched.amountIDR && <div className="text-danger small mt-1">{errors.amountIDR}</div>}
                                </FormGroup>
                              </Col>

                              {/* <Col md="4">
                                <FormGroup>
                                  <Label className="required-label">Bill Number</Label>
                                  <Input type="text" name="billNumber" placeholder="Enter Bill Number" value={values.billNumber} onChange={e => setFieldValue("billNumber", e.target.value)} />
                                  {errors.billNumber && touched.billNumber && <div className="text-danger small mt-1">{errors.billNumber}</div>}
                                </FormGroup>
                              </Col> */}

                              <Col md="4">
                                <FormGroup>
                                  <Label>Attachment (if any)</Label>
                                  <Input
                                    type="file"
                                    name="attachment"
                                    onChange={(e) => {
                                      const file = e.currentTarget.files[0];
                                      setFieldValue("attachment", file || null);
                                    }}
                                  />  </FormGroup>
                              </Col>
                            </Row>
                          </Form>
                        );
                      }}
                    </Formik>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>


        </Container>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
        <ModalHeader toggle={() => setIsModalOpen(false)}>Confirm Action</ModalHeader>
        <ModalBody className="py-3 px-5 text-center">
          <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "6em", color: "orange" }} />
          <h4>Do you want to {submitType === 0 ? "Save" : "Post"}?</h4>
          <div className="mt-3 d-flex justify-content-center gap-3">
            <Button color="success" size="lg" onClick={() => setIsModalOpen(false)}>Yes</Button>
            <Button color="danger" size="lg" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default AddExpense;
