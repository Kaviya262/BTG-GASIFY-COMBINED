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
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "flatpickr/dist/themes/material_blue.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { getRevenueType, saveOrUpdateRevenue,GetRevenueSeqNum } from "../../../src/common/data/mastersapi";
import { GetClaimAndPaymentTransactionCurrency } from "../../../src/common/data/mastersapi";
import { GetBankList } from "common/data/mastersapi";

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

const revenueOptions = [
  { value: "rent", label: "Rent Revenues" },
  { value: "penalty", label: "Penalty from employees" },
  { value: "sister", label: "Sister company revenues" },
  { value: "interest", label: "Interest Revenue" },
  { value: "cylinder", label: "Cylinder Deposit" },
];

const OtherRevenues = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [revenues, setRevenues] = useState([]);   
 
  const [revenueTypeOptions, setRevenueTypeOptions] = useState([]);
  const history = useHistory();
  const location = useLocation();
  const revenueData = location.state?.revenueData || null;
  const [localRevenueData, setLocalRevenueData] = useState([]);
  const [generatedVoucherNo, setGeneratedVoucherNo] = useState("");

  const [currencySuggestions, setCurrencySuggestions] = useState([]);
  const [btgBankOptions, setbtgBankOptions] = useState([]);
  const [accountOptionsMap, setaccountOptionsMap] = useState({});
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const validationSchema = Yup.object().shape({
    revenueType: Yup.string().required("Revenue type is required"),
    description: Yup.string().required("Description is required"),
    amountIDR: Yup.number().typeError("Enter a valid amount").positive("Amount must be positive").required("Amount is required"),
    receivedDate: Yup.date().required("Received Date is required"),
    whom: Yup.string().required("From Whom is required"),
    remarks: Yup.string().nullable(),
  });

  useEffect(() => {
      debugger
      console.log("revenueData received on Add Page:", revenueData);
      // if (revenueData) {
      //  setLocalRevenueData(revenueData);
      // }
      fetchSeqNo();
      loadRevenueTypeList();
    }, []);
  
    const fetchSeqNo = async () => {
    try { debugger      
      const res = await GetRevenueSeqNum(1, 1, 1);
      console.log("voucher-response :", res.data.VoucherNo);
      if (res?.data?.VoucherNo) {
        setGeneratedVoucherNo(res.data.VoucherNo);
        console.log("generatedVoucherNo :", generatedVoucherNo);
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
  useEffect(() => {
    fetchCurrencyList();
    loadBankList();
  }, []);

  const fetchCurrencyList = async () => {
    const data = await GetClaimAndPaymentTransactionCurrency(0, 1, 1, "%");
  
    setCurrencySuggestions(data);
  };
  

  const loadBankList = async () => {
    const data = await GetBankList(1, 1);
  
    const bankOpts = data.map(item => ({
      value: item.value,
      label: item.BankName
    }));
  
    setbtgBankOptions(bankOpts);
  
    // Account numbers grouped by bank
    const accMap = data.reduce((acc, item) => {
      if (!acc[item.value]) acc[item.value] = [];
      acc[item.value].push({
        value: item.AccountNumber,
        label: item.AccountNumber
      });
      return acc;
    }, {});
  
    setaccountOptionsMap(accMap);
  };
  
  
  
    const loadRevenueTypeList = async () => {
      try {
        debugger
        const data = await getRevenueType(1, 1);
  
        const formatted = data.map(item => ({
          value: item.RevenueTypeId,
          label: item.RevenueTypeDescription
        }));
        
        console.log("formatted :", formatted);
        setRevenueTypeOptions(formatted);
      } catch (err) {
        console.log("err :", err);
        toast.error("Failed to load revenue type list");
      }
    };
  
  
    const handleSaveOrUpdate = async (values, resetForm, type) => {
      try {
        debugger
        setIsSubmitting(true);
  
        const isEdit = !!revenueData?.RevenueId; 
      
  
        const payload = {
          bankid: values.payment_method === 2 ? values.bankid : 0,
  payment_method: values.payment_method === 1 ? 1 : 2,
  amount: values.amount,
  currencyid: values.currencyid,
  amountIDR: values.amountIDR,
          VoucherNo: values.voucherNo,
          ReceivedDate: formatDate(values.receivedDate),
          Description: values.description,
          RevenueTypeId: values.revenueType, // map based on selection          
          Remarks: values.remarks,
          Whom: values.whom,
          AmountIDR: parseFloat(values.amountIDR),
          IsSubmitted: type === 1 ? true : false,
          OrgId: 1,
          BranchId: 1,
          IsActive: true,
          ...(isEdit
            ? {
              RevenueId: revenueData.RevenueId,
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
        await saveOrUpdateRevenue(body, isEdit);
  
        toast.success(`Revenue ${isEdit ? "updated" : "saved"} successfully`);
        resetForm();
        setIsModalOpen(false);
        history.push("/ManageRevenues");
      } catch (error) {
        toast.error("Failed to save or update revenue");
      } finally {
        setIsSubmitting(false);
      }
    };

  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
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
    const exportData = revenues.map((r) => ({
      "Revenue Type": r.revenueType,
      "Description": r.description,
      "Amount": r.amountIDR,
      "Received Date": r.receivedDate.toLocaleDateString(),
      "From Whom": r.whom,
      "Remarks": r.remarks,
      "Status": r.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Revenues");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, `OtherRevenues-${new Date().toISOString().slice(0,10)}.xlsx`);
  };
  const formatDisplay = (val) => {
    if (val === undefined || val === null) return "";
    const strVal = String(val); // Convert number to string
    const [integer, decimal] = strVal.split(".");
    const withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimal !== undefined ? `${withCommas}.${decimal}` : withCommas;
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

  const statusBodyTemplate = (rowData) => (
    <Tag value={rowData.status} severity={rowData.status === "Posted" ? "success" : "info"} />
  );

  const actionBodyTemplate = (rowData) => (
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
          <Breadcrumbs title="Finance" breadcrumbItem="Other Revenues" />
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <Formik
                    initialValues={{                      
                      voucherNo: revenueData?.VoucherNo || generatedVoucherNo,
                        receivedDate: revenueData?.ReceivedDate ? new Date(revenueData.ReceivedDate) : new Date(),
                        revenueType: revenueData?.RevenueTypeId || "",
                        description: revenueData?.Description || "",
                        remarks: revenueData?.Remarks || "",
                        amountIDR: revenueData?.AmountIDR || "", 
                        amount: revenueData?.Amount || "",                                            
                        currencyid: revenueData?.currencyid || "",  
                        payment_method:revenueData?.payment_method || 0,
                        bankid : revenueData?.bankid || 0,                                          
                        whom: revenueData?.Whom || "",
                    }}
                    enableReinitialize = {true}
                    validationSchema={validationSchema}                    
                  >
                    {({ errors, touched, setFieldValue, values , resetForm}) => (
                      <Form>
                        <Row>
                          <Col md="8"></Col>
                          <Col md="4" className="text-end mb-3">
                            <div className="button-items">
                              <button type="submit" className="btn btn-info me-2" onClick={() =>  handleSaveOrUpdate(values, resetForm, 0)}>Save</button>
                              <button type="submit" className="btn btn-success me-2" onClick={() => handleSaveOrUpdate(values, resetForm, 1)}>Post</button>
                              <button type="button" className="btn btn-danger" onClick={() => history.push("/ManageRevenues")} disabled={isSubmitting}>Cancel</button>
                            </div>
                          </Col>

                          
                          <Col md="3">
                            <FormGroup>
                              <Label className="required-label">Sys Seq No.</Label>
                              <Input type="text" name="Sys Seq  No" value={values.voucherNo}
                                    onChange={e => setFieldValue("voucherNo", e.target.value)} disabled={true} />
                               
                            </FormGroup>
                          </Col>
                          {/* Form Fields */}
                          <Col md="3">
                            <FormGroup>
                              <Label className="required-label">Revenue Type</Label>
                              <Select
                                name="revenueType"
                                options={revenueTypeOptions}
                                value={revenueTypeOptions.find(o => o.value === values.revenueType) || null}
                                onChange={option => setFieldValue("revenueType", option?.value || "")}
                                placeholder="Choose Revenue Type"
                              />
                              {errors.revenueType && touched.revenueType && <div className="text-danger small mt-1">{errors.revenueType}</div>}
                            </FormGroup>
                          </Col>

                          <Col md="3">
                            <FormGroup>
                              <Label className="required-label">Description</Label>
                              <Input type="text" name="description" placeholder="Enter Description" value={values.description} onChange={e => setFieldValue("description", e.target.value)} />
                              {errors.description && touched.description && <div className="text-danger small mt-1">{errors.description}</div>}
                            </FormGroup>
                          </Col>

                          <Col md="3">
  <FormGroup>
    <Label className="required-label">Payment Method</Label><br />

    <Input
      type="radio"
      name="payment_method"
      value="1"
      checked={values.payment_method === 1}
      onChange={() => setFieldValue("payment_method", 1)}
    /> Cash &nbsp;&nbsp;&nbsp;&nbsp;

    <Input
      type="radio"
      name="payment_method"
      value="2"
      checked={values.payment_method === 2}
      onChange={() => setFieldValue("payment_method",2)}
    /> Bank
  </FormGroup>
</Col>
{values.payment_method === 2 && (
  <>
    <Col md="3">
      <FormGroup>
        <Label className="required-label">BTG Bank</Label>
        <Select
          name="bankid"
          options={btgBankOptions}
          value={btgBankOptions.find(o => o.value === values.bankid) || null}
          onChange={(option) => {
            setFieldValue("bankid", option?.value || "");
            setFieldValue("accountNumber", "");
          }}
          placeholder="Select Bank"
        />
      </FormGroup>
    </Col>

  
  </>
)}

<Col md="3">
  <FormGroup>
    <Label className="required-label">Currency</Label>
    <Select
      name="currencyid"
      options={currencySuggestions.map(c => ({
        value: c.currencyid,
        label: c.Currency,
        ExchangeRate: c.ExchangeRate
      }))}
      value={
        currencySuggestions.find(c => c.currencyid === values.currencyid) || null
      }
      onChange={(option) => {
        setFieldValue("currencyid", option?.value || "");
        const idr = (parseFloat(values.amount || 0) * (option?.ExchangeRate || 1));
        setFieldValue("amountIDR", idr);
      }}
      placeholder="Select Currency"
    />
  </FormGroup>
</Col>



<Col md="3">
  <FormGroup>
    <Label className="required-label">Amount</Label>
    <Input
      type="text"
      name="amount"
      placeholder="Enter Amount"
      // value={values.amount}
      value={values.amount ? formatDisplay(values.amount) : ""}

      onChange={(e) => {
      
        
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

        setFieldValue("amount", cleanNumber);

        const rate = currencySuggestions.find(x => x.currencyid === values.currencyid)?.ExchangeRate || 1;

        const idr = cleanNumber * rate;
        setFieldValue("amountIDR", idr);
      }}
    />
  </FormGroup>
</Col>

<Col md="3">
  <FormGroup>
    <Label>Amount (IDR)</Label>
    <Input type="text"                                    value={values.amountIDR ? formatDisplay(values.amountIDR) : ""}
 disabled   />
  </FormGroup>
</Col>
 

                          <Col md="3">
                            <FormGroup>
                              <Label className="required-label">Received Date</Label>
                              <Flatpickr
                                name="receivedDate"
                                className="form-control d-block"
                                options={{ dateFormat: "d-M-Y", defaultDate: values.receivedDate }}
                                onChange={([receivedDate]) => setFieldValue("receivedDate", receivedDate)}
                              />
                              {errors.receivedDate && touched.receivedDate && <div className="text-danger small mt-1">{errors.receivedDate}</div>}
                            </FormGroup>
                          </Col>

                          <Col md="3">
                            <FormGroup>
                              <Label className="required-label">From Whom</Label>
                              <Input type="text" name="whom" placeholder="Enter Name / Company" value={values.whom} onChange={e => setFieldValue("whom", e.target.value)} />
                              {errors.whom && touched.whom && <div className="text-danger small mt-1">{errors.whom}</div>}
                            </FormGroup>
                          </Col>

                          <Col md="6">
                            <FormGroup>
                              <Label>Remarks</Label>
                              <Input type="textarea" name="remarks" rows="3" placeholder="Enter Remarks" value={values.remarks} onChange={e => setFieldValue("remarks", e.target.value)} />
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

      {/* Confirmation Modal */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
        <ModalHeader toggle={() => setIsModalOpen(false)}>Confirm Action</ModalHeader>
        <ModalBody className="py-3 px-5 text-center">
          <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "6em", color: "orange" }} />
          <h4>Do you want to {submitType === 0 ? "Save" : "Post"}?</h4>
          <div className="mt-3 d-flex justify-content-center gap-3">
            <Button className="btn btn-info" color="success" size="lg" onClick={() => setIsModalOpen(false)}>Yes</Button>
            <Button color="danger" size="lg" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </div>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default OtherRevenues;
