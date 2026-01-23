import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Collapse, Col, Container, Row, Button, FormGroup, Label, Input, Table, Tooltip, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledAlert, } from "reactstrap";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { GetCustomerFilter, fetchSalesInvoiceDOList, getPackingDetails, GetUoM, GetCurrency, fetchGasListDSI, GetCascodedetail, GetCurrencyconversion } from "../../../common/data/mastersapi";

// --- UPDATED IMPORTS: Added GetAvailableDOs ---
import { GetInvoiceDetails, CreatenewInvoice, GetInvoiceSNo, UpdateInvoice, GetAvailableDOs } from "../../../common/data/invoiceapi";
import useAccess from "../../../common/access/useAccess";
import { createAR } from "../../FinanceModule/service/financeapi";

// --- IMPORTS FOR DO SELECTION TABLE ---
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const AddManualInvoice = () => {
  const { access, applyAccessUI } = useAccess("Invoice", " Direct Sales Invoice");
  const [gasCodeList, setGasCodeList] = useState([]);
  const [CurrencyList, setCurrencyList] = useState([]);
  const [UOMList, setUOMList] = useState([]);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isClearable, setIsClearable] = useState(true);
  const [activeAccord, setActiveAccord] = useState({ col1: true, col2: true, });
  const showAccord = activeItem => {
    setActiveAccord(prevState => ({
      ...prevState,
      [activeItem]: !prevState[activeItem], // Dynamically update the specific key
    }));
  };
  const history = useHistory();
  const { id } = useParams();
  const currentDate = new Date();

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
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW STATES FOR DO CONVERSION ---
  const [convertModal, setConvertModal] = useState(false);
  const [availableDOs, setAvailableDOs] = useState([]);
  const [selectedDOs, setSelectedDOs] = useState([]);
  const [doLoading, setDoLoading] = useState(false);

  const [invoiceHeader, SetInvoiceHeader] = useState({
    doid: [],
    id: 0,
    salesInvoiceNbr: "",
    customerId: "",
    salesInvoiceDate: currentDate,
    totalAmount: 1,
    totalQty: 1,
    isSubmitted: 0,
    orgId: 1,
    branchId: 1,
    userId: 1,
    calculatedPrice: 1,
  });
  const [totalQty, setTotalQty] = useState();
  const [totalPrice, setTotalPrice] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currencySelect, setcurrencySelect] = useState(null);

  // Add this function in your component
  const handleDeleteRow = (rowIndex) => {
    setmanualinvoiceDetails(prev =>
      prev.filter((_, index) => index !== rowIndex)
    );
  };

  const [manualinvoiceDetails, setmanualinvoiceDetails] = useState([
    {
      sqid: 0,
      packingid: 0,
      id: 0,
      salesInvoicesId: 0,
      packingDetailId: 0,
      deliveryNumber: "",
      GasCodeId: 0,
      gasCode: "",
      Volume: 1,
      Pressure: 1,
      Qty: 1,
      pickedQty: 1, // Ensure pickedQty is initialized
      Uom: "",
      UomId: 0,
      CurrencyId: currencySelect,
      UnitPrice: 0,
      TotalPrice: 0,
      ConvertedPrice: "",
      price: "",
      Exchangerate: 0,
      driverName: "",
      truckName: "",
      poNumber: "",
      doNumber: "",
      requestDeliveryDate: currentDate,
      deliveryAddress: "",
      deliveryInstruction: "",
      soQty: 0,
      so_Issued_Qty: 0,
      balance_Qty: 0,
      ConvertedCurrencyId: currencySelect
    },
  ]);

  useEffect(() => {
    if (!access.loading) {
      applyAccessUI();
    }
  }, [access, applyAccessUI]);

  useEffect(() => {
    const getCustomerList = async () => {
      try {
        const data = await GetCustomerFilter(branchId, "%");
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

    console.log("Invoice ID from URL:", id); // DEBUG
    if (id) {
      console.log("Loading invoice details for ID:", id); // DEBUG
      getInvoiceDetails(id);
    } else {
      console.log("No ID found, create mode"); // DEBUG
      // getInvoicesno();
    }
  }, [branchId, id]); // Added 'id' to dependency array

  const handleAddItem = async () => {
    const newRow = {
      sqid: 0,
      packingid: 0,
      id: 0,
      salesInvoicesId: 0,
      packingDetailId: 0,
      deliveryNumber: "",
      GasCodeId: 0,
      gasCode: "",
      Volume: "1",
      Pressure: "1",
      Qty: 1,
      pickedQty: 1,
      Uom: "",
      UomId: 0,
      CurrencyId: currencySelect || null,
      UnitPrice: 0,
      TotalPrice: 0,
      ConvertedPrice: "",
      price: "",
      Exchangerate: "",
      driverName: "",
      truckName: "",
      poNumber: "",
      doNumber: "",
      requestDeliveryDate: currentDate,
      deliveryAddress: "",
      deliveryInstruction: "",
      soQty: 0,
      so_Issued_Qty: 0,
      balance_Qty: 0,
      ConvertedCurrencyId: currencySelect || null,
    };

    const updatedDetails = [...manualinvoiceDetails, newRow];
    setmanualinvoiceDetails(updatedDetails);

    if (currencySelect) {
      // calculate price for new row only if currency is selected
      await GetCurrencyval(updatedDetails.length - 1, currencySelect);
    }
  };


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

  const handleCustomerSelectChange = option => {
    SetInvoiceHeader(prev => ({
      ...prev,
      customerId: option ? option.value : "",
    }));
    setIscustomerchange(prev => prev + 1); // Trigger reset

    // Clear the grid when customer changes to avoid mixing DOs
    setmanualinvoiceDetails([{
      sqid: 0, packingid: 0, id: 0, salesInvoicesId: 0, packingDetailId: 0, deliveryNumber: "", GasCodeId: 0, gasCode: "",
      Volume: 1, Pressure: 1, Qty: 1, pickedQty: 1, Uom: "", UomId: 0, CurrencyId: currencySelect, UnitPrice: 0, TotalPrice: 0,
      ConvertedPrice: "", price: "", Exchangerate: 0, driverName: "", truckName: "", poNumber: "", doNumber: "",
      requestDeliveryDate: currentDate, deliveryAddress: "", deliveryInstruction: "", soQty: 0, so_Issued_Qty: 0, balance_Qty: 0,
      ConvertedCurrencyId: currencySelect
    }]);
  };

  const handleDOSelectChange = options => {
    console.log(options);
    setPackingDetails([]);
    if (options.length === 0) {
      setPackingDetails([]);
    }
    ;
    const updatedOptions = options.map((item, index) => ({
      ...item,
      doid: item.id || 0,
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

  // --- START NEW DO IMPORT LOGIC ---
  const toggleConvertModal = () => {
    if (!invoiceHeader.customerId) {
      setErrorMsg(["Please select a Customer first."]);
      return;
    }
    const isOpening = !convertModal;
    setConvertModal(isOpening);

    if (isOpening) {
      fetchAvailableDOs();
    }
  };

  // --- UPDATED: Client-Side Filtering (Like AR Book) ---
  const fetchAvailableDOs = async () => {
    setDoLoading(true);
    try {
      const payload = {
        customerid: invoiceHeader.customerId,
        gascodeid: 0
      };
      const response = await GetAvailableDOs(payload);
      const allData = response.data || response || [];

      // Filter: Show records starting with "DO" OR "27"
      const filteredData = allData.filter(item => {
        const ref = item.do_number || "";
        return ref.startsWith("DO") || ref.startsWith("27");
      });

      setAvailableDOs(filteredData);
    } catch (e) {
      console.error(e);
    } finally {
      setDoLoading(false);
    }
  };

  const handleImportDOs = async () => {
    if (selectedDOs.length === 0) return;

    setConvertModal(false);
    setIsLoading(true);

    try {
      let newItems = [];

      // Loop through selected DOs and fetch details for each
      for (const doHeader of selectedDOs) {
        const doId = doHeader.do_id;
        const doNumber = doHeader.do_number;

        // Reuse existing GetInvoiceDetails to get line items
        const detailsData = await GetInvoiceDetails(doId);

        if (detailsData && detailsData.Items) {
          // Map items to grid format
          const mappedItems = await Promise.all(detailsData.Items.map(async (item) => {
            // Find Gas Info locally 
            const gasInfo = gasCodeList.find(g => g.GasCodeId === item.gascodeid);
            let description = "";
            let volume = "";
            let pressure = "";

            if (gasInfo) {
              try {
                const gDet = await GetCascodedetail(gasInfo.GasCodeId);
                if (gDet && gDet[0]) {
                  description = gDet[0].Descriptions;
                  volume = gDet[0].Volume;
                  pressure = gDet[0].pressure;
                }
              } catch (e) { }
            }

            return {
              sqid: 0, packingid: 0, id: 0, salesInvoicesId: 0, packingDetailId: 0, deliveryNumber: "",

              GasCodeId: item.gascodeid,
              gasCode: gasInfo ? gasInfo.GasName : "",
              Description: description || (gasInfo ? gasInfo.GasName : ""),
              Volume: volume,
              Pressure: pressure,

              Qty: item.PickedQty,
              pickedQty: item.PickedQty,

              UnitPrice: item.UnitPrice,
              TotalPrice: item.TotalPrice,
              ConvertedPrice: item.TotalPrice * (item.ExchangeRate || 1),
              CurrencyId: item.Currencyid,
              ConvertedCurrencyId: item.Currencyid,
              Exchangerate: item.ExchangeRate,

              Uom: "", UomId: 0,

              poNumber: detailsData.PONumber || "",
              doNumber: doNumber,

              requestDeliveryDate: currentDate,
            };
          }));
          newItems = [...newItems, ...mappedItems];
        }
      }

      // Remove blank row if it exists and append new items
      setmanualinvoiceDetails(prev => {
        const cleanPrev = prev.filter(r => r.GasCodeId !== 0);
        return [...cleanPrev, ...newItems];
      });

      if (newItems.length > 0 && newItems[0].ConvertedCurrencyId) {
        setcurrencySelect(newItems[0].ConvertedCurrencyId);
      }

    } catch (error) {
      console.error("Import failed", error);
      setErrorMsg(["Failed to import DO details."]);
    } finally {
      setIsLoading(false);
      setSelectedDOs([]);
    }
  };
  // --- END NEW DO IMPORT LOGIC ---


  const toggleTooltip = tid => {
    setTooltipOpen(prev => ({
      ...prev,
      [tid]: !prev[tid],
    }));
  };

  const validationSchema = Yup.object().shape({
    salesInvoiceNbr: Yup.string().required("Invoice number is required"),
    salesInvoiceDate: Yup.date().required("Invoice date is required"),
    customerId: Yup.string().required("Customer is required"),
    ConvertedCurrencyId: Yup.string().required("Currency is required"),
    manualinvoiceDetails: Yup.array()
      .of(
        Yup.object().shape({
          GasCodeId: Yup.string().required("Gas is required"),
          pickedQty: Yup.number()
            .max(5, "Qty Number must be at most 5 characters")
            .typeError("Qty must be a number")
            .required("Qty is required")
            .positive("Qty must be positive"),
          poNumber: Yup.string()
            .max(20, "PO Number must be at most 20 characters")
            .matches(/^[a-zA-Z0-9 ]*$/, "Only alphanumeric characters allowed")
            .required("PO Number is required"),
          UomId: Yup.string().required("UOM is required"),
          UnitPrice: Yup.number()
            .typeError("Unit Price must be a number")
            .required("Unit Price is required")
            .positive("Unit Price must be positive"),
        })
      )
      .min(1, "At least one gas detail is required"),
  });


  const validateForm = () => {
    // Validate invoiceHeader
    if (!invoiceHeader || !invoiceHeader.salesInvoiceNbr || !invoiceHeader.customerId || !invoiceHeader.salesInvoiceDate || invoiceHeader.totalAmount <= 0 || invoiceHeader.totalQty <= 0) {
      setErrorMsg(["Invoice header details are incomplete or invalid."]);
      return false;
    }
    for (let i = 0; i < manualinvoiceDetails.length; i++) {
      const item = manualinvoiceDetails[i];
      if (!item.poNumber || item.poNumber.trim() === "") {
        setErrorMsg([`PO Number is required.`]);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (submitTypeParam) => {
    const submitValue = Number(submitTypeParam ?? submitType);
    if (!validateForm()) return;

    // Calculate totals from manualinvoiceDetails
    const totalQty = manualinvoiceDetails.reduce((acc, item) => acc + (Number(item.pickedQty) || 0), 0); // Changed Qty to pickedQty
    const totalAmount = manualinvoiceDetails.reduce((acc, item) => acc + (Number(item.TotalPrice) || 0), 0);
    const calculatedPrice = manualinvoiceDetails.reduce((acc, item) => acc + (Number(item.ConvertedPrice) || 0), 0);

    const headerdetails = {
      id: invoiceHeader.id || 0,
      customerId: invoiceHeader.customerId || "",
      salesInvoiceDate: invoiceHeader.salesInvoiceDate || currentDate,
      salesInvoiceNbr: invoiceHeader.salesInvoiceNbr || "",
      orgId: invoiceHeader.orgId || 1,
      branchId: invoiceHeader.branchId || 1,
      userId: invoiceHeader.userId || 1,
      isSubmitted: Number(submitType),
      ismanual: 1,
      totalQty,
      totalAmount,
      calculatedPrice,
    };

    const updatedDetails = manualinvoiceDetails.map(item => ({
      sqid: item.sqid || 0,
      packingid: item.packingid || 0,
      id: item.id || 0,
      salesInvoicesId: item.salesInvoicesId || 0,
      packingDetailId: item.packingDetailId || 0,
      deliveryNumber: item.deliveryNumber || "",
      gasCodeId: item.GasCodeId || 0,
      gasCode: item.gasCode || "",
      Volume: item.Volume || "",
      Pressure: item.Pressure || "",
      Qty: Number(item.pickedQty) || 1,
      Uom: item.Uom || 0,
      UomId: item.UomId || 0,
      doNumber: item.doNumber || "",
      CurrencyId: item.CurrencyId,
      UnitPrice: Number(item.UnitPrice) || 0,
      TotalPrice: Number(item.TotalPrice) || 0,
      price: Number(item.ConvertedPrice) || 0,
      Exchangerate: Number(item.Exchangerate) || 0,
      driverName: item.driverName || "",
      truckName: item.truckName || "",
      poNumber: item.poNumber,
      requestDeliveryDate: item.requestDeliveryDate || currentDate,
      deliveryAddress: item.deliveryAddress || "",
      deliveryInstruction: item.deliveryInstruction || "",
      soQty: Number(item.soQty) || 0,
      pickedQty: Number(item.pickedQty) || 0,
      so_Issued_Qty: Number(item.so_Issued_Qty) || 0,
      balance_Qty: Number(item.balance_Qty) || 0,
      ConvertedCurrencyId: item.ConvertedCurrencyId,
    }));

    const doDetailPayload = doDetail.map(item => ({
      doid: item.doid || 0,
      id: item.id || 0,
      salesInvoicesId: item.salesInvoicesId || 0,
      packingId: item.packingId || 0,
    }));

    const finalPayload = {
      command: id > 0 ? "UpdateInvoice" : "CreateInvoice",
      header: {
        ...headerdetails,
        isSubmitted: Number(submitType) || 0,
      },
      details: updatedDetails,
      doDetail: doDetailPayload
    };
    console.log(finalPayload);

    setIsSubmitting(true);
    try {
      let response;
      if (id > 0) {
        response = await UpdateInvoice(finalPayload);
      } else {
        response = await CreatenewInvoice(finalPayload);
      }

      const msg = response?.message?.toLowerCase() || "";
      if (msg.includes("invoice number already exist") || msg.includes("invoice number already used")) {
        setErrorMsg([response.message]);
        setSuccessStatus(false);
        setIsSubmitting(false);
        return;
      }
      if (response?.status) {
        setErrorMsg([]);
        setSuccessStatus(true);

        if (Number(submitType) === 1) {
          let Arresponse;
          Arresponse = await createAR({
            "orgId": 1,
            "branchId": 1,
            "userId": 1,
            "userIp": "123",
            "invoiceId": response?.data,
            "typeid": 0
          });
        }

        const action = id > 0 ? submitType === 0 ? "Updated" : "Posted" : submitType === 0 ? "Saved" : "Posted";

        setSuccessMsg(`Sales Invoice ${action} Successfully!`);
        setTimeout(() => {
          history.push("/manual-invoices");
        }, 1000);
      } else {
        setErrorMsg([response?.message || "Please Fill All Details in Gas Detail. "]);
      }
    } catch (err) {
      console.error("Error creating/updating invoice:", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInvoiceDetails = async id => {
    try {
      console.log("Fetching invoice details for ID:", id); // DEBUG
      const data = await GetInvoiceDetails(id);
      console.log("Invoice data received:", data); // DEBUG

      // Handle two possible response structures:
      // 1. Old structure: { Header: {...}, Details: [...] }
      // 2. New structure: { InvoiceId, InvoiceNbr, Items: [...] }

      const isNewStructure = data?.Items && !data?.Header;

      if (isNewStructure) {
        // NEW STRUCTURE: Flat response with Items array
        console.log("Using new API structure"); // DEBUG

        // Set header from flat response
        SetInvoiceHeader(prev => ({
          ...prev,
          id: data.InvoiceId || id,
          salesInvoiceNbr: data.InvoiceNbr || "",
          customerId: data.customerid || "",
          salesInvoiceDate: data.Salesinvoicesdate || new Date(),
          totalAmount: data.TotalAmount || 0,
          calculatedPrice: data.CalculatedPrice || 0,
        }));
        console.log("Invoice header set from flat structure"); // DEBUG

        // Set details from Items array
        if (Array.isArray(data.Items) && data.Items.length > 0) {
          const mappedDetails = data.Items.map(item => ({
            sqid: 0,
            packingid: 0,
            id: item.Id || 0,
            salesInvoicesId: data.InvoiceId || 0,
            packingDetailId: 0,
            deliveryNumber: "",
            GasCodeId: item.gascodeid || 0,
            gasCode: item.GasName || "",
            Description: item.gasDescription || "",
            Volume: item.Volume || "",
            Pressure: item.Pressure || "",
            Qty: item.PickedQty || item.qty || 1,
            pickedQty: item.PickedQty || item.qty || 1,
            Uom: item.UOM || "",
            UomId: item.uomid || 0,
            CurrencyId: item.Currencyid || item.currencyId || 0,
            UnitPrice: item.UnitPrice || item.unitPrice || 0,
            TotalPrice: item.TotalPrice || item.totalPrice || 0,
            price: item.price || "",
            ConvertedPrice: item.ConvertedPrice || item.price || 0,
            Exchangerate: item.ExchangeRate || item.exchangerate || 0,
            driverName: item.driverName || "",
            truckName: item.truckName || "",
            poNumber: item.PONumber || item.poNumber || "",
            doNumber: item.DOnumber || "",
            requestDeliveryDate: item.requestDeliveryDate || new Date(),
            deliveryAddress: item.deliveryAddress || "",
            deliveryInstruction: item.deliveryInstruction || "",
            soQty: item.soQty || 0,
            so_Issued_Qty: item.so_Issued_Qty || 0,
            balance_Qty: item.balance_Qty || 0,
            ConvertedCurrencyId: item.convertedCurrencyId || item.Currencyid || 0,
          }));
          setmanualinvoiceDetails(mappedDetails);
          setcurrencySelect(mappedDetails[0]?.ConvertedCurrencyId || null);
          console.log("Invoice details set, row count:", mappedDetails.length); // DEBUG
        }
      } else {
        // OLD STRUCTURE: Header/Details structure
        console.log("Using old API structure"); // DEBUG

        // set header
        if (data?.Header) {
          SetInvoiceHeader(prev => ({
            ...prev,
            ...data.Header,
            id: data.Header.id || id, // Ensure ID is set
          }));
          console.log("Invoice header set:", data.Header); // DEBUG
        }

        // set details
        if (Array.isArray(data?.Details)) {
          const mappedDetails = data.Details.map(item => ({
            sqid: item.sqid || 0,
            packingid: item.packingid || 0,
            id: item.id || 0,
            salesInvoicesId: item.salesInvoicesId || 0,
            packingDetailId: item.packingDetailId || 0,
            deliveryNumber: item.deliveryNumber || "",
            GasCodeId: item.gascodeid || 0,
            gasCode: item.GasName || item.GasName || "",
            Description: item.gasDescription || "",
            Volume: item.Volume || "",
            Pressure: item.Pressure || "",
            Qty: item.qty || 1,
            Uom: item.UOM || "",
            UomId: item.uomid || 0,
            CurrencyId: item.currencyId,
            UnitPrice: item.unitPrice || 0,
            TotalPrice: item.totalPrice || 0,
            price: item.price || "",
            ConvertedPrice: item.ConvertedPrice || item.price || 0,
            Exchangerate: item.exchangerate || 0,
            driverName: item.driverName || "",
            truckName: item.truckName || "",
            poNumber: item.poNumber,
            doNumber: item.DOnumber || "",
            requestDeliveryDate: item.requestDeliveryDate || new Date(),
            deliveryAddress: item.deliveryAddress || "",
            deliveryInstruction: item.deliveryInstruction || "",
            soQty: item.soQty || 0,
            pickedQty: item.pickedQty ?? item.qty ?? 0,
            so_Issued_Qty: item.so_Issued_Qty || 0,
            balance_Qty: item.balance_Qty || 0,
            ConvertedCurrencyId: item.convertedCurrencyId,
          }));
          setmanualinvoiceDetails(mappedDetails);
          setcurrencySelect(mappedDetails[0]?.ConvertedCurrencyId || null);
          console.log("Invoice details set, row count:", mappedDetails.length); // DEBUG
        }

        // set DO details
        if (Array.isArray(data?.DoDetail)) {
          setDoDetail(data.DoDetail);

          const updatedOptions = data.DoDetail.map(item => ({
            ...item,
            value: item.packingId,
            label: item.packno,
          }));

          // load packing for each DO
          handleDOSelectChange(updatedOptions);
        }
      }
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
    const totalQtys = manualinvoiceDetails.reduce(
      (acc, item) => acc + (Number(item.pickedQty) || 0),
      0
    );
    const totalPrices = manualinvoiceDetails.reduce(
      (acc, item) => acc + (Number(item.TotalPrice) || 0),
      0
    );
    setTotalQty(totalQtys);
    setTotalPrice(totalPrices);

    SetInvoiceHeader(prev => ({
      ...prev,
      totalQty: totalQtys,
      totalAmount: totalPrices,
    }));
  }, [manualinvoiceDetails]);

  const openpopup = (e, submitype) => {
    if (!validateForm()) {
      return true;
    }
    else {
      setSubmitType(submitype);
      // handleSubmit(submitype);
      setIsModalOpen(true);
    }
  };

  const handleUOMChange = (index, uomId) => {
    const updatedDetails = [...manualinvoiceDetails];
    const selectedUOM = UOMList.find(u => u.UoMId === Number(uomId));
    updatedDetails[index].Uom = selectedUOM ? selectedUOM.UoM : "";
    updatedDetails[index].UomId = selectedUOM ? selectedUOM.UoMId : 0;
    setmanualinvoiceDetails(updatedDetails);
  };

  const handlePOChange = (index, ponumber) => {
    const updatedDetails = [...manualinvoiceDetails];
    // Ensure the row exists
    if (!updatedDetails[index]) {
      return;
    }
    updatedDetails[index].poNumber = ponumber;
    setmanualinvoiceDetails(updatedDetails);
  };

  const handleDOChange = (index, donumber) => {
    const updatedDetails = [...manualinvoiceDetails];
    // Ensure the row exists
    if (!updatedDetails[index]) {
      return;
    }
    updatedDetails[index].doNumber = donumber;
    setmanualinvoiceDetails(updatedDetails);
  };

  const handleCurrencyChange = async (index, value) => {
    if (index === null) {
      // global currency change (top dropdown)
      const updatedDetails = manualinvoiceDetails.map(item => ({
        ...item,
        ConvertedCurrencyId: value,
        CurrencyId: value,
      }));
      setmanualinvoiceDetails(updatedDetails);
      setcurrencySelect(value); // can be null

      if (value) {
        // only call GetCurrencyval if value is not null
        for (let i = 0; i < updatedDetails.length; i++) {
          await GetCurrencyval(i, value);
        }
      }
    } else {
      // per row currency change
      const updatedDetails = [...manualinvoiceDetails];
      updatedDetails[index].ConvertedCurrencyId = value;
      updatedDetails[index].CurrencyId = value;
      setmanualinvoiceDetails(updatedDetails);

      if (value) {
        await GetCurrencyval(index, value);
      }
    }
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
    const updatedDetails = [...manualinvoiceDetails];

    if (!updatedDetails[index]) {
      console.warn(`Row at index ${index} is undefined`);
      return;
    }

    //  Keep user-selected currencyId, don't overwrite with BaseCurrencyId
    updatedDetails[index].CurrencyId = updatedDetails[index].CurrencyId || currencySelect;
    updatedDetails[index].ConvertedCurrencyId = updatedDetails[index].ConvertedCurrencyId || currencySelect;

    updatedDetails[index].Exchangerate = currencyval.Exchangerate;

    const price = currencyval.Exchangerate || 1;
    const unitPrice = updatedDetails[index].UnitPrice || 0;
    const qty = updatedDetails[index].pickedQty || 1;

    let total_price = parseFloat(unitPrice) * parseFloat(qty);
    total_price = parseFloat(total_price.toFixed(2));
    updatedDetails[index].TotalPrice = total_price;

    let esti_price = parseFloat(price) * total_price; // simpler: exchange rate × total
    esti_price = parseFloat(esti_price.toFixed(2));

    updatedDetails[index].ConvertedPrice = esti_price;

    setmanualinvoiceDetails(updatedDetails);
  };

  const handleUnitPriceChange = async (index, uprice) => {
    const updatedDetails = [...manualinvoiceDetails];
    updatedDetails[index].UnitPrice = uprice;
    updatedDetails[index].ConvertedPrice = uprice;
    setmanualinvoiceDetails(updatedDetails);
    await GetCurrencyval(index, updatedDetails[index].ConvertedCurrencyId);
  };

  const handleQtyUpdate = async (index, value) => {
    const updatedDetails = [...manualinvoiceDetails];
    if (!updatedDetails[index]) {
      return;
    }
    // updatedDetails[index].Qty = qty;
    updatedDetails[index] = {
      ...updatedDetails[index],
      pickedQty: value
    };
    setmanualinvoiceDetails(updatedDetails);
    await GetCurrencyval(index, updatedDetails[index].ConvertedCurrencyId);
  };

  const handleGasCodeChange = async (index, selectedValue) => {
    const updatedDetails = [...manualinvoiceDetails];
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
        CurrencyId: currencySelect,
        UnitPrice: 0,
        TotalPrice: 0,
        ConvertedPrice: "",
        ConvertedCurrencyId: currencySelect,
        Exchangerate: "",
      };
      setmanualinvoiceDetails(updatedDetails);
      return;
    }

    const selectedGas = gasCodeList.find(c => c.GasCodeId === selectedValue);
    if (selectedGas) {
      try {
        const gascodedetails = await GetCascodedetail(selectedGas.GasCodeId);

        updatedDetails[index] = {
          ...updatedDetails[index],
          GasCodeId: selectedGas.GasCodeId,
          Description: gascodedetails[0]?.Descriptions || "",
          gasCode: gascodedetails[0]?.Descriptions || "",
          Volume: gascodedetails[0]?.Volume || "",
          Pressure: gascodedetails[0]?.pressure || "",
          Qty: 1,
          Uom: "",
          CurrencyId: currencySelect,
          UnitPrice: 0,
          TotalPrice: 0,
          ConvertedPrice: "",
          ConvertedCurrencyId: currencySelect,
          Exchangerate: "",
        };
        setIsLoading(false);
        setmanualinvoiceDetails(updatedDetails);
      } catch (error) {
        console.error("Error fetching gas code details:", error);
      }
    }
  };

  const formatCurrency = value => {
    if (!value) return "";
    const number = Number(value);
    return number.toLocaleString("en-US"); // Use "en-US" for US format (1,234,567.89)
  };

  useEffect(() => {
    const loadGasList = async () => {
      const data = await fetchGasListDSI(1, 0);
      setGasCodeList(data);
    };
    loadGasList();

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
  }, []);


  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Sales" breadcrumbItem="Direct Sales Invoice" />
        <Row>
          <Col lg="12">
            <div className="content clearfix mt-1" style={{ minHeight: "560px" }} >
              <Card>
                <CardBody>
                  <Formik
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

                          {/* --- MODIFIED SECTION: Buttons Layout --- */}
                          <Col md="12" className="mb-3">
                            <div className="d-flex justify-content-end align-items-center gap-2">
                              {access.canSave && (
                                <Button color="secondary" onClick={(e) => { openpopup(e, 0) }} disabled={isSubmitting} >
                                  {id > 0 ? "Update" : "Save"}
                                </Button>
                              )}

                              {access.canPost && (
                                <Button color="success" onClick={(e) => { openpopup(e, 1) }}  // pass 1 for Post
                                  disabled={isSubmitting} >
                                  <i className="bx bxs-save me-2"></i>Post
                                </Button>
                              )}

                              <Button
                                color="warning"
                                onClick={toggleConvertModal}
                                disabled={!invoiceHeader.customerId}
                                title="Convert DO"
                              >
                                <i className="bx bx-import me-1"></i> Convert DO
                              </Button>

                              <Button color="danger" onClick={() => history.push("/manual-invoices")} disabled={isSubmitting} >
                                <i className="bx bx-window-close me-2"></i>Cancel
                              </Button>
                            </div>
                          </Col>
                          {/* --- END MODIFIED SECTION --- */}

                          <Col md="2">
                            <FormGroup>
                              <Label className="required-label" for="SalesInvoiceNum">Invoice No.</Label>

                              <Input
                                type="text"
                                name="salesInvoiceNbr"
                                value={invoiceHeader.salesInvoiceNbr}
                                id="salesInvoiceNbr"
                                maxLength="40"
                                onChange={(e) => {
                                  SetInvoiceHeader((prev) => ({
                                    ...prev,
                                    salesInvoiceNbr: e.target.value,
                                  }))
                                }
                                }
                              />
                              {touched.salesInvoiceNbr && errors.salesInvoiceNbr && (
                                <div className="text-danger">{errors.salesInvoiceNbr}</div>
                              )}
                            </FormGroup>
                          </Col>

                          <Col md="2">
                            <FormGroup>
                              <Label>Date</Label>
                              <Flatpickr className="form-control d-block" placeholder="dd-mm-yyyy"
                                options={{
                                  altInput: true,
                                  altFormat: "d-M-Y",
                                  dateFormat: "Y-m-d",
                                  defaultDate: invoiceHeader.salesInvoiceDate,
                                }}
                                name="SalesInvoiceDate"
                                onChange={date =>
                                  SetInvoiceHeader(prev => ({
                                    ...prev,
                                    salesInvoiceDate: date[0]
                                  }))
                                }
                              />
                              <ErrorMessage name="SalesInvoiceDate" component="div" className="text-danger" />
                            </FormGroup>
                          </Col>
                          <Col md="4">
                            <FormGroup>
                              <Label htmlFor="customerId" className="required-label">Customer</Label>
                              <Select
                                name="customerId"
                                classNamePrefix="select"
                                className={errors.customerId && touched.customerId ? "select-invalid" : ""}
                                isClearable
                                isSearchable
                                options={customerList.map(cus => ({
                                  value: cus.CustomerID,
                                  label: cus.CustomerName,
                                }))}
                                onChange={handleCustomerSelectChange}
                                value={
                                  customerList
                                    .map(cus => ({
                                      value: cus.CustomerID,
                                      label: cus.CustomerName,
                                    }))
                                    .find(option => option.value === invoiceHeader.customerId) || null
                                }
                              />
                              <ErrorMessage name="customerId" component="div" className="text-danger" />
                            </FormGroup>
                          </Col>

                          {/* Currency Select */}
                          <Col md="4">
                            <FormGroup>
                              <Label className="required-label">Currency</Label>
                              <Select
                                name="ConvertedCurrencyId"
                                classNamePrefix="select"
                                className={errors.currencyId && touched.currencyId ? "select-invalid" : ""}
                                isClearable
                                isSearchable
                                options={CurrencyList.map(currency => ({
                                  value: currency.currencyid,
                                  label: currency.Currency
                                }))}
                                onChange={option => handleCurrencyChange(null, option ? option.value : null)}
                                id="Currency-Global"
                                value={
                                  currencySelect
                                    ? {
                                      value: currencySelect,
                                      label: CurrencyList.find(c => c.currencyid === currencySelect)?.Currency
                                    }
                                    : null
                                }
                              />
                              {touched.ConvertedCurrencyId && errors.ConvertedCurrencyId && (
                                <div className="text-danger">{errors.ConvertedCurrencyId}</div>
                              )}
                            </FormGroup>
                          </Col>


                          <Col md="12">
                            <div
                              className="accordion accordion-flush"
                              id="accordionFlushExample"
                            >
                              <div className="accordion-item">
                                <h2 className="accordion-header" id="headingFlushTwo" style={{ backgroundColor: "#cee3f8" }} >
                                  <button className={`accordion-button fw-medium ${!activeAccord.col2 ? "collapsed" : ""}`} type="button"
                                    onClick={() => showAccord("col2")} style={{ cursor: "pointer" }} >
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
                                            <th className="text-center" style={{ width: "2%" }} >
                                              <span style={{ cursor: "pointer", alignItems: "center", }} onClick={handleAddItem} >
                                                <i className="mdi mdi-plus" />
                                              </span>
                                            </th>
                                            <th className="text-center required-label" style={{ width: "14%" }}> Gas Name </th>
                                            {/* <th className="text-center" style={{ width: "10%" }} > Gas Details </th> */}
                                            <th className="text-center required-label" style={{ width: "8%" }} > Qty </th>
                                            <th className="text-center required-label" style={{ width: "8%" }} > PO No. </th>
                                            <th className="text-center " style={{ width: "8%" }} > DO No. </th>
                                            <th className="text-center required-label" style={{ width: "10%" }} > UOM </th>
                                            {/* <th className="text-center required-label" style={{ width: "9%" }} > Currency </th> */}
                                            <th className="text-center required-label" style={{ width: "12%" }} > Unit Price </th>
                                            <th className="text-center" style={{ width: "11%" }} > Total Price{" "} </th>
                                            <th className="text-center" style={{ width: "14%" }} > Price (IDR) </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {manualinvoiceDetails.map((item, index) => {
                                            const tooltipId = `gas-code-${index}`;
                                            const tooltipId2 = `delivery-${index}`;
                                            return (
                                              <tr key={item.GasCodeId || index}>
                                                <td>
                                                  {access.canDelete && (
                                                    <span color="danger" className="btn-sm" onClick={() => handleDeleteRow(index)} title="Delete" >
                                                      <i className="mdi mdi-trash-can-outline label-icon align-middle" title="Delete" />
                                                    </span>
                                                  )}
                                                </td>
                                                <td>
                                                  <Select
                                                    name="GasCodeId"
                                                    id={`GasCodeId-${index}`} // Unique ID for each row
                                                    options={gasCodeList
                                                      .filter(code =>
                                                        !manualinvoiceDetails.some((item, i) => i !== index && item.GasCodeId === code.GasCodeId)
                                                      )
                                                      .map(code => ({
                                                        value: code.GasCodeId,
                                                        label: code.GasName,
                                                      }))}
                                                    value={
                                                      gasCodeList.find(
                                                        option =>
                                                          option.GasCodeId ===
                                                          manualinvoiceDetails[index]?.GasCodeId
                                                      ) || null
                                                    }
                                                    onChange={option =>
                                                      handleGasCodeChange(index, option ? option.value : null)
                                                    }
                                                    classNamePrefix="select"
                                                    isDisabled={isDisabled}
                                                    isLoading={isLoading}
                                                    isClearable={isClearable}
                                                    isSearchable={isSearchable}
                                                  />
                                                  <ErrorMessage
                                                    name={`manualinvoiceDetails.${index}.GasCodeId`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </td>
                                                <td>
                                                  <Input name={`manualinvoiceDetails.${index}.pickedQty`} type="text" inputMode="numeric" className="text-end" maxLength={5}
                                                    onChange={e => handleQtyUpdate(index, e.target.value)}
                                                    value={manualinvoiceDetails[index]?.pickedQty || ""}
                                                    id={`Qty-${index}`}
                                                    onKeyDown={e => {
                                                      // Allow only digits, backspace, delete, tab, arrow keys
                                                      if (
                                                        !/[0-9]/.test(e.key) &&
                                                        e.key !== "Backspace" &&
                                                        e.key !== "Delete" &&
                                                        e.key !== "ArrowLeft" &&
                                                        e.key !== "ArrowRight" &&
                                                        e.key !== "Tab"
                                                      ) {
                                                        e.preventDefault();
                                                      }
                                                    }}
                                                  />
                                                  <ErrorMessage
                                                    name={`manualinvoiceDetails.${index}.pickedQty`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </td>
                                                {/* Editable PO Number */}
                                                <td>
                                                  <Input type="text" name={`manualinvoiceDetails.${index}.poNumber`} className="text-end" maxLength={40}
                                                    onChange={e => handlePOChange(index, e.target.value)}
                                                    value={manualinvoiceDetails[index]?.poNumber}
                                                    id={`poNumber-${index}`}
                                                  />
                                                  <ErrorMessage
                                                    name={`manualinvoiceDetails.${index}.poNumber`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </td>
                                                {/* Editable DO Number */}
                                                <td>
                                                  <Input type="text" className="text-end" maxLength={20}
                                                    onChange={e => handleDOChange(index, e.target.value)}
                                                    value={manualinvoiceDetails[index]?.doNumber}
                                                    id={`doNumber-${index}`}
                                                  />
                                                </td>
                                                {/* Select UOM  */}
                                                <td>
                                                  <Input type="select"
                                                    onChange={e => handleUOMChange(index, e.target.value)}
                                                    id={`Uom-${index}`}
                                                    value={manualinvoiceDetails[index]?.UomId || ""}
                                                  >
                                                    <option key="0" value="">Select</option>
                                                    {UOMList.map(uom => (
                                                      <option key={uom.UoMId} value={uom.UoMId}> {uom.UoM} </option>
                                                    ))}
                                                  </Input>
                                                  <ErrorMessage
                                                    name={`manualinvoiceDetails.${index}.UomId`}
                                                    component="div"
                                                    className="text-danger"
                                                  />

                                                </td>
                                                <td>
                                                  <Input type="text" name={`manualinvoiceDetails.${index}.UnitPrice`} inputMode="decimal" className="text-end" maxLength={15}
                                                    value={manualinvoiceDetails[index]?.UnitPrice || ""}
                                                    onChange={e => {
                                                      const raw = e.target.value.replace(/[^0-9.]/g, "");
                                                      // Prevent multiple decimal points
                                                      if ((raw.match(/\./g) || []).length > 1) {
                                                        return;
                                                      }
                                                      if (raw.length <= 15) {
                                                        handleUnitPriceChange(index, raw);
                                                      }
                                                    }}
                                                    onKeyDown={e => {
                                                      if (
                                                        e.key === "e" || e.key === "-" ||
                                                        (e.key.length === 1 && !/[0-9.]/.test(e.key))
                                                      ) {
                                                        e.preventDefault();
                                                      }
                                                    }}
                                                  />
                                                  <ErrorMessage
                                                    name={`manualinvoiceDetails.${index}.UnitPrice`}
                                                    component="div"
                                                    className="text-danger"
                                                  />
                                                </td>
                                                <td>

                                                  <Input type="text" disabled name="TotalPrice" className="text-end" value={new Intl.NumberFormat("en-US",
                                                    {
                                                      style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2,
                                                    }
                                                  ).format(
                                                    manualinvoiceDetails[index]?.TotalPrice || 0
                                                  )}
                                                    id={`TotalPrice-${index}`}
                                                  />
                                                </td>
                                                <td>
                                                  <Input type="text" disabled name="ConvertedPrice"
                                                    value={new Intl.NumberFormat("en-US",
                                                      {
                                                        style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2,
                                                      }
                                                    ).format(
                                                      manualinvoiceDetails[index]?.ConvertedPrice || 0
                                                    )} // Ensure value is defined
                                                    id={`ConvertedPrice-${index}`} className="text-end"
                                                  />
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                        <tfoot>
                                          <tr className="fw-bold">
                                            <td colSpan="7" className="text-end">Total</td>
                                            <td className="text-end">
                                              {new Intl.NumberFormat("en-US", {
                                                style: "decimal",
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              }).format(
                                                manualinvoiceDetails.reduce(
                                                  (sum, item) => sum + (parseFloat(item.TotalPrice) || 0),
                                                  0
                                                )
                                              )}
                                            </td>
                                            <td className="text-end">
                                              {new Intl.NumberFormat("en-US", {
                                                style: "decimal",
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              }).format(
                                                manualinvoiceDetails.reduce(
                                                  (sum, item) => sum + (parseFloat(item.ConvertedPrice) || 0),
                                                  0
                                                )
                                              )}
                                            </td>
                                          </tr>
                                        </tfoot>
                                      </Table>
                                    </div>
                                  </div>
                                </Collapse>
                              </div>   </div>
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

      {/* --- DO IMPORT MODAL --- */}
      <Modal isOpen={convertModal} toggle={toggleConvertModal} size="lg" centered>
        <ModalHeader toggle={toggleConvertModal}>Select DO to Convert</ModalHeader>
        <ModalBody>
          <p className="text-muted mb-2">Select confirmed Delivery Orders to import items from.</p>
          <div className="table-responsive border rounded" style={{ minHeight: '300px' }}>
            <DataTable
              value={availableDOs}
              selection={selectedDOs}
              onSelectionChange={(e) => setSelectedDOs(e.value)}
              dataKey="do_id"
              emptyMessage={doLoading ? "Loading..." : "No available DOs found."}
              showGridlines
              className="p-datatable-sm"
              loading={doLoading}
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
              <Column field="do_number" header="DO Number" sortable></Column>
              <Column field="do_date" header="Date" sortable></Column>
              <Column field="qty" header="Qty" className="text-end"></Column>
              <Column field="total" header="Amount" className="text-end" body={(r) => r.total ? r.total.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}></Column>
            </DataTable>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleConvertModal}>Cancel</Button>
          <Button
            color="primary"
            onClick={handleImportDOs}
            disabled={selectedDOs.length === 0}
          >
            Import ({selectedDOs.length})
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered tabIndex="1"
      >
        <ModalBody className="py-3 px-5">
          <Row>
            <Col lg={12}>
              <div className="text-center">
                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />
                <h4> Do you want to{" "}
                  {id > 0 ? submitType === 0 ? "Update" : "Post" : submitType === 0 ? "Save" : "Post"} ? </h4>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="text-center mt-3 button-items">
                <Button className="btn btn-info" color="success" size="lg" onClick={() => { handleSubmit(submitType); setIsModalOpen(false); }} > Yes </Button>
                <Button color="danger" size="lg" className="btn btn-danger" onClick={() => setIsModalOpen(false)} > Cancel </Button>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AddManualInvoice;