import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";

// UI libraries
import {
    Button, Card, CardBody, Col, Collapse, Container, Form, FormGroup,
    Input, InputGroup, Label, Modal, ModalBody, Row, Table, Tooltip, UncontrolledAlert
} from "reactstrap";

import { ToggleButton } from "primereact/togglebutton";
import { AutoComplete } from "primereact/autocomplete";
import { Calendar } from "primereact/calendar";
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import makeAnimated from "react-select/animated";

// Rich text editors
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// Styles
import "flatpickr/dist/themes/material_blue.css";

// Custom Components
import Breadcrumbs from "../../../components/Common/Breadcrumb";

// API Methods
import {
    AddCustomerFromSQ,
    fetchGasList,
    GetQuotationType,
    GetPaymentMethods,
    GetCustomer,
    GetPaymentTerms,
    GetSalesPerson,
    GetUoM,
    GetCurrency,
    UpdateSQ,
    GetContactList,
    GetCurrencyconversion,
    GetShippingAddress,
    GetCascodedetail,
    GetSQ,
    AddSQ,
    GetSqseqno
} from "../../../common/data/mastersapi";

// Optional: Redux action
import { getCustomers } from "store/actions";

// Other Pages/Components
import AnotherPageComponent from "../Quotation/add-quotation";

export const handleSalesOrderSubmit = async ({
    actionType,
    sqbasicinfo,
    validationfn,
    quotationDetails,
    SelectedContactOperationValues,
    setErrorClass,
    setIsModalOpen2,
    onValidationResult,
    setIsSubmitting,
    AddSQ,
    OpContactList,
    history,
}) => {

    let hasError = false;
    let tempErrors = [];

    for (const key of Object.keys(sqbasicinfo)) {
        if (actionType === "save" && key === "CustomerContactId") continue;
        validationfn(key, sqbasicinfo[key], tempErrors);
    }

    let newErrorMsg = "";
    if (actionType === "post") {
        if (!SelectedContactOperationValues || SelectedContactOperationValues.length === 0) {
            newErrorMsg = "Please select customer operation contact.";
        }
        // Validate each quotation detail
        quotationDetails.forEach((item, idx) => {
            if (!item.UnitPrice || parseFloat(item.UnitPrice) === 0) {
                tempErrors.push(`Unit Price is missing for row ${idx + 1}.`);
            }
            if (!item.ConvertedPrice || parseFloat(item.ConvertedPrice) === 0) {
                tempErrors.push(`Converted Price is missing for row ${idx + 1}.`);
            }
            if (!item.ConvertedCurrencyId || parseInt(item.ConvertedCurrencyId) === 0) {
                tempErrors.push(`Gas Detail Row ${index + 1}: Currency is required.`);
            }
        });
    } else if (!quotationDetails || quotationDetails.length === 0) {
        newErrorMsg = "Please add at least one gas detail.";
    }

    setErrorClass(prev => ({ ...prev, [name]: "" }));

    if (newErrorMsg) {
        tempErrors.push(newErrorMsg);
    }

    setIsModalOpen2(false);

    if (tempErrors.length > 0) {
        hasError = true;
        return {
            success: false,
            message: tempErrors,
        };
    }

    if (onValidationResult) {
        onValidationResult(true);
    }

    setIsSubmitting(true);
    try {
        const updatedSQBasicInfo = {
            ...sqbasicinfo,
            isSubmit: actionType === "post" ? 1 : 0,
            IsReadyToPost: actionType === "Ready To Post" ? 1 : 0,
            DeliveryAddressId: sqbasicinfo.DeliveryAddressId || null,
            IsSalesOrderSaved: true,
            CustomerId: sqbasicinfo.CustomerId || null,
            CustomerContactId: sqbasicinfo.CustomerContactId || null,

        };

        const response = await AddSQ({
            header: updatedSQBasicInfo,
            details: quotationDetails,
            operation: OpContactList,
        });

        if (response?.status) {
            return {
                success: true,
                status: response.status,
                message: response.message,
            };
        } else {
            return {
                success: false,
                message: [response?.Message || "Please verify the gas code details."],
            };
        }
    } catch (error) {
        console.error("Error in AddSQ:", error);
        return {
            success: false,
            message: ["An error occurred while adding SQ. Please try again."],
        };
    } finally {
        setIsSubmitting(false);
    }
};

const animatedComponents = makeAnimated();

