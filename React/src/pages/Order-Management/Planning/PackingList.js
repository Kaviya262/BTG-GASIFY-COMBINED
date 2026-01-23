import { Modal, ModalHeader, ModalBody, Table, ModalFooter } from 'reactstrap';

import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Label,
  Input, InputGroup, InputGroupText
} from "reactstrap";
import Select from "react-select";
import { toast } from 'react-toastify';
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  uploadDOFile,
  downloadExcel,
  GetALLPackingDelivery,
  GetPackerList,
  uploadAckDOFile, downloadPackingExportExcel, packingstage, GetBarcodePackingList, packingacknoledgement, GetInvoiceData
  , CreateAutoInvoice, GetStagedata, BarcodeMachineScan, PackingConfirmed, GetgasCodeData, printExportExcelPacking, SaveBarcodeScan, GetBarcodeDetails
  , GetRackDetails, GetPackerautoList, GetCustomerFilter,
} from "../../../common/data/invoiceapi";
import { GetAllPackingList, SaveBarcodePackingList, GetByIdBarcodepackingList } from "../../../common/data/mastersapi";
import logo from '../../../assets/images/logo.png';

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(/ /g, "-"); // e.g. "09-Oct-2025"
};

const PackingList = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const driverOptions = [
    { label: "Anwar", value: "Anwar" },
    { label: "Shafiq", value: "Shafiq" },
  ];

  const truckOptions = [
    { label: "BHP1234", value: "BHP1234" },
    { label: "BHP0945", value: "BHP0945" },
  ];
  const [globalFilter, setGlobalFilter] = useState("");

  const [items, setItems] = useState([]);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  const driverTemplate = (rowData) => <span>{rowData.driver}</span>;
  
  // Helper function to get first word of truck name
  const getFirstWord = (text) => {
    if (!text) return "";
    return text.split(' ')[0] || text;
  };

  const truckTemplate = (rowData) => {
    const truckName = rowData.truck || "";
    const firstWord = getFirstWord(truckName);
    return (
      <span 
        title={truckName} 
        style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          display: 'inline-block',
          maxWidth: '100%'
        }}
      >
        {firstWord}
      </span>
    );
  };
  
  const packerDropdown = (rowData) => <span>{rowData.packer}</span>;
  // const packerDropdown = (rowData) => (
  //     <Input
  //       type="select"
  //       value={rowData.packer || ""}
  //       onChange={(e) => updateField(rowData.id, "packer", e.target.value)}
  //     >
  //       <option value="">Select</option>
  //       <option value="Ahmed">Ahmed</option>
  //       <option value="Hussainy">Hussainy</option>
  //     </Input>
  //   );

  const closeBarcodeModal = () => {
    setShowBarcodeModal(false);
    setBarcodeSO(null);
    setItems([]);
    setBarcodeData('');
    setSelectedRackId(null);
  };


  const [searchBy, setSearchBy] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [barcodeSO, setBarcodeSO] = useState({});
  const [keyword, setKeyword] = useState("");

  const [salesOrders, setSalesOrders] = useState([
    {
      id: 0,
      pdlNumber: "",            // from "PDL No."
      pdlDate: "",              // from "PDL Date" (format: YYYY-MM-DD)
      customerId: 0,
      customer: "",             // from "Customer"
      gasCodeId: 0,
      gasCode: "",              // from "Gas Code"
      gasDescription: "",       // from "Gas Description"
      soQty: 0,                 // from "SO Qty"
      plannedQty: 0,            // from "Plan Deliv Qty"
      estTime: "",              // from "Seq Time" (HH:MM)
      driver: "",               // from "Driver"
      driverId: null,
      packer: "",               // from "Packer"
      packerId: null,
      truck: "",                // from "Truck"
      truckId: null,
      instruction: "",          // from "Deliv Inst"
      convertToPDL: false,      // from "Select" === 1
      status: "S",
      packingDetailsId: null,
      deliveryDetailRefId: null,
      packingId: null,
      PackNo: "",
      DOID: ""
    }
  ]);

  const [selectedRackId, setSelectedRackId] = useState(null);
  const [rackNumberOptions, setrackNumberOptions] = useState([]);
  const getracknolist = async () => {
    debugger
    try {
      const response = await GetRackDetails();
      if (response?.status) {
        setrackNumberOptions(response.data)
      }
    } catch (error) {
      console.error("Error loading packer list:", error);
    }


  }
  // const handleSave = async (isSubmitted) => {
  //   debugger;
  //   const isSubmit = isSubmitted === 1 ? true : false;
  //   if (!barcodeSO) {
  //     toast.warn("No sales order selected.");
  //     return;
  //   }

  //   if (!selectedRackId) {
  //     toast.warn("Please select a rack number.");
  //     return;
  //   }

  //   if (!items || items.length === 0) {
  //     toast.warn("Please scan or enter at least one barcode.");
  //     return;
  //   }

  //   const barcodeList = items
  //     .map(item => item.barcode?.trim())
  //     .filter(b => b && b !== '');

  //   if (barcodeList.length === 0) {
  //     toast.warn("No valid barcodes found in the scanned items.");
  //     return;
  //   }

  //   const barcodeString = barcodeList.join(',');

  //   const payload = {
  //     Barcode: barcodeString,
  //     packingdetails: selectedOrder.packingDetailsId,
  //     packingId: selectedOrder.packingId,
  //     RackId: selectedRackId,
  //     isSubmitted: isSubmit,
  //     userId: 1,
  //     packNo: selectedOrder.pdlNumber
  //   };

  //   try {
  //     const response = await SaveBarcodePackingList(payload);
  //     debugger;

  //     if (response && response.status) {
  //       toast.success(isSubmitted ? "Posted successfully" : "Saved successfully");
  //       closeBarcodeModal();
  //     } else {
  //       toast.error("Failed to save PDL. Please try again.");
  //     }
  //   } catch (error) {
  //     toast.error("Error occurred while saving.");
  //     console.error(error);
  //   }
  // };
  const handleSave = async (isSubmitted) => {
    debugger;
    const isSubmit = isSubmitted === 1 ? true : false;

    if (!barcodeSO) {
      toast.warn("No sales order selected.");
      return;
    }

    if (!selectedRackId) {
      toast.warn("Please select a rack number.");
      return;
    }

    if (!items || items.length === 0) {
      toast.warn("Please scan or enter at least one barcode.");
      return;
    }

    const plannedQty = parseInt(barcodeSO?.plannedQty || 0, 10);
    const scannedCount = items.length;

    if (isSubmit) {
      if (scannedCount < plannedQty) {
        toast.warn(`You must scan exactly ${plannedQty} barcode(s) before posting.`);
        return;
      }
      if (scannedCount > plannedQty) {
        toast.warn(`You cannot scan more than ${plannedQty} barcode(s). Please remove extra.`);
        return;
      }
    }

    const barcodeList = items
      .map(item => item.barcode?.trim())
      .filter(b => b && b !== '');

    if (barcodeList.length === 0) {
      toast.warn("No valid barcodes found in the scanned items.");
      return;
    }

    const barcodeString = barcodeList.join(',');

    const payload = {
      Barcode: barcodeString,
      packingdetails: selectedOrder.packingDetailsId,
      packingId: selectedOrder.packingId,
      RackId: selectedRackId,
      isSubmitted: isSubmit,
      userId: 1,
      packNo: selectedOrder.pdlNumber
    };

    try {
      const response = await SaveBarcodePackingList(payload);
      debugger;

      if (response && response.status) {
        toast.success(isSubmitted ? "Posted successfully" : "Saved successfully");
        closeBarcodeModal();
        fetchPackingList();
      } else {
        toast.error("Failed to save PDL. Please try again.");
      }
    } catch (error) {
      toast.error("Error occurred while saving.");
      console.error(error);
    }
  };





  const handleRackChange = (option) => {
    setSelectedRackId(option?.RackId || null);
  };
  const [showModal, setShowModal] = useState(false);
  const [selectedSO, setSelectedSO] = useState(null);

  // Initialize filters similar to manage-packing.js
  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      pdlNumber: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      pdlDate: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      customer: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      gasCode: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      gasDescription: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      soQty: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      plannedQty: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      estTime: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      driver: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      truck: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      packer: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      instruction: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
    });
    setKeyword("");
  };

  // Initialize filters on mount
  useEffect(() => {
    initFilters();
  }, []);

  const filteredOrders = salesOrders.filter(item => {
    if (!searchBy || !searchValue) return true;
    return item[searchBy] === searchValue;
  });
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // 1. Packer (string compare)
    const packerCompare = (a.packer || "").localeCompare(b.packer || "");
    if (packerCompare !== 0) return packerCompare;

    // 2. PDL Number (numeric compare)
    const numA = parseInt(a.pdlNumber?.replace(/\D/g, '') || '0', 10);
    const numB = parseInt(b.pdlNumber?.replace(/\D/g, '') || '0', 10);
    if (numA !== numB) return numA - numB;

    // 3. PDL Date (date compare)
    const dateA = a.pdlDate ? new Date(a.pdlDate) : new Date(0);
    const dateB = b.pdlDate ? new Date(b.pdlDate) : new Date(0);
    if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;

    // 4. Est. Time / Seq Time (string compare)
    return (a.estTime || "").localeCompare(b.estTime || "");
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const handleBarcodeClick = (rowData) => {
    const selectedOrder = rowData;
    setBarcodeSO(rowData);
    setShowBarcodeModal(true);
    getracknolist();
    setSelectedOrder(selectedOrder);
    fetchBarcodeDetailsAndRacks(rowData.packingId, rowData.packingDetailsId);
  };


  const fetchBarcodeDetailsAndRacks = async (packingId, packingDetailsId) => {
    debugger
    try {
      setLoading(true);
      const response = await GetByIdBarcodepackingList(packingId, packingDetailsId);
      debugger
      if (response?.status && Array.isArray(response.data)) {
        const transformedItems = response.data.map((item) => ({
          sno: item["SQ No."] ?? "Not Found",
          gasCode: item["Gas Code"] ?? "",
          gasDescription: item["Gas Name"] ?? "",
          cylinderNumber: item["Cylinder Number - Cylinder Name"] ?? "",
          testedOn: item["Tested On"] ?? "",
          nextTestDate: item["Next Test Date"] ?? "",
          barcode: item["Barcode"] ?? ""
        }));

        setItems(transformedItems);
        if (response.data.length > 0 && response.data[0].RackId) {
          setSelectedRackId(response.data[0].RackId);
        }
      } else {
        // Handle case where no data is returned
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching barcode details or rack numbers:', error);
    }
  };
  const staticSalesOrderDetails = {
    salesOrder: "SO0000220",
    soType: "Insert from Sales Quotation",
    soDate: "27-Jun-2025",
    customer: "TC Customer",
    phone: "+6281234567890",
    email: "tccus@gmail.com",
    orderBy: "NewOrdergetDSO",
    project: "CHECK",
    items: [
      {
        sno: 1,
        sqNo: "SQ0000290",
        poNumber: "12 2MG3-BA",
        gasCode: "2",
        gasDescription: "MIXED GASES 3 (CO2 25% + AR 75%)",
        volume: "7.2 M3",
        pressure: "47",
        soQty: "150",
        uom: "1 KGS"
      }
    ]
  };

  const updateField = (id, field, value) => {
    setSalesOrders(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };



  // Templates


  const driverDropdown = rowData => (
    <Input
      type="select"
      value={rowData.driver}
      onChange={e => updateField(rowData.id, "driver", e.target.value)}
    >
      <option value="">Select</option>
      {driverOptions.map((item, index) => (
        <option key={index} value={item.value}>
          {item.label}
        </option>
      ))}
    </Input>
  );

  const handleSODoubleClick = (rowData) => {

    setSelectedSO(staticSalesOrderDetails);
    setShowModal(true);

  };

  const truckDropdown = rowData => (
    <Input
      type="select"
      value={rowData.truck}
      onChange={e => updateField(rowData.id, "truck", e.target.value)}
    >
      <option value="">Select</option>
      {truckOptions.map((item, index) => (
        <option key={index} value={item.value}>
          {item.label}
        </option>
      ))}
    </Input>
  );

  const convertToPDLTemplate = rowData => (
    <Checkbox
      checked={rowData.convertToPDL}
      onChange={e => updateField(rowData.id, "convertToPDL", e.checked)}
    />
  );

  const DelivInstCell = ({ inst }) => {
    const displayText =
      inst.length > 30
        ? `${inst.slice(0, 27)}… `
        : inst;

    return <span title={inst}>{displayText}</span>;
  };

  const getSeverity = (Status) => {
    switch (Status) {
      case 'unqualified':
        return 'danger';
      case 'qualified':
        return 'success';
      case 'Posted':
        return 'success';
      case 'Saved':
        return 'danger';
      case 'new':
        return 'info';
      case 'negotiation':
        return 'warning';
      case 'renewal':
        return null;
    }
  };
  const remainingBarcodes = (barcodeSO?.plannedQty || 0) - items.length;

  const renderHeader = () => {
    return (
      <div className="row align-items-center g-3 clear-spa">
        <div className="col-12 col-lg-6">
         <Button 
        className="btn btn-danger btn-label" 
        onClick={() => { setKeyword(""); setFilters({}); setSalesOrders(allPackingData); }}
         >
        <i className="mdi mdi-filter-off label-icon" /> Clear
         </Button>
        </div>
        <div className="col-12 col-lg-3 text-end">
          <span className="me-4"><Tag value="S" severity={getSeverity("Saved")} /> Saved</span>
          {/* <span className="me-1"><Tag value="P" severity={getSeverity("Posted")} /> Posted</span>  */}
        </div>
        <div className="col-12 col-lg-3">
          <input
            className="form-control"
            type="text"
            placeholder="Keyword Search"
            value={keyword}
            onChange={(e) => {
              const val = e.target.value;
              setKeyword(val);
              if (val === "") {
                setSalesOrders(allPackingData);
              } else {
                const lowerVal = val.toLowerCase();
                const filtered = allPackingData.filter(item => {
                  // Search in customer, packer, gasCode, and any other relevant fields
                  return (
                    (item.customerName && item.customerName.toLowerCase().includes(lowerVal)) ||
                    (item.packer && item.packer.toLowerCase().includes(lowerVal)) ||
                    (item.gasCode && item.gasCode.toLowerCase().includes(lowerVal)) ||
                    (item.pdlNumber && String(item.pdlNumber).toLowerCase().includes(lowerVal))
                  );
                });
                setSalesOrders(filtered);
              }
            }}
          />
        </div>
      </div>
    );
  };

  const header = renderHeader();
  const savePostTemplate = (rowData) => (
    <div className="d-flex gap-2 justify-content-center">
      <Button
        className="p-button-sm p-button-primary"
        tooltip="Save"
        style={{ padding: '4px 6px', fontSize: '10px' }}
        onClick={() => alert("Save clicked for ID " + rowData.id)}
      >
        <i className="pi pi-save"></i>
      </Button>
      <Button
        className="p-button-sm p-button-success"
        tooltip="Post"
        style={{ padding: '4px 6px', fontSize: '10px' }}
        onClick={() => alert("Post clicked for ID " + rowData.id)}
      >
        <i className="pi pi-send"></i>
      </Button>
    </div>
  );
  const [barcodeData, setBarcodeData] = useState('');
  const handleButtonClick = () => {
    debugger
    console.log('Barcode scanned:', barcodeData);
    processBarcode(barcodeData);
    setBarcodeData('');
  };
  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter') {
      console.log('Barcode scanned:', barcodeData);
      processBarcode(barcodeData);
      setBarcodeData('');
      e.preventDefault();
    }
  };

  // "PDL No.": barcodeSO.PDL No.,
  // "PDL Date": "2025-07-15T00:00:00",
  // "CustomerId": barcodeSO.CustomerId,
  // "Customer": "PT. GLOBAL MARINE SAFETY INDONESIA",
  // "GasCodeId": 1,
  // "Gas Code": "2MG3-BA",
  // "Gas Description": "2 MIXED GASES 3 ( CO2 25% + AR 75% ) 7.2 M3",
  // "SO Qty": 1,
  // "Plan Deliv Qty": 0,
  // "Seq Time": "14:16:00",
  // "DriverId": 108,
  // "Driver": "Hendro",
  // "TruckId": 0,
  // "Truck": "Indo Transporter",
  // PackerId: barcodeSO.PackerId,
  // "Packer": "Kareem",
  // "Deliv Inst": "test",
  // PackingDetailsId: barcodeSO.PackingDetailsId,
  // "Delivery Detail Ref ID": barcodeSO.Delivery Detail Ref ID,
  // "Status": "Posted"

  // Processing Function
  // const processBarcode = async (barcode) => {
  //   console.log("PDL Number:", barcodeSO?.pdlNumber);
  //   setLoading(true);
  //   toast.dismiss();

  //   const packingId = selectedOrder.packingId;
  //   const donoId = selectedOrder.DOID; // Use if you have a dynamic DONO ID

  //   try {
  //     const response = await GetBarcodePackingList({
  //       packingId: packingId,
  //       barcode: barcode ?? "",
  //       donoId: donoId,
  //     });
  //           fetchBarcodeDetailsAndRacks(packingId,donoId);
  //     // if (response?.status && Array.isArray(response.data)) {
  //     //   const formattedItems = response.data.map((item, index) => ({
  //     //     sno: index + 1,
  //     //     gasCode: item.gascode,
  //     //     gasDescription: item.gasname,
  //     //     cylinderNumber: item.cylindername,
  //     //     testedOn: item.testedon,
  //     //     nextTestDate: item.nexttestdate,
  //     //     barcode: item.barcode,
  //     //     deliveryId: item.deliveryid,
  //     //     sqNumber: item.SQ_Nbr,
  //     //     sqId: item.SQID,
  //     //     dono: item.dono,
  //     //   }));

  //     //   setItems(formattedItems);
  //       setBarcodeData("");
  //     } else {
  //       toast.error(response?.message || "Failed to fetch barcode details.");
  //     }
  //   } catch (error) {
  //     console.error("Error processing barcode:", error);
  //     toast.error("An error occurred while processing the barcode.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const processBarcode = async (barcode) => {
    console.log("PDL Number:", barcodeSO?.pdlNumber);
    setLoading(true);
    toast.dismiss();
    debugger
    const packingId = selectedOrder.packingId;
    const donoId = selectedOrder.DOID;
    const packingdetailsId = selectedOrder.packingDetailsId
    debugger
    try {
      const response = await GetBarcodePackingList({
        packingId: packingId,
        barcode: barcode ?? "",
        donoId: donoId,
      });
      debugger
      if (response?.status) {
        await fetchBarcodeDetailsAndRacks(packingId, packingdetailsId);
      }

    } catch (error) {
      console.error("Error processing barcode:", error);
      toast.error("An error occurred while processing the barcode.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    debugger
    const plannedQty = parseInt(barcodeSO?.plannedQty || 0, 10);
    const alreadyScanned = items.length;
    const remainingQty = plannedQty - alreadyScanned;

    let inputVal = e.target.value;

    const barcodeArray = inputVal
      .split(',')
      .map(b => b.trim())
      .filter(b => b !== '');

    if (barcodeArray.length > remainingQty) {
      inputVal = barcodeArray.slice(0, remainingQty).join(', ');
      toast.warn(`You can only enter ${remainingQty} more barcode${remainingQty > 1 ? 's' : ''}.`);
    }

    setBarcodeData(inputVal);
  };

  // Fetch packing list
  // const fetchPackingList = async () => {
  //   try {
  //     setLoading(true);

  //     let searchById = 0;
  //     let customerId = 0;
  //     let gasCodeId = 0;

  //     if (searchBy === "customer") {
  //       searchById = 1;
  //       customerId = customerOptions.find(c => c.value === searchValue)?.value || 0;
  //     } else if (searchBy === "gasCode") {
  //       searchById = 2;
  //       gasCodeId = gasCodeOptions.find(g => g.value === searchValue)?.value || 0;
  //     } else if (searchBy === "packer") {
  //       searchById = 3;
  //     }
  //     debugger

  //     const branchId = 1;
  //     const response = await GetAllPackingList(searchById, customerId, gasCodeId, branchId);

  //     const mappedData = response.data.map((item, index) => ({
  //       id: index + 1,
  //       pdlNumber: item["PDL No."] || "",
  //       pdlDate: item["PDL Date"] ? item["PDL Date"].split("T")[0] : "",
  //       customerId: item["CustomerId"] || 0,
  //       customer: item["Customer"] || "",
  //       gasCodeId: item["GasCodeId"] || "",
  //       gasCode: item["Gas Code"] || "",
  //       gasDescription: item["Gas Description"] || "",
  //       soQty: item["SO Qty"] || 0,
  //       plannedQty: item["Plan Deliv Qty"] || 0,
  //       estTime: item["Seq Time"] ? item["Seq Time"].split("T")[1]?.substring(0, 5) : "",
  //       driver: item["Driver"] || "",
  //       driverId: item["DriverId"] || null,
  //       packer: item["Packer"] || "",
  //       packerId: item["PackerId"] || null,
  //       truck: item["Truck"] || "",
  //       truckId: item["TruckId"] || null,
  //       instruction: item["Deliv Inst"] || "",
  //       convertToPDL: item["Select"] === 1,
  //       status: item["Status"] === "Posted" ? "P" : "S",

  //       packingDetailsId: item["PackingDetailsId"] || null,
  //       deliveryDetailRefId: item["Delivery Detail Ref ID"] || null,
  //       packingId: item["PackingId"] || null
  //     }));

  //     setSalesOrders(mappedData);
  //   } catch (error) {
  //     console.error("Error fetching packing list:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchPackingList = async () => {
    try {
      setLoading(true);

      const response = await GetAllPackingList(0, 0, 0, 1); // unfiltered
      const mappedData = response.data.map((item, index) => ({
        id: index + 1,
        pdlNumber: item["PDL No."] || "",
        pdlDate: item["PDL Date"] ? item["PDL Date"].split("T")[0] : "",
        customerId: item["CustomerId"] || 0,
        customer: item["Customer"] || "",
        gasCodeId: item["GasCodeId"] || "",
        gasCode: item["Gas Code"] || "",
        gasDescription: item["Gas Description"] || "",
        soQty: item["SO Qty"] || 0,
        plannedQty: item["Plan Deliv Qty"] || 0,
        estTime: item["Seq Time"]?.substring(0, 5) || "",
        driver: item["Driver"] || "",
        driverId: item["DriverId"] || null,
        packer: item["Packer"] || "",
        packerId: item["PackerId"] || null,
        truck: item["Truck"] || "",
        truckId: item["TruckId"] || null,
        instruction: item["Deliv Inst"] || "",
        convertToPDL: item["Select"] === 1,
        status: item["Status"] === "Posted" ? "P" : "S",
        packingDetailsId: item["PackingDetailsId"] || null,
        deliveryDetailRefId: item["Delivery Detail Ref ID"] || null,
        packingId: item["PackingId"] || null,
        DOID: item["DOID"] || null
      }));

      setAllPackingData(mappedData);     // keep original full list
      setSalesOrders(mappedData);        // show full list initially
    } catch (error) {
      console.error("Error fetching packing list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    try {
      if (!sortedOrders || sortedOrders.length === 0) {
        toast.error("No data available to print.");
        return;
      }

      const formatDate = (val) => {
        const date = new Date(val);
        return isNaN(date) ? val : date.toISOString().split('T')[0];
      };

      const tableHeaders = `
      <tr>
        <th>PDL No.</th>
        <th>PDL Date</th>
        <th>Customer</th>
        <th>Gas Code</th>
        <th>Gas Description</th>
        <th>SO Qty</th>
        <th>Plan Deliv Qty</th>
        <th>Seq Time</th>
        <th>Driver</th>
        <th>Truck</th>
        <th>Deliv Inst</th>
        <th>Status</th>
      </tr>
    `;

      const tableRows = sortedOrders.map(row => `
      <tr>
        <td>${row.pdlNumber || ''}</td>
        <td>${formatDate(row.pdlDate)}</td>
        <td>${row.customer || ''}</td>
        <td>${row.gasCode || ''}</td>
        <td>${row.gasDescription || ''}</td>
        <td>${row.soQty || ''}</td>
        <td>${row.plannedQty || ''}</td>
        <td>${row.estTime || ''}</td>
        <td>${row.driver || ''}</td>
        <td>${row.truck || ''}</td>
        <td>${row.instruction || ''}</td>
        <td>${row.status || ''}</td>
      </tr>
    `).join('');

      const logoHeader = `
        <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
          <div style="min-width: 90px; margin-right: 18px;">
            <img src='${logo}' alt='logo' style='height: 70px;' />
          </div>
          <div style="text-align: left; font-size: 12px; line-height: 1.4; max-width: 260px; word-break: break-word;">
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 2px;">PT. Batam Teknologi Gas</div>
            <div>Jalan Brigjen Katamso KM.3, Tanjung Uncang,<br/>Batam – Indonesia</div>
            <div>WebSite www.ptbtg.com E-mail<br/>ptbtg@ptpbtg.com</div>
            <div>Telp (+62)778 462959 391918</div>
          </div>
        </div>
      `;
      const printHtml = `
      <html>
        <head>
          <title>Delivery Order Print</title>
          <style>
            @media print {
              @page {
                size: landscape;
              }
              body {
                transform: scale(0.98);
                transform-origin: top left;
                margin: 20px;
              }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h3 {
              margin-bottom: 20px;
              text-align: center;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #333;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${logoHeader}
          <h3>Delivery Order List</h3>
          <table>
            <thead>${tableHeaders}</thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(printHtml);
      doc.close();

      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    } catch (err) {
      console.error("Failed to print:", err);
      toast.error("Failed to print packing. Please try again.");
    }
  };


  const exportToExcel = () => {
    if (!sortedOrders || sortedOrders.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const formatDate = (val) => {
      const date = new Date(val);
      return isNaN(date) ? val : date.toISOString().split('T')[0];
    };

    const exportData = sortedOrders.map(item => ({
      "PDL No.": item.pdlNumber || '',
      "PDL Date": formatDate(item.pdlDate),
      "Customer": item.customer || '',
      "Gas Code": item.gasCode || '',
      "Gas Description": item.gasDescription || '',
      "SO Qty": item.soQty || '',
      "Plan Deliv Qty": item.plannedQty || '',
      "Seq Time": item.estTime || '',
      "Driver": item.driver || '',
      "Truck": item.truck || '',
      "Deliv Inst": item.instruction || '',
      //"Status": item.status || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Delivery Orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString("en-US", { month: "short" }).toLowerCase();
    const day = now.getDate().toString().padStart(2, '0');
    const hours24 = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours24 >= 12 ? "pm" : "am";
    const hours = (hours24 % 12 || 12).toString().padStart(2, '0');

    const fileName = `Delivery-Orders-${year}-${month}-${day}-${hours}-${minutes}-${ampm}.xlsx`;

    saveAs(data, fileName);
  };

  const [packerOptions, setPackerOptions] = useState([]);

  // const handlePrint = async () => {
  //   try {

  //     let podetails = "%";
  //     const blob = await printExportExcelPacking(
  //       packingFilter.BranchId,
  //     );



  //     const arrayBuffer = await blob.arrayBuffer();
  //     const workbook = XLSX.read(arrayBuffer, { type: "array" });
  //     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  //     const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  //     const tableRows = jsonData.map(row => `
  //             <tr>
  //                 ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
  //             </tr>
  //         `).join('');

  //     const tableHeaders = Object.keys(jsonData[0]).map(key => `<th>${key}</th>`).join('');

  //     const printHtml = `
  //     <html>
  //         <head>
  //             <title>Delivery Order Print</title>
  //             <style>
  //                 @media print {
  //                     @page {
  //                         size: landscape;
  //                     }
  //                         body {
  //         transform: scale(0.98);
  //         transform-origin: top left;
  //       }
  //                 }
  //                 table { border-collapse: collapse; width: 100%; }
  //                 th, td { border: 1px solid #333; padding: 8px; text-align: left; }
  //                 th { background-color: #f2f2f2; }
  //             </style>
  //         </head>
  //         <body>
  //             <h3>Delivery Order List</h3>
  //             <table>
  //                 <thead><tr>${tableHeaders}</tr></thead>
  //                 <tbody>${tableRows}</tbody>
  //             </table>
  //         </body>
  //     </html>
  // `;


  //     const iframe = document.createElement('iframe');
  //     iframe.style.position = 'fixed';
  //     iframe.style.right = '0';
  //     iframe.style.bottom = '0';
  //     iframe.style.width = '0';
  //     iframe.style.height = '0';
  //     iframe.style.border = '0';
  //     document.body.appendChild(iframe);

  //     const doc = iframe.contentWindow.document;
  //     doc.open();
  //     doc.write(printHtml);
  //     doc.close();

  //     iframe.onload = () => {
  //       iframe.contentWindow.focus();
  //       iframe.contentWindow.print();


  //       setTimeout(() => {
  //         document.body.removeChild(iframe);
  //       }, 1000);
  //     };

  //   } catch (err) {
  //     toast.error("Failed to print report:", err);
  //     toast.error("Failed to print packing. Please try again.");
  //   }
  // };

  // Load once on mount
  useEffect(() => {
    fetchPackingList();
    // Dropdown options are now extracted from displayed data, not from API
    // Removed API calls to GetCustomer, fetchGasList, and GetPackersName
  }, []);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [gasCodeOptions, setGasCodeOptions] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('');

  const [allPackingData, setAllPackingData] = useState([]);
  const [filteredList, setFilteredList] = useState([]);

  // Extract unique values from displayed data for dropdown options
  const extractDropdownOptions = (data) => {
    // Extract unique customers from displayed data
    const uniqueCustomers = [];
    const customerMap = new Map();
    data.forEach(item => {
      if (item.customerId && item.customer && !customerMap.has(item.customerId)) {
        customerMap.set(item.customerId, true);
        uniqueCustomers.push({
          label: item.customer,
          value: item.customerId
        });
      }
    });

    // Extract unique gas codes from displayed data
    const uniqueGasCodes = [];
    const gasCodeMap = new Map();
    data.forEach(item => {
      if (item.gasCodeId && item.gasCode && !gasCodeMap.has(item.gasCodeId)) {
        gasCodeMap.set(item.gasCodeId, true);
        uniqueGasCodes.push({
          label: item.gasCode,
          value: item.gasCodeId
        });
      }
    });

    // Extract unique packers from displayed data
    const uniquePackers = [];
    const packerMap = new Map();
    data.forEach(item => {
      if (item.packerId && item.packer && !packerMap.has(item.packerId)) {
        packerMap.set(item.packerId, true);
        uniquePackers.push({
          label: item.packer,
          value: item.packerId
        });
      }
    });

    return {
      customers: uniqueCustomers,
      gasCodes: uniqueGasCodes,
      packers: uniquePackers
    };
  };

  // Update dropdown options from allPackingData (full dataset, not filtered)
  useEffect(() => {
    if (allPackingData.length > 0) {
      const options = extractDropdownOptions(allPackingData);
      setCustomerOptions(options.customers);
      setGasCodeOptions(options.gasCodes);
      setPackerOptions(options.packers);
    }
  }, [allPackingData]);

  const filterSalesOrders = (by, value) => {
    if (!by || !value) return allPackingData;

    const filterValue = String(value);
    debugger
    return allPackingData.filter(item => {
      if (by === "customer") return String(item.customerId) === filterValue;
      if (by === "gasCode") return String(item.gasCodeId) === filterValue;
      if (by === "packer") return String(item.packerId) === filterValue;
      return true;
    });
  };



  const handleSearchValueChange = e => {
    const selectedValue = e.target.value;
    setSearchValue(selectedValue);

    const filtered = filterSalesOrders(searchBy, selectedValue);
    setSalesOrders(filtered);
  };

  const statusTemplate = (rowData) => {
    console.log("Status Debug:", rowData);

    return (
      <Tag
        value={rowData.status}
        severity={rowData.status === "P" ? "success" : "danger"}
      />
    );
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>

          <Breadcrumbs title="Distribution" breadcrumbItem="Packing List" />

          {/* 🔍 Search Filter */}
          <Card className="p-3 mb-3">
            <Row className="align-items-center g-2">
              <Col lg="1" md="6">
                <Label htmlFor="Search_Type">Search By</Label>
              </Col>
              <Col lg="2" md="6">
                <Input
                  type="select"
                  name="Search_Type"
                  id="Search_Type"
                  value={searchBy}
                  onChange={e => {
                    setSearchBy(e.target.value);
                    setSearchValue(""); // Reset selection
                    setSelectedLabel(""); // Reset label
                  }}
                >
                  <option value="">Select</option>
                  <option value="customer">Customer</option>
                  <option value="gasCode">Gas Code</option>
                  <option value="packer">Packer</option>
                </Input>
              </Col>
              <Col lg="1" md="6">
                <Label htmlFor="Search_Value">
                  {searchBy === "customer"
                    ? "Customer"
                    : searchBy === "gasCode"
                      ? "Gas Code"
                      : searchBy === "packer"
                        ? "Packer"
                        : ""}
                </Label>
              </Col>

              {searchBy && (
                <Col lg="2" md="6">
                  <Input
                    type="select"
                    name="Search_Value"
                    id="Search_Value"
                    value={searchValue}
                    onChange={e => {
                      const selectedValue = e.target.value;
                      setSearchValue(selectedValue);

                      const options =
                        searchBy === "customer"
                          ? customerOptions
                          : searchBy === "gasCode"
                            ? gasCodeOptions
                            : searchBy === "packer"
                              ? packerOptions
                              : [];

                      const selectedOption = options.find(opt => String(opt.value) === selectedValue);
                      setSelectedLabel(selectedOption?.label || "");
                    }}
                  >
                    <option value="">Select</option>
                    {(searchBy === "customer"
                      ? customerOptions
                      : searchBy === "gasCode"
                        ? gasCodeOptions
                        : searchBy === "packer"
                          ? packerOptions
                          : []
                    ).map((item, index) => (
                      <option key={index} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Input>
                </Col>
              )}

              <Col lg={searchBy === "" ? 8 : 6} md="6">
                <div className="text-end button-items">
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={async () => {
                      setLoading(true);
                      const filteredData = filterSalesOrders(searchBy, searchValue);
                      setSalesOrders(filteredData);
                      setTimeout(() => setLoading(false), 500); // simulate async, remove if real async
                    }}
                  >
                    <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i>
                    Search
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={async () => {
                      setLoading(true);
                      setSearchBy("");
                      setSearchValue("");
                      setSelectedLabel("");
                      setSalesOrders(filterSalesOrders("", ""));
                      initFilters(); // Clear filters like manage-packing.js
                      setTimeout(() => setLoading(false), 500); // simulate async, remove if real async
                    }}
                  >
                    <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={exportToExcel}
                  >
                    <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i>
                    Export
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handlePrint}
                  >
                    <i className="bx bx-printer label-icon font-size-16 align-middle me-2"></i>
                    Print
                  </button>
                </div>
              </Col>
            </Row>
          </Card>
          {/* 📦 DataTable */}
          <Row>
            <Col lg="12">
              <Card>

                <DataTable
                  value={salesOrders}
                  rows={10}
                  header={header}
                  paginator
                  filters={filters}
                  globalFilterFields={['customer', 'gasCode', 'status', 'gasDescription', 'driver', 'pdlNumber', 'pdlDate', 'truck', 'packer', 'estTime']}
                  scrollable
                  scrollHeight="400px"
                  responsiveLayout="scroll"
                  className='blue-bg'
                  emptyMessage="No order found."
                  onFilter={(e) => setFilters(e.filters)}
                  globalFilter={keyword}
                >
                  {/* <Column
  header="Posted Sales Order"
  body={(rowData) => (
    <span
      onDoubleClick={() => handleSODoubleClick(rowData)}
      style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
    >
      {rowData.salesOrder}
    </span>
  )}
  className='text-center'
  style={{ width: '8%' }}
/>
<Column field="soDate" header="SO Date" style={{ width: '6%' }} /> */}

                  <Column 
                    field="pdlNumber" 
                    header="PDL No." 
                    headerStyle={{ textAlign: 'center' }}
                    filter
                    filterPlaceholder="Search by PDL No."
                  />
                  <Column 
                    field="pdlDate" 
                    header="PDL Date" 
                    headerStyle={{ textAlign: 'center' }}
                    filter
                    filterPlaceholder="Search by PDL Date"
                    body={(rowData) => {
                      const formattedDate = formatDate(rowData.pdlDate);
                      return (
                        <span style={{ whiteSpace: 'nowrap', overflow: 'visible' }} title={formattedDate}>
                          {formattedDate}
                        </span>
                      );
                    }}
                    style={{ whiteSpace: 'nowrap' }}
                    bodyStyle={{ whiteSpace: 'nowrap', overflow: 'visible' }}
                  />
                  <Column 
                    field="customer" 
                    header="Customer" 
                    style={{ width: "20%" }} 
                    headerStyle={{ textAlign: 'center' }}
                    filter
                    filterPlaceholder="Search by Customer"
                  />
                  <Column 
                    field="gasCode" 
                    header="Gas Code" 
                    headerStyle={{ textAlign: 'center' }}
                    filter
                    filterPlaceholder="Search by Gas Code"
                  />
                  <Column 
                    field="gasDescription" 
                    header="Gas Description" 
                    headerStyle={{ textAlign: 'center' }}
                    filter
                    filterPlaceholder="Search by Gas Description"
                  />
                  <Column 
                    field="soQty" 
                    header="SO Qty" 
                    style={{ textAlign: "center" }}
                    filter
                    filterPlaceholder="Search by SO Qty"
                  />

                  <Column 
                    field="plannedQty" 
                    header="Plan Deliv Qty" 
                    style={{ textAlign: "center" }}
                    filter
                    filterPlaceholder="Search by Plan Deliv Qty"
                  />
                  <Column
                    header="Barcode"

                    body={(rowData, { rowIndex }) => (
                      <Button
                        // style={{ backgroundColor: (rowIndex % 2 !== 0) ? "#f0f0f0" : "#fff", border: (rowIndex % 2 !== 0) ? "1px solid #ccc" : "" }}
                        className="p-button-text"
                        onClick={() => handleBarcodeClick(rowData)}
                      //disabled={rowIndex % 2 !== 0} 
                      >
                        <i
                          className="mdi mdi-barcode-scan"
                          style={{ fontSize: '1.2rem' }} // Adjust size as needed
                        />
                      </Button>
                    )} headerStyle={{ textAlign: 'center' }}
                  />
                  <Column 
                    header="Seq Time" 
                    field="estTime" 
                    headerStyle={{ textAlign: 'center' }}
                    filter
                    filterPlaceholder="Search by Seq Time"
                  />
                  <Column 
                    field="driver" 
                    header="Driver" 
                    body={driverTemplate} 
                    headerStyle={{ textAlign: 'center' }}
                    filter
                    filterPlaceholder="Search by Driver"
                  />
                  <Column 
                    field="truck" 
                    header="Truck" 
                    body={truckTemplate} 
                    headerStyle={{ textAlign: 'center' }}
                    style={{ minWidth: '110px' }}
                    bodyStyle={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                    filter
                    filterPlaceholder="Search by Truck"
                  />
                  <Column 
                    header="Packer" 
                    body={packerDropdown} 
                    headerStyle={{ textAlign: 'center' }}
                    filter
                    filterPlaceholder="Search by Packer"
                    field="packer"
                  />
                  <Column 
                    body={rowData => <DelivInstCell inst={rowData.instruction} />} 
                    header="Deliv Inst" 
                    tooltip="testt" 
                    headerStyle={{ textAlign: 'center' }}
                    field="instruction"
                    filter
                    filterPlaceholder="Search by Deliv Inst"
                  />
                  {/* <Column header="Save / Post" body={savePostTemplate} style={{ width: '3%', textAlign: 'center' }} /> */}
                  <Column 
                    header="Status" 
                    className="text-center" 
                    body={statusTemplate} 
                    headerStyle={{ textAlign: 'center' }}
                    field="status"
                    filter
                    filterPlaceholder="Search by Status"
                  />
                </DataTable>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal isOpen={showModal} toggle={() => setShowModal(false)} size="xl">
        <ModalHeader toggle={() => setShowModal(false)} >
          Sales Order - {selectedSO?.salesOrder}
        </ModalHeader>
        <ModalBody>
          {selectedSO && (
            <>
              <p><strong>SO Type:</strong> {selectedSO.soType}</p>
              <p><strong>SO Date:</strong> {selectedSO.soDate}</p>
              <p><strong>Customer:</strong> {selectedSO.customer}</p>
              <p><strong>Phone No:</strong> {selectedSO.phone}</p>
              <p><strong>Email:</strong> {selectedSO.email}</p>
              <p><strong>Order By:</strong> {selectedSO.orderBy}</p>
              <p><strong>Project:</strong> {selectedSO.project}</p>


              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>SQ No.</th>
                    <th>PO Number</th>
                    <th>Gas Code</th>
                    <th>Gas Description</th>
                    <th>Volume</th>
                    <th>Pressure</th>
                    <th>SO Qty</th>
                    <th>UOM</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSO.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.sno}</td>
                      <td>{item.sqNo}</td>
                      <td>{item.poNumber}</td>
                      <td>{item.gasCode}</td>
                      <td>{item.gasDescription}</td>
                      <td>{item.volume}</td>
                      <td>{item.pressure}</td>
                      <td>{item.soQty}</td>
                      <td>{item.uom}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </ModalBody>
      </Modal>
      {/* Barcode Modal */}
      <Modal isOpen={showBarcodeModal} toggle={closeBarcodeModal} size="xl">
        <ModalHeader toggle={closeBarcodeModal}>
          Barcode for PDL: {barcodeSO?.pdlNumber}
        </ModalHeader>
        <ModalBody>
          <div className="modal-body">
            <div className="row g-3">

              {/* Planned Delivered Qty */}
              <div className="col-12 col-lg-4 d-flex align-items-center">
                <Label className="me-2 m-0">
                  Plan Deliv Qty
                </Label>
                <Input
                  type="text"
                  disabled
                  value={barcodeSO?.plannedQty || ''}
                  style={{ flexGrow: 1 }}
                />
              </div>

              {/* Start Scanning */}


              {/* Rack No. Dropdown */}
              <div className="col-12 col-lg-4 d-flex align-items-center">
                <Label
                  className="me-2 m-0 required-label"
                  htmlFor="rackNumber"


                >
                  Rack No.
                </Label>
                <Select
                  value={rackNumberOptions.find(opt => opt.RackId === selectedRackId) || null}
                  options={rackNumberOptions}
                  getOptionValue={opt => opt.RackId}
                  getOptionLabel={opt => opt.label}
                  onChange={handleRackChange}
                  placeholder="Select"
                  inputId="rackNumber"
                  className="flex-grow-1"
                  styles={{ container: base => ({ ...base, flexGrow: 1 }) }}
                />

              </div>

              <div className="col-12 col-lg-8 d-flex flex-column">
                <Label
                  className="me-2 m-0 required-label"
                  style={{ color: "#800517", fontWeight: "bold" }}
                >
                  Please fill out the Barcode (e.g., 234356, 546545)

                </Label>
                <InputGroup>
                  <Input
                    type="textarea"
                    name="BarcodeScanner"
                    id="BarcodeScanner"
                    autoFocus
                    style={{ flexGrow: 1 }}
                    value={barcodeData}
                    onChange={handleInputChange}
                    onKeyDown={handleBarcodeScan}
                    disabled={remainingBarcodes <= 0}
                  />
                  <InputGroupText>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={handleButtonClick}
                      disabled={remainingBarcodes <= 0}
                    >
                      Enter
                    </Button>
                  </InputGroupText>
                </InputGroup>
                {/* Barcode remaining count message removed as requested */}

                {/* <div style={{ marginTop: '4px', color: 'firebrick', fontWeight: 'bold' }}>
            Please fill out the Barcode (e.g., 234356, 546545)
          </div> */}
              </div>
              {/* Table */}
              <div className="col-12">
                <div className="table-responsive">
                  <table border="1" cellPadding="8" cellSpacing="0" width="100%">
                    <thead>
                      <tr>
                        <th className="text-center">Barcode</th>
                        <th className="text-center">Gas Code</th>
                        <th className="text-center">Gas Name</th>
                        <th className="text-center">Cylinder Number - Cylinder Name</th>
                        <th className="text-center">Tested On</th>
                        <th className="text-center">Next Test Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items?.length > 0 ? (
                        items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="text-center">{item.barcode}</td>
                            <td className="text-center">{item.gasCode}</td>
                            <td className="text-center">{item.gasDescription}</td>
                            <td className="text-center">{item.cylinderNumber}</td>
                            <td className="text-center">{item.testedOn}</td>
                            <td className="text-center">{item.nextTestDate}</td>

                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-3">No items scanned yet.</td>
                        </tr>
                      )}
                    </tbody>

                  </table>
                </div>
              </div>

            </div>
          </div>
        </ModalBody>
        <ModalFooter>

          <Button className="btn btn-info" onClick={() => handleSave(0)}>
            Save
          </Button>

          <Button className="btn btn-success" onClick={() => handleSave(1)}>
            Post
          </Button>

          <Button className='btn btn-danger' onClick={closeBarcodeModal}>
            Cancel
          </Button>

        </ModalFooter>
      </Modal>

    </React.Fragment>
  );
};

export default PackingList;

