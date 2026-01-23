import React, { useState, useEffect } from "react";
import { Calendar } from 'primereact/calendar';
import { ToggleButton } from 'primereact/togglebutton';

import {
  Card,
  CardBody,
  Col,
  Collapse,
  Container,
  Row,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Table,
  InputGroup,
  Modal,
  ModalBody,
  UncontrolledAlert,
} from "reactstrap";
import { useHistory } from "react-router-dom";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { Tooltip } from "reactstrap";
import Select from "react-select";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { AutoComplete } from "primereact/autocomplete";
import makeAnimated from "react-select/animated";
const animatedComponents = makeAnimated();
import {
  fetchGasList,
  GetQuotationType,
  GetPaymentMethods,
  GetCustomer,
  GetPaymentTerms,
  GetSalesPerson,
  GetUoM,
  GetCurrency,
  AddSQ,
  GetContactList,
  GetCurrencyconversion,
  GetShippingAddress,
  GetSqseqno,
  GetCascodedetail, AddCustomerFromSQ
} from "../../../common/data/mastersapi";


const AddQuotation = () => {
  const history = useHistory();
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeAccord, setActiveAccord] = useState({
    col1: true,
    col2: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [successStatus, setSuccessStatus] = useState(false);
  const [quotationDetails, setQuotationDetails] = useState([
    {
      id: 0,
      SQ_ID: 0,
      GasCodeId: null,
      GasDescription: "",
      Volume: "1",
      Pressure: "1",
      Qty: 1,
      Uom: "",
      CurrencyId: "5",
      UnitPrice: 0,
      TotalPrice: 0,
      ConvertedPrice: "",
      ConvertedCurrencyId: "5",
      Exchangerate: "0",
    },
  ]);
  const [submittype, setSubmittype] = useState("");
  const [currencySelect, setcurrencySelect] = useState("AUD");
  const [tooltipOpen, setTooltipOpen] = useState({});
  const toggleTooltip = id => {
    setTooltipOpen(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const [gasCodeList, setGasCodeList] = useState([]);
  const [CustomerList, setCustomerList] = useState([]);
  const [FilterCustomerList, setFilterCustomerList] = useState([]);
  const [ContactList, setContactList] = useState([]);
  const [OpContactList, setopContactList] = useState([]);
  const [sqType, setsqType] = useState([]);
  const [SalesPersonList, setSalesPersonList] = useState([]);
  const [MainAddress, setMainAddress] = useState([]);
  const [PaymentTermList, setPaymentTermList] = useState([]);
  const [PaymentMethodList, setPaymentMethodList] = useState([]);
  const [CurrencyList, setCurrencyList] = useState([]);
  const [UOMList, setUOMList] = useState([]);
  const [SqSeqNo, setSqSeqNo] = useState();
  const [DeliveryAddressList, setDeliveryAddressList] = useState([]);

  const showAccord = activeItem => {
    setActiveAccord(prevState => ({
      ...prevState, // Preserve the existing state
      [activeItem]: !prevState[activeItem], // Dynamically update the specific key
    }));
  };
  const [selectedOptions, setselectedOptions] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gaslistindex, setGaslistindex] = useState();
  const openModal = index => {
    setGaslistindex(index);
    setIsModalOpen(true);
  };
  const currentDate = new Date();
  const [selectedCustomer, setselectedCustomer] = useState(null);
  const [sqbasicinfo, setSqbasicinfo] = useState({
    SQ_Type: 26,
    CustomerId: "",
    CustomerContactId: "",
    CustomerAttention: "",
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
    PaymentMethod: "",
    Subject: "",
    SalesPerson: "",
    SalesPersonContact: "",
    SalesPersonEmail: "",
    TermsAndCond: "",
    id: 0,
    UserId: 1,
    OrgId: 1,
    BranchId: 1,
    IsReadyToPost: 0,
    EffectiveFromDate: currentDate,
    Qtn_Month: "",
    Qtn_Day: 0,
    TBA: "",
    IsWithCustomer: true,
    IsSavedByDSO: 0

  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [validDays, setValidDays] = useState([]);
  const [SelectedContactOperationValues, setSelectedContactOperationValues] = useState(null);


  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  // Array of months and days
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
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
      const data = await fetchGasList(1, 0);
      setGasCodeList(data);
    };
    loadGasList();

    const loadCustomerList = async (ev) => {

      const data = await GetCustomer(1, 0);
      setCustomerList(data);

    };
    loadCustomerList();

    const loadsqType = async () => {

      const data = await GetQuotationType(1);
      setsqType(data);
    };
    loadsqType();

    const loadSalesPersonList = async () => {
      const data = await GetSalesPerson(1, 0);
      setSalesPersonList(data);
    };
    loadSalesPersonList();

    const loadPaymentTermList = async () => {
      const data = await GetPaymentTerms(1, 0);
      setPaymentTermList(data);
    };
    loadPaymentTermList();

    const loadPaymentMethodList = async () => {
      const data = await GetPaymentMethods(1, 0);
      setPaymentMethodList(data);
    };
    loadPaymentMethodList();

    const loadCurrencyList = async () => {
      const data = await GetCurrency(1, 0);
      setCurrencyList(data);
    };
    loadCurrencyList();

    const loadUOMList = async () => {
      const data = await GetUoM(1, 0);
      setUOMList(data);
    };
    loadUOMList();

    const loadSQSeqNo = async () => {
      const data = await GetSqseqno(1);
      const sqNoString = data.SQNO?.toString() || "";
      setSqSeqNo(data.SQNO);
      setSqbasicinfo(prevState => ({
        ...prevState,
        SQ_Nbr: sqNoString,
      }));
    };
    loadSQSeqNo();
  }, []);

  useEffect(() => {
    let rtv = sqType.filter(val => val.SQTypeId == sqbasicinfo.SQ_Type);
    if (rtv.length > 0) {
      setSqbasicinfo(prevState => ({
        ...prevState,
        TermsAndCond: rtv[0].TermsAndCond,
      }));
    }
  }, [sqType]);

  // const minDate = new Date();
  // minDate.setDate(currentDate.getDate() - 90);
  // const maxDate = new Date();
  // maxDate.setDate(currentDate.getDate() + 90);
  const currentYear = currentDate.getFullYear();
  const minDate = new Date(currentYear, 0, 1);
  const minEffectiveDate = new Date();

  const maxDate = new Date(currentYear, 11, 31);
  const handleDateChange = selectedDates => {
    const selectedDate = selectedDates[0];
    const localDate = new Date(
      selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];
    setSqbasicinfo(prevState => ({
      ...prevState,
      SQ_Date: localDate,
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

  // const [gasDetails, setGasDetails] = useState([
  //     {
  //       "id": 0,
  //       "sQ_ID": 0,
  //       "gasCodeId": 0,
  //       "gasDescription": "string",
  //       "volume": 0,
  //       "pressure": 0,
  //       "qty": 0,
  //       "uom": 0,
  //       "currencyId": 5,
  //       "unitPrice": 0,
  //       "totalPrice": 0,
  //       "convertedPrice": 0,
  //       "convertedCurrencyId": 5
  //     }
  // ]);

  const [errorClass, setErrorClass] = useState({
    Validity: "",
    SQType: "",
  });
  const [errorMsg, setErrorMsg] = useState([]);

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

  const handleInputChange = e => {
    const { name, value } = e.target;

    let hasError = false;
    let tempErrors = [];
    setErrorMsg([]);
    validationfn(name, value, tempErrors);
    if (tempErrors.length > 0) {
      setErrorMsg(tempErrors);
      hasError = true;
    }

    // if (name == "Validity" && parseInt(value) < 1) {
    //   setErrorMsg(["Quote validity should be greater than zero"]);
    //   hasError = true;
    // }

    if (!hasError) {
      setSqbasicinfo(prevState => ({ ...prevState, [name]: value }));
      if (name === "SQ_Type") {
        let rtv = sqType.filter(val => val.SQTypeId == value);
        if (rtv.length > 0) {
          setSqbasicinfo(prevState => ({
            ...prevState,
            TermsAndCond: rtv[0].TermsAndCond,
          }));
        }
      }
      if (name === "CustomerContactId") {

        setSqbasicinfo(prevState => ({ ...prevState, ["DeliveryAddressId"]: "" }));
        setDeliveryAddressList([]);
        getshippingAddress(value);
      }
      if (name === "DeliveryAddressId") {

        let devliadd = DeliveryAddressList.filter(
          val => val.DeliveryAddressId == value
        );
        if (devliadd.length > 0) {
          setSqbasicinfo(prevState => ({
            ...prevState,
            DeliveryAddress: devliadd[0].DeliveryAddress,
          }));
        }
      }
    } else {
      setSqbasicinfo(prevState => ({ ...prevState, [name]: "" }));
    }

    console.log(sqbasicinfo);
  };

  const handleSubmit = async (e, actionType) => {
    e.preventDefault();
    let hasError = false;
    let tempErrors = []; // Temporary error array
    setErrorMsg([]); // Clear previous errors before validating
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


    setIsModalOpen2(false);
    if (tempErrors.length > 0) {
      setErrorMsg(tempErrors);
      hasError = true;
    }

    if (!hasError) {

      setIsSubmitting(true);
      try {
        const updatedSQBasicInfo = {
          ...sqbasicinfo,
          isSubmit: actionType === "post" ? 1 : 0,
          IsReadyToPost: actionType === "Ready To Post" ? 1 : 0,
          DeliveryAddressId: sqbasicinfo.DeliveryAddressId === "" ? null : sqbasicinfo.DeliveryAddressId,
          CustomerContactId: sqbasicinfo.CustomerContactId === "" ? 0 : sqbasicinfo.CustomerContactId,
          Qtn_Day: sqbasicinfo.Qtn_Day === "" ? null : sqbasicinfo.Qtn_Day,
          IsSavedByDSO: sqbasicinfo.IsSavedByDSO == 0 ? false : true
        };
        console.log("update", {
          header: updatedSQBasicInfo,
          details: quotationDetails,
        });

        const response = await AddSQ({
          header: updatedSQBasicInfo,
          details: quotationDetails,
          operation: SelectedContactOperationValues?.map(x => ({
            CustomerContactId: x.value,
            CustomerContactName: x.label
          }))
        });
        if (response?.status) {
          console.log("Success:", response);
          setSuccessStatus(response?.status);
          setSuccessMsg(response?.message);

          setTimeout(() => {
            history.push("/manage-quotation");
          }, 1000);
        } else {
          console.error(
            "Failed to add SQ:",
            response?.Message || "Unknown error"
          );
          setErrorMsg([
            response?.Message || "Please verify the gas code details.",
          ]);
        }
      } catch (error) {
        console.error("Error in AddSQ:", error);
        setErrorMsg(["An error occurred while adding SQ. Please try again."]);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const [sqGasinfo, setSqGasinfo] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState({});

  const handleGasCodeChange = async (index, selectedValue) => {
    const updatedDetails = [...quotationDetails];
    setIsLoading(true);
    if (!selectedValue) {
      updatedDetails[index] = {
        ...updatedDetails[index], // Preserve existing properties
        GasCodeId: "",
        Description: "",
        Volume: "",
        Pressure: "",
        Qty: 1,
        Uom: "",
        CurrencyId: 5,
        UnitPrice: 0,
        TotalPrice: 0,
        ConvertedPrice: "",
        ConvertedCurrencyId: 5,
        Exchangerate: "",
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
          CurrencyId: 5,
          UnitPrice: 0,
          TotalPrice: 0,
          ConvertedPrice: "",
          ConvertedCurrencyId: 5,
          Exchangerate: "",
        };
        setIsLoading(false);
        setQuotationDetails(updatedDetails);
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
    const updatedDetails = [...quotationDetails];
    updatedDetails[index].Qty = 1;
    setQuotationDetails(updatedDetails);
    await currencyvalfn();
  };

  const handleUOMChange = (index, uom) => {
    const updatedDetails = [...quotationDetails];
    updatedDetails[index].Uom = uom; //UOMList.find((u) => u.UoMId === uom);
    setQuotationDetails(updatedDetails);
    console.log(updatedDetails);
  };

  const handleUnitPriceChange = async (index, uprice) => {
    const updatedDetails = [...quotationDetails];
    updatedDetails[index].UnitPrice = uprice < 1 ? "" : uprice;
    setQuotationDetails(updatedDetails);
    await GetCurrencyval(index, updatedDetails[index].ConvertedCurrencyId);
  };

  const handleCurrencyChange = async (index, value) => {
    const updatedDetails = [...quotationDetails];
    updatedDetails[index].CurrencyId = 5;
    updatedDetails[index].ConvertedCurrencyId = value;
    setQuotationDetails(updatedDetails);
    setcurrencySelect(value);
    await GetCurrencyval(index, value);
  };

  const [currencyval, setCurrencyval] = useState({});
  const [pendingIndex, setPendingIndex] = useState(null);
  const GetCurrencyval = async (index, currencyId) => {
    const data = await GetCurrencyconversion(currencyId);
    console.log("call currency", data[0]);
    setCurrencyval(data[0]);
    setPendingIndex(index);
  };

  useEffect(() => {
    if (currencyval && pendingIndex !== null) {
      currencyvalfn(pendingIndex);
      setPendingIndex(null);
    }
  }, [currencyval]);

  const currencyvalfn = async index => {
    const updatedDetails = [...quotationDetails];
    console.log("currencyval", currencyval);
    updatedDetails[index].CurrencyId = currencyval.BaseCurrencyId;
    updatedDetails[index].ConvertedCurrencyId = currencyval.ConvertedCurrencyId;
    updatedDetails[index].Exchangerate = currencyval.Exchangerate;

    const price = currencyval.Exchangerate || 1;
    const unitPrice = updatedDetails[index].UnitPrice || 0;
    const qty = updatedDetails[index].Qty || 1;

    let unit_price = parseFloat(unitPrice) * parseFloat(qty);
    unit_price = parseFloat(unit_price.toFixed(2));
    // unit_price = new Intl.NumberFormat("en-US", {
    //     style: "decimal",
    //     minimumFractionDigits: 2,
    //     maximumFractionDigits: 2
    // }).format(unit_price);
    updatedDetails[index].TotalPrice = unit_price;

    let esti_price =
      parseFloat(price) * parseFloat(unitPrice) * parseFloat(qty);
    esti_price = parseFloat(esti_price.toFixed(2));
    // esti_price = new Intl.NumberFormat("en-US", {
    //     style: "decimal",
    //     minimumFractionDigits: 2,
    //     maximumFractionDigits: 2
    // }).format(esti_price);
    updatedDetails[index].ConvertedPrice = esti_price;

    // unit_price = new Intl.NumberFormat("en-US", {
    //     style: "decimal",
    //     minimumFractionDigits: 2,
    //     maximumFractionDigits: 2
    // }).format(unit_price);
    updatedDetails[index].UnitPrice = unit_price;

    setTimeout(async () => {
      await setQuotationDetails(updatedDetails);
      console.log("af price cal", quotationDetails);
    }, 300);
  };

  const handleAddItem = () => {
    setQuotationDetails([
      ...quotationDetails,
      {
        id: 0,
        SQ_ID: 0,
        GasCodeId: null,
        GasDescription: "",
        Volume: "1",
        Pressure: "1",
        Qty: 1,
        Uom: "",
        CurrencyId: "2",
        UnitPrice: 0,
        TotalPrice: 0,
        ConvertedPrice: "",
        ConvertedCurrencyId: 5,
        Exchangerate: "",
      },
    ]);
  };

  const handleRemoveItem = index => {
    const updatedDetails = quotationDetails.filter((_, i) => i !== index);
    setQuotationDetails(updatedDetails);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    history.push("/manage-quotation");
  };

  const GetContacts = async id => {
    const data = await GetContactList(id, 0);
    setContactList(data);


    var contactlist = data.map(item => ({
      ...item,
      id: 0

    }));

    setopContactList(contactlist);

  };
  const getshippingAddress = async id => {

    const data = await GetShippingAddress(id, 0);
    console.log("deliveryAddrList :", data);
    setDeliveryAddressList(data);
  };

  const handleCustomerChange = async opt => {

    setselectedCustomer(opt.value);

    setSelectedContactOperationValues([]);
    setSqbasicinfo(prevState => ({ ...prevState, ["DeliveryAddressId"]: "" }));
    setSqbasicinfo(prevState => ({ ...prevState, ["CustomerContactId"]: "" }));
    setDeliveryAddressList([]);

    let option = opt.value;
    if (!option) {
      setSqbasicinfo(prevState => ({ ...prevState, ["CustomerId"]: "" }));
      setSqbasicinfo(prevState => ({ ...prevState, ["MainAddress"]: "" }));
      setSqbasicinfo(prevState => ({ ...prevState, ["FaxNo"]: "" }));
      setSqbasicinfo(prevState => ({ ...prevState, ["Email"]: "" }));
      setSqbasicinfo(prevState => ({ ...prevState, ["PhoneNumber"]: "" }));
    } else {
      setselectedCustomer(opt.value);
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
      await GetContacts(option.value);
    }
  };


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
      await GetContacts(option.value);
    }
  };

  const handleSalesChange = async option => {
    if (option) {
      setErrorClass(prev => ({ ...prev, ["SalesPerson"]: "" }));
      setSqbasicinfo(prevState => ({
        ...prevState,
        ["SalesPerson"]: option.value,
      }));
      setSqbasicinfo(prevState => ({
        ...prevState,
        ["SalesPersonEmail"]: option.Email != null ? option.Email : "Test",
      }));
      setSqbasicinfo(prevState => ({
        ...prevState,
        ["SalesPersonContact"]:
          option.PhoneNumber != null ? option.PhoneNumber : "Test",
      }));
    } else {
      setSqbasicinfo(prevState => ({ ...prevState, ["SalesPerson"]: null }));
      setSqbasicinfo(prevState => ({
        ...prevState,
        ["SalesPersonEmail"]: null,
      }));
      setSqbasicinfo(prevState => ({
        ...prevState,
        ["SalesPersonContact"]: null,
      }));
    }
    console.log("sqbasicinfo", sqbasicinfo);
  };

  const openModal2 = async (e, actionType) => {
    if (actionType == "post") {
      if (sqbasicinfo.IsWithCustomer == false) {
        setErrorMsg(["Customer details not filled up fully. Pls check"]);
        return;
      }
    }
    e.preventDefault();
    let hasError = false;
    let tempErrors = []; // Temporary error array
    setErrorMsg([]); // Clear previous errors before validating
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
      if (!item.ConvertedPrice || isNaN(parseFloat(item.ConvertedPrice))) {
        tempErrors.push(
          `Gas Detail Row ${index + 1}: Please enter the valid price details.`
        );
      }
    });

    if (tempErrors.length > 0) {
      setErrorMsg(tempErrors);
      hasError = true;
    }

    if (!hasError) {
      setSubmittype(actionType);
      setIsModalOpen2(true);
    }
  };

  const formatCurrency = value => {
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

  const createcustomer = async () => {
    try {

      if (selectedCustomer == null || selectedCustomer == undefined || selectedCustomer.trim() == "") {
        setIsModalOpen3(false);

        setErrorMsg(["Please enter customer"]);
        return;
      }
      if (typeof selectedCustomer === 'string') {
        const existing = CustomerList.find(
          (c) => c.Customer.toLowerCase() === selectedCustomer.toLowerCase()
        );

        if (!existing) {
          var customernamedetail = selectedCustomer;
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
              Customer: customernamedetail,
              CustomerId: response?.data,
              Email: "",
              Fax: "",
              MainAddress: "",
              PhoneNumber: "",
              label: customernamedetail,
              value: response?.data
            }
            setIsModalOpen3(false);
            setselectedCustomer(data);

            handleCustomerTypeChange(data);

            var Customerdata = await GetCustomer(1, 0);
            setCustomerList(Customerdata);
            console.log("Success:", response);
            setErrorMsg([]);
            setSuccessStatus(response?.status);
            setSuccessMsg(response?.message);


          } else {
            setIsModalOpen3(false);
            console.error(
              "Failed to add Customer:",
              response?.message || "Unknown error"
            );
            setErrorMsg([
              response?.message || "Error while creating customer.",
            ]);
          }

        }
        else {
          setIsModalOpen3(false);
          setErrorMsg(["The customer is already is exists"]);
        }
      }
      else {
        setIsModalOpen3(false);
        setErrorMsg(["Please Enter the different customer name"]);
      }
    } catch (error) {
      setIsModalOpen3(false);
      console.error("Error in AddCustomer:", error);
      setErrorMsg(["An error occurred while adding Customer. Please try again."]);
    }


  }
  const changeexistingcustomer = () => {
    handleCustomerTypeChange(selectedCustomer);
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Sales" breadcrumbItem="Quotation" />
          <Row>
            <Card>
              <Row>
                <Col xl={12}>
                  <div
                    className="content clearfix mt-1"
                    style={{ minHeight: "560px" }}
                  >
                    <div className="mt-2">
                      <div className="row align-items-center g-3 justify-content-end mb-2">
                        <div className="col-12 col-lg-8 col-md-8 col-sm-8 button-items">
                          {errorMsg.length > 0 && (
                            <div className="alert alert-danger alert-new">
                              {errorMsg[0]}
                            </div>
                          )}
                          {successStatus && (
                            <UncontrolledAlert color="success" role="alert">
                              {successMsg}
                            </UncontrolledAlert>
                          )}
                        </div>
                        <div className="col-12 col-lg-4 col-md-4 col-sm-4 button-items me-1">
                          <button
                            type="button"
                            className="btn btn-danger fa-pull-right"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                          >
                            <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                            Cancel
                          </button>
                          {/* <button type="button" className="btn btn-success fa-pull-right" onClick={(e) => handleSubmit(e, "post")}>
                                                        <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>Post
                                                    </button>  */}

                          <button
                            type="button"
                            className="btn btn-success fa-pull-right"
                            onClick={e => openModal2(e, "post")}
                            disabled="true"
                          >
                            <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>
                            Post
                          </button>
                          <button
                            type="button"
                            className="btn btn-info fa-pull-right"
                            onClick={e => openModal2(e, "Ready To Post")}
                            disabled={isSubmitting}
                          >
                            <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>
                            Ready To Post
                          </button>
                          <button
                            type="button"
                            className="btn btn-info fa-pull-right"
                            onClick={e => openModal2(e, "save")}
                            disabled={isSubmitting}
                          >
                            <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>
                            Save
                          </button>
                          {/* <button type="button" className="btn btn-info fa-pull-right" onClick={(e) => handleSubmit(e, "save")}>
                                                        <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>Save
                                                    </button> */}
                        </div>
                      </div>

                      <Card>
                        <div
                          className="accordion accordion-flush"
                          id="accordionFlushExample"
                        >
                          <div className="accordion-item">
                            <h2
                              className="accordion-header"
                              id="headingFlushOne"
                              style={{ backgroundColor: "#f6f6f9" }}
                            >
                              <button
                                className={`accordion-button fw-medium ${!activeAccord.col1 ? "collapsed" : ""
                                  }`}
                                type="button"
                                onClick={() => showAccord("col1")}
                                style={{ cursor: "pointer" }}
                              >
                                {" "}
                                SQ BASIC INFO{" "}
                              </button>
                            </h2>
                            <Collapse
                              isOpen={activeAccord.col1}
                              className="accordion-collapse"
                            >
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
                                        }} />

                                        <Label > Click here. </Label>
                                      </div>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="SQ Type" className="required-label">SQ Type </Label>
                                        <Input
                                          type="select"
                                          name="SQ_Type"
                                          id="SQ_Type"
                                          onChange={handleInputChange}
                                          className={errorClass.SQ_Type}
                                          value={sqbasicinfo.SQ_Type}
                                        >
                                          <option key="0" value="">
                                            Select
                                          </option>
                                          {sqType.map((sqtype, index) => (
                                            <option
                                              key={index}
                                              value={sqtype.SQTypeId}
                                            >
                                              {sqtype.SQType}
                                            </option>
                                          ))}
                                        </Input>
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="SQ_Nbr">
                                          System Seq. No.
                                        </Label>
                                        <Input
                                          type="text"
                                          name="SQ_Nbr"
                                          id="SQ_Nbr"
                                          disabled
                                          value={sqbasicinfo.SQ_Nbr}
                                        />
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="Sys_SQ_Nbr" className="required-label">
                                          Manual SQ No.
                                        </Label>
                                        <Input
                                          type="text"
                                          name="Sys_SQ_Nbr"
                                          id="Sys_SQ_Nbr"
                                          onChange={handleInputChange}
                                          className={errorClass.Sys_SQ_Nbr}
                                          maxLength={20}
                                        />
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
                                              minDate: minDate, // Ensure Date object is correctly passed
                                              maxDate: maxDate, // Ensure Date object is correctly passed
                                              defaultDate: currentDate, // Set default date to today
                                            }}
                                            onChange={handleDateChange}
                                          />
                                        </InputGroup>
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="Subject" className="required-label">
                                          Quote Subject
                                        </Label>
                                        <Input
                                          type="textarea"
                                          id="Subject"
                                          name="Subject"
                                          maxLength="100"
                                          rows="13"
                                          placeholder="Quote Subject"
                                          onChange={handleInputChange}
                                          className={errorClass.Subject}
                                        />
                                      </FormGroup>
                                    </Col>
                                  </div>
                                  <div className="col-xl-4">
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="CustomerId" className="required-label">Customer </Label>
                                        <br></br>
                                        <div className="d-flex align-items-center gap-2">

                                          <AutoComplete field="Customer" value={selectedCustomer}
                                            suggestions={FilterCustomerList} completeMethod={loadCustomerLoad}

                                            onChange={(e) => { setselectedCustomer(e.value); }}
                                            className={`my-autocomplete ${errorClass.CustomerId}`}
                                            style={{ width: "100%" }}
                                            onSelect={(e) => handleCustomerChange(e)}
                                            maxLength="30"


                                          />


                                          <button
                                            type="button"
                                            className="btn btn-info fa-pull-right"
                                            onClick={e => setIsModalOpen3(true)} disabled={sqbasicinfo.IsWithCustomer}

                                          >
                                            <i className="bx bx-plus label-icon font-size-16 align-middle "></i>
                                          </button>

                                        </div>
                                        {/*                                       
                                        <Select
                                          name="CustomerId"
                                          id="CustomerId"
                                          options={CustomerList}
                                          value={
                                            CustomerList.find(
                                              option =>
                                                option.value ===
                                                sqbasicinfo.CustomerId
                                            ) || null
                                          }
                                          onChange={option =>
                                            handleCustomerChange(option)
                                          }
                                          classNamePrefix="select"
                                          isDisabled={isDisabled}
                                          isLoading={isLoading}
                                          isClearable={isClearable}
                                          isRtl={isRtl}
                                          isSearchable={isSearchable}
                                          className={errorClass.CustomerId}
                                        /> */}
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="MainAddress">
                                          Main Address
                                        </Label>
                                        <Input
                                          type="text"
                                          name="MainAddress"
                                          id="MainAddress"
                                          disabled
                                          value={sqbasicinfo.MainAddress || ""}
                                        />
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="DeliveryAddressId">
                                          Delivery Address
                                        </Label>
                                        <Input
                                          type="select"
                                          name="DeliveryAddressId"
                                          id="DeliveryAddressId"
                                          onChange={handleInputChange}
                                          value={sqbasicinfo.DeliveryAddressId}
                                        >
                                          <option key="0" value="">
                                            Select
                                          </option>
                                          {DeliveryAddressList.map(term => (
                                            <option
                                              key={term.DeliveryAddressId}
                                              value={term.DeliveryAddressId}
                                            >
                                              {term.DeliveryAddress}
                                            </option>
                                          ))}
                                        </Input>
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="PhoneNumber">
                                          Phone No.
                                        </Label>
                                        <Input
                                          type="text"
                                          name="PhoneNumber"
                                          id="PhoneNumber"
                                          disabled
                                          onChange={handleInputChange}
                                          value={sqbasicinfo.PhoneNumber}
                                        />
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="FaxNo">Fax No.</Label>
                                        <Input
                                          type="text"
                                          name="FaxNo"
                                          id="FaxNo"
                                          disabled
                                          onChange={handleInputChange}
                                          value={sqbasicinfo.FaxNo || ""}
                                        />
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="Email">Email</Label>
                                        <Input
                                          type="email"
                                          name="Email"
                                          id="Email"
                                          disabled
                                          onChange={handleInputChange}
                                          value={sqbasicinfo.Email || ""}
                                        />
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
                                              defaultDate: currentDate, // Set default date to today
                                            }}
                                            onChange={handleEffectiveDateChange}
                                          />
                                        </InputGroup>
                                      </FormGroup>
                                    </Col>

                                    {/* 
                                    <Col md="12">
                                      <FormGroup>
                                        <Label className="required-label">Quotation validity</Label>
                                        <InputGroup>
                                       
 

  <Input type="select" name="SQ_Qtn_Month" id="SQ_Qtn_Month"
   onChange={(e) => {
    handleMonthChange(e);  
    handleInputChange(e);       
     
  }}
  className={errorClass.SQ_Qtn_Month} value={sqbasicinfo.Qtn_Month} >
  <option value="">Select Month</option>
        {months.map((month, index) => (
          <option key={index} value={month}>
            {month}
          </option>
        ))}
  </Input>
  
 
  <Input type="select" name="SQ_Qtn_Day" id="SQ_Qtn_Day"
  onChange={(e) => {
    handleDayChange(e);  
    handleInputChange(e);       
     
  }}

   className={errorClass.SQ_Qtn_Day} value={sqbasicinfo.Qtn_Day} >
  <option value="">Select Day</option>
          {Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
  </Input>
      

                                        </InputGroup>
                                      </FormGroup>
                                    </Col> */}
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
                                        <Label for="CustomerContactId" className="required-label">
                                          Customer Contact
                                        </Label>
                                        <Input
                                          type="select"
                                          name="CustomerContactId"
                                          id="CustomerContactId"
                                          onChange={handleInputChange}
                                          className={
                                            errorClass.CustomerContactId
                                          }
                                          value={sqbasicinfo.CustomerContactId}
                                        >
                                          <option key="0" value="">
                                            Select
                                          </option>
                                          {ContactList.map(
                                            (customer, index) => (
                                              <option
                                                key={index}
                                                value={
                                                  customer.CustomerContactId
                                                }
                                              >
                                                {customer.CustomerContact}
                                              </option>
                                            )
                                          )}
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
                                          className={
                                            errorClass.customercontactoperation
                                          }
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
                                        <Label for="Validity" className="required-label">
                                          Quote Validity (in days)  
                                        </Label>
                                        <Input
                                          type="number"
                                          name="Validity"
                                          id="Validity"
                                          onChange={handleInputChange}
                                          value={sqbasicinfo.Validity || ""}
                                          max={60}
                                          step="1"
                                          onKeyDown={e => {
                                            if (
                                              e.key === "." ||
                                              e.key === "e" ||
                                              e.key === "-"
                                            ) {
                                              e.preventDefault();
                                            }
                                          }}
                                          min={1}
                                          className={errorClass.Validity}
                                        />
                                      </FormGroup>
                                    </Col> */}
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="DeliveryTerms" className="required-label">
                                          Delivery Terms
                                        </Label>
                                        <Input
                                          type="text"
                                          name="DeliveryTerms"
                                          id="DeliveryTerms"
                                          onChange={handleInputChange}
                                          className={errorClass.DeliveryTerms}
                                          maxLength={50}
                                        />
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="PaymentTerms" className="required-label">
                                          Payment Terms
                                        </Label>
                                        <Input
                                          type="select"
                                          name="PaymentTerms"
                                          id="PaymentTerms"
                                          onChange={handleInputChange}
                                          className={errorClass.PaymentTerms}
                                        >
                                          <option>Select</option>
                                          {PaymentTermList.map(term => (
                                            <option
                                              key={term.PaymentTermsId}
                                              value={term.PaymentTermsId}
                                            >
                                              {term.PaymentTerms}
                                            </option>
                                          ))}
                                        </Input>
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="PaymentMethod" className="required-label">
                                          Payment Method
                                        </Label>
                                        <Input
                                          type="select"
                                          name="PaymentMethod"
                                          id="PaymentMethod"
                                          onChange={handleInputChange}
                                          className={errorClass.PaymentMethod}
                                        >
                                          <option key="0" value="">
                                            Select
                                          </option>
                                          {PaymentMethodList.map(method => (
                                            <option
                                              key={method.PaymentMethodId}
                                              value={method.PaymentMethodId}
                                            >
                                              {method.PaymentMethod}
                                            </option>
                                          ))}
                                        </Input>
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="SalesPerson" className="required-label">
                                          Sales Person
                                        </Label>
                                        <Select
                                          name="SalesPerson"
                                          id="SalesPerson"
                                          options={SalesPersonList}
                                          value={
                                            SalesPersonList.find(
                                              option =>
                                                option.value ===
                                                sqbasicinfo.SalesPerson
                                            ) || null
                                          }
                                          onChange={option =>
                                            handleSalesChange(option)
                                          }
                                          classNamePrefix="select"
                                          isDisabled={isDisabled}
                                          isLoading={isLoading}
                                          isClearable={isClearable}
                                          isRtl={isRtl}
                                          isSearchable={isSearchable}
                                          className={errorClass.SalesPerson}
                                        />
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="SalesPersonContact">
                                          Sales Person Contact
                                        </Label>
                                        <Input
                                          type="text"
                                          name="SalesPersonContact"
                                          id="SalesPersonContact"
                                          disabled
                                          value={sqbasicinfo.SalesPersonContact}
                                        />
                                      </FormGroup>
                                    </Col>
                                    <Col md="12">
                                      <FormGroup>
                                        <Label for="SalesPersonEmail">
                                          Sales Person Email
                                        </Label>
                                        <Input
                                          type="email"
                                          name="SalesPersonEmail"
                                          id="SalesPersonEmail"
                                          disabled
                                          value={sqbasicinfo.SalesPersonEmail}
                                        />
                                      </FormGroup>
                                    </Col>
                                  </div>
                                </Row>

                                <div className="row">
                                  <div className="col-12 col-lg-12">
                                    <Label for="Remark">
                                      Terms and Conditions
                                    </Label>
                                    <Form method="post">
                                      <CKEditor
                                        editor={ClassicEditor}
                                        data={sqbasicinfo.TermsAndCond}
                                        onReady={editor => {
                                          console.log(
                                            "Editor is ready to use!",
                                            editor
                                          );
                                        }}
                                        onChange={(event, editor) => {
                                          const data = editor.getData();
                                          setSqbasicinfo(prevState => ({
                                            ...prevState,
                                            TermsAndCond: data,
                                          }));
                                          console.log(sqbasicinfo);
                                        }}
                                      // onBlur={(event, editor) => {
                                      //     const data = editor.getData();
                                      //     setSqbasicinfo(prevState => ({
                                      //         ...prevState,
                                      //         TermsAndCond: data
                                      //     }));
                                      // }}
                                      // onFocus={(event, editor) => { console.log('Focus.', editor); }}
                                      />
                                    </Form>
                                  </div>
                                </div>
                              </div>
                            </Collapse>
                          </div>
                          <div className="accordion-item">
                            <h2
                              className="accordion-header"
                              id="headingFlushTwo"
                              style={{ backgroundColor: "#cee3f8" }}
                            >
                              <button
                                className={`accordion-button fw-medium ${!activeAccord.col2 ? "collapsed" : ""
                                  }`}
                                type="button"
                                onClick={() => showAccord("col2")}
                                style={{ cursor: "pointer" }}
                              >
                                {" "}
                                GAS DETAIL{" "}
                              </button>
                            </h2>
                            <Collapse
                              isOpen={activeAccord.col2}
                              className="accordion-collapse"
                            >
                              <div className="accordion-body">
                                <div className="table-responsive tab-wid table-height">
                                  <Table className="table mb-0">
                                    <thead
                                      style={{ backgroundColor: "#3e90e2" }}
                                    >
                                      <tr>
                                        <th
                                          className="text-center"
                                          style={{ width: "2%" }}
                                        >
                                          <span
                                            style={{
                                              cursor: "pointer",
                                              alignItems: "center",
                                            }}
                                            onClick={handleAddItem}
                                          >
                                            <i className="mdi mdi-plus" />
                                          </span>
                                        </th>
                                        <th className="text-center required-label">
                                          Gas Code
                                        </th>
                                        <th
                                          className="text-center"
                                          style={{ width: "10%" }}
                                        >
                                          Gas Details
                                        </th>
                                        <th
                                          className="text-center required-label"
                                          style={{ width: "5%" }}
                                        >
                                          Qty
                                        </th>
                                        <th
                                          className="text-center required-label"
                                          style={{ width: "14%" }}
                                        >
                                          UOM
                                        </th>
                                        <th
                                          className="text-center required-label"
                                          style={{ width: "9%" }}
                                        >
                                          Currency
                                        </th>
                                        <th
                                          className="text-center required-label"
                                          style={{ width: "12%" }}
                                        >
                                          Unit Price
                                        </th>
                                        <th
                                          className="text-center"
                                          style={{ width: "11%" }}
                                        >
                                          Total Price{" "}
                                        </th>
                                        <th
                                          className="text-center"
                                          style={{ width: "14%" }}
                                        >
                                          Price (IDR)
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {quotationDetails.map((item, index) => {
                                        const tooltipId = `gas-code-${index}`;
                                        const tooltipId2 = `delivery-${index}`;
                                        return (
                                          <tr key={item.GasCodeId || index}>
                                            <td>
                                              <span
                                                color="danger"
                                                className="btn-sm"
                                                onClick={() => openModal(index)}
                                                title="Delete"
                                              >
                                                <i
                                                  className="mdi mdi-trash-can-outline label-icon align-middle"
                                                  title="Delete"
                                                />
                                              </span>
                                            </td>
                                            <td>
                                              <Select
                                                name="GasCodeId"
                                                id={`GasCodeId-${index}`} // Unique ID for each row
                                                options={gasCodeList
                                                  .filter(
                                                    code =>
                                                      !quotationDetails.some(
                                                        (item, i) =>
                                                          i !== index &&
                                                          item.GasCodeId ===
                                                          code.GasCodeId
                                                      )
                                                  )
                                                  .map(code => ({
                                                    value: code.GasCodeId,
                                                    label: code.GasCode,
                                                  }))}
                                                value={
                                                  gasCodeList.find(
                                                    option =>
                                                      option.GasCodeId ===
                                                      quotationDetails[index]
                                                        ?.GasCodeId
                                                  ) || null
                                                }
                                                onChange={option =>
                                                  handleGasCodeChange(
                                                    index,
                                                    option ? option.value : null
                                                  )
                                                }
                                                classNamePrefix="select"
                                                isDisabled={isDisabled}
                                                isLoading={isLoading}
                                                isClearable={isClearable}
                                                isSearchable={isSearchable}
                                              />
                                            </td>
                                            <td>
                                              <span
                                                id={tooltipId}
                                                style={{
                                                  cursor: "pointer",
                                                  color: "blue",
                                                }}
                                                className="btn-rounded btn btn-link"
                                              >
                                                Details
                                              </span>
                                              {!isLoading && (
                                                <Tooltip
                                                  isOpen={
                                                    tooltipOpen[tooltipId] ||
                                                    false
                                                  }
                                                  target={tooltipId}
                                                  toggle={() =>
                                                    toggleTooltip(tooltipId)
                                                  }
                                                  style={{
                                                    maxWidth: "350px",
                                                    width: "320px",
                                                    wordWrap: "break-word",
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      textAlign: "left",
                                                    }}
                                                    className="font-size-13"
                                                  >
                                                    <div className="d-flex align-items-center gap-2">
                                                      <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left">
                                                        <strong>Volume:</strong>
                                                      </div>
                                                      <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">
                                                        {" "}
                                                        {
                                                          quotationDetails[
                                                            index
                                                          ].Volume
                                                        }
                                                      </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                      <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left">
                                                        <strong>
                                                          Pressure:
                                                        </strong>
                                                      </div>
                                                      <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">
                                                        {
                                                          quotationDetails[
                                                            index
                                                          ].Pressure
                                                        }
                                                      </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                      <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left">
                                                        <strong>
                                                          Description:
                                                        </strong>
                                                      </div>
                                                      <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">
                                                        {
                                                          quotationDetails[
                                                            index
                                                          ].Description
                                                        }
                                                      </div>
                                                    </div>
                                                  </div>
                                                </Tooltip>
                                              )}
                                            </td>
                                            <td>
                                              <Input
                                                type="text"
                                                className="text-end"
                                                onChange={e =>
                                                  handleQtyChange(
                                                    index,
                                                    e.target.value
                                                  )
                                                }
                                                disabled
                                                value={Number(quotationDetails[index]?.Qty || 1).toLocaleString()}
                                                id={`Qty-${index}`}
                                              />
                                            </td>
                                            <td>
                                              <Input
                                                type="select"
                                                onChange={e =>
                                                  handleUOMChange(
                                                    index,
                                                    e.target.value
                                                  )
                                                }
                                                id={`Uom-${index}`}
                                              >
                                                <option key="0" value="">
                                                  Select
                                                </option>
                                                {UOMList.map(uom => (
                                                  <option
                                                    key={uom.UoMId}
                                                    value={uom.UoMId}
                                                  >
                                                    {uom.UoM}
                                                  </option>
                                                ))}
                                              </Input>
                                            </td>
                                            <td>
                                              <Input
                                                type="select"
                                                onChange={e =>
                                                  handleCurrencyChange(
                                                    index,
                                                    e.target.value
                                                  )
                                                }
                                                id={`Currency-${index}`}
                                                value={item.ConvertedCurrencyId}
                                              >
                                                <option key="0" value="">
                                                  Select
                                                </option>
                                                {CurrencyList.map(currency => (
                                                  <option
                                                    key={currency.currencyid}
                                                    value={currency.currencyid}
                                                  >
                                                    {currency.Currency}
                                                  </option>
                                                ))}
                                              </Input>
                                            </td>

                                            <td>
                                              <Input
                                                type="text"
                                                inputMode="numeric"
                                                className="text-end"
                                                maxLength={15}
                                                value={formatCurrency(
                                                  quotationDetails[index]
                                                    .UnitPrice
                                                )}
                                                onChange={e => {
                                                  const raw =
                                                    e.target.value.replace(
                                                      /[^0-9]/g,
                                                      ""
                                                    );
                                                  if (raw.length <= 11) {
                                                    handleUnitPriceChange(
                                                      index,
                                                      raw
                                                    );
                                                  }
                                                }}
                                                onKeyDown={e => {
                                                  if (
                                                    e.key === "." ||
                                                    e.key === "e" ||
                                                    e.key === "-" ||
                                                    (e.key.length === 1 &&
                                                      !/[0-9]/.test(e.key))
                                                  ) {
                                                    e.preventDefault();
                                                  }
                                                }}
                                              />
                                            </td>
                                            <td>
                                              {/* <Input type="text" disabled name="TotalPrice" value={quotationDetails[index].TotalPrice} id={`TotalPrice-${index}`} className="text-end"/> */}
                                              <Input
                                                type="text"
                                                disabled
                                                name="TotalPrice"
                                                className="text-end"
                                                value={new Intl.NumberFormat(
                                                  "en-US",
                                                  {
                                                    style: "decimal",
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                  }
                                                ).format(
                                                  quotationDetails[index]
                                                    ?.TotalPrice || 0
                                                )}
                                                id={`TotalPrice-${index}`}

                                              />
                                            </td>
                                            <td>
                                              <Input
                                                type="text"
                                                disabled
                                                name="ConvertedPrice"
                                                value={new Intl.NumberFormat(
                                                  "en-US",
                                                  {
                                                    style: "decimal",
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                  }
                                                ).format(
                                                  quotationDetails[index]
                                                    ?.ConvertedPrice || 0
                                                )} // Ensure value is defined
                                                id={`ConvertedPrice-${index}`}
                                                className="text-end"
                                              />
                                            </td>
                                          </tr>
                                        );
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
                <i
                  className="mdi mdi-alert-circle-outline"
                  style={{ fontSize: "9em", color: "orange" }}
                />
                <h4>Do you want to delete this item?</h4>
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
                  onClick={() => handleRemoveItem(gaslistindex)}
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

      <Modal
        isOpen={isModalOpen2}
        toggle={() => setIsModalOpen2(false)}
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
                <h4>Do you want to {submittype} this details?</h4>
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
                  onClick={e => handleSubmit(e, submittype)}
                >
                  Yes
                </Button>
                <Button
                  color="danger"
                  size="lg"
                  className="btn btn-danger"
                  onClick={() => setIsModalOpen2(false)}
                >
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
};

export default AddQuotation;
