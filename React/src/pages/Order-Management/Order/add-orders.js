import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { Card, Col, Container, Row, Button, FormGroup, Label, Input, InputGroup, UncontrolledAlert, Modal, ModalBody } from "reactstrap";
import { useHistory } from "react-router-dom";
import Flatpickr from "react-flatpickr";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import {
    GetSOType,
    GetSalesPerson,
    GetUoM,
    AddSO,
    GetOrderSeqNo,
    GetSQCustomer,
    fetchGasList,
} from "../../../common/data/mastersapi";
import DirectSalesForm from "./DirectSalesForm";
import QuotationSalesForm from "./QuotationSalesForm";
import { handleSalesOrderSubmit } from "./DirectSalesForm";
import Select from "react-select";
import makeAnimated from "react-select/animated";
const animatedComponents = makeAnimated();

const AddOrders = forwardRef(function AddOrdersForm(props, ref) {
    const [childValidationPassed, setChildValidationPassed] = useState(true);

    const handleChildValidation = (isValid) => {
        setChildValidationPassed(isValid);
    };
    const directSalesRef = useRef();
    const formRef = useRef();
    const history = useHistory();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const minDate = new Date(currentYear, 0, 1);
    const maxDate = new Date(currentYear, 11, 31);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const [submittype, setSubmittype] = useState();
    const [submitState, setSubmitState] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // State Variables
    const [errorClass, setErrorClass] = useState({});
    const [errorMsg, setErrorMsg] = useState([]);
    const [successStatus, setSuccessStatus] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [soType, setSoType] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const [codeList, setCodeList] = useState([]);
    const [salesPersonList, setSalesPersonList] = useState([]);
    const [uomData, setUomData] = useState([]);
    const [submitType, setSubmitType] = useState('post'); // default to 'post'
    const [activeActionType, setActiveActionType] = useState("");
    const [isChildValid, setIsChildValid] = useState(true);

    const [soData, setSoData] = useState({
        SO_ID: 0,
        OrderType: 2,
        OrderDate: currentDate,
        SO_Number: 1,
        CustomerId: 0,
        CustomerEmail: "",
        CustomerPhone: "",
        BranchId: 1,
        OrderBy: "",
        RackNumber: "",
        ProjectName: "",
        UserId: 1,
        Categories: 2,
    });
    const [gasCodeSaveList, setGasCodeSaveList] = useState([]);
    const [SQDetails, setSQDetails] = useState([]);
    const [initialSeq, setInitialSeq] = useState("");
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [soTypeData, orderSeqData, customerData, gasListData, salesPersonData, uomData] = await Promise.all([
                    GetSOType(1),
                    GetOrderSeqNo(1),
                    GetSQCustomer(1),
                    fetchGasList(1, -1),
                    GetSalesPerson(1, -1),
                    // GetUoM(1,0),
                ]);

                setSoType(soTypeData);
                const seqNo = orderSeqData?.SONO?.toString() || "";
                setInitialSeq(seqNo);
                setSoData((prevState) => ({
                    ...prevState,
                    SO_Number: prevState.OrderType === 1 ? `E${seqNo}` : `${seqNo}`,
                }));
                setCustomerList(customerData);
                setCodeList(gasListData);
                setSalesPersonList(salesPersonData);
                //setUomData(uomData);
            } catch (error) {
                console.error("Error loading initial data:", error);
                setErrorMsg(["Error loading initial data. Please try again."]);
            }
        };

        fetchInitialData();
    }, []);

    // Handle Input Changes
    const handleInputChange = (e) => {

        const { name, value } = e.target;
        let tempErrors = {};
        validationfn(name, value, tempErrors);
        if (Object.keys(tempErrors).length > 0) {
            setErrorMsg(Object.values(tempErrors));
        } else {
            setErrorMsg([]);
        }
        setSoData((prevState) => ({ ...prevState, [name]: value?.toString() }));

        if (name === "OrderType") {
            if (value === "1") {
                // Direct Sales Order → add 'E' prefix
                setSoData(prev => ({
                    ...prev,
                    SO_Number: initialSeq ? `E${initialSeq}` : "",
                }));
            } else {
                // Insert from Sales Quotation → use stored sequence
                setSoData(prev => ({
                    ...prev,
                    SO_Number: initialSeq ? `${initialSeq}` : "",
                }));
            }
        }
    };
    const [selectedValue, setSelectedValue] = useState(null);

    // Handle Select Changes
    const handleSelectChange = (name, option) => {

        let tempErrors = {};
        const selectedValue = option?.value || "";
        validationfn(name, selectedValue, tempErrors);
        if (Object.keys(tempErrors).length > 0) {
            setErrorMsg(Object.values(tempErrors));
        } else {
            setErrorMsg([]);
        }

        if (name === "CustomerId") {
            if (!option) {
                setSoData((prevState) => ({ ...prevState, CustomerId: "", CustomerName: "", CustomerEmail: "", CustomerPhone: "" }));
            } else {
                const { value, label, Email, PhoneNumber } = option;
                setSoData((prevState) => ({
                    ...prevState,
                    CustomerId: value,
                    CustomerName: label,
                    CustomerEmail: Email || "",
                    CustomerPhone: PhoneNumber || "",
                }));
            }
        } else if (name === "SalesPerson") {
            if (!option) {
                setSoData((prevState) => ({ ...prevState, SalesPerson: "", SalesPersonName: "", SalesPersonEmail: "", SalesPersonPhone: "" }));
            } else {
                const { value, label, Email, PhoneNumber } = option;
                setSoData((prevState) => ({
                    ...prevState,
                    SalesPerson: value,
                    SalesPersonName: label,
                    SalesPersonEmail: Email || "",
                    SalesPersonPhone: PhoneNumber || "",
                }));
            }
        } else {
            setSoData((prevState) => ({ ...prevState, [name]: option ? option.value : 0 }));
        }
    };

    // Handle Date Change
    const handleDateChange = (selectedDates) => {
        const selectedDate = selectedDates[0];
        const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];
        setSoData((prevState) => ({ ...prevState, OrderDate: localDate }));
    };

    // Handle Cancel
    const handleCancel = () => {
        history.push("/manage-order");
    };

    // Validate required fields
    let validationRules = {};

    if (soData.OrderType === 2) {
        validationRules = {
            CustomerId: { required: true, message: "Please select a customer." },
            CustomerEmail: { required: true, message: "Please add customer email." },
            CustomerPhone: { required: true, message: "Please add customer phone." },
            // OrderBy: { required: true, message: "Please add order by." },
            // ProjectName: { required: true, message: "Please add project name." }
        };
    }

    // Validate only required fields
    const validationfn = (name, value, tempErrors) => {
        // if (name === "RackNumber") {
        //     const rackvalue = document.querySelector('input[name="RackNumber"]')?.value;

        //     if (!value) {
        //       value = rackvalue;
        //     }
        //   }
        let newValue = typeof value === "string" ? value.trim() : value;
        if (validationRules[name]?.required && (!newValue || newValue === "" || newValue === null || newValue === undefined)) {
            const newErrorClass = name === "CustomerId" ? "select-invalid" : "is-invalid";
            const newErrorMsg = validationRules[name].message;
            setErrorClass((prev) => ({ ...prev, [name]: newErrorClass }));
            tempErrors[name] = newErrorMsg;
        } else {
            setErrorClass((prev) => ({ ...prev, [name]: "" }));
            delete tempErrors[name];
        }
    };

    function validateGasCodeSaveList() {
        let errors = [];
        const sqIdList = [];
        // if(gasCodeSaveList.length<1){
        //     setErrorMsg(["Please add all required gas details"]);
        //     return false;
        // }

        gasCodeSaveList.forEach((item, index) => {
            sqIdList.push({
                Sqid: item.SQ_ID,
                SO_ID: 0,
            });
            let errorMsg = [];
            // if (item.PoNumber === "" || item.PoNumber == null) {
            //     errorMsg.push("Please enter the PO No.");
            // }
            if (item.SO_Qty == null || isNaN(item.SO_Qty) || item.SO_Qty < 1) {
                errorMsg.push("Please enter the valid SO Qty.");
            }
            if (!item.uomid || isNaN(item.uomid)) {
                errorMsg.push("Please enter the UoM.");
            }
            if (!item.DeliveryAddressId || isNaN(item.DeliveryAddressId)) {
                errorMsg.push("Please enter the Delivery Address.");
            }
            // if (item.DeliveryInstruction === "" || item.DeliveryInstruction == null) {
            //     errorMsg.push("Delivery Instruction cannot be empty.");
            // }
            if (!item.GasCodeId || isNaN(item.GasCodeId)) {
                errorMsg.push("Please select any Gas Code.");
            }
            if (!item.GasID || isNaN(item.GasID)) {
                errorMsg.push("Please select any Gas Code.");
            }
            if (!item.ReqDeliveryDate || isNaN(new Date(item.ReqDeliveryDate).getTime())) {
                errorMsg.push("Please enter the Req.Delivery Date.");
            }

            if (errorMsg.length > 0) {
                errors.push({
                    index: index,
                    errors: errorMsg,
                });
                setErrorMsg(errorMsg)
            }
        });
        if (soData.OrderType != 1) {
            if (gasCodeSaveList.length == 0) {
                let errorMsg = ["Please select at least one row."]; // ✅ Fixed: declare errorMsg
                errors.push({
                    index: 0,
                    errors: errorMsg,
                });
                setErrorMsg(errorMsg)
            }

        }
        setSQDetails(sqIdList);
        return errors.length > 0 ? false : true;
    }


    // Handle Submit
    const handleSubmit = async (e, actionType) => {
        e?.preventDefault();
        let haserror = false;
        let DsoCustomerId = null;
        let DsoCustomerEmail = null;
        let DsoCustomerPhone = null;
        let DsoCustomerQuotation = null;
        if (soData.OrderType === "1") {
            if (directSalesRef.current?.submitForm) {
                const result = await directSalesRef.current.submitForm(e, actionType, 2);
                if (!result) {
                    console.warn("Result is undefined or null. Exiting early.");
                    return;
                }

                if (result.response?.status) {
                    haserror = true;
                    DsoCustomerId = result.customerId;
                    DsoCustomerPhone = result.customerPhone;
                    DsoCustomerEmail = result.customerMail;
                    DsoCustomerQuotation = result.quotationId;
                } else {
                    console.log("Child form submitted successfully");
                    haserror = false;
                    return;
                }

            }
        } else {
            haserror = true;
        }

        if (haserror) {
            e?.preventDefault?.();
            e.preventDefault();
            let tempErrors = {};
            setErrorMsg([]);
            setSuccessStatus(false);
            Object.keys(validationRules).forEach((key) => {
                validationfn(key, soData[key], tempErrors);
            });
            if (Object.keys(tempErrors).length > 0) {
                setErrorMsg(Object.values(tempErrors));
                return;
            }
            setIsModalOpen2(false);
            let erstatus = validateGasCodeSaveList();
            if (!erstatus) {
                return;
            } else {
                setIsSubmitting(true);
                try {
                    // const rackvalue = document.querySelector('input[name="RackNumber"]')?.value;
                    // soData.RackNumber = rackvalue;
                    const updatedSOBasicInfo = {
                        ...soData,
                        isSubmitted: actionType === "post" ? 1 : 0,
                        CustomerId: soData.CustomerId == null || soData.CustomerId === "" || soData.CustomerId === 0
                            ? DsoCustomerId
                            : soData.CustomerId,
                        SO_Number: soData.OrderType === "1" && !soData.SO_Number.startsWith("E")
                            ? `E${soData.SO_Number}`
                            : soData.SO_Number,
                        CustomerPhone:
                            soData.OrderType === "1" &&
                                (soData.CustomerPhone == null || soData.CustomerPhone === "" || soData.CustomerPhone === undefined)
                                ? DsoCustomerPhone
                                : soData.CustomerPhone,

                        CustomerEmail:
                            soData.OrderType === "1" &&
                                (soData.CustomerEmail == null || soData.CustomerEmail === "" || soData.CustomerEmail === undefined)
                                ? DsoCustomerEmail
                                : soData.CustomerEmail,
                        SQ_ID:
                            soData.OrderType === "1" &&
                                (soData.quotationId == null || soData.quotationId === "" || soData.quotationId === undefined)
                                ? DsoCustomerQuotation
                                : soData.quotationId,
                    };

                    const uniqueSQDetails = SQDetails.filter(
                        (item, index, self) => index === self.findIndex((t) => t.Sqid === item.Sqid)
                    );
                    const orderDate = new Date(updatedSOBasicInfo.OrderDate);
                    orderDate.setHours(0, 0, 0, 0);

                    const hasInvalidDate = gasCodeSaveList.some(item => {
                        const reqDate = new Date(item.ReqDeliveryDate);
                        reqDate.setHours(0, 0, 0, 0);
                        return reqDate < orderDate;
                    });

                    if (hasInvalidDate) {
                        setErrorMsg(["Delivery date cannot be earlier than Sales Order date."]);
                        return;
                    }
                    const response = await AddSO({
                        header: updatedSOBasicInfo,
                        details: gasCodeSaveList,
                        sqDetail: uniqueSQDetails
                    });
                    if (response?.status) {
                        setSuccessStatus(true);
                        setSuccessMsg(response?.message || "Order saved successfully.");
                        setTimeout(() => {
                            history.push("/manage-order");
                        }, 1000);
                    } else {
                        setErrorMsg([response?.Message || "Something went wrong. Please try again."]);
                    }
                } catch (error) {
                    console.error("Error in AddSO:", error);
                    setErrorMsg(["Error: " + (error.message || "Something went wrong. Please try again.")]);
                } finally {
                    setIsSubmitting(false);
                }
            }
        }
    };


    useEffect(() => {
        const sqDetails = (gasCodeSaveList || []).map(item => ({
            Sqid: item.SQ_ID,
            SO_ID: item.SO_ID
        })).filter(item => item.Sqid && item.SO_ID !== undefined);
        setSQDetails(sqDetails);
    }, [soData, gasCodeSaveList]);

    const openModal2 = async (e, actionType) => {
        e.preventDefault();

        setActiveActionType(actionType);
        setErrorMsg([]);
        setSuccessStatus(false);

        // Run basic validation
        let tempErrors = {};
        Object.keys(validationRules).forEach((key) => {
            validationfn(key, soData[key], tempErrors);
        });

        if (Object.keys(tempErrors).length > 0) {
            setErrorMsg(Object.values(tempErrors));
            return;
        }

        // Validate gas code list
        const erstatus = validateGasCodeSaveList();
        if (!erstatus) return;
        // Handle direct sales flow
        if (soData.OrderType === "1") {
            if (directSalesRef.current?.submitForm) {
                const result = await directSalesRef.current.submitForm();

                if (result) {
                    console.log("Child form submission failed:", result?.message);

                } else {
                    console.log("Child form submitted successfully:", result.message);
                    return
                }
            }
        }
        setSubmittype(actionType);
        setIsModalOpen2(true);
    };




    // const openModal2 = async (e, actionType) => {
    //     debugger
    //     e.preventDefault();

    //     setActiveActionType(actionType);
    //     setErrorMsg([]);
    //     setSuccessStatus(false);
    //     // ✅ Call child form submission
    //     //  const result = await directSalesRef.current?.submitForm?.();
    //     let tempErrors = {};
    //     Object.keys(validationRules).forEach((key) => {
    //         validationfn(key, soData[key], tempErrors);
    //     });

    //     if (Object.keys(tempErrors).length > 0) {
    //         setErrorMsg(Object.values(tempErrors));
    //         return;
    //     }

    //     const erstatus = validateGasCodeSaveList();
    //     if (!erstatus) return;

    //     debugger

    //     if (directSalesRef.current?.submitForm) {
    //         const result = await directSalesRef.current.submitForm();

    //         if (!result?.success) {
    //             console.log("Child form submission failed:", result?.message);
    //             // Optional: keep modal open or show error
    //         } else {
    //             console.log("Child form submitted successfully:", result.message);
    //             // Optional: close modal or show success message
    //         }
    //     }

    //     if (soData.OrderType === "1" && isChildValid === false) {
    //         return;
    //     }

    // };
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Sales" breadcrumbItem="Sales Order" />
                    <Card>
                        <Row>
                            <Col xl={12}>
                                <div className="content clearfix mt-1" style={{ minHeight: "560px" }}>
                                    <div className="row mb-2">
                                        <div className="col-12 col-lg-8 col-md-8 col-sm-8 button-items mt-1">
                                            {errorMsg.length > 0 && (
                                                <div className="alert alert-danger alert-new">
                                                    {errorMsg[0]}
                                                </div>
                                            )}
                                            {/* {successStatus &&
                                                <UncontrolledAlert color="success" role="alert">
                                                    {successMsg}
                                                </UncontrolledAlert>
                                            } */}
                                            {successMsg && (
                                                <UncontrolledAlert color="success" className="alert-new">
                                                    {successMsg}
                                                </UncontrolledAlert>
                                            )}

                                        </div>
                                        <div className="col-12 col-lg-4 justify-content-end text-end me-1 mt-1">
                                            <div className="button-items">
                                                <button type="button" className="btn btn-info" onClick={(e) => openModal2(e, "save")} disabled={isSubmitting}><i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>Save</button>
                                                <button type="button" className="btn btn-success" onClick={(e) => openModal2(e, "post")} disabled={isSubmitting}><i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>Post</button>
                                                <button type="button" className="btn btn-danger" onClick={handleCancel} disabled={isSubmitting}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row align-items-center g-3">
                                        <Col md="3">
                                            <FormGroup>
                                                <Label for="OrderType" className="required-label">SO Type  </Label>
                                                <Input
                                                    type="select"
                                                    name="OrderType"
                                                    id="OrderType"
                                                    value={soData.OrderType}
                                                    onChange={handleInputChange}
                                                >
                                                    {soType.map((sotype) => (
                                                        <option key={sotype.Order_TypeId} value={sotype.Order_TypeId}>
                                                            {sotype.Order_TypeName}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                        <Col md="3">
                                            <FormGroup>
                                                <Label className="required-label">SO Date</Label>
                                                <InputGroup>
                                                    <Flatpickr
                                                        name="OrderDate"
                                                        id="OrderDate"
                                                        className="form-control d-block"
                                                        placeholder="dd-mm-yyyy"
                                                        options={{
                                                            altInput: true,
                                                            altFormat: "d-M-Y",
                                                            dateFormat: "Y-m-d",
                                                            minDate: minDate,
                                                            maxDate: maxDate,
                                                            defaultDate: soData.OrderDate
                                                        }}
                                                        onChange={handleDateChange}
                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                        </Col>
                                        <Col md="3">
                                            <FormGroup>
                                                <Label for="SO_Number">System Generated SO No.</Label>
                                                <Input type="text" name="SO_Number" id="SO_Number" disabled value={soData.SO_Number} />
                                            </FormGroup>
                                        </Col>
                                    </div>

                                    {soData.OrderType != 1 ? (
                                        <Row>
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label htmlFor="CustomerId" className="required-label">Customer</Label>
                                                    <Select
                                                        name="CustomerId"
                                                        id="CustomerId"
                                                        options={customerList}
                                                        value={customerList.find((option) => option.value === soData.CustomerId) || null}
                                                        onChange={(option) => handleSelectChange("CustomerId", option)}
                                                        classNamePrefix="select"
                                                        isDisabled={isDisabled}
                                                        isLoading={isLoading}
                                                        isClearable={isClearable}
                                                        isRtl={isRtl}
                                                        isSearchable={isSearchable}
                                                        className={errorClass.CustomerId}
                                                        components={animatedComponents}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            {/* <Col md="4">
                                            <FormGroup>
                                                <Label for="Email">Email</Label>
                                                <Input type="email" name="CustomerEmail" id="CustomerEmail" value={soData.CustomerEmail || ""} disabled />
                                            </FormGroup>
                                        </Col> */}
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label for="PhoneNumber">Phone No.</Label>
                                                    <Input type="text" name="CustomerPhone" id="CustomerPhone" value={soData.CustomerPhone || ""} disabled />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    ) : null}
                                    {/* Render different forms based on OrderType */}
                                    {soData.OrderType == 1 ? (
                                        <DirectSalesForm
                                            ref={directSalesRef}
                                            soData={soData}
                                            handleSelectChange={handleSelectChange}
                                            salesPersonList={salesPersonList}
                                            codeList={codeList}
                                            actionType={activeActionType}
                                            onValidationResult={(isValid) => {
                                                console.log("Child form is valid?", isValid);
                                                setIsChildValid(isValid);
                                            }}
                                            errorHandler={setErrorMsg} // ✅ Pass centralized error handler
                                            successHandler={setSuccessMsg}
                                        />
                                    ) : (
                                        <QuotationSalesForm
                                            soData={soData}
                                            handleInputChange={handleInputChange}
                                            errorClass={errorClass}
                                            setErrorMsg={setErrorMsg}
                                            setGasCodeSaveList={setGasCodeSaveList}
                                        />
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Container>
            </div>

            <Modal isOpen={isModalOpen2} toggle={() => setIsModalOpen2(false)} centered tabIndex="1">
                <ModalBody className="py-3 px-5">
                    <Row>
                        <Col lg={12}>
                            <div className="text-center">
                                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />
                                <h4>Do you want to {submittype} this details?</h4>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="text-center mt-3 button-items">
                                <Button className="btn btn-info" color="success" size="lg" onClick={(e) => {
                                    setSubmitState(true);
                                    handleSubmit(e, submittype);
                                }}>
                                    Yes
                                </Button>
                                <Button color="danger" size="lg" className="btn btn-danger" onClick={() => setIsModalOpen2(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </React.Fragment>

    );

});

export default AddOrders;