const EditDirectSalesForm = forwardRef((props, ref) => {
    const {
        soData,
        handleSelectChange,
        salesPersonList,
        codeList,
        onSuccess,
        actionType,
        onValidationResult,
        errorHandler, // ✅ New prop for centralized error handling
    } = props;

    const [isModalOpen2, setIsModalOpen2] = useState(false);

    const [isModalOpen3, setIsModalOpen3] = useState(false);
    const [gasCodeList, setGasCodeList] = useState([]);
    const [CustomerList, setCustomerList] = useState([]);
    const [FilterCustomerList, setFilterCustomerList] = useState([]);
    const [ContactList, setContactList] = useState([]);
    const [SalesPersonList, setSalesPersonList] = useState([]);
    const [MainAddress, setMainAddress] = useState([]);
    const [PaymentTermList, setPaymentTermList] = useState([]);
    const [PaymentMethodList, setPaymentMethodList] = useState([]);
    const [CurrencyList, setCurrencyList] = useState([]);
    const [UOMList, setUOMList] = useState([]);
    const [SqSeqNo, setSqSeqNo] = useState();
    const [DeliveryAddressList, setDeliveryAddressList] = useState([]);

    const { id } = useParams();
    const history = useHistory();
    const [selectedOptions, setselectedOptions] = useState(null);
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeAccord, setActiveAccord] = useState({ col1: true, col2: true });
    const [successMsg, setSuccessMsg] = useState("");
    const [successStatus, setSuccessStatus] = useState(false);
    const [quotationDetails, setQuotationDetails] = useState([
        { "id": 0, "SQ_ID": 0, GasCodeId: null, GasDescription: "", Volume: "1", Pressure: "1", Qty: 1, Po_No: "", Uom: "", CurrencyId: null, UnitPrice: 0, TotalPrice: 0, ConvertedPrice: "" || 0, ConvertedCurrencyId: "" },
    ]);
    const [submittype, setSubmittype] = useState("");
    const [currencySelect, setcurrencySelect] = useState("AUD");
    const [tooltipOpen, setTooltipOpen] = useState({});
    const toggleTooltip = (id) => {
        setTooltipOpen((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const showAccord = (activeItem) => {

        setActiveAccord((prevState) => ({
            ...prevState, // Preserve the existing state
            [activeItem]: !prevState[activeItem], // Dynamically update the specific key
        }));
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gaslistindex, setGaslistindex] = useState();
    const openModal = (index) => {
        setGaslistindex(index);
        setIsModalOpen(true);
    }
    const currentDate = new Date();
    const [sqGasinfo, setSqGasinfo] = useState([]);
    const [SelectedContactOperationValues, setSelectedContactOperationValues] = useState(null);
    const [selectedCustomer, setselectedCustomer] = useState(null);
    const [OpContactList, setopContactList] = useState([]);
    const [sqbasicinfo, setSqbasicinfo] = useState({
        SQ_Type: "",
        CustomerId: "",
        CustomerContactId: "",
        IsSavedByDSO: true,
        SQ_Nbr: "",
        Sys_SQ_Nbr: 0,
        SQ_Date: currentDate,
        MainAddress: "",
        DeliveryAddressId: "",
        PhoneNumber: "",
        FaxNo: "",
        Email: "",
        Validity: "",
        DeliveryTerms: "",
        PaymentTerms: "",
        PaymentMethod: "1",
        Subject: "",
        OrderedBy: "",
        SalesPersonID: "",
        SalesPersonContact: "",
        SalesPersonEmail: "",
        TermsAndCond: "",
        EffectiveFromDate: "",
        Qtn_Month: "",
        Qtn_Day: 0,
        TBA: "",
        IsWithCustomer: true,

    });
    // Array of months and days
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const [sqType, setsqType] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedDay, setSelectedDay] = useState('');
    const [UserData, setUserData] = useState(null);
    const [IsAdmin, setIsAdmin] = useState(0);
    const getUserDetails = () => {
        if (localStorage.getItem("authUser")) {
            const obj = JSON.parse(localStorage.getItem("authUser"))
            return obj;
        }
    }
    useEffect(() => {
        debugger
        const loadIsadmindetails = async () => {
            const userData = getUserDetails();
            setUserData(userData);
            setIsAdmin(userData.IsAdmin);


        }
        loadIsadmindetails();
        debugger
        const quotationId = localStorage.getItem('quotationId');
        console.log('Quotation ID:', quotationId);
        if (quotationId) {
            debugger
            GetSQdata(quotationId);
            // loadCustomerList();
        }

    }, [id]);

    const submitForm = async (actionType, value) => {
        debugger;

        if (value === 2) {
            const result = await handleSubmit({
                actionType,
                sqbasicinfo: soData,
                validationfn,
                quotationDetails,
                SelectedContactOperationValues,
                // setErrorMsg,
                setErrorClass,
                setIsModalOpen2,
                onValidationResult,
                setIsSubmitting,
                setSuccessStatus,
                setSuccessMsg,
                AddSQ,
                OpContactList,
                history,
            });

            return result;
        } else {
            debugger
            // Otherwise, call IsPopuphandleSubmit
            const result = await IsPopuphandleSubmit({
                actionType,
                sqbasicinfo: soData,
                validationfn,
                quotationDetails,
                SelectedContactOperationValues,
                // setErrorMsg,
                setErrorClass,
                setIsModalOpen2,
                onValidationResult,
                setIsSubmitting,
                setSuccessStatus,
                setSuccessMsg,
                AddSQ,
                OpContactList,
                history,
            });

            return result;
        }
    };

    // Expose submitForm via ref
    useImperativeHandle(ref, () => ({

        submitForm,
    }));
    const IsPopuphandleSubmit = async (actionType) => {
        let hasError = false;
        let tempErrors = [];

        for (const key of Object.keys(sqbasicinfo)) {
            validationfn(key, sqbasicinfo[key], tempErrors);
        }

        let newErrorMsg = "";

        if (!quotationDetails || quotationDetails.length === 0) {
            newErrorMsg = "Please add at least one gas detail.";
        }

        if (actionType === "post") {
            // Check if any ConvertedPrice is missing
            const missingConvertedPrice = quotationDetails.some(
                (item) =>
                    item.ConvertedPrice === undefined ||
                    item.ConvertedPrice === null ||
                    item.ConvertedPrice === "" ||
                    item.ConvertedPrice === 0 ||
                    isNaN(item.ConvertedPrice)
            );

            if (missingConvertedPrice) {
                newErrorMsg = "Please fill Converted Price before posting.";
            }
        }

        setErrorClass(prev => ({ ...prev, [name]: "" }));

        if (newErrorMsg) {
            tempErrors.push(newErrorMsg);
        }

        if (tempErrors.length > 0) {
            errorHandler(tempErrors); // ✅ Use centralized errorHandler
            hasError = true;
        }

        if (onValidationResult) {
            onValidationResult(!hasError);
        }

        return !hasError;
    }
    const [defaultEffectiveDate, setdefaultEffectiveDate] = useState(currentDate);
    const [sqDate, setsqDate] = useState(currentDate);
    const GetSQdata = async (id) => {
        setLoading(true);
        try {

            const data = await GetSQ(id);
            let bsicinfo = data[0][0];

            await getshippingAddress(bsicinfo.CustomerContactId, id)
            setSqbasicinfo({
                id: id,
                SQ_Type: bsicinfo.TypeId,
                CustomerId: bsicinfo.customerid,
                CustomerContactId: bsicinfo.CustomerContactId,
                CustomerAttention: bsicinfo.CustomerContactId.toString(),
                SQ_Nbr: bsicinfo.SQ_Nbr,
                Sys_SQ_Nbr: bsicinfo.manual,
                SQ_Date: bsicinfo.SQ_Date,
                MainAddress: bsicinfo.MainAddress,
                DeliveryAddress: bsicinfo.DeliveryAddress,
                DeliveryAddressId: bsicinfo.DeliveryAddressId,
                PhoneNumber: bsicinfo.PhoneNumber,
                FaxNo: bsicinfo.FaxNo,
                Email: bsicinfo.customerEmail,
                Validity: bsicinfo.Validity,
                OrderedBy: bsicinfo.OrderedBy || bsicinfo.Ordered_By || "",
                DeliveryTerms: bsicinfo.DeliveryTerms,
                PaymentTermsId: bsicinfo.PaymentTermsId,
                PaymentTerms: bsicinfo.PaymentTermsId,
                PaymentMethodId: bsicinfo.PaymentMethodId ? bsicinfo.PaymentMethodId : 1,
                PaymentMethod: bsicinfo.PaymentMethodId ? bsicinfo.PaymentMethodId : 1,
                Subject: bsicinfo.Subject,
                SalesPersonID: bsicinfo.SalesPersonID,
                SalesPerson: bsicinfo.SalesPersonID,
                SalesPersonContact: bsicinfo.SalesPersonContact,
                SalesPersonEmail: bsicinfo.SalesPersonEmail,
                UserId: 1,
                OrgId: 1,
                BranchId: 1,
                TermsAndCond: bsicinfo.TermsAndCond ? bsicinfo.TermsAndCond : "",
                IsReadyToPost: bsicinfo.IsReadyToPost ? bsicinfo.IsReadyToPost : 0,
                EffectiveFromDate: bsicinfo.EffectiveFromDate ? bsicinfo.EffectiveFromDate : currentDate,

                Qtn_Month: bsicinfo.Qtn_Month ? bsicinfo.Qtn_Month : "",
                Qtn_Day: bsicinfo.Qtn_Day ? bsicinfo.Qtn_Day : 0,
                TBA: bsicinfo.TBA ? bsicinfo.TBA : "",
                IsWithCustomer: bsicinfo.IsWithCustomer == 0 ? false : true
            });

            setSelectedMonth(bsicinfo.Qtn_Month ? bsicinfo.Qtn_Month : "");

            setSelectedDay(bsicinfo.Qtn_Day ? bsicinfo.Qtn_Day : 0);

            setdefaultEffectiveDate(bsicinfo.EffectiveFromDate ? new Date(new Date(bsicinfo.EffectiveFromDate).getTime() - new Date(bsicinfo.EffectiveFromDate).getTimezoneOffset() * 60000) : currentDate);
            setsqDate(bsicinfo.SQ_Date ? new Date(new Date(bsicinfo.SQ_Date).getTime() - new Date(bsicinfo.SQ_Date).getTimezoneOffset() * 60000) : currentDate);

            if (id === undefined) id = 0;

            const datas = await GetCustomer(1, id);
            let mydata = datas;
            setCustomerList(mydata);
            const selectedcustomer = mydata.find(c => c.CustomerId === bsicinfo?.customerid);
            setselectedCustomer(selectedcustomer);



            let gasdetails = data[1];
            const updatedDetails = gasdetails.map((val, index) => ({
                id: val.Sq_dtl_id,
                SQ_ID: val.sq_id,
                GasCodeId: val.gascodeid,
                GasDescription: val.gasdescription,
                Volume: val.Volume,
                Pressure: val.Pressure,
                Qty: val.Qty,
                Po_No: val.Po_No || val.Po_No || val.PO_No || "",
                Uom: val.uomid,
                CurrencyId: val.CurrencyId,
                UnitPrice: val.UnitPrice,
                TotalPrice: val.TotalPrice,
                ConvertedPrice: val.ConvertedPrice,
                ConvertedCurrencyId: val.ConvertedCurrencyId,
                Exchangerate: val.Exchangerate || 0
            }));
            setQuotationDetails(updatedDetails);



            let operatincont = data[2];

            operatincont = operatincont.map(item => ({
                ...item,
                value: item["CustomerContactId"],
                label: item["CustomerContact"] || "-"
            }));

            setSelectedContactOperationValues(operatincont);

            await GetContacts(bsicinfo.customerid, operatincont, id);
            // set(updatedDetails);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching SQ:", error);
        }
    };

    const createcustomer = async () => {
        try {

            if (selectedCustomer == null || selectedCustomer == undefined || selectedCustomer.trim() == "") {
                setIsModalOpen3(false);

                errorHandler(["Please enter customer"]); // ✅ Use centralized errorHandler
                return;
            }

            if (typeof selectedCustomer === 'string') {
                const existing = CustomerList.find(
                    (c) => c.Customer.toLowerCase() === selectedCustomer.toLowerCase()
                );

                if (!existing) {
                    console.log("Creating new customer:", selectedCustomer);

                    const response = await AddCustomerFromSQ({
                        CustomerName: selectedCustomer,
                        UserId: 1,
                        BranchId: 1,
                        OrgId: 1
                    });
                    if (response?.status) {


                        setSelectedContactOperationValues([]);
                        setSqbasicinfo(prevState => ({ ...prevState, ["DeliveryAddressId"]: "" }));
                        setSqbasicinfo(prevState => ({ ...prevState, ["CustomerContactId"]: "" }));
                        setDeliveryAddressList([]);
                        let data = {
                            Customer: selectedCustomer,
                            CustomerId: response?.data,
                            Email: "",
                            Fax: "",
                            MainAddress: "",
                            PhoneNumber: "",
                            label: selectedCustomer,
                            value: response?.data
                        }
                        setIsModalOpen3(false);
                        setselectedCustomer(data);

                        handleCustomerTypeChange(data);

                        var Customerdata = await GetCustomer(1, 0);
                        setCustomerList(Customerdata);
                        console.log("Success:", response);
                        errorHandler([]); // ✅ Clear errors using centralized handler
                        setSuccessStatus(response?.status);
                        setSuccessMsg(response?.message);


                    } else {
                        setIsModalOpen3(false);
                        console.error(
                            "Failed to add Customer:",
                            response?.message || "Unknown error"
                        );
                        errorHandler([ // ✅ Use centralized errorHandler
                            response?.message || "Error while creating customer.",
                        ]);
                    }

                }
                else {
                    setIsModalOpen3(false);
                    errorHandler(["The customer is already is exists"]); // ✅ Use centralized errorHandler
                }
            }
            else {
                setIsModalOpen3(false);
                errorHandler(["Please Enter the different customer name"]); // ✅ Use centralized errorHandler
            }
        } catch (error) {
            setIsModalOpen3(false);
            console.error("Error in AddCustomer:", error);
            errorHandler(["An error occurred while adding Customer. Please try again."]); // ✅ Use centralized errorHandler
        }


    }

    const handleCustomerTypeChange = async opt => {



        // setSelectedContactOperationValues([]);
        // setSqbasicinfo(prevState => ({ ...prevState, ["DeliveryAddressId"]: "" }));
        // setSqbasicinfo(prevState => ({ ...prevState, ["CustomerContactId"]: "" }));
        // setDeliveryAddressList([]);

        let option = opt;
        if (!option) {
            setSqbasicinfo(prevState => ({ ...prevState, ["CustomerId"]: "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ["MainAddress"]: "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ["FaxNo"]: "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ["Email"]: "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ["PhoneNumber"]: "" }));
        } else {
            setselectedCustomer(opt);
            console.log(option);
            setErrorClass(prev => ({ ...prev, ["CustomerId"]: "" }));
            setSqbasicinfo(prevState => ({
                ...prevState,
                ["CustomerId"]: option.value,
            }));
            setSqbasicinfo(prevState => ({
                ...prevState,
                ["MainAddress"]: option.MainAddress != null ? option.MainAddress : "",
            }));
            setSqbasicinfo(prevState => ({
                ...prevState,
                ["FaxNo"]: option.Fax != null ? option.Fax : "",
            }));
            setSqbasicinfo(prevState => ({
                ...prevState,
                ["Email"]: option.Email != null ? option.Email : "",
            }));
            setSqbasicinfo(prevState => ({
                ...prevState,
                ["PhoneNumber"]: option.PhoneNumber != null ? option.PhoneNumber : "",
            }));
            await GetContacts(option.value, []);
        }
    };


    const changeexistingcustomer = () => {
        handleCustomerTypeChange(selectedCustomer);
    }

    const loadCustomerLoad = (ev) => {


        setTimeout(() => {

            let _filteredCustomer;

            if (!ev.query.trim().length) {
                _filteredCustomer = [...CustomerList];
            }
            else {
                if (/^%+$/.test(ev.query.trim())) {
                    _filteredCustomer = [...CustomerList];
                } else {
                    _filteredCustomer = CustomerList.filter((cus) => {
                        return cus.Customer.toLowerCase().startsWith(ev.query.toLowerCase());
                    });
                }
            }

            setFilterCustomerList(_filteredCustomer);
        }, 250);


    };

    useEffect(() => {

        const loadGasList = async () => {
            console.log("sqbasicinfo", sqbasicinfo);
            if (id === undefined) id = 0;
            const data = await fetchGasList(1, id);
            console.log("data", data);
            setGasCodeList(data);
        };
        loadGasList();

        //         const loadCustomerList = async () => {
        //             const data = await GetCustomer(1);
        //             setCustomerList(data);




        //         const selectedcustomer = CustomerList.find(c => c.CustomerId === sqbasicinfo.CustomerId);
        // setselectedCustomer(selectedcustomer);


        //         };


        const loadsqType = async () => {
            const data = await GetQuotationType(1);
            setsqType(data);
        };
        loadsqType();

        const loadSalesPersonList = async () => {

            if (id === undefined) id = 0;

            const data = await GetSalesPerson(1, id);
            setSalesPersonList(data);
        };
        loadSalesPersonList();

        const loadPaymentTermList = async () => {

            if (id === undefined) id = 0;

            const data = await GetPaymentTerms(1, id);
            setPaymentTermList(data);
        };
        loadPaymentTermList();

        const loadPaymentMethodList = async () => {

            if (id === undefined) id = 0;
            const data = await GetPaymentMethods(1, id);
            setPaymentMethodList(data);
        };
        loadPaymentMethodList();

        const loadCurrencyList = async () => {

            if (id === undefined) id = 0;

            const data = await GetCurrency(1, id);
            setCurrencyList(data);
        };
        loadCurrencyList();

        const loadUOMList = async () => {

            if (id === undefined) id = 0;

            const data = await GetUoM(1, id);
            setUOMList(data);
        };
        loadUOMList();
    }, []);

    const currentYear = currentDate.getFullYear();
    const minDate = new Date(currentYear, 0, 1);
    const minEffectiveDate = new Date();
    const maxDate = new Date(currentYear, 11, 31);

    const defaultSQDate = sqbasicinfo.SQ_Date ? new Date(new Date(sqbasicinfo.SQ_Date).getTime() - new Date(sqbasicinfo.SQ_Date).getTimezoneOffset() * 60000) : currentDate;
    // const defaultEffectiveDate = sqbasicinfo.EffectiveFromDate ? new Date(new Date(sqbasicinfo.EffectiveFromDate).getTime() - new Date(sqbasicinfo.EffectiveFromDate).getTimezoneOffset() * 60000) : currentDate;

    const handleDateChange = (selectedDates) => {
        const selectedDate = selectedDates[0];
        const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];
        setSqbasicinfo(prevState => ({
            ...prevState,
            SQ_Date: localDate
        }));
    };

    const handleEffectiveDateChange = selectedDates => {
        const selectedDate = selectedDates[0];
        const localDate = new Date(
            selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
        )
            .toISOString()
            .split("T")[0];
        setSqbasicinfo(prevState => ({
            ...prevState,
            EffectiveFromDate: localDate,
        }));
    };

    const [errorClass, setErrorClass] = useState({
        Validity: "",
        SQ_Type: "",
    });
    // ✅ Removed local [errorMsg, setErrorMsg]

    const validationfn = (name, value, tempErrors, formValues) => {

        let newErrorClass = "";
        let newErrorMsg = "";
        let newValue = typeof value === "string" ? value.trim() : value;
        if (name === "TBA" || name === "Qtn_Month" || name === "Qtn_Day") {
            const isTBAfilled = !!sqbasicinfo.TBA;
            const isQtnMonthFilled = !!sqbasicinfo.Qtn_Month;
            const isQtnDayFilled = !!sqbasicinfo.Qtn_Day;


            if (isTBAfilled) {
                if (name === "TBA" && !newValue) {
                    newErrorClass = "form-control is-invalid";
                    newErrorMsg = "Please enter the TBA.";
                }
                if (name === "Qtn_Month" || name === "Qtn_Day") {
                    newErrorClass = "";
                }
            } else if (isQtnMonthFilled && isQtnDayFilled) {
                if (name === "TBA") {
                    newErrorClass = "";
                }
                if ((name === "Qtn_Month" || name === "Qtn_Day") && !newValue) {
                    newErrorClass = "form-control is-invalid";
                    newErrorMsg = `Please select a quotation validity ${name === "Qtn_Month" ? "month" : "day"}.`;
                }
            } else {
                newErrorClass = "form-control is-invalid";
                newErrorMsg = "Please Enter Quotation Validity (TBA or Qtn Month & Day).";
            }
        } else {

            switch (name) {
                case "Sys_SQ_Nbr":
                    if (!newValue) {
                        newErrorClass = "form-control is-invalid";
                        newErrorMsg = "Manual SQ No. is required.";
                    }
                    break;
                case "SQ_Type":
                    if (!newValue) {
                        newErrorClass = "form-control is-invalid";
                        newErrorMsg = "SQ Type is required.";
                    }
                    break;
                // case "Validity":
                //   if (!newValue || Number(newValue) > 60) {
                //     newErrorClass = "form-control is-invalid";
                //     newErrorMsg = "Quote Validity cannot exceed 60 days.";
                //   }
                //   break;
                case "Subject":
                    if (!newValue) {
                        newErrorClass = "form-control is-invalid";
                        newErrorMsg = "Quote Subject cannot be empty.";
                    }
                    break;
                    debugger
                case "CustomerId":
                    if (!newValue) {
                        newErrorClass = "select-invalid";
                        newErrorMsg = "Please select a customer.";
                    }
                    break;
                case "CustomerContactId":
                    if (!newValue) {
                        if (sqbasicinfo.IsWithCustomer == true) {
                            newErrorClass = "form-control is-invalid";
                            newErrorMsg = "Please select a contact person.";
                        }
                    }
                    break;
                case "customercontactoperation":
                    if (!newValue) {
                        if (sqbasicinfo.IsWithCustomer == true) {
                            newErrorClass = "form-control is-invalid";
                            newErrorMsg = "Please select customer operation contact.";
                        }
                    }
                    break;
                /* case "DeliveryAddressId":
                   if (!newValue) {
                     newErrorClass = "form-control is-invalid";
                     newErrorMsg = "Please select a delivery address.";
                   }
                   break;*/

                case "EffectiveFromDate":
                    if (!newValue) {
                        newErrorClass = "form-control is-invalid";
                        newErrorMsg = "Please select a Effective From Date.";
                    }
                    break;


                // case "Qtn_Month":
                //   if (!newValue) {
                //     newErrorClass = "form-control is-invalid";
                //     newErrorMsg = "Please select a quotation validity month.";
                //   }
                //   break;

                // case "Qtn_Day":
                //   if (!newValue) {
                //     newErrorClass = "form-control is-invalid";
                //     newErrorMsg = "Please select a quotation validity day.";
                //   }
                //   break;

                // case "TBA":
                //   if (!newValue) {
                //     newErrorClass = "form-control is-invalid";
                //     newErrorMsg = "Please enter the TBA.";
                //   }
                //   break;
                case "DeliveryTerms":
                    if (!newValue) {
                        newErrorClass = "form-control is-invalid";
                        newErrorMsg = "Delivery Term is required.";
                    }
                    break;
                case "PaymentTerms":
                    if (!newValue) {
                        newErrorClass = "form-control is-invalid";
                        newErrorMsg = "Payment Terms is required.";
                    }
                    break;
                case "PaymentMethod":
                    if (!newValue) {
                        console.log("error patment method");
                        newErrorClass = "form-control is-invalid";
                        newErrorMsg = "Payment Method is required.";
                    }
                    break;
                case "SalesPerson":
                    if (!newValue) {
                        newErrorClass = "select-invalid";
                        newErrorMsg = "Please select a Sales Person.";
                    }
                    break;
                default:
                    break;
            }
        }

        setErrorClass(prev => ({ ...prev, [name]: newErrorClass }));

        if (newErrorMsg) {
            tempErrors.push(newErrorMsg);
            console.log("errormsg =>", tempErrors);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let hasError = false;
        let tempErrors = [];
        validationfn(name, value, tempErrors)
        if (tempErrors.length > 0) {
            errorHandler(tempErrors); // ✅ Use centralized errorHandler
            hasError = true;
        }

        // if (name == "Validity" && parseInt(value) < 1) {
        //     setErrorMsg(["Quote validity should be greater than zero"]);
        //     hasError = true;
        // }

        if (!hasError) {
            setSqbasicinfo(prevState => ({ ...prevState, [name]: value }));
            setSqbasicinfo(prevState => ({ ...prevState, ["UserId"]: 1 }));
            setSqbasicinfo(prevState => ({ ...prevState, ["OrgId"]: 1 }));
            setSqbasicinfo(prevState => ({ ...prevState, ["BranchId"]: 1 }));

            if (name === 'SQ_Type') {
                let rtv = sqType.filter((val) => val.SQTypeId == value);
                if (rtv.length > 0) {
                    setSqbasicinfo(prevState => ({ ...prevState, TermsAndCond: rtv[0].TermsAndCond }));
                }
            }

            if (name == "CustomerContactId") {
                setSqbasicinfo(prevState => ({ ...prevState, ['CustomerAttention']: value.toString() }));
                setSqbasicinfo(prevState => ({ ...prevState, ["DeliveryAddressId"]: "" }));
                setDeliveryAddressList([]);

                getshippingAddress(value);
            }
            if (name == "PaymentTermsId") {
                setSqbasicinfo(prevState => ({ ...prevState, ['PaymentTerms']: value }));
                getshippingAddress(value);
            }
            if (name == "PaymentMethodId") {
                setSqbasicinfo(prevState => ({ ...prevState, ['PaymentMethod']: value }));
                getshippingAddress(value);
            }

        } else {
            setSqbasicinfo(prevState => ({ ...prevState, [name]: "" }));
        }
    };

    const handleSubmit = async (e, actionType) => {

        let hasError = false;
        let tempErrors = [];
        for (const key of Object.keys(sqbasicinfo)) {
            validationfn(key, sqbasicinfo[key], tempErrors);
        }

        let newErrorMsg = "";
        if (SelectedContactOperationValues == null || SelectedContactOperationValues == undefined || SelectedContactOperationValues.length == 0) {
            // newErrorClass = "form-control is-invalid";
            if (sqbasicinfo.IsWithCustomer == true) {
                newErrorMsg = "Please select customer operation contact.";
            }
        }

        // Validate that every row has a currency selected
        const missingCurrencyRows = quotationDetails
            .map((item, index) => ({
                index: index + 1,
                hasCurrency: item.ConvertedCurrencyId && parseInt(item.ConvertedCurrencyId) !== 0
            }))
            .filter(row => !row.hasCurrency);

        if (missingCurrencyRows.length > 0) {
            const rows = missingCurrencyRows.map(r => r.index).join(", ");
            tempErrors.push(`Please select currency for Gas Detail`);
        }

        setErrorClass(prev => ({ ...prev, [name]: "" }));

        if (newErrorMsg) {
            tempErrors.push(newErrorMsg);

        }

        if (tempErrors.length > 0) {
            errorHandler(tempErrors); // ✅ Use centralized errorHandler
            hasError = true;
        }
        if (!hasError) {
            try {
                debugger
                const isPost = (actionType ?? e?.actionType) === "post";
                if (isPost) {
                    if (sqbasicinfo.IsWithCustomer == false) {
                        errorHandler(["Please update the customer basic info in customer master"]);
                        return;
                    }
                }
                const updatedSQBasicInfo = {
                    ...sqbasicinfo,
                    isSubmit: isPost ? 0 : 0,
                    IsReadyToPost: actionType === "Ready To Post" ? 1 : 0,
                    DeliveryAddressId: sqbasicinfo.DeliveryAddressId === "" ? null : sqbasicinfo.DeliveryAddressId,
                    CustomerContactId: sqbasicinfo.CustomerContactId === "" ? 0 : sqbasicinfo.CustomerContactId,
                    Qtn_Day: sqbasicinfo.Qtn_Day === "" ? null : sqbasicinfo.Qtn_Day,
                    IsSavedByDSO: true,
                };
                debugger
                if (isPost) {
                    const hasMissingPrice = quotationDetails.some(q => !q.UnitPrice || q.UnitPrice === 0);
                    if (hasMissingPrice) {
                        //      errorHandler(["Price / Customer details were missing in the Sales Quotation. Please update it in the Sales Quotation screen."]); // ✅ Use centralized errorHandler
                        // errorHandler(["Customer details cannot fill in the Sales Quotation"]);
                        //   return;
                    }
                    const hasMissingConvertedPrice = quotationDetails.some(q =>
                        q.ConvertedPrice === undefined ||
                        q.ConvertedPrice === null ||
                        q.ConvertedPrice === "" ||
                        isNaN(q.ConvertedPrice) ||
                        parseFloat(q.ConvertedPrice) === 0
                    );

                    if (hasMissingConvertedPrice) {
                        //     errorHandler(["Price / Customer details were missing in the Sales Quotation. Please update it in the Sales Quotation screen."]); // ✅ Use centralized errorHandler
                        // errorHandler(["Customer details cannot fill in the Sales Quotation"]);
                        //    return;
                    }
                }
                // Ensure Po_No is sent as a string (or null when empty).
                // Rules:
                // - empty/null/undefined => null
                // - otherwise send the trimmed string value (so numeric PO numbers become strings like "12345";
                //   special values like "po ni" are preserved)
                const sanitizedDetails = quotationDetails.map(d => {
                    const po = d.Po_No;
                    if (po === "" || po === null || po === undefined) {
                        return { ...d, Po_No: null };
                    }
                    const str = String(po).trim();
                    return { ...d, Po_No: str === "" ? null : str };
                });

                const response = await UpdateSQ({ header: updatedSQBasicInfo, details: sanitizedDetails, operation: SelectedContactOperationValues });
                if (response?.status) {
                    // setSuccessStatus(response?.status);
                    // setSuccessMsg(response?.message);
                    return {
                        response,
                        customerId: sqbasicinfo.CustomerId,
                        customerPhone: sqbasicinfo.PhoneNumber,
                        customerMail: sqbasicinfo.Email,

                        quotationId: response.data
                    };
                } else {
                    console.error("Failed to add SQ:", response?.Message || "Unknown error");
                    const msg = [response?.Message || "Please verify the gas code details."];
                    errorHandler(msg); // ✅ Use centralized errorHandler
                }
            } catch (error) {
                console.error("Error in UpdateSQ:", error);
                const msg = ["An error occurred while adding SQ. Please try again."];
                errorHandler(msg); // ✅ Use centralized errorHandler
            }
        } else {
            return { success: false, message: tempErrors };
        }
    };

    const [selectedCodes, setSelectedCodes] = useState({});
    const handleGasCodeChange = async (index, selectedValue) => {
        const updatedDetails = [...quotationDetails];
        setIsLoading(true);
        if (!selectedValue) {
            updatedDetails[index] = {
                ...updatedDetails[index],
                GasCodeId: "",
                Description: "",
                Volume: "",
                Pressure: "",
                Qty: 1,
                Uom: "",
                CurrencyId: 0,
                UnitPrice: 0,
                TotalPrice: 0,
                ConvertedPrice: "" || 0,
                ConvertedCurrencyId: 0
            };
            setQuotationDetails(updatedDetails);
            return;
        }

        const selectedGas = gasCodeList.find(c => c.GasCodeId === selectedValue);

        if (selectedGas) {
            try {
                const gascodedetails = await GetCascodedetail(selectedGas.GasCodeId);

                // Update only the necessary fields, keeping other properties unchanged
                updatedDetails[index] = {
                    ...updatedDetails[index], // Preserve existing values
                    GasCodeId: selectedGas.GasCodeId,
                    Description: gascodedetails[0]?.Descriptions || "",
                    GasDescription: gascodedetails[0]?.Descriptions || "",
                    Volume: gascodedetails[0]?.Volume || "",
                    Pressure: gascodedetails[0]?.pressure || "",
                    Qty: 1,
                    Uom: "",
                    CurrencyId: 0,
                    UnitPrice: 0,
                    TotalPrice: 0,
                    ConvertedPrice: "" || 0,
                    ConvertedCurrencyId: 0
                };

                setQuotationDetails(updatedDetails);
                setIsLoading(false)
            } catch (error) {
                console.error("Error fetching gas code details:", error);
            }
        }
    };

    const handleVolumeChange = (index, value) => {
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].Volume = value;
        setQuotationDetails(updatedDetails);
    };

    const handlePressureChange = (index, value) => {
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].Pressure = value;
        setQuotationDetails(updatedDetails);
    };

    const handleQtyChange = async (index, qty) => {
        // const updatedDetails = [...quotationDetails];
        // updatedDetails[index].Qty = 1;
        // setQuotationDetails(updatedDetails);
        // await currencyvalfn();
    };

    const handleCurrencyChange = async (index, value) => {
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].CurrencyId = value;
        updatedDetails[index].ConvertedCurrencyId = value;
        setQuotationDetails(updatedDetails);
        setcurrencySelect(value);
        await GetCurrencyval(index, value);
    };

    const handleUOMChange = (index, uom) => {
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].Uom = uom;//UOMList.find((u) => u.UoMId === uom);
        setQuotationDetails(updatedDetails);
        console.log(updatedDetails)
    };

    const handlePriceChange = (index, price) => {
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].ConvertedPrice = price;
        setQuotationDetails(updatedDetails);
    };

    const handleUnitPriceChange = async (index, uprice) => {
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].UnitPrice = (uprice < 1) ? "" : uprice;
        setQuotationDetails(updatedDetails);
        await GetCurrencyval(index, updatedDetails[index].ConvertedCurrencyId);
    };

    const [currencyval, setCurrencyval] = useState({});
    const [pendingIndex, setPendingIndex] = useState(null);
    const GetCurrencyval = async (index, currencyId) => {
        const data = await GetCurrencyconversion(currencyId);
        console.log("call curren", data[0]);
        setCurrencyval(data[0]);
        setPendingIndex(index);
    };

    useEffect(() => {
        if (currencyval && pendingIndex !== null) {
            currencyvalfn(pendingIndex);
            setPendingIndex(null);
        }
    }, [currencyval]);

    const currencyvalfn = async (index) => {
        const updatedDetails = [...quotationDetails];
        console.log("currencyval", currencyval)
        updatedDetails[index].CurrencyId = currencyval.BaseCurrencyId;
        updatedDetails[index].ConvertedCurrencyId = currencyval.ConvertedCurrencyId;
        updatedDetails[index].Exchangerate = currencyval.Exchangerate;
        const price = currencyval.Exchangerate || 1;
        const unitPrice = updatedDetails[index].UnitPrice || 0;
        const qty = updatedDetails[index].Qty || 1;
        updatedDetails[index].TotalPrice = parseFloat(unitPrice) * parseFloat(qty);
        updatedDetails[index].ConvertedPrice = price * unitPrice * qty;
        setTimeout(async () => {
            await setQuotationDetails(updatedDetails);
            console.log("af price cal", quotationDetails)
        }, 300)

    };

    const handleAddItem = () => {
        setQuotationDetails([
            ...quotationDetails,
            { "id": 0, "SQ_ID": 0, GasCodeId: null, GasDescription: "", Volume: "1", Pressure: "1", Qty: 1, Po_No: "", Uom: "", CurrencyId: 0, UnitPrice: 0, TotalPrice: 0, ConvertedPrice: "" || 0, ConvertedCurrencyId: 0 },
        ]);
    };

    const handleRemoveItem = (index) => {
        const updatedDetails = quotationDetails.filter((_, i) => i !== index);
        setQuotationDetails(updatedDetails);
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        history.push("/manage-quotation");
    };

    const GetContacts = async (id, selecteddata, sq_id) => {

        if (sq_id === undefined) sq_id = 0;

        const data = await GetContactList(id, sq_id);
        setContactList(data);


        var contactlist = data.map(item => ({
            ...item,
            id: 0

        }));


        // console.log("cusssssss : ",SelectedContactOperationValues);

        contactlist.forEach((item, index) => {
            var info = selecteddata.filter(x => x.CustomerContactId === item.CustomerContactId);
            if (info.length > 0) {
                item.id = info[0].id
            }

        });
        setopContactList(contactlist);

        //     console.log("OP   jj : ",OpContactList);
    };
    const getshippingAddress = async (id, sq_id) => {

        if (sq_id == undefined) sq_id = 0;

        const data = await GetShippingAddress(id, sq_id);
        setDeliveryAddressList(data);
    };

    const handleCustomerChange = async (opt) => {
        setselectedCustomer(opt.value);

        setSelectedContactOperationValues([]);
        setSqbasicinfo(prevState => ({ ...prevState, ["DeliveryAddressId"]: "" }));
        setSqbasicinfo(prevState => ({ ...prevState, ["CustomerContactId"]: "" }));
        setDeliveryAddressList([]);
        let option = opt.value;
        if (!option) {
            setSqbasicinfo(prevState => ({ ...prevState, ['CustomerId']: "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ['MainAddress']: "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ['FaxNo']: "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ['Email']: "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ['PhoneNumber']: "" }));
        } else {
            setselectedCustomer(opt.value);
            setSqbasicinfo(prevState => ({ ...prevState, ['CustomerId']: option.value }));
            setSqbasicinfo(prevState => ({ ...prevState, ['MainAddress']: option.MainAddress != null ? option.MainAddress : "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ['FaxNo']: option.Fax != null ? option.Fax : "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ['Email']: option.Email != null ? option.Email : "" }));
            setSqbasicinfo(prevState => ({ ...prevState, ['PhoneNumber']: option.PhoneNumber != null ? option.PhoneNumber : "" }));
            await GetContacts(option.value, []);
        }
    };

    const handleSalesChange = async (option) => {
        if (option) {
            setSqbasicinfo(prevState => ({ ...prevState, ['SalesPersonID']: option.value }));
            setSqbasicinfo(prevState => ({ ...prevState, ['SalesPerson']: option.value }));
            setSqbasicinfo(prevState => ({ ...prevState, ['SalesPersonEmail']: option.Email != null ? option.Email : "Test" }));
            setSqbasicinfo(prevState => ({ ...prevState, ['SalesPersonContact']: option.PhoneNumber != null ? option.PhoneNumber : "Test" }));
        } else {
            setSqbasicinfo(prevState => ({ ...prevState, ['SalesPersonID']: null }));
            setSqbasicinfo(prevState => ({ ...prevState, ['SalesPersonEmail']: null }));
            setSqbasicinfo(prevState => ({ ...prevState, ['SalesPersonContact']: null }));
        }
        console.log("sqbasicinfo", sqbasicinfo)
    };

    const openModal2 = async (e, actionType) => {
        if (actionType == "post") {
            if (sqbasicinfo.IsWithCustomer == false) {
                errorHandler(["Please select Existing Customer as Yes"]); // ✅ Use centralized errorHandler
                return;
            }
        }

        e.preventDefault();
        let hasError = false;
        let tempErrors = []; // Temporary error array 
        for (const key of Object.keys(sqbasicinfo)) {
            validationfn(key, sqbasicinfo[key], tempErrors);
        }

        let newErrorMsg = "";
        if (SelectedContactOperationValues == null || SelectedContactOperationValues == undefined || SelectedContactOperationValues.length == 0) {
            // newErrorClass = "form-control is-invalid";
            if (sqbasicinfo.IsWithCustomer == true) {
                newErrorMsg = "Please select customer operation contact.";
            }
        }
        else if (quotationDetails == undefined || quotationDetails == null || quotationDetails.length == 0) {
            newErrorMsg = "Please add atleast one gas details.";
        }
        setErrorClass(prev => ({ ...prev, [name]: "" }));

        if (newErrorMsg) {
            tempErrors.push(newErrorMsg);

        }

        // Validate quotationDetails
        quotationDetails.forEach((item, index) => {
            if (!item.GasCodeId) {
                tempErrors.push(`Gas Detail Row ${index + 1}: Gas Code is required.`);
            }
            if (!item.Uom) {
                tempErrors.push(`Gas Detail Row ${index + 1}: UOM is required.`);
            }
        });

        if (tempErrors.length > 0) {
            errorHandler(tempErrors); // ✅ Use centralized errorHandler
            hasError = true;
        }

        if (!hasError) {
            setSubmittype(actionType)
            setIsModalOpen2(true);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return "";
        const number = Number(value);
        return number.toLocaleString("en-IN"); // Use "en-US" for US format (1,234,567.89)
    };


    // Handle month change
    const handleMonthChange = (e) => {

        const { name, value } = e.target;
        setSelectedMonth(value);
        sqbasicinfo.Qtn_Month = value;
        setSelectedDay(''); // Reset day when month changes
        sqbasicinfo.Qtn_Day = '';
    };

    // Handle day change
    const handleDayChange = (e) => {
        const { name, value } = e.target;
        sqbasicinfo.Qtn_Day = value;
        setSelectedDay(value);
    };

    // Get number of days in the selected month (ignoring leap years)
    const getDaysInMonth = (month) => {
        const monthIndex = months.indexOf(month);
        const daysInMonth = [
            31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
        ];

        // If month is February, handle leap year
        if (monthIndex === 1) {
            const currentYear = new Date().getFullYear();
            if ((currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0)) {
                return 29; // Leap year February
            }
        }

        return daysInMonth[monthIndex];
    };

    return (
        <React.Fragment>
            <div className="">
                <Container fluid>

                    <Row>
                        <Card>
                            <Row>
                                <Col xl={12}>
                                    <div className="mt-2">
                                        <div className="row align-items-center g-3 justify-content-end mb-2">
                                            <div className="col-12 col-lg-8 col-md-8 col-sm-8 button-items">
                                                {/* ✅ Removed errorMsg display; handled by parent */}
                                                {successStatus &&
                                                    <UncontrolledAlert color="success" role="alert">
                                                        {successMsg}
                                                    </UncontrolledAlert>
                                                }
                                            </div>

                                        </div>

                                        <Card>
                                            <div className="accordion accordion-flush" id="accordionFlushExample">
                                                <div className="accordion-item">

                                                    <Collapse isOpen={activeAccord.col1} className="accordion-collapse">
                                                        <div className="accordion-body">
                                                            <Row>
                                                                <div className="col-xl-4">
                                                                    <Col md="12">
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                                                                            <Label for="SQ Type" className="required-label">Existing Customer </Label>


                                                                            <ToggleButton checked={sqbasicinfo.IsWithCustomer} className="bg-success text-white border-0 rounded" onChange={(e) => {
                                                                                changeexistingcustomer();
                                                                                setSqbasicinfo(prevState => ({
                                                                                    ...prevState,
                                                                                    IsWithCustomer: e.value,
                                                                                }));
                                                                            }} />                <Label > Click here. </Label>
                                                                        </div>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="SQ Type" className="required-label">SQ Type</Label>
                                                                            <Input type="select" name="SQ_Type" id="SQ_Type" onChange={handleInputChange} className={errorClass.SQ_Type} value={sqbasicinfo.SQ_Type} >
                                                                                <option key="0" value="">Select</option>
                                                                                {sqType.map((sqtype, index) => (
                                                                                    <option key={index} value={sqtype.SQTypeId}>
                                                                                        {sqtype.SQType}
                                                                                    </option>
                                                                                ))}
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="SQ_Nbr">System Seq. No.</Label>
                                                                            <Input type="text" name="SQ_Nbr" id="SQ_Nbr" disabled value={sqbasicinfo.SQ_Nbr} />
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="Sys_SQ_Nbr" className="required-label">Manual SQ No.</Label>
                                                                            <Input type="text" name="Sys_SQ_Nbr" id="Sys_SQ_Nbr" onChange={handleInputChange} className={errorClass.Sys_SQ_Nbr} value={sqbasicinfo.Sys_SQ_Nbr} maxLength={20} />
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label className="required-label">SQ Date</Label>
                                                                            <InputGroup>
                                                                                <Flatpickr
                                                                                    name="SQ_Date"
                                                                                    className="form-control d-block"
                                                                                    placeholder="dd-mm-yyyy"
                                                                                    options={{
                                                                                        altInput: true,
                                                                                        altFormat: "d-M-Y",
                                                                                        dateFormat: "Y-m-d",
                                                                                        minDate: minDate,
                                                                                        maxDate: maxDate,
                                                                                        defaultDate: defaultSQDate.toISOString().split("T")[0]
                                                                                    }}
                                                                                    value={sqDate}
                                                                                    onChange={handleDateChange}
                                                                                />
                                                                            </InputGroup>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="OrderedBy">Order by</Label>
                                                                            <Input type="text" name="OrderedBy" id="OrderedBy" placeholder="" onChange={handleInputChange} value={sqbasicinfo.OrderedBy || ""} />
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="Subject" className="required-label">Quote Subject</Label>
                                                                            <Input type="textarea" id="Subject" name="Subject" maxLength="100" rows="13" placeholder="Quote Subject" onChange={handleInputChange} className={errorClass.Subject} value={sqbasicinfo.Subject} />
                                                                        </FormGroup>
                                                                    </Col>
                                                                </div>
                                                                <div className="col-xl-4">
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="CustomerId" className="required-label">Customer</Label>
                                                                            <div className="d-flex align-items-center gap-2">


                                                                                <AutoComplete field="Customer" value={selectedCustomer}
                                                                                    suggestions={FilterCustomerList} completeMethod={loadCustomerLoad}

                                                                                    onChange={(e) => {
                                                                                        setselectedCustomer(e.value);
                                                                                    }}
                                                                                    className={`my-autocomplete ${errorClass.CustomerId}`}
                                                                                    style={{ width: "100%" }}
                                                                                    onSelect={(e) => handleCustomerChange(e)} />
                                                                                {/* <Select
                                                                                      name="CustomerId"
                                                                                      id="CustomerId"
                                                                                      options={CustomerList}
                                                                                      value={CustomerList.find(option => option.value === sqbasicinfo.CustomerId) || null}
                                                                                      onChange={option => handleCustomerChange(option)}
                                                                                      classNamePrefix="select"
                                                                                      isDisabled={isDisabled}
                                                                                      isLoading={isLoading}
                                                                                      isClearable={isClearable}
                                                                                      isRtl={isRtl}
                                                                                      isSearchable={isSearchable}
                                                                                  /> */}


                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-info fa-pull-right"
                                                                                    onClick={e => setIsModalOpen3(true)}
                                                                                    disabled={sqbasicinfo.IsWithCustomer}
                                                                                >
                                                                                    <i className="bx bx-plus label-icon font-size-16 align-middle "></i>
                                                                                </button>

                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="MainAddress">Main Address</Label>
                                                                            <Input type="text" name="MainAddress" id="MainAddress" disabled value={sqbasicinfo.MainAddress || ""} />
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="DeliveryAddressId" className="required-label">Delivery Address</Label>
                                                                            <Input type="select" name="DeliveryAddressId" id="DeliveryAddressId" onChange={handleInputChange} className={errorClass.DeliveryAddressId} value={sqbasicinfo.DeliveryAddressId}>
                                                                                <option key="0" value="">Select</option>
                                                                                {DeliveryAddressList.map((term) => (
                                                                                    <option key={term.DeliveryAddressId} value={term.DeliveryAddressId}>
                                                                                        {term.DeliveryAddress}
                                                                                    </option>
                                                                                ))}
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="PhoneNumber">Phone No.</Label>
                                                                            <Input type="text" name="PhoneNumber" id="PhoneNumber" disabled onChange={handleInputChange} value={sqbasicinfo.PhoneNumber || ""} />
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="FaxNo">Fax No.</Label>
                                                                            <Input type="text" name="FaxNo" id="FaxNo" disabled onChange={handleInputChange} value={sqbasicinfo.FaxNo || ""} />
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="Email">Email</Label>
                                                                            <Input type="email" name="Email" id="Email" disabled onChange={handleInputChange} value={sqbasicinfo.Email || ""} />
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label className="required-label">Effective From Date</Label>
                                                                            <InputGroup>
                                                                                <Flatpickr
                                                                                    name="EffectiveFrom_Date"
                                                                                    className="form-control d-block"
                                                                                    placeholder="dd-mm-yyyy"
                                                                                    options={{
                                                                                        altInput: true,
                                                                                        altFormat: "d-M-Y",
                                                                                        dateFormat: "Y-m-d",
                                                                                        minDate: sqbasicinfo.SQ_Date, // Ensure Date object is correctly passed
                                                                                        maxDate: maxDate, // Ensure Date object is correctly passed
                                                                                        defaultDate: defaultEffectiveDate.toISOString().split("T")[0]
                                                                                    }}
                                                                                    value={defaultEffectiveDate}
                                                                                    onChange={handleEffectiveDateChange}
                                                                                />
                                                                            </InputGroup>
                                                                        </FormGroup>
                                                                    </Col>


                                                                    {/* <Col md="12">
                                                                                                                                                  <FormGroup>
                                                                                                              
                                                                                                                                                  <Label for="FaxNo" className="required-label">TBA</Label>
                                                                                                                                                      <Input
                                                                                                                                                        type="text"
                                                                                                                                                        name="TBA"
                                                                                                                                                        id="TBA"
                                                                                                                                                        maxLength={20}
                                                                                                                                                        onChange={handleInputChange}
                                                                                                                                                        value={sqbasicinfo.TBA || ""}
                                                                                                                                                      />
                                                                                                              
                                                                                                                                                    </FormGroup>
                                                                                                                                                    </Col> */}


                                                                </div>
                                                                <div className="col-xl-4">
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="CustomerContactId" className="required-label">Customer Contact</Label>
                                                                            <Input
                                                                                type="select"
                                                                                name="CustomerContactId"
                                                                                id="CustomerContactId"
                                                                                onChange={handleInputChange}
                                                                                className={errorClass.CustomerContactId}
                                                                                value={sqbasicinfo.CustomerContactId} >
                                                                                <option key="0" value="">Select</option>
                                                                                {ContactList.map((customer, index) => (
                                                                                    <option key={index} value={customer.CustomerContactId}>
                                                                                        {customer.CustomerContact}
                                                                                    </option>
                                                                                ))}
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>

                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="CustomerContactId" className="required-label">
                                                                                Customer Operation Contact
                                                                            </Label>
                                                                            <Select
                                                                                components={animatedComponents}
                                                                                className="basic-single"
                                                                                classNamePrefix="select"
                                                                                isDisabled={isDisabled}
                                                                                isLoading={isLoading}
                                                                                isClearable={isClearable}
                                                                                isRtl={isRtl}
                                                                                isSearchable={isSearchable}
                                                                                name={`customercontactoperation`}
                                                                                id={`customercontactoperation`}
                                                                                options={OpContactList}
                                                                                isMulti

                                                                                value={OpContactList.filter(option =>
                                                                                    SelectedContactOperationValues?.some(
                                                                                        selected =>
                                                                                            parseInt(selected.value) === parseInt(option.value)
                                                                                    )
                                                                                )}

                                                                                onChange={(selectedOptions) => {
                                                                                    setSelectedContactOperationValues(selectedOptions || []);
                                                                                }}
                                                                            />
                                                                        </FormGroup>
                                                                    </Col>



                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label className="required-label">Quotation validity</Label>
                                                                            <InputGroup className="gap-1 flex-wrap">

                                                                                {/* Month Picker */}

                                                                                <Input type="select" name="SQ_Qtn_Month" id="SQ_Qtn_Month" style={{ width: "70px" }}
                                                                                    onChange={(e) => {
                                                                                        handleMonthChange(e);
                                                                                        handleInputChange(e);

                                                                                    }}
                                                                                    className={errorClass.SQ_Qtn_Month} value={sqbasicinfo.Qtn_Month} >
                                                                                    <option value="">MONTH ▼</option>
                                                                                    {months.map((month, index) => (
                                                                                        <option key={index} value={month}>
                                                                                            {month}
                                                                                        </option>
                                                                                    ))}
                                                                                </Input>


                                                                                {/* Day Picker */}
                                                                                <Input type="select" name="SQ_Qtn_Day" id="SQ_Qtn_Day" style={{ width: "40px" }}
                                                                                    onChange={(e) => {
                                                                                        handleDayChange(e);
                                                                                        handleInputChange(e);

                                                                                    }}

                                                                                    className={errorClass.SQ_Qtn_Day} value={sqbasicinfo.Qtn_Day} >
                                                                                    <option value="">DAY ▼</option>
                                                                                    {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => (
                                                                                        <option key={i + 1} value={i + 1}>
                                                                                            {i + 1}
                                                                                        </option>
                                                                                    ))}
                                                                                </Input>
                                                                                <span className="px-2 fw-bold align-self-center">(OR)</span>
                                                                                <Input
                                                                                    type="text"
                                                                                    placeholder="TBA"
                                                                                    name="TBA"
                                                                                    id="TBA"
                                                                                    style={{ width: "100px" }}
                                                                                    maxLength={20}
                                                                                    value={sqbasicinfo.TBA || ""}
                                                                                    onChange={(e) => {
                                                                                        debugger
                                                                                        const { name, value } = e.target;
                                                                                        setSqbasicinfo(prevState => ({
                                                                                            ...prevState,
                                                                                            [name]: value,
                                                                                        }));
                                                                                    }}
                                                                                />
                                                                            </InputGroup>
                                                                        </FormGroup>
                                                                    </Col>

                                                                    <Col md="12">
                                                                        <FormGroup>


                                                                        </FormGroup>
                                                                    </Col>

                                                                    {/* <Col md="12">
                                                                              <FormGroup>
                                                                                  <Label for="Validity" className="required-label">Quote Validity (in days)</Label>
                                                                                  <Input
                                                                                      type="number"
                                                                                      name="Validity"
                                                                                      id="Validity"
                                                                                      onChange={handleInputChange}
                                                                                      max={60}
                                                                                      step="1"
                                                                                      onKeyDown={(e) => {
                                                                                          if (e.key === "." || e.key === "e" || e.key === "-") {
                                                                                              e.preventDefault();
                                                                                          }
                                                                                      }}
                                                                                      className={errorClass.Validity}
                                                                                      value={sqbasicinfo.Validity}
                                                                                  />
                                                                              </FormGroup>
                                                                          </Col> */}
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="DeliveryTerms" className="required-label">Delivery Terms </Label>
                                                                            <Input type="text" name="DeliveryTerms" id="DeliveryTerms" onChange={handleInputChange} className={errorClass.DeliveryTerms} value={sqbasicinfo.DeliveryTerms} maxLength={50} />
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="PaymentTermsId" className="required-label">Payment Terms</Label>
                                                                            <Input type="select" name="PaymentTermsId" id="PaymentTermsId" onChange={handleInputChange} className={errorClass.PaymentTerms} value={sqbasicinfo.PaymentTermsId}>
                                                                                <option>Select</option>
                                                                                {PaymentTermList.map((term) => (
                                                                                    <option key={term.PaymentTermsId} value={term.PaymentTermsId}>
                                                                                        {term.PaymentTerms}
                                                                                    </option>
                                                                                ))}
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="PaymentMethodId" className="required-label">Payment Method</Label>
                                                                            <Input type="select" name="PaymentMethodId" id="PaymentMethodId" onChange={handleInputChange} className={errorClass.PaymentMethodId} value={sqbasicinfo.PaymentMethodId} >
                                                                                <option key="0" value="">Select</option>
                                                                                {PaymentMethodList.map((method) => (
                                                                                    <option key={method.PaymentMethodId} value={method.PaymentMethodId}>
                                                                                        {method.PaymentMethod}
                                                                                    </option>
                                                                                ))}
                                                                            </Input>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="SalesPersonID" className="required-label">Sales Person</Label>
                                                                            <Select
                                                                                name="SalesPersonID"
                                                                                id="SalesPersonID"
                                                                                options={SalesPersonList}
                                                                                value={SalesPersonList.find(option => option.value === sqbasicinfo.SalesPersonID) || null}
                                                                                onChange={option => handleSalesChange(option)}
                                                                                classNamePrefix="select"
                                                                                isDisabled={isDisabled}
                                                                                isLoading={isLoading}
                                                                                isClearable={isClearable}
                                                                                isRtl={isRtl}
                                                                                isSearchable={isSearchable}
                                                                            />
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="SalesPersonContact">Sales Person Contact</Label>
                                                                            <Input type="text" name="SalesPersonContact" id="SalesPersonContact" disabled value={sqbasicinfo.SalesPersonContact} />
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col md="12">
                                                                        <FormGroup>
                                                                            <Label for="SalesPersonEmail">Sales Person Email</Label>
                                                                            <Input type="email" name="SalesPersonEmail" id="SalesPersonEmail" disabled value={sqbasicinfo.SalesPersonEmail} />
                                                                        </FormGroup>
                                                                    </Col>

                                                                </div>
                                                            </Row>

                                                            <div className="row">
                                                                <div className="col-12 col-lg-12">
                                                                    <Label for="Remark">Terms and Conditions</Label>
                                                                    <Form method="post">
                                                                        <CKEditor editor={ClassicEditor}
                                                                            data={sqbasicinfo.TermsAndCond}
                                                                            onReady={editor => { console.log('Editor is ready to use!', editor); }}
                                                                            onChange={(event, editor) => {
                                                                                const data = editor.getData();
                                                                                setSqbasicinfo(prevState => ({
                                                                                    ...prevState,
                                                                                    TermsAndCond: data
                                                                                }));
                                                                            }}
                                                                        />
                                                                    </Form>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Collapse>
                                                </div>
                                                <div className="accordion-item">
                                                    <h2 className="accordion-header" id="headingFlushTwo" style={{ backgroundColor: "#cee3f8" }}>
                                                        <button className={`accordion-button fw-medium ${!activeAccord.col2 ? "collapsed" : ""}`} type="button" onClick={() => showAccord("col2")} style={{ cursor: "pointer" }}> GAS DETAIL </button>
                                                    </h2>
                                                    <Collapse isOpen={activeAccord.col2} className="accordion-collapse">
                                                        <div className="accordion-body">
                                                            <div className="table-responsive tab-wid table-height" >
                                                                <Table className="table mb-0">
                                                                    <thead style={{ backgroundColor: "#3e90e2" }}>
                                                                        <tr>
                                                                            <th className="text-center" style={{ width: "2%" }}>
                                                                                <span style={{ cursor: "pointer", alignItems: "center" }} onClick={handleAddItem}>
                                                                                    <i className="mdi mdi-plus" />
                                                                                </span></th>
                                                                            <th className="text-center required-label" style={{ width: "12%" }}>Gas Code</th>
                                                                            <th className="text-center" style={{ width: "8%" }}>Gas Details</th>
                                                                            <th className="text-center" style={{ width: "8%" }}>PO Number</th>
                                                                            <th className="text-center" style={{ width: "5%" }}>Qty</th>
                                                                            <th className="text-center required-label" style={{ width: "14%" }}>UOM</th>
                                                                            <th className="text-center required-label" style={{ width: "10%" }}>Currency</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {quotationDetails.map((item, index) => {
                                                                            const tooltipId = `gas-code-${index}`;
                                                                            const tooltipId2 = `delivery-${index}`;
                                                                            return (
                                                                                <tr key={item.GasCodeId || index}>
                                                                                    <td>
                                                                                        <span color="danger" className="btn-sm" onClick={() => openModal(index)} title="Delete">
                                                                                            <i className="mdi mdi-trash-can-outline label-icon align-middle" title="Delete" />
                                                                                        </span>
                                                                                    </td>
                                                                                    <td>
                                                                                        <Select
                                                                                            name="GasCodeId"
                                                                                            id={`GasCodeId-${index}`} // Unique ID for each row
                                                                                            options={gasCodeList
                                                                                                .filter(code =>
                                                                                                    !quotationDetails.some((item, i) => i !== index && item.GasCodeId === code.GasCodeId)
                                                                                                )
                                                                                                .map(code => ({ value: code.GasCodeId, label: code.GasCode }))}
                                                                                            value={gasCodeList.find(option => option.GasCodeId === quotationDetails[index]?.GasCodeId) || null}
                                                                                            onChange={option => handleGasCodeChange(index, option ? option.value : null)}
                                                                                            classNamePrefix="select"
                                                                                            isDisabled={isDisabled}
                                                                                            isLoading={isLoading}
                                                                                            isSearchable={isSearchable}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        <span id={tooltipId} style={{ cursor: "pointer", color: "blue" }} className="btn-rounded btn btn-link">
                                                                                            Details
                                                                                        </span>
                                                                                        {!isLoading && (
                                                                                            <Tooltip isOpen={tooltipOpen[tooltipId]} target={tooltipId} toggle={() => toggleTooltip(tooltipId)} style={{ maxWidth: "300px", width: "300px" }} >
                                                                                                <div style={{ textAlign: "left" }} className="font-size-13">
                                                                                                    <div className="d-flex align-items-center gap-2">
                                                                                                        <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>Volume:</strong></div>
                                                                                                        <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left"> {quotationDetails[index].Volume}</div>
                                                                                                    </div>
                                                                                                    <div className="d-flex align-items-center gap-2">
                                                                                                        <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>Pressure:</strong></div>
                                                                                                        <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">{quotationDetails[index].Pressure}</div>
                                                                                                    </div>
                                                                                                    <div className="d-flex align-items-center gap-2">
                                                                                                        <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>Description:</strong></div>
                                                                                                        <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">{quotationDetails[index].GasDescription}</div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </Tooltip>
                                                                                        )}
                                                                                    </td>
                                                                                    <td>
                                                                                        <Input
                                                                                            type="text"
                                                                                            id={`Po_No-${index}`}
                                                                                            className="text-start"
                                                                                            value={quotationDetails[index]?.Po_No !== undefined && quotationDetails[index]?.Po_No !== null ? String(quotationDetails[index].Po_No) : ''}
                                                                                            maxLength={20}
                                                                                            onChange={(e) => {
                                                                                                // Allow free-form input so users can type strings like "po ni".
                                                                                                // We'll interpret/sanitize when submitting.
                                                                                                const inputVal = e.target.value;
                                                                                                setQuotationDetails((prev) => {
                                                                                                    const updated = [...prev];
                                                                                                    updated[index] = {
                                                                                                        ...updated[index],
                                                                                                        Po_No: inputVal,
                                                                                                    };
                                                                                                    return updated;
                                                                                                });
                                                                                            }}
                                                                                        />
                                                                                    </td>
                                                                                    <td>
                                                                                        <Input
                                                                                            type="text"
                                                                                            className="text-end"
                                                                                            value={
                                                                                                quotationDetails[index]?.Qty
                                                                                                    ? Number(quotationDetails[index].Qty.toString().replace(/,/g, '')).toLocaleString()
                                                                                                    : ''
                                                                                            }
                                                                                            id={`Qty-${index}`}
                                                                                            maxLength={13}
                                                                                            onChange={(e) => {
                                                                                                let rawValue = e.target.value.replace(/,/g, '');
                                                                                                if (/^\d*$/.test(rawValue)) {
                                                                                                    setQuotationDetails((prev) => {
                                                                                                        const updated = [...prev];
                                                                                                        updated[index] = {
                                                                                                            ...updated[index],
                                                                                                            Qty: rawValue, // Store raw number in state
                                                                                                        };
                                                                                                        return updated;
                                                                                                    });
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </td>

                                                                                    <td>
                                                                                        <Input type="select" onChange={(e) => handleUOMChange(index, e.target.value)} id={`Uom-${index}`} value={quotationDetails[index].Uom}>
                                                                                            <option key="0" value="">Select</option>
                                                                                            {UOMList.map((uom) => (
                                                                                                <option key={uom.UoMId} value={uom.UoMId}>
                                                                                                    {uom.UoM}
                                                                                                </option>
                                                                                            ))}
                                                                                        </Input>
                                                                                    </td>
                                                                                    <td>
                                                                                        <Input type="select" onChange={(e) => handleCurrencyChange(index, e.target.value)} id={`Currency-${index}`} value={quotationDetails[index].ConvertedCurrencyId || ""}>
                                                                                            <option key="0" value="">Select</option>
                                                                                            {CurrencyList.map((currency) => (
                                                                                                <option key={currency.currencyid} value={currency.currencyid}>
                                                                                                    {currency.Currency}
                                                                                                </option>
                                                                                            ))}
                                                                                        </Input>
                                                                                    </td>
                                                                                </tr>
                                                                            )
                                                                        })}
                                                                    </tbody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                    </Collapse>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Row>
                </Container>
            </div>
            {/* Confirmation Modal */}
            <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
                <ModalBody className="py-3 px-5">
                    <Row>
                        <Col lg={12}>
                            <div className="text-center">
                                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />
                                <h4>Do you want to delete this item?</h4>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="text-center mt-3 button-items">
                                <Button className="btn btn-info" color="success" size="lg" onClick={() => handleRemoveItem(gaslistindex)}>
                                    Yes
                                </Button>
                                <Button color="danger" size="lg" className="btn btn-danger" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            <Modal isOpen={isModalOpen2} toggle={() => setIsModalOpen2(false)} centered tabIndex="1">
                <ModalBody className="py-3 px-5">
                    <Row>
                        <Col lg={12}>
                            <div className="text-center">
                                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />
                                {/* <h4>Do you want to {submittype} this details?</h4> */}
                                <h4>
                                    Do you want to {(submittype == "save" ? "Update" : submittype === "Ready To Post"
                                        ? "Ready To Post" : "Post")}?
                                </h4>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="text-center mt-3 button-items">
                                <Button className="btn btn-info" color="success" size="lg" onClick={(e) => handleSubmit(e, submittype)}>
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

            <Modal
                isOpen={isModalOpen3}
                toggle={() => setIsModalOpen3(false)}
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
                                <h4>Do you want to add a customer?</h4>
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
                                    onClick={e => createcustomer()}
                                >
                                    Yes
                                </Button>
                                <Button
                                    color="danger"
                                    size="lg"
                                    className="btn btn-danger"
                                    onClick={() => setIsModalOpen3(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
    return (
        <>
            <Row>
                <Col md="4">
                    <FormGroup>
                        <Label for="SalesPerson">Sales Person</Label>
                        <Select
                            name="SalesPerson"
                            id="SalesPerson"
                            options={salesPersonList}
                            onChange={(option) => handleSelectChange("SalesPerson", option)}
                            classNamePrefix="select"
                            components={animatedComponents}
                        />
                    </FormGroup>
                </Col>
                <Col md="4">
                    <FormGroup>
                        <Label for="SalesPersonEmail">Sales Person Email</Label>
                        <Input
                            type="email"
                            name="SalesPersonEmail"
                            id="SalesPersonEmail"
                            disabled
                            value={soData.SalesPersonEmail}
                        />
                    </FormGroup>
                </Col>
                <Col md="4">
                    <FormGroup>
                        <Label for="SalesPersonPhone">Sales Person Phone</Label>
                        <Input
                            type="text"
                            name="SalesPersonPhone"
                            id="SalesPersonPhone"
                            disabled
                            value={soData.SalesPersonPhone}
                        />
                    </FormGroup>
                </Col>
                <Col md="4">
                    <FormGroup>
                        <Label for="GasCode">Gas Code</Label>
                        <Select
                            components={animatedComponents}
                            name="GasCode"
                            options={codeList}
                            isMulti
                            onChange={(selectedOptions) => handleSelectChange("GasCode", selectedOptions)}
                            classNamePrefix="select"
                        />
                    </FormGroup>
                </Col>
            </Row>
        </>
    );
});
EditDirectSalesForm.displayName = "EditDirectSalesForm";
export default EditDirectSalesForm;
