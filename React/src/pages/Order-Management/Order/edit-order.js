import React, { useState, useEffect } from "react";
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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  InputGroup,
  UncontrolledAlert,
} from "reactstrap";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
const animatedComponents = makeAnimated();
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import Breadcrumbs from "../../../components/Common/Breadcrumb";

import {
  GetSOType,
  GetSalesPerson,
  GetUoM,
  AddSO,
  OrderGetbyid,
  GetSQCustomer,
  GetCustomerSQ,
  GetSQGasCode,
  GetShippingAddress,
  fetchGasList,
  GetCustomerGasCode,
  GetCustomerGasCodeDetail,
  getchGasList,
} from "../../../common/data/mastersapi";

const EditOrder = () => {
  const { id } = useParams();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const minDate = new Date(currentYear, 0, 1);
  const maxDate = new Date(currentYear, 11, 31);
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [currencySelect, setcurrencySelect] = useState("AUD");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const [SalesPersonList, setSalesPersonList] = useState([]);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const toggleModal2 = () => {
    setIsModalOpen2(!isModalOpen2);
  };
  const rackNumberOptions = [
    { value: "RBTG1234A", label: "RBTG1234A" },
    { value: "RBTG9874B", label: "RBTG9874B" },
    { value: "RBTG3456C", label: "RBTG3456C" },
    { value: "RBTG3245D", label: "RBTG3245D" },
    { value: "RBTG4355E", label: "RBTG4355E" },
    { value: "RBTG4445F", label: "RBTG4445F" },
  ];

  const [isDirectsale, setIsDirectsale] = useState("1");
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
    categories: 2,
  });
  const [SODetail, setSODetail] = useState([]);
  const [addressrowids, setAddressrowids] = useState([]);
  const history = useHistory();
  const [activeAccord, setActiveAccord] = useState([]);
  const [selectedSQ, setSelectedSQ] = useState([]);
  const [sqList, setSqList] = useState([]);
  const [gasCodeList, setGasCodeList] = useState([]);
  const [successStatus, setSuccessStatus] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [SOGasDetails, setSOGasDetails] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [deliveryaddressList, setDeliveryaddressList] = useState([
    { Code: null, address: "" },
  ]);

  const [soType, setSoType] = useState([
    { name: "Direct Sales Order", code: "1" },
    { name: "Insert from Sales Quotations", code: "2" },
  ]);

  const [CodeList, setCodeList] = useState([]);
  const [SQGasCodeList, setSQGasCodeList] = useState([]);
  const [CustomerList, setCustomerList] = useState([]);
  const [UOMList, setUOMList] = useState([]);
  const [DelAddress, SetDelAddress] = useState([]);

  useEffect(() => {
    const loadSOTypeList = async () => {
      const data = await GetSOType(1);
      setSoType(data);
    };
    loadSOTypeList();

    const loadSQCustomer = async () => {
      const data = await GetSQCustomer(1);
      setCustomerList(data);
    };
    loadSQCustomer();

    const loadGasList = async () => {
      const data = await fetchGasList(1, -1);
      setCodeList(data);
    };
    loadGasList();

    const loadSalesPersonList = async () => {
      const data = await GetSalesPerson(1, -1);
      setSalesPersonList(data);
    };
    loadSalesPersonList();

    const loadUOMList = async () => {
      const data = await GetUoM(1, -1);
      setUOMList(data);
    };
    loadUOMList();
  }, []);

  const GetSOdata = async id => {
    try {
      const data = await OrderGetbyid(id);
      setSoData({
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
        categories: 2,
      });
    } catch (error) {
      console.error("Error fetching SQ:", error);
    }
  };
  useEffect(() => {
    if (id) {
      GetSOdata(id);
    } else {
      history.push("/sales-order");
    }
  }, [id]);

  const [errorClass, setErrorClass] = useState({});
  const [errorMsg, setErrorMsg] = useState([]);
  const validationRules = {
    CustomerId: { required: true, message: "Please select a customer." },
    CustomerEmail: { required: true, message: "Please add Customer Email." },
    CustomerPhone: { required: true, message: "Please add Customer Phone." },
    OrderBy: { required: true, message: "Please add order by." },
    ProjectName: { required: true, message: "Please add project name." },
  };

  const validationfn = (name, value, tempErrors) => {
    let newValue = typeof value === "string" ? value.trim() : value;
    let newErrorClass = "";
    let newErrorMsg = "";

    if (
      validationRules[name]?.required &&
      (!newValue ||
        newValue === "" ||
        newValue === null ||
        newValue === undefined)
    ) {
      newErrorClass = name == "CustomerId" ? "select-invalid" : "is-invalid";
      newErrorMsg = validationRules[name].message;
    }
    setErrorClass(prev => ({ ...prev, [name]: newErrorClass }));
    if (newErrorMsg) {
      tempErrors[name] = newErrorMsg;
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    let tempErrors = {};
    validationfn(name, value, tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      setErrorMsg(Object.values(tempErrors));
    } else {
      setErrorMsg([]);
    }
    setSoData(prevState => ({
      ...prevState,
      [name]: value?.toString().trim(),
    }));
  };
  const handleRackChange = selectedOption => {
    const value = selectedOption?.value || "";
    const event = {
      target: {
        name: "RackNumber",
        value: value,
      },
    };

    handleInputChange(event);
  };

  const handleInputChange2 = e => {
    const { name, value } = e.target;
    setDeliveryaddressList(prevState => {
      if (!Array.isArray(prevState) || prevState.length === 0) {
        return [{ [name]: value }];
      }

      let updatedFirstItem = { ...prevState[0], [name]: value };

      if (name === "DeliveryInstruction") {
        updatedFirstItem = { ...updatedFirstItem, IsDisabled: 1 };
      }
      if (
        updatedFirstItem.colKey !== undefined &&
        updatedFirstItem.index !== undefined
      ) {
        setGasCodeList(prevGasCodeList => {
          const newGasCodeList = { ...prevGasCodeList };
          if (!Array.isArray(newGasCodeList[updatedFirstItem.colKey])) {
            newGasCodeList[updatedFirstItem.colKey] = [];
          }
          newGasCodeList[updatedFirstItem.colKey] = newGasCodeList[
            updatedFirstItem.colKey
          ].map((item, idx) =>
            idx === updatedFirstItem.index
              ? { ...item, ...updatedFirstItem }
              : item
          );
          return newGasCodeList;
        });
      }
      return [updatedFirstItem, ...prevState.slice(1)];
    });
  };

  const saveAddressdet = () => {
    if (addressrowids.length > 0) {
      const updatedRows = addressrowids.map(row => ({
        ...row,
        DeliveryAddressId: deliveryaddressList[0]?.DeliveryAddressId,
        DeliveryInstruction: deliveryaddressList[0]?.DeliveryInstruction,
      }));

      setTimeout(() => {
        console.log(updatedRows);
      }, 1000);

      setSODetail(prevState => {
        if (!Array.isArray(prevState) || prevState.length === 0) {
          return [...updatedRows];
        }
        return [{ ...prevState, ...updatedRows }, ...prevState.slice(1)];
      });
    } else {
      setSODetail(prevState => {
        if (!Array.isArray(prevState) || prevState.length === 0) {
          return [deliveryaddressList[0]];
        }
        return [
          { ...prevState[0], ...deliveryaddressList[0] },
          ...prevState.slice(1),
        ];
      });
      alert(1);
      console.log("SODetail", SODetail);
    }
    toggleModal();
  };

  const showAccord = activeItem => {
    setActiveAccord(prevState => ({}));
  };

  const handleDateChange = selectedDates => {
    const selectedDate = selectedDates[0];
    const localDate = new Date(
      selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];
    setSoData(prevState => ({
      ...prevState,
      OrderDate: localDate,
    }));
  };
  const handleDateChange2 = selectedDates => {
    const selectedDate = selectedDates[0];
    const localDate = new Date(
      selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];
  };
  const handleQtyChange = (index, qty) => {
    if (!Array.isArray(SODetail)) return;
    const updatedDetails = [...SODetail];
    updatedDetails[index] = { ...updatedDetails[index], SO_Qty: parseInt(qty) };
    setSODetail(updatedDetails);
  };

  const handleUOMChange = (index, uom) => {
    if (!Array.isArray(SODetail) || index < 0 || index >= SODetail.length)
      return;
    const selectedUOM = UOMList.find(u => u.UoMId === uom);
    if (!selectedUOM) {
      console.error("UOM not found!");
      return;
    }
    const updatedDetails = [...SODetail];
    updatedDetails[index] = { ...updatedDetails[index], uomid: uom };
    setSODetail(updatedDetails);
  };

  const handleSOTypeChange = value => {
    setIsDirectsale(value);
    setGasCodeList([]);
  };
  const handleGascodeChange = (colKey, selectedOption) => {
    if (!selectedOption) {
      setGasCodeList(prevState => ({
        ...prevState,
        [colKey]: [],
      }));
    } else {
      setGasCodeList(prevState => ({
        ...prevState,
        [colKey]:
          CodeList.find(item => item.GasCodeId === selectedOption.GasCodeId) ||
          selectedOption,
      }));
    }
  };
  const handleGascodeChange2 = async (colKey, selectedOption) => {
    if (!soData.CustomerId) {
      setErrorMsg(["Please select any customer"]);
      return;
    }

    if (!selectedOption || selectedOption.length === 0) {
      setGasCodeList(prevState => ({
        ...prevState,
        [colKey]: [],
      }));
      return;
    }

    try {
      const updatedGasCodes = await Promise.all(
        selectedOption.map(async val => {
          return GetCustomerGasCode(soData.CustomerId, val.GasCodeId, 1);
        })
      );
      const mergedGasCodes = updatedGasCodes.flat();
      setGasCodeList(prevState => ({
        ...prevState,
        [colKey]: mergedGasCodes,
      }));
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  const handleSQListChange = selectedOptions => {
    if (!selectedOptions || selectedOptions.length < 1) {
      setActiveAccord([]);
      setSelectedSQ({});
      setSODetail({});
      setGasCodeList({});
    } else {
      const updatedCols = {};
      const updatedSqs = {};
      selectedOptions.forEach((option, index) => {
        updatedCols[`col${index + 1}`] = true;
        updatedSqs[index] = option;
        getsqgasecods(`col${index + 1}`, option);
      });
      const maxCols = Math.max(
        Object.keys(updatedCols).length,
        Object.keys(activeAccord).length
      );
      for (let i = Object.keys(updatedCols).length + 1; i <= maxCols; i++) {
        updatedCols[`col${i}`] = false;
      }
      setActiveAccord(updatedCols);
      setSelectedSQ(updatedSqs);
      setSODetail(updatedSqs);
    }
  };

  const getsqgasecods = async (colKey, sqid) => {
    if (soBaseValue == 1 && soData?.CustomerId) {
      try {
        const data = await GetSQGasCode(sqid.id);
        setSQGasCodeList(prevState => ({
          ...prevState,
          [colKey]: data,
        }));
        setTimeout(() => {
          console.log("data", data);
          console.log("SQGasCodeList", SQGasCodeList);
        }, 800);
      } catch (error) {
        console.error("Error fetching customer data:", error);
        setSqList([]);
      }
    } else {
      setSqList([]);
    }
  };
  const handleCancel = () => {
    history.push("/manage-order");
  };

  const handleSubmit = async (e, actionType) => {
    e.preventDefault();
    let hasError = false;
    let tempErrors = {};
    setErrorMsg([]);
    for (const key of Object.keys(soData)) {
      validationfn(key, soData[key], tempErrors);
    }
    if (!gasCodeList || gasCodeList.length < 1) {
      tempErrors["gasCode"] = "Please select at least one gas code.";
    }
    if (Object.keys(tempErrors).length > 0) {
      setErrorMsg(Object.values(tempErrors));
      return;
    }

    try {
      const updatedSQBasicInfo = {
        ...soData,
        isSubmitted: actionType === "post" ? 1 : 0,
      };
      debugger;
      const orderDate = new Date(updatedSQBasicInfo.OrderDate);
      orderDate.setHours(0, 0, 0, 0);

      const hasInvalidDate = SODetail.some(item => {
        const reqDate = new Date(item.ReqDeliveryDate);
        reqDate.setHours(0, 0, 0, 0);
        return reqDate < orderDate;
      });

      if (hasInvalidDate) {
        setErrorMsg(["Delivery date cannot be earlier than Sales Order date."]);
        return;
      }
      const response = await AddSO({
        header: updatedSQBasicInfo,
        deatils: SODetail,
        SODetail: [{ sqid: 40, SO_ID: 0 }],
      });
      if (response?.status) {
        setSuccessStatus(response?.status);
        setSuccessMsg(response?.message);
        setTimeout(() => {
          history.push("/manage-order");
        }, 1000);
      } else {
        setErrorMsg([
          response?.Message || "Please verify the gas code and its details.",
        ]);
      }
    } catch (error) {
      console.error("Error in AddSQ:", error);
      setErrorMsg(["An error occurred while adding SO. Please try again."]);
    }
  };

  useEffect(() => {
    handleSOTypeChange(1);
  }, []);

  useEffect(() => {
    setErrorMsg([]);
  }, [gasCodeList]);

  const [soBaseValue, setSoBaseValue] = useState("1");

  const handleSQCustomer = selectedOptions => {
    if (selectedOptions) {
      setSoData(prevState => ({
        ...prevState,
        ["CustomerId"]: selectedOptions.CustomerId,
      }));
      setSoData(prevState => ({
        ...prevState,
        ["CustomerEmail"]: selectedOptions.Email,
      }));
      setSoData(prevState => ({
        ...prevState,
        ["CustomerPhone"]: selectedOptions.PhoneNumber,
      }));
      setSoData(prevState => ({
        ...prevState,
        ["CustomerName"]: selectedOptions.CustomerName,
      }));
      setErrorMsg([]);
    } else {
      setSoData(prevState => ({ ...prevState, ["CustomerId"]: "" }));
      setSoData(prevState => ({ ...prevState, ["CustomerEmail"]: "" }));
      setSoData(prevState => ({ ...prevState, ["CustomerPhone"]: "" }));
      setSoData(prevState => ({ ...prevState, ["CustomerName"]: "" }));
    }
  };

  useEffect(() => {
    setGasCodeList([]);
    const loadCustomerSQ = async () => {
      if (soBaseValue == 1 && !soData?.CustomerId) {
        setErrorMsg(["Please select any customer"]);
        return;
      }
      if (soBaseValue == 1 && soData?.CustomerId) {
        try {
          const data = await GetCustomerSQ(soData.CustomerId);
          setSqList(data);
        } catch (error) {
          console.error("Error fetching customer data:", error);
          setSqList([]);
        }
      } else if (soData.CustomerId) {
        try {
          const data = await GetCustomerGasCodeDetail(soData.CustomerId);
          setCodeList(data);
        } catch (error) {
          console.error("Error fetching customer data:", error);
          setCodeList([]);
        }
      } else {
        setSqList([]);
      }
    };
    loadCustomerSQ();
  }, [soBaseValue, soData?.CustomerId]);

  const openaddresspopup = async (rowItem, colKey, index) => {
    console.log(rowItem);
    toggleModal();
    try {
      const data = await GetShippingAddress(rowItem.ContactId, -1);
      SetDelAddress(data);
      setDeliveryaddressList([
        {
          DeliveryAddressId: rowItem.DeliveryAddressId,
          address: rowItem.Address,
          ReqDeliveryDate: currentDate,
          Deliveryaddressid: rowItem.DeliveryAddressId,
          Deliveryaddress: rowItem.Address,
          DeliveryInstruction: "",
          id: 0,
          Sqdtlid: 0,
          Sqid: rowItem.SQ_ID,
          SO_ID: 0,
          PoNumber: "123",
          GasID: rowItem.GasCodeId,
          GasDescription: rowItem.GasDescription,
          Volume: rowItem.Volume,
          Pressure: rowItem.Pressure,
          Alr_Issued_Qty: 1,
          SQ_Qty: rowItem.sqqty,
          SO_Qty: 1,
          Balance_Qty: 1,
          Uomid: rowItem.uomid,
          IsDisabled: rowItem.IsDisabled,
          index: index,
          colKey: colKey,
        },
      ]);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  const addAddressRowIds = (index, item, isChecked) => {
    setAddressrowids(prev => {
      let updatedRows = [...prev];
      if (isChecked) {
        updatedRows.push(item);
      } else {
        updatedRows = updatedRows.filter((_, i) => i !== index); // Remove item by index
      }

      return updatedRows;
    });

    setTimeout(() => {
      console.log("Updated addressrowids:", addressrowids);
    }, 1000); // Delay logging to capture updated state
  };

  const handleSalesChange = async option => {
    if (option) {
      setSoData(prevState => ({ ...prevState, ["SalesPerson"]: option.value }));
      setSoData(prevState => ({
        ...prevState,
        ["SalesPersonEmail"]: option.Email != null ? option.Email : "Test",
      }));
      setSoData(prevState => ({
        ...prevState,
        ["SalesPersonContact"]:
          option.PhoneNumber != null ? option.PhoneNumber : "Test",
      }));
    } else {
      setSoData(prevState => ({ ...prevState, ["SalesPerson"]: null }));
      setSoData(prevState => ({ ...prevState, ["SalesPersonEmail"]: null }));
      setSoData(prevState => ({ ...prevState, ["SalesPersonContact"]: null }));
    }
  };
  const handleCustomerChange = async option => {
    if (!option) {
      setSoData(prevState => ({ ...prevState, ["CustomerId"]: "" }));
      setSoData(prevState => ({ ...prevState, ["MainAddress"]: "" }));
      setSoData(prevState => ({ ...prevState, ["FaxNo"]: "" }));
      setSoData(prevState => ({ ...prevState, ["Email"]: "" }));
      setSoData(prevState => ({ ...prevState, ["PhoneNumber"]: "" }));

      setSqList([]);                         // clear quotation list
      setSelectedSQ({});                     // clear selected quotations
      setActiveAccord([]);                   // close quotation accordions
      setGasCodeList({});                    // clear all gas code dropdowns
      setCodeList([]);                       // clear gas code options
      setSelectedContactOperationValues([]); // clear contact operation select
      setQuotationDetails([]);            // clear quotation details table
    } else {
      setSoData(prevState => ({ ...prevState, ["CustomerId"]: option.value }));
      setSoData(prevState => ({
        ...prevState,
        ["CustomerName"]: option.label,
      }));
      setSoData(prevState => ({
        ...prevState,
        ["MainAddress"]: option.MainAddress != null ? option.MainAddress : "",
      }));
      setSoData(prevState => ({
        ...prevState,
        ["FaxNo"]: option.Fax != null ? option.Fax : "",
      }));
      setSoData(prevState => ({
        ...prevState,
        ["Email"]: option.Email != null ? option.Email : "",
      }));
      setSoData(prevState => ({
        ...prevState,
        ["PhoneNumber"]: option.PhoneNumber != null ? option.PhoneNumber : "",
      }));
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Sales" breadcrumbItem="Sales Order" />
          <Card>
            <Row>
              <Col xl={12}>
                <div className="accordion-body">
                  <div className="row mb-2">
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
                    <div className="col-12 col-lg-4 justify-content-end text-end">
                      <div
                        className="button-items"
                        style={{ marginRight: "2px" }}
                      >
                        <button
                          type="button"
                          className="btn btn-info"
                          onClick={e => handleSubmit(e, "save")}
                        >
                          <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>
                          Update
                        </button>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={e => handleSubmit(e, "post")}
                        >
                          <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>
                          Post
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
                  </div>
                  <div className="row align-items-center g-3">
                    <div className="col-12 col-lg-3">
                      <FormGroup>
                        <Label for="SO Type">SO Type</Label>
                        <Input
                          type="select"
                          name="Order_TypeId"
                          id="Order_TypeId"
                          onChange={e => handleSOTypeChange(e.target.value)}
                          value={isDirectsale}
                        >
                          {soType.map(sotype => (
                            <option
                              key={sotype.Order_TypeId}
                              value={sotype.Order_TypeId}
                            >
                              {sotype.Order_TypeName}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </div>

                    <div className="col-12 col-lg-3">
                      <FormGroup>
                        <Label>SO Date</Label>
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
                              defaultDate: currentDate,
                            }}
                            onChange={handleDateChange}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                    <div className="col-12 col-lg-3">
                      <FormGroup>
                        <Label for="SO_Number">System Generated SO No.</Label>
                        <Input
                          type="text"
                          name="SO_Number"
                          id="SO_Number"
                          disabled
                          maxLength="20"
                          value={soData.SO_Number}
                          onChange={handleDateChange}
                        />
                      </FormGroup>
                    </div>
                  </div>
                  <hr className="mt-1" />
                  {isDirectsale == 1 && (
                    <Row>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="horizontal-firstname-Input">
                            Customer
                          </Label>
                          <Select
                            name="CustomerId"
                            id="CustomerId"
                            options={CustomerList}
                            value={
                              CustomerList.find(
                                option => option.value === soData.CustomerId
                              ) || null
                            }
                            onChange={option => handleCustomerChange(option)}
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
                      <Col md="4">
                        <FormGroup>
                          <Label for="Email">Email</Label>
                          <Input
                            type="email"
                            name="Email"
                            id="Email"
                            disabled
                            value={soData.Email || ""}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label for="PhoneNumber">Phone No.</Label>
                          <Input
                            type="number"
                            name="PhoneNumber"
                            id="PhoneNumber"
                            disabled
                            value={soData.PhoneNumber || ""}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label for="salesperson">Sales Person</Label>
                          <Select
                            name="SalesPerson"
                            id="SalesPerson"
                            options={SalesPersonList}
                            onChange={option => handleSalesChange(option)}
                            classNamePrefix="select"
                            isDisabled={isDisabled}
                            isLoading={isLoading}
                            isClearable={isClearable}
                            isRtl={isRtl}
                            isSearchable={isSearchable}
                            className={errorClass.SalesPerson}
                            components={animatedComponents}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label for="SalesPersonEmail">
                            Sales Person Email
                          </Label>
                          <Input
                            type="email"
                            name="SalesPersonEmail"
                            id="SalesPersonEmail"
                            onChange={handleInputChange}
                            disabled
                            value={soData.SalesPersonEmail}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label for="salesContact">Order By</Label>
                          <Input type="text" id="textarea" placeholder="" />
                        </FormGroup>
                      </Col>
                      <Col md="8">
                        <FormGroup>
                          <Label for="salesContact">Gas Code</Label>
                          <Select
                            components={animatedComponents}
                            className="basic-single"
                            classNamePrefix="select"
                            isDisabled={isDisabled}
                            isLoading={isLoading}
                            isClearable={isClearable}
                            isRtl={isRtl}
                            isSearchable={isSearchable}
                            name="gascode-col12"
                            options={CodeList}
                            isMulti
                            id="gascode-col12"
                            onChange={selectedOptions =>
                              handleGascodeChange2("col1", selectedOptions)
                            }
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}

                  {isDirectsale == 1 && (
                    <div className="mt-1">
                      <hr className="mt-2" />
                      <div className="table-responsive mt-1">
                        <Table className="table mb-0">
                          <thead style={{ backgroundColor: "#3e90e2" }}>
                            <tr>
                              <th className="text-center">S.No.</th>
                              <th className="text-center">#</th>
                              <th
                                className="text-center"
                                style={{ width: "8%" }}
                              >
                                SQ No.
                              </th>
                              <th
                                className="text-center"
                                style={{ width: "10%" }}
                              >
                                PO No.
                              </th>
                              <th className="text-center">Gas Code</th>
                              <th className="text-center">Gas Description</th>
                              <th
                                className="text-center"
                                style={{ width: "8%" }}
                              >
                                Volume
                              </th>
                              <th
                                className="text-center"
                                style={{ width: "5%" }}
                              >
                                Pressure
                              </th>
                              <th
                                className="text-center"
                                style={{ width: "8%" }}
                              >
                                SO Qty
                              </th>
                              <th
                                className="text-center"
                                style={{ width: "8%" }}
                              >
                                UoM
                              </th>
                              <th
                                className="text-center"
                                style={{ width: "8%" }}
                              >
                                Delivery Details
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const colKey = "col1";
                              const gasrows = gasCodeList["col1"];
                              return Array.isArray(gasrows) &&
                                gasrows.length > 0 ? (
                                gasrows.map((item, index) => (
                                  <tr key={index}>
                                    <td className="text-center align-middle">
                                      {index + 1}
                                    </td>
                                    <td className="text-center align-middle">
                                      <Input
                                        type="checkbox"
                                        name={`addresschk${index}`}
                                        id={`${item.SQ_ID}-${item.GasCodeId}`}
                                        className="tdfrmsizechg"
                                        onChange={e =>
                                          addAddressRowIds(
                                            index,
                                            item,
                                            e.target.checked
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        name={`SQ_Nbr${index}`}
                                        value={item.SQ_Nbr}
                                        disabled
                                      />
                                    </td>
                                    <td>
                                      <Input type="text" name="ponumber" />
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        value={item.label}
                                        disabled
                                      />{" "}
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        value={item.Description}
                                        disabled
                                      />{" "}
                                    </td>
                                    <td>
                                      <Input
                                        type="number"
                                        value={item.Volume}
                                        disabled
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        value={item.Pressure}
                                        disabled
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        value={item.Qty}
                                        onChange={e =>
                                          handleQtyChange(
                                            index,
                                            e.target.value,
                                            "col1"
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        key={`${colKey}-${index}`}
                                        type="select"
                                        disabled
                                        onChange={e =>
                                          handleUOMChange(index, e.target.value)
                                        }
                                      >
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
                                    <td className="text-center">
                                      <div
                                        className="avatar-xs"
                                        onClick={() =>
                                          openaddresspopup(item, colKey, index)
                                        }
                                        style={{ margin: "auto" }}
                                      >
                                        <span className="avatar-title rounded-circle bg-soft bg-info text-info font-size-14">
                                          <i className="bx bx-plus-medical"></i>
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="11"
                                    className="text-center text-muted"
                                  >
                                    Please select any gas code
                                  </td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {isDirectsale == 2 && (
                    <Row>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="horizontal-firstname-Input">
                            Customer
                          </Label>
                          <Select
                            components={animatedComponents}
                            classNamePrefix="select"
                            isDisabled={isDisabled}
                            isLoading={isLoading}
                            isClearable={isClearable}
                            isRtl={isRtl}
                            isSearchable={isSearchable}
                            name="Customers"
                            options={CustomerList}
                            value={
                              CustomerList.find(
                                option => option.value === soData.CustomerId
                              ) || null
                            }
                            onChange={selectedOptions =>
                              handleSQCustomer(selectedOptions)
                            }
                            className={errorClass.CustomerId}
                          />
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="horizontal-firstname-Input">
                            Customer Email
                          </Label>
                          <Input
                            type="email"
                            name="CustomerEmail"
                            id="CustomerEmail"
                            value={soData.CustomerEmail}
                            onChange={handleInputChange}
                            className={errorClass.CustomerEmail}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="horizontal-firstname-Input">
                            Phone No.
                          </Label>
                          <Input
                            type="text"
                            name="CustomerPhone"
                            id="CustomerPhone"
                            value={soData.CustomerPhone}
                            onChange={handleInputChange}
                            className={errorClass.CustomerPhone}
                          />
                        </FormGroup>
                      </Col>

                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="horizontal-firstname-Input">
                            Order By
                          </Label>
                          <Input
                            type="text"
                            name="OrderBy"
                            id="OrderBy"
                            value={soData.OrderBy}
                            onChange={handleInputChange}
                            className={errorClass.OrderBy}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="ProjectName">Project Name</Label>
                          <Input
                            type="text"
                            name="ProjectName"
                            id="ProjectName"
                            value={soData.ProjectName}
                            onChange={handleInputChange}
                            className={errorClass.ProjectName}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup></FormGroup>
                      </Col>
                      {/* <Col md="4">
                        <FormGroup>
                          <Label htmlFor="RackNumber">Rack No.</Label>
                          <Select
                            className="basic-single"
                            isSearchable={isSearchable}
                            name="RackNumber"
                            id="RackNumber"
                            options={rackNumberOptions}
                            onChange={handleRackChange}
                            value={
                              soData.RackNumber
                                ? rackNumberOptions.find(
                                    option => option.value === soData.RackNumber
                                  )
                                : null
                            }
                          />
                        </FormGroup>
                      </Col> */}
                      <Col md="4">
                        <FormGroup>
                          <Label htmlFor="addresstype">SO Based On:</Label>
                          <div className="row">
                            {[
                              { value: "1", label: "Sales Quotation" },
                              { value: "2", label: "Gas" },
                            ].map(({ value, label }) => (
                              <div
                                key={value}
                                className="col-12 col-lg-5 col-md-6 col-sm-6 form-check frm-chk-addresstype"
                              >
                                <Input
                                  key={`sobase-code-${value}`}
                                  type="radio"
                                  name="addresstype"
                                  value={value}
                                  className="form-check-input"
                                  checked={soBaseValue === value}
                                  onChange={() => setSoBaseValue(value)}
                                />
                                <label className="form-check-label">
                                  {label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </FormGroup>
                      </Col>
                      {soBaseValue < 2 ? (
                        <Col md="8">
                          <FormGroup>
                            <Label className="control-label">Quotations </Label>
                            <Select
                              components={animatedComponents}
                              className="basic-single"
                              classNamePrefix="select"
                              isDisabled={isDisabled}
                              isLoading={isLoading}
                              isClearable={isClearable}
                              isRtl={isRtl}
                              isSearchable={isSearchable}
                              name="SQList"
                              options={sqList}
                              isMulti
                              onChange={handleSQListChange}
                            />
                          </FormGroup>
                        </Col>
                      ) : null}
                      <hr />
                      {soBaseValue > 1 ? (
                        <div
                          className="accordion accordion-flush"
                          id="accordionFlushExample"
                        >
                          <div className="accordion-item">
                            <Collapse
                              isOpen={true}
                              className="accordion-collapse"
                            >
                              <div className="accordion-body">
                                <div className="row align-items-center g-3">
                                  <div className="col-12 col-lg-8">
                                    <FormGroup>
                                      <Label for="salesContact">Gas Code</Label>
                                      <Select
                                        components={animatedComponents}
                                        className="basic-single"
                                        classNamePrefix="select"
                                        isDisabled={isDisabled}
                                        isLoading={isLoading}
                                        isClearable={isClearable}
                                        isRtl={isRtl}
                                        isSearchable={isSearchable}
                                        name="gascode-col12"
                                        options={CodeList}
                                        isMulti
                                        id="gascode-col12"
                                        onChange={selectedOptions =>
                                          handleGascodeChange2(
                                            "col1",
                                            selectedOptions
                                          )
                                        }
                                      />
                                    </FormGroup>
                                  </div>
                                </div>

                                <div className="table-responsive mt-1">
                                  <Table className="table mb-0">
                                    <thead
                                      style={{ backgroundColor: "#3e90e2" }}
                                    >
                                      <tr>
                                        {/* <th className="text-center">S.No.</th> */}
                                        <th className="text-center">#</th>
                                        <th
                                          className="text-center"
                                          style={{ width: "7%" }}
                                        >
                                          SQ No.
                                        </th>
                                        <th className="text-center">PO No.</th>
                                        <th className="text-center">
                                          Gas Code
                                        </th>
                                        <th className="text-center">
                                          Gas Description
                                        </th>
                                        <th className="text-center">Volume</th>
                                        <th className="text-center">
                                          Pressure
                                        </th>
                                        <th className="text-center">SO Qty</th>
                                        <th
                                          className="text-center"
                                          style={{ width: "8%" }}
                                        >
                                          UoM
                                        </th>
                                        <th
                                          className="text-center"
                                          style={{ width: "8%" }}
                                        >
                                          Delivery Details
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(() => {
                                        const colKey = "col1";
                                        const gasrows = gasCodeList["col1"];
                                        return Array.isArray(gasrows) &&
                                          gasrows.length > 0 ? (
                                          gasrows.map((item, index) => (
                                            <tr key={index}>
                                              {/* <td className="text-center align-middle">
                                                {index + 1}
                                              </td> */}
                                              <td className="text-center align-middle">
                                                <Input
                                                  type="checkbox"
                                                  name={`addresschk${index}`}
                                                  id={`col1${index}`}
                                                  className="tdfrmsizechg"
                                                  onChange={e =>
                                                    addAddressRowIds(
                                                      index,
                                                      item,
                                                      e.target.checked
                                                    )
                                                  }
                                                  disabled={item.IsDisabled}
                                                />
                                              </td>
                                              <td>
                                                <Input
                                                  type="text"
                                                  name={`SQ_Nbr${index}`}
                                                  value={item.SQ_Nbr}
                                                  disabled
                                                />
                                              </td>
                                              <td>
                                                <Input
                                                  type="text"
                                                  name="ponumber"
                                                />
                                              </td>
                                              <td>
                                                <Input
                                                  type="text"
                                                  value={item.label}
                                                  disabled
                                                />{" "}
                                              </td>
                                              <td>
                                                <Input
                                                  type="text"
                                                  value={item.Description}
                                                  disabled
                                                />{" "}
                                              </td>
                                              <td>
                                                <Input
                                                  type="number"
                                                  value={item.Volume}
                                                  disabled
                                                />
                                              </td>
                                              <td>
                                                <Input
                                                  type="text"
                                                  value={item.Pressure}
                                                  disabled
                                                />
                                              </td>
                                              <td>
                                                <Input
                                                  type="text"
                                                  value={item.Qty}
                                                  onChange={e =>
                                                    handleQtyChange(
                                                      index,
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                              </td>
                                              <td>
                                                <Input
                                                  key={`${colKey}-${index}`}
                                                  disabled
                                                  type="select"
                                                  onChange={e =>
                                                    handleUOMChange(
                                                      index,
                                                      e.target.value
                                                    )
                                                  }
                                                >
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
                                              <td className="text-center">
                                                <div
                                                  className="avatar-xs"
                                                  onClick={() =>
                                                    openaddresspopup(
                                                      item,
                                                      colKey,
                                                      index
                                                    )
                                                  }
                                                  style={{ margin: "auto" }}
                                                >
                                                  <span className="avatar-title rounded-circle bg-soft bg-info text-info font-size-14">
                                                    <i className="bx bx-plus-medical"></i>
                                                  </span>
                                                </div>
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td
                                              colSpan="11"
                                              className="text-center text-muted"
                                            >
                                              Please select any gas code
                                            </td>
                                          </tr>
                                        );
                                      })()}
                                    </tbody>
                                  </Table>
                                </div>
                              </div>
                            </Collapse>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="accordion accordion-flush"
                          id="accordionFlushExample"
                        >
                          {Object.entries(activeAccord).map(
                            ([colKey, isOpen], index) => {
                              const sqs = selectedSQ[index];
                              const SQAllGasCodeList = SQGasCodeList[colKey];
                              return (
                                <div className="accordion-item" key={colKey}>
                                  <h2
                                    className="accordion-header"
                                    id={`heading-${colKey}`}
                                    style={{ backgroundColor: "#e0e4e7" }}
                                  >
                                    <button
                                      className={`accordion-button fw-medium ${!isOpen ? "collapsed" : ""
                                        }`}
                                      type="button"
                                      onClick={() => showAccord(colKey)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      Sale Quotation No. :{" "}
                                      {sqs?.SQ_Nbr || "soData"}
                                    </button>
                                  </h2>
                                  <Collapse
                                    isOpen={isOpen}
                                    className="accordion-collapse"
                                  >
                                    <div className="accordion-body">
                                      <div className="row align-items-center g-3">
                                        <div className="col-12 col-lg-8">
                                          <FormGroup>
                                            <Label for="salesContact">
                                              Gas Code
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
                                              name={`gascode-${colKey}`}
                                              options={SQAllGasCodeList}
                                              isMulti
                                              onChange={selectedOptions =>
                                                handleGascodeChange(
                                                  colKey,
                                                  selectedOptions
                                                )
                                              }
                                            />
                                          </FormGroup>
                                        </div>
                                      </div>
                                      <div className="table-responsive mt-1">
                                        <Table className="table mb-0">
                                          <thead
                                            style={{
                                              backgroundColor: "#3e90e2",
                                            }}
                                          >
                                            <tr>
                                              <th className="text-center">
                                                S.No.
                                              </th>
                                              <th className="text-center">#</th>
                                              <th
                                                className="text-center"
                                                style={{ width: "10%" }}
                                              >
                                                PO No.
                                              </th>
                                              <th className="text-center">
                                                Gas Code
                                              </th>
                                              <th className="text-center">
                                                Gas Description
                                              </th>
                                              <th
                                                className="text-center"
                                                style={{ width: "8%" }}
                                              >
                                                Volume
                                              </th>
                                              <th
                                                className="text-center"
                                                style={{ width: "5%" }}
                                              >
                                                Pressure
                                              </th>
                                              <th
                                                className="text-center"
                                                style={{ width: "8%" }}
                                              >
                                                SO Qty
                                              </th>
                                              <th
                                                className="text-center"
                                                style={{ width: "8%" }}
                                              >
                                                UoM
                                              </th>
                                              <th
                                                className="text-center"
                                                style={{ width: "8%" }}
                                              >
                                                Delivery Details
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {(() => {
                                              const gasrows =
                                                gasCodeList[colKey];
                                              return Array.isArray(gasrows) &&
                                                gasrows.length > 0 ? (
                                                gasrows.map((item, index) => {
                                                  return (
                                                    <tr key={index}>
                                                      <td className="text-center align-middle">
                                                        {index + 1}
                                                      </td>
                                                      <td className="text-center align-middle">
                                                        <Input
                                                          type="checkbox"
                                                          name={`addresschk${index}`}
                                                          id={`col1${index}`}
                                                          className="tdfrmsizechg"
                                                          onChange={e =>
                                                            addAddressRowIds(
                                                              index,
                                                              item,
                                                              e.target.checked
                                                            )
                                                          }
                                                          disabled={
                                                            item.IsDisabled
                                                          }
                                                        />
                                                      </td>
                                                      <td>
                                                        <Input
                                                          type="text"
                                                          name="ponumber"
                                                        />
                                                      </td>
                                                      <td>
                                                        <Input
                                                          type="text"
                                                          value={item.label}
                                                          disabled
                                                        />{" "}
                                                      </td>
                                                      <td>
                                                        <Input
                                                          type="text"
                                                          value={
                                                            item.Description
                                                          }
                                                          disabled
                                                        />{" "}
                                                      </td>
                                                      <td>
                                                        <Input
                                                          type="number"
                                                          value={item.Volume}
                                                          disabled
                                                        />
                                                      </td>
                                                      <td>
                                                        <Input
                                                          type="text"
                                                          value={item.Pressure}
                                                          disabled
                                                        />
                                                      </td>
                                                      <td>
                                                        <Input
                                                          type="text"
                                                          value={item.Qty}
                                                          onChange={e =>
                                                            handleQtyChange(
                                                              index,
                                                              e.target.value
                                                            )
                                                          }
                                                        />
                                                      </td>
                                                      <td>
                                                        <Input
                                                          key={`${colKey}-${index}`}
                                                          type="select"
                                                          disabled
                                                          onChange={e =>
                                                            handleUOMChange(
                                                              index,
                                                              e.target.value
                                                            )
                                                          }
                                                        >
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
                                                      <td className="text-center">
                                                        <div
                                                          className="avatar-xs"
                                                          onClick={() =>
                                                            openaddresspopup(
                                                              item,
                                                              colKey,
                                                              index
                                                            )
                                                          }
                                                          style={{
                                                            margin: "auto",
                                                          }}
                                                        >
                                                          <span className="avatar-title rounded-circle bg-soft bg-info text-info font-size-14">
                                                            <i className="bx bx-plus-medical"></i>
                                                          </span>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  );
                                                })
                                              ) : (
                                                <tr>
                                                  <td
                                                    colSpan="11"
                                                    className="text-center text-muted"
                                                  >
                                                    Please select any gas code
                                                  </td>
                                                </tr>
                                              );
                                            })()}
                                          </tbody>
                                        </Table>
                                      </div>
                                    </div>
                                  </Collapse>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </Row>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </Container>
      </div>
      <Modal
        isOpen={isModalOpen}
        role="dialog"
        autoFocus={true}
        centered={true}
        className="exampleModal"
        tabIndex="-1"
        toggle={toggleModal}
        size="lg"
      >
        <div className="modal-content">
          <ModalHeader toggle={toggleModal}>Add Delivery Address</ModalHeader>
          <ModalBody>
            <div className="table-responsive">
              <Table className="table align-middle bg">
                <thead>
                  <tr className="table-light">
                    <th
                      className="text-center"
                      scope="col"
                      style={{ width: "20%" }}
                    >
                      Req. Delivery Date
                    </th>
                    <th className="text-center" scope="col">
                      Delivery Address
                    </th>
                    <th className="text-center" scope="col">
                      Delivery Instruction
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryaddressList.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center" scope="col">
                        <Flatpickr
                          className="form-control d-block"
                          placeholder="dd-mm-yyyy"
                          options={{
                            altInput: true,
                            altFormat: "d-M-Y",
                            dateFormat: "Y-m-d",
                            minDate: minDate,
                            maxDate: maxDate,
                            defaultDate: currentDate,
                          }}
                          onChange={handleDateChange2}
                        />
                      </td>
                      <td className="text-center" scope="col">
                        <Input
                          name="DeliveryAddressId"
                          id="DeliveryAddressId"
                          type="select"
                          value={item.DeliveryAddressId}
                          onChange={handleInputChange2}
                        >
                          {DelAddress.map(addr => (
                            <option
                              key={addr.DeliveryAddressId}
                              value={addr.DeliveryAddressId}
                            >
                              {addr.DeliveryAddress}
                            </option>
                          ))}
                        </Input>
                      </td>
                      <td className="text-center" scope="col">
                        <Input
                          type="text"
                          name="DeliveryInstruction"
                          id="DeliveryInstruction"
                          onChange={handleInputChange2}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              className="btn btn-info"
              onClick={saveAddressdet}
            >
              <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>
              Save
            </Button>
            <Button type="button" color="secondary" onClick={toggleModal}>
              Close
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default EditOrder;
