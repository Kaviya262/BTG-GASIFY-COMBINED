import { Modal, ModalHeader, ModalBody, Table, ModalFooter } from 'reactstrap';
import React, { useState, useEffect, useRef, useMemo } from "react";
import Select from 'react-select';
import { Tooltip } from 'primereact/tooltip';
import {
  Card,
  Col,
  Container,
  Row,
  Label,
  Input,
} from "reactstrap";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { toast } from 'react-toastify';
import { Tag } from "primereact/tag";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { GetAllMasterSalesOrder, GetDriversList, GetTruckList, SaveMasterSalesOrder, UpdateMasterSalesOrder, GetCustomer, fetchGasList, OrderGetbyid } from "../../../common/data/mastersapi";
import { GetPackerList, GetPackingpackno, } from 'common/data/invoiceapi';
import { orders } from 'common/data';
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

const TransportPlanner = () => {
  const driverOptions = [
    { label: "Anwar", value: "Anwar" },
    { label: "Shafiq", value: "Shafiq" },
  ];

  const truckOptions = [
    { label: "BHP1234", value: "BHP1234" },
    { label: "BHP0945", value: "BHP0945" },
  ];
  const [customerOptions, setCustomerOptions] = useState([]);
  const [gasCodeOptions, setGasCodeOptions] = useState([]);
  const [editingDriver, setEditingDriver] = useState(null);

  // single toast ref: update existing toast instead of stacking multiple toasts
  const toastRef = useRef(null);
  const showOrUpdateToast = (message, type = 'info', options = {}) => {
    const fnMap = {
      success: toast.success,
      error: toast.error,
      warning: toast.warn || toast.warning || toast.warn,
      info: toast.info,
    };
    const fn = fnMap[type] || toast;

    try {
      const onClose = () => { toastRef.current = null; };
      if (toastRef.current && toast.isActive && toast.isActive(toastRef.current)) {
        // update existing toast
        toast.update(toastRef.current, { render: message, type, autoClose: 5000, onClose, ...options });
      } else {
        const id = fn(message, { autoClose: 5000, onClose, ...options });
        toastRef.current = id;
      }
    } catch (err) {
      // fallback to simple toast call if update fails
      fn(message, { autoClose: 5000, onClose: () => { toastRef.current = null; }, ...options });
    }
  };

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [customerData, gasData] = await Promise.all([
          GetCustomer(1, 0),
          fetchGasList(1, 0),
        ]);

        const customerOpts = customerData.map(c => ({
          label: c.CustomerName || c.Customer, // adjust as per your API field
          value: c.CustomerId,
        }));

        const gasOpts = gasData.map(g => ({
          label: g.GasCodeName || g.GasCode, // adjust as per your API field
          value: g["Gas Code"] || g.GasCodeId, // based on your data payload
        }));

        setCustomerOptions(customerOpts);
        setGasCodeOptions(gasOpts);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
      }
    };

    loadDropdowns();
  }, []);


  // const customerOptions = [
  //   { label: "test", value: "test" },
  //   { label: "PT. KARIMUN TEKNOLOGI GAS	", value: "PT. KARIMUN TEKNOLOGI GAS	" },
  // ];

  // const gasCodeOptions = [
  //   { label: "2MG3-BA", value: "2MG3-BA" },
  //   { label: "CO2-AA", value: "CO2-AA" },
  //   { label: "N2", value: "N2" },
  //   { label: "C2H2", value: "C2H2" },
  //   { label: "AR", value: "AR" },
  //   { label: "MO2", value: "MO2" },
  // ];
  const [selectedSO, setSelectedSO] = useState({ items: [] });

  const [searchBy, setSearchBy] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

  const [salesOrders, setSalesOrders] = useState([
    {
      id: null,
      soid: 0,
      salesOrder: "",
      soDate: "",
      customer: "",
      customerId: 0,
      gasCodeId: "",
      gasCode: "",
      gasDescription: "",
      soQty: 0,
      pendingQty: 0,
      balanceQty: 0,
      plannedQty: 0,
      estTime: "",
      driver: "",
      driverId: null,
      packerId: null,
      truckId: null,
      truck: "",
      packer: "",
      instruction: "",
      convertToPDL: false,
      status: null,
      pckId: null,
      detailsId: "",
      packingDetailId: null,
      packerHeaderId: null,
      packingSODetailId: null,
      PackingHeaderId: null,
      packingCustomerCustomerId: null,
      packingCustomerPackingId: null,
      packingCustomerDetailId: null,
      PackingGasDetailId: null,
      IsSubmitted: null,
      IsQtyMatched: null,
      exchangeRate: 0,
      CurrencyId: 0,
      PONumber: 0,
      customerdetailid: 0
    },
  ]);

  const [pdlWorking, setPdlWorking] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showPDLModal, setShowPDLModal] = useState(false);
  const [pdlNumber, setPdlNumber] = useState(null);
  const [packerList, setPackerList] = useState([]);
  const selectedForPDL = salesOrders.filter((so) => so.convertToPDL);
  const [filters, setFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [driverNameList, setDriverNameList] = useState([]);
  const [truckList, setTruckList] = useState([]);
  const [selectedFilterType, setSelectedFilterType] = useState(null);
  const [selectedAutoItem, setSelectedAutoItem] = useState(null);
  const [autoOptions, setAutoOptions] = useState([]);
  const [branch_Id, setBranchId] = useState(1);
  const [org_Id, setOrgId] = useState(1);
  const [commonEstTime, setCommonEstTime] = useState("");
  const [editingTruck, setEditingTruck] = useState(null);
  const [editingPacker, setEditingPacker] = useState(null);

  const FilterTypes = [
    { name: 'Customer', value: 1 }, { name: 'Gas Code', value: 2 }
  ];

  const getDynamicLabel = () => {
    if (selectedFilterType?.value === 1) return "Customer";
    if (selectedFilterType?.value === 2) return "Gas Code";
    return "";
  };

  useEffect(() => {
    const loadOptions = async () => {
      if (!selectedFilterType) {
        setAutoOptions([]);
        return;
      }

      try {
        // Fetch ALL sales orders (all pages) without filters to get unique IDs across all pages
        const branchId = 1;
        const allSalesOrdersResponse = await GetAllMasterSalesOrder(
          0, // searchBy = 0 means no filter
          0, // customerId = 0
          0, // gasCodeId = 0
          branchId
        );

        let result = [];
        if (selectedFilterType.value === 1) {
          // Customer - Get all customers from API
          const allCustomers = await GetCustomer(1, 0);
          // Extract unique customer IDs from ALL sales orders (all pages)
          const uniqueCustomerIds = [...new Set(
            allSalesOrdersResponse.data
              .map(item => item["CustomerId"] || 0)
              .filter(id => id > 0)
          )];
          // Filter to only show customers that exist in any sales order
          const filteredCustomers = allCustomers.filter(customer =>
            uniqueCustomerIds.includes(customer.CustomerId || customer.id)
          );
          // Format for react-select
          result = filteredCustomers.map(c => ({
            label: c.CustomerName || c.Customer,
            value: c.CustomerId || c.id,
          }));
          setAutoOptions(result);
        } else if (selectedFilterType.value === 2) {
          // Gas Code - Get all gas codes from API
          const allGasCodes = await fetchGasList(1, 0);
          // Extract unique gas code IDs from ALL sales orders (all pages)
          const uniqueGasCodeIds = [...new Set(
            allSalesOrdersResponse.data
              .map(item => {
                const gasCodeId = item["Gas Code"];
                // Convert to string for consistent comparison, but keep original type in set
                return gasCodeId !== undefined && gasCodeId !== null && gasCodeId !== "" ? gasCodeId : null;
              })
              .filter(id => id !== null && id !== "")
          )];
          // Filter to only show gas codes that exist in any sales order (across all pages)
          const filteredGasCodes = allGasCodes.filter(gas => {
            const gasCodeId = gas["Gas Code"] || gas.GasCodeId || gas.id;
            // Use consistent comparison - convert both to string for comparison
            return uniqueGasCodeIds.some(id => String(id) === String(gasCodeId));
          });
          // Format for react-select
          result = filteredGasCodes.map(g => ({
            label: g.GasCodeName || g.GasCode,
            value: g["Gas Code"] || g.GasCodeId || g.id,
          }));
          setAutoOptions(result);
        } else {
          setAutoOptions([]);
        }
        console.log('result > ', result)
      } catch (error) {
        console.error("Error loading dropdown options:", error);
        setAutoOptions([]);
      }
    };

    loadOptions();
  }, [selectedFilterType]);


  // useEffect(() => {
  //   debugger
  //   const mapped = staticSalesOrderDetails.items.map(item => ({
  //     id: null,
  //     soid: 0,
  //     salesOrder: staticSalesOrderDetails.salesOrder,
  //     soDate: staticSalesOrderDetails.soDate,
  //     customer: staticSalesOrderDetails.customer,
  //     customerId: staticSalesOrderDetails.customerId || 0,
  //     gasCodeId: parseInt(item.gasCode) || "", // convert if needed
  //     gasCode: item.gasCode,
  //     gasDescription: item.gasDescription,
  //     soQty: parseInt(item.soQty),
  //     pendingQty: 0,
  //     plannedQty: 0,
  //     estTime: "",
  //     driver: "",
  //     driverId: null,
  //     packerId: null,
  //     truckId: null,
  //     truck: "",
  //     packer: "",
  //     instruction: "",
  //     convertToPDL: false,
  //     status: "",
  //     pckId: null,
  //     Sqdtlid: null,
  //     IsSubmitted :staticSalesOrderDetails.IsSubmitted,
  //   }));

  //   setSalesOrders(mapped);
  // }, []);
  const fetchTruckList = async () => {
    try {
      const branchId = 1;
      debugger
      const data = await GetTruckList(branchId);
      debugger
      const formatted = data.map(truck => ({
        value: truck.id,
        label: truck.truckName,
      }));
      setTruckList(formatted);
    } catch (err) {
      console.error("Error fetching trucks:", err.message);
    }
  };

  const fetchDriversList = async () => {
    try {
      debugger
      const branchId = 1;
      const data = await GetDriversList(branchId);
      const formatted = data.map(driver => ({
        value: driver.Id,
        label: driver.driverName,
      }));
      setDriverNameList(formatted);
    } catch (err) {
      console.error("Error fetching delivery orders:", err.message);
    }
  };
  const fetchPackerList = async () => {
    try {
      const branchId = 1;
      const data = await GetPackerList(branchId);
      debugger
      const formatted = data.map(packer => ({
        value: packer.Id,
        label: packer.PackerName,
      }));
      setPackerList(formatted);
    } catch (err) {
      console.error("Error fetching packer list:", err.message);
    }
  };


  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      let searchById = 0;
      let customerId = 0;
      let gasCodeId = 0;

      if (searchBy === "customer") {
        searchById = 1;
        customerId = parseInt(searchValue) || 0;
      } else if (searchBy === "gasCode") {
        searchById = 2;
        gasCodeId = parseInt(searchValue) || 0;
      }

      const branchId = 1;
      const response = await GetAllMasterSalesOrder(
        searchById,
        customerId,
        gasCodeId,
        branchId
      );
      debugger
      const mappedData = response.data.map((item, index) => {
        const planned = item["Plan Deliv Qty"] > 0 ? item["Plan Deliv Qty"] : 0;
        const pending = item["Pend Qty"] || 0;
        const soQty = item["SO Qty"] || 0;
        const balancesqty = item["balancesqty"] || 0;
        const alreadyPostedQty = soQty - balancesqty; // Calculate already posted quantity
        const originalRemainingQty = pending;
        return {
          id: item["Id"] || index + 1,
          soid: item["SO Id"] || 0,
          salesOrder: item["SO No."] || "",
          soDate: item["SO Date"]?.split("T")[0] || "",
          customer: item["Customer"] || "",
          customerId: item["CustomerId"] || 0,
          detailsId: item["Detail Id"] || 0,
          gasCodeId: item["Gas Code"] || 0,
          gasCode: item["GasCodeName"] || "",
          gasDescription: item["Gas Description"] || "",
          exchangeRate: item["exchangeRate"] || 0,
          CurrencyId: item["CurrencyId"] || 0,
          PONumber: item["PONumber"] || 0,
          soQty: soQty,
          balanceQty: item["Balance Qty"] || 0,
          pendingQty: pending,
          plannedQty: item.IsSubmitted === 1 ? 0 : planned, // Reset to 0 for posted orders
          alreadyPostedQty: alreadyPostedQty, // Store already posted quantity
          originalRemainingQty: originalRemainingQty,
          balancesqty: balancesqty,

          estTime: item["Seq Time"]?.substring(0, 5) || "",
          driver: item["Driver"] || "",
          driverId: item["DriverId"] || null,
          truckId: item["TruckId"] || null,
          truck: item["Truck"] || "",
          packer: item["Packer"] || "",
          packerId: item["PackerId"] || null,
          instruction: item["Deliv Inst"] || "",
          status: item["Status"] === "Posted" ? "P" : "S",
          pckId: item["PackingId"] || null,

          packingDetailId: item["PackingDetailId"] || null,
          packerHeaderId: item["PackerHeaderId"] || null,
          packingSODetailId: item["PackingSODetailId"] || null,
          PackingHeaderId: item["PackingHeaderId"] || null,

          packingCustomerDetailId: item["PackingCustomerDetailId"] || null,
          packingCustomerPackingId: item["PackingCustomerPackingId"] || null,
          packingCustomerCustomerId: item["PackingCustomerCustomerId"] || null,
          customerdetailid: item["customerdetailid"] || 0,

          PackingGasDetailId: item["PackingGasDetailId"] || null,
          Sqdtlid: item["Sqdtlid"] || null,
          convertToPDL: false,
          IsSubmitted: item["IsSubmitted"] !== undefined ? item["IsSubmitted"] : null,
          IsQtyMatched: item["IsQtyMatched"] !== undefined ? item["IsQtyMatched"] : null,
        };
      });

      debugger
      setSalesOrders(mappedData);

    } catch (error) {
      console.error("Failed to fetch sales orders:", error);
    } finally {
      setLoading(false);
    }
  };
  const [headerData, setHeaderData] = useState({
    packNo: "",
    RackNo: "",
    RackId: 0,

  });
  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      salesOrder: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      soDate: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
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
      pendingQty: {
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
    setGlobalFilter("");
  };

  useEffect(() => {
    fetchSalesOrders();
    fetchPackerList();
    fetchDriversList();
    fetchTruckList();
    initFilters();
    const GetPackingno = async () => {
      try {
        debugger
        const data = await GetPackingpackno(1);
        setHeaderData(prev => ({
          ...prev,
          packNo: String(data?.PackNo || ""),
          RackNo: data.RackNo || "",
          RackId: data.RackId || 0,
        }));
      } catch (err) {
        console.error("Error fetching delivery orders:", err.message);
      }
    };
    GetPackingno();
  }, []);
  const printRef = useRef();
  const confirmPDLSave = async (actiontype) => {
    debugger;
    setPdlWorking(true);
    try {
      // Filter selected orders marked for conversion to PDL
      const selectedOrders = salesOrders.filter(order => order.convertToPDL);

      if (selectedOrders.length === 0) {
        showOrUpdateToast("Please select at least one Sales Order to convert to PDL.", 'warning');
        return;
      }

      // Check if ANY selected order is already posted
      const hasPosted = selectedOrders.some(order => order.IsSubmitted === 1);

      // Print selected customerIds
      selectedOrders.forEach((order, index) => {
        console.log(`selectedOrders[${index}].customerId: ${order.customerId}`);
      });

      // Prepare header data
      const currentDate = new Date().toISOString().split("T")[0];

      const headerData = {
        userId: 1,
        branchId: 1,
        orgId: 1,
        packingpersonid: selectedOrders[0]?.packerId || 0,
        pdldate: currentDate,
        IsSubmitted: actiontype === 1 ? 1 : 0,
        packNo: "",
        id: hasPosted ? 0 : (selectedOrders[0]?.packerHeaderId || 0), // NEW IF POSTED
        doNo: 0,
        RackNo: "",
        RackId: 0,
        esttime: selectedOrders[0]?.estTime || commonEstTime,
        PackingType: 1,

      };

      // Build customer map
      let customerMap = new Map();

      selectedOrders.forEach((order, index) => {
        if (!customerMap.has(order.customerId)) {
          customerMap.set(order.customerId, {
            id: hasPosted ? 0 : order.packingCustomerCustomerId || 0,
            PackingId: order.pckId,
            CustomerId: selectedOrders[index].customerId, // ✅ Correct
            CustomerName: order.customer
          });

          console.log(`Added: selectedOrders[${index}].customerId = ${selectedOrders[index].customerId}`);
        }
      });

      const Customers = Array.from(customerMap.values());

      // Map Sales Order details (SODtl)
      const SODtl = selectedOrders
        .map(order => ({
          id: hasPosted ? 0 : order.packingSODetailId || 0,
          PackingId: order.packerHeaderId,
          CustomerId: order.customerId,
          SOID: order.soid,
          CustomerDtlId: 0,
          SoNum: order.salesOrder || ""
        }))
        // Remove duplicates by CustomerId + SOID
        .filter((value, index, self) =>
          index === self.findIndex(
            t => t.CustomerId === value.CustomerId && t.SOID === value.SOID
          )
        );
      // Map packing details (Details)
      const Details = selectedOrders.map((order, index) => ({
        SQID: selectedOrders[index].Sqdtlid,
        soid: selectedOrders[index].soid,
        customerId: selectedOrders[index].customerId,
        // id: selectedOrders[index].packingDetailId || 0,
        id: hasPosted ? 0 : (selectedOrders[index]?.packingDetailId || 0),
        // packerheaderid: order.packerHeaderId || 0,
        packerheaderid: hasPosted ? 0 : (order.packerHeaderId || 0),
        sodetailid: order.packingSODetailId || 0,
        gascodeid: Number(order.gasCodeId),
        soqty: order.soQty,
        pickqty: order.plannedQty,
        drivername: order.driver || "",
        trucknumber: order.truck || "",
        ponumber: order.PONumber || "PO123",
        requestdeliverydate: order.requestdeliverydate || null,
        deliveryaddress: "",
        deliveryinstruction: order.instruction || "",
        Volume: "",
        Pressure: "",
        SQ_Qty: order.soQty,
        CurrencyId: order.CurrencyId || 1,
        UnitPrice: 0,
        TotalPrice: 0,
        ConvertedPrice: 0,
        ConvertedCurrencyId: 1,
        ExchangeRate: order.exchangeRate || 1,
        So_Issued_Qty: 0,
        // Balance_Qty: order.pendingQty,
        Balance_Qty: (order.soQty ?? 0) -
          (order.alreadyPostedQty ?? 0) -
          (order.plannedQty ?? 0),
        uomid: 1,
        SeqTime: order.estTime || "00:00:00",
        DriverId: order.driverId || null,
        TruckId: order.truckId || null,
        PackerName: order.packer || "",
        PackerId: order.packerId || null,
        GasName: order.gasDescription || order.gasCode || "",
        GasCode: order.gasCode || "",
        GasId: Number(order.gasCodeId),
        // IsQtyMatched: order.soQty === order.plannedQty ? 1 : 0,
        IsQtyMatched: order.plannedQty === (order.soQty - order.alreadyPostedQty) ? 1 : 0,
      }));
      debugger
      // Map gas details (GasDtl)
      const gasMap = new Map();

      selectedOrders.forEach((order, index) => {
        const key = `${order.gasCodeId}-${order.customerId}`;
        if (!gasMap.has(key)) {
          gasMap.set(key, {
            // id: order.PackingGasDetailId || 0,
            id: hasPosted ? 0 : (order.PackingGasDetailId || 0),
            PackingId: order.packingCustomerPackingId,
            CustomerId: selectedOrders[index].customerId,
            gascodeid: Number(order.gasCodeId),
            CustomerDtlId: 0,
            GasName: order.gasDescription || order.gasCode,
            GasCode: order.gasCode,
            GasId: selectedOrders[index].gasCodeId
          });
        }
      });

      const GasDtl = Array.from(gasMap.values());

      // Final payload
      const payload = {
        Header: headerData,
        Customers,
        SODtl,
        Details,
        GasDtl
      };
      // Call API
      let response;
      debugger
      if (actiontype === 0) {
        if (headerData.id && headerData.id !== 0) {
          response = await UpdateMasterSalesOrder(payload);
        } else {
          response = await SaveMasterSalesOrder(payload);
        }
      } else if (actiontype === 1) {
        response = await UpdateMasterSalesOrder(payload);
      } else {
        showOrUpdateToast("Invalid action type.", 'error');
        return;
      }
      if (response && response.status) {
        if (response.data) {
          setPdlNumber(response.data);
          showOrUpdateToast("The PDL has been generated for the selected SOs, and the records have been moved to the Packing List screen", 'success');
          setShowPDLModal(true);
          refreshPDLData();
        } else {
          setShowPDLModal(false);
          showOrUpdateToast("Saved successfully.", 'success');
          setPdlNumber(null);
          refreshPDLData();
        }
        if (actiontype === 1) {
          // Reset plannedQty to 0 after posting
          setSalesOrders(prev => prev.map(item =>
            item.convertToPDL ? { ...item, plannedQty: 0 } : item
          ));
        }
      } else {
        showOrUpdateToast("Failed to save PDL. Please try again.", 'error');
      }

    } catch (error) {
      console.error("Error saving PDL:", error);
      showOrUpdateToast("Failed to save PDL. Please try again.", 'error');
    }
    finally {
      setPdlWorking(false);           // <-- re-enable when done
    }
  };
  const handleConvertToPDLClick = () => {

    if (selectedForPDL.length === 0) {
      showOrUpdateToast("Please select at least one order to convert to PDL.", 'warning');
      return;
    }
    // Check required fields for each selected row
    const requiredFields = ["driver", "truck", "packer", "plannedQty", "estTime"];
    const fieldLabels = {
      driver: "driver",
      truck: "truck",
      packer: "packer",
      plannedQty: "planned quantity",
      estTime: "Sequence time"
    };
    let missingField = null;
    let missingFieldLabel = null;
    for (const row of selectedForPDL) {
      for (const field of requiredFields) {
        if (!row[field] || row[field] === 0 || row[field] === "") {
          missingField = field;
          missingFieldLabel = fieldLabels[field];
          break;
        }
      }
      if (missingField) break;
    }
    if (missingField) {
      showOrUpdateToast(`Select ${missingFieldLabel}`, 'warning');
      return;
    }
    setShowPDLModal(true);
    setPdlNumber(null); // reset PDL number on modal open
  };

  // Confirm PDL posting
  const confirmPDLPost = () => {
    // Simulate generating a PDL Number (could be from API)
    const generatedPDLNumber = "PDL-" + Math.floor(100000 + Math.random() * 900000);
    setPdlNumber(generatedPDLNumber);

    // Here you could update salesOrders status or send data to backend

    // Optional: uncheck all after posting
    setSalesOrders((prev) =>
      prev.map((item) =>
        item.convertToPDL ? { ...item, convertToPDL: false, status: "P" } : item
      )
    );
  };


  // const updateField = (id, field, value, idField = null, idValue = null) => {
  //   setSalesOrders(prev => {
  //     return prev.map(item => {
  //       const syncFields = ["driver", "truck", "packer", "estTime"];
  //       const shouldSync = syncFields.includes(field) && item.convertToPDL;

  //       if (shouldSync) {
  //         return {
  //           ...item,
  //           [field]: value,
  //           ...(idField && { [idField]: idValue })
  //         };
  //       }

  //       if (item.id === id) {
  //         if (field === "plannedQty") {
  //           let newValue = value.replace(/[^0-9]/g, '');
  //           if (newValue === "") newValue = "0";
  //           newValue = parseInt(newValue, 10);
  //           if (newValue > item.balanceQty) newValue = item.balanceQty;
  //           return {
  //             ...item,
  //             plannedQty: newValue,
  //             pendingQty: item.balanceQty - newValue,
  //           };
  //         }
  //         return {
  //           ...item,
  //           [field]: value,
  //           ...(idField && { [idField]: idValue })
  //         };
  //       }

  //       return item;
  //     });
  //   });
  // };

  const updateField = (id, field, value, idField = null, idValue = null) => {
    setSalesOrders(prev => {
      return prev.map(item => {
        const syncFields = ["driver", "truck", "packer", "estTime"];
        const shouldSync = syncFields.includes(field) && item.convertToPDL && item.id !== id;

        if (item.id === id || shouldSync) {
          if (field === "estTime") {
            setCommonEstTime(value);
          }
          if (field === "plannedQty") {
            let numValue = 0;
            if (typeof value === 'string') {
              numValue = parseInt(value.replace(/[^0-9]/g, '') || '0', 10);
            } else if (typeof value === 'number') {
              numValue = value;
            }
            if (numValue < 0) {
              numValue = 0; // Prevent negative values
            }
            if (numValue > item.balancesqty) {
              numValue = item.balancesqty; // Cap at pendingQty
            }
            const newPendingQty = item.soQty - item.alreadyPostedQty - numValue;
            return {
              ...item,
              plannedQty: numValue,
              pendingQty: newPendingQty >= 0 ? newPendingQty : 0,
            };
          }
          return {
            ...item,
            [field]: value,
            ...(idField && { [idField]: idValue })
          };
        }
        return item;
      });
    });
  };

  const refreshPDLData = () => {
    fetchSalesOrders();
    fetchPackerList();
    fetchDriversList();
    fetchTruckList();

    const GetPackingno = async () => {
      try {
        const data = await GetPackingpackno(1);
        setHeaderData(prev => ({
          ...prev,
          packNo: String(data?.PackNo || ""),
          RackNo: data.RackNo || "",
          RackId: data.RackId || 0,
        }));
      } catch (err) {
        console.error("Error fetching delivery orders:", err.message);
      }
    };

    GetPackingno();
  };

  // const plannedQtyTemplate = (rowData) => (
  //   <InputText
  //     value={rowData.plannedQty.toString()}
  //     onChange={e => updateField(rowData.id, "plannedQty", e.target.value)}
  //     style={{ width: "100%", textAlign: "right" }}
  //     type="number"
  //     min={0}
  //     max={rowData.balanceQty}
  //   />
  // );

  const plannedQtyTemplate = (rowData) => {
    const maxQty = rowData.balancesqty; // Restrict to pendingQty
    const displayValue = rowData.plannedQty;
    return (
      <InputText
        value={displayValue}
        onChange={(e) => {
          const input = e.target.value.replace(/[^0-9]/g, '') || '0'; // Only allow numbers
          const num = parseInt(input, 10);
          if (num < 0) {
            showOrUpdateToast("Planned Quantity cannot be negative", 'warning');
          } else if (maxQty === 0 && num > 0) {
            showOrUpdateToast("Cannot enter Planned Quantity when Pending Quantity is 0", 'warning');
          } else if (num > maxQty) {
            showOrUpdateToast(`Planned Quantity cannot exceed Pending Quantity (${maxQty})`, 'warning');
          } else {
            updateField(rowData.id, "plannedQty", num);
          }
        }}
        style={{ width: "100%", textAlign: "right" }}
        type="text"
        inputMode="numeric"
        placeholder={maxQty === 0 ? "No quantity available" : ""}
        tooltip={`Max: ${maxQty} | Pending: ${rowData.pendingQty}`}
      />
    );
  };

  // For PrimeReact column filters to work, we should pass the raw data
  // Only apply custom filtering when custom search is active
  // const filteredOrders = useMemo(() => {
  //   // If custom search is active, apply it, otherwise return raw data for PrimeReact filters
  //   if (selectedFilterType && selectedAutoItem) {
  //     return salesOrders.filter(item => {
  //       if (selectedFilterType.value === 1) {
  //         // Customer filter
  //         return item.customerId === selectedAutoItem.value;
  //       } else if (selectedFilterType.value === 2) {
  //         // Gas Code filter
  //         return item.gasCodeId === selectedAutoItem.value;
  //       }
  //       return true;
  //     });
  //   }
  //   // Return raw data so PrimeReact column filters can work
  //   return salesOrders;
  // }, [salesOrders, selectedFilterType, selectedAutoItem]);

  const filteredOrders = salesOrders;

  // Templates
  const estTimeTemplate = rowData => (
    <input
      type="time"
      value={rowData.estTime}
      onChange={e => updateField(rowData.id, "estTime", e.target.value)}
      style={{ width: "100%", padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
      placeholder="HH:mm"
    />
  );

  // Format date template - prevent cutting
  const dateTemplate = (rowData) => {
    const formattedDate = formatDate(rowData.soDate);
    return (
      <span style={{ whiteSpace: 'nowrap', overflow: 'visible' }} title={formattedDate}>
        {formattedDate}
      </span>
    );
  };

  // Helper function to get first word of truck name
  const getFirstWord = (text) => {
    if (!text) return "";
    return text.split(' ')[0] || text;
  };

  const truckDropdown = (rowData) => {
    const selectedTruck = truckList.find(opt => opt.value === rowData.truckId);
    const label = selectedTruck?.label || "";

    // If NOT editing → show plain text
    if (editingTruck !== rowData.id) {
      return (
        <div
          onClick={() => setEditingTruck(rowData.id)}
          style={{
            cursor: "pointer",
            padding: "4px 6px",
            minHeight: 32,
            display: "flex",
            alignItems: "center",
            background: "#fff",
            fontSize: 12,
            color: label ? "#000" : "#999",
            width: "100%",
            maxWidth: 200,
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
          title={label || "Select Truck"}
        >
          {label || "Select Truck"}
        </div>
      );
    }

    // If editing → show dropdown
    return (
      <Select
        autoFocus
        menuPortalTarget={document.body}
        components={{ IndicatorSeparator: () => null }}
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }),
          control: (base) => ({
            ...base,
            minHeight: 32,
            height: 32,
            fontSize: 12,
          }),
        }}
        options={truckList}
        value={selectedTruck || null}
        onChange={(opt) => {
          handleInputChange("truck", opt?.label, rowData, "truckId", opt?.value);
          setEditingTruck(null); // Close dropdown after selecting
        }}
        onBlur={() => setEditingTruck(null)} // Click outside → close
      />
    );
  };

  // const truckDropdown = (rowData) => {
  //   const selectedTruck = truckList.find(opt => opt.value == rowData.truckid);
  //   return (
  //     <Select
  //       menuPortalTarget={document.body}
  //       styles={{
  //         menuPortal: base => ({ ...base, zIndex: 9999 })
  //       }}
  //       name="truck"
  //       className="basic-single"
  //       classNamePrefix="select"
  //       options={truckList}
  //       placeholder="Select"
  //       value={selectedTruck || null}
  //       onChange={(opt) =>
  //         handleInputChange("truck", opt?.label || "", rowData, "truckId", opt?.value || null)
  //       }
  //     />
  //   );
  // };

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

  const handleSODoubleClick = async (rowData) => {
    try {
      setLoading(true);
      console.log("Fetching order with soid:", rowData.soid);
      if (!rowData.soid) {
        showOrUpdateToast("Invalid order ID.", 'error');
        return;
      }
      const response = await OrderGetbyid(rowData.soid);
      console.log("handleSODoubleClick Response:", response);
      console.log("Detail Array:", response?.Detail);
      if (response && response.Header) {
        const { Header, Detail, SQ_Details } = response;
        const selected = {
          salesOrder: Header.SO_Number || "N/A",
          soType: Header.salesordertype || "N/A",
          soDate: Header.OrderDate?.split("T")[0] || "N/A",
          customer: Header.CustomerName || "N/A",
          phone: Header.CustomerPhone || "N/A",
          email: Header.customerEmail || "N/A",
          orderBy: Header.OrderBy || "N/A",
          project: Header.ProjectName || "N/A",
          items: Detail.map((item, index) => {
            console.log("Detail Item:", item);
            return {
              sno: index + 1,
              sqNo: item.sq_nbr || "N/A", // Use lowercase sq_nbr
              poNumber: item.PoNumber || "N/A",
              gasCode: item.GasCode || "N/A",
              gasDescription: item.GasDescription || "N/A",
              volume: item.Volume || "N/A",
              pressure: item.Pressure || "N/A",
              soQty: item.SO_Qty || 0,
              uom: item.UOM || "N/A",
            };
          }),
        };
        console.log("Mapped selectedSO:", selected);
        setSelectedSO(selected);
        setShowModal(true);
      } else {
        showOrUpdateToast("Failed to fetch order details: Invalid response data", 'error');
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      showOrUpdateToast("Failed to fetch order details: " + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const convertToPDLTemplate = (rowData) => {
    return (
      <Checkbox
        checked={rowData.convertToPDL}
        onChange={(e) => updateField(rowData.id, "convertToPDL", e.checked)}

      />
    );
  };

  const isPostDisabled = salesOrders.every(order => !order.packingCustomerCustomerId);

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
  const statusTemplate = (rowData) => {
    debugger
    console.log("Status Debug:", rowData);
    if (rowData.IsQtyMatched != false) {
      return <></>;
    }
    if (rowData.IsSubmitted == null || rowData.IsSubmitted === 1) {
      return <></>; // Empty for new or posted records
    }
    const isPosted = rowData.IsQtyMatched != false;
    debugger
    return (
      <Tag
        value={isPosted ? "Posted" : "Saved"}
        severity={isPosted ? "success" : "danger"}
      />
    );
  };
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

  const searchData = async () => {
    const filterValue = selectedAutoItem?.value || 0;
    const filterType = filterValue ? selectedFilterType?.value : 0;

    const customerId = filterType === 1 ? filterValue : 0;
    const gasCodeId = filterType === 2 ? filterValue : 0;

    const res = await GetAllMasterSalesOrder(
      filterType,
      customerId,
      gasCodeId,
      1
    );

    // const res = await GetPurchaseRequisitionList(filterType, filterValue, orgId, branchId, userData?.u_id);
    if (res.status) {
      const mappedData = res.data.map((item, index) => ({
        id: item["Id"] || index + 1,
        soid: item["SO Id"] || 0,
        salesOrder: item["SO No."] || "",
        soDate: item["SO Date"]?.split("T")[0] || "",
        customer: item["Customer"] || "",
        customerId: item["CustomerId"] || 0,
        detailsId: item["Detail Id"] || 0,
        gasCodeId: item["Gas Code"] || 0,
        gasCode: item["GasCodeName"] || "",
        gasDescription: item["Gas Description"] || "",
        exchangeRate: item["exchangeRate"] || 0,
        CurrencyId: item["CurrencyId"] || 0,
        PONumber: item["PONumber"] || 0,

        soQty: item["SO Qty"] || 0,
        pendingQty: item["Pend Qty"] || 0,
        balanceQty: item["Balance_Qty"] || 0, // ✅ Mapped properly now

        // plannedQty: item["Balance_Qty"] || 0,
        plannedQty: item["Plan Deliv Qty"] > 0 ? item["Plan Deliv Qty"] : 0,
        customerdetailid: item["customerdetailid"] || 0,

        estTime: item["Seq Time"]?.substring(0, 5) || "",
        driver: item["Driver"] || "",
        driverId: item["DriverId"] || null,
        truckId: item["TruckId"] || null,
        truck: item["Truck"] || "",
        packer: item["Packer"] || "",
        packerId: item["PackerId"] || null,
        instruction: item["Deliv Inst"] || "",
        status: item["Status"] === "Posted" ? "P" : "S",
        pckId: item["PackingId"] || null,

        packingDetailId: item["PackingDetailId"] || null,
        packerHeaderId: item["PackerHeaderId"] || null,
        packingSODetailId: item["PackingSODetailId"] || null,
        PackingHeaderId: item["PackingHeaderId"] || null,

        packingCustomerDetailId: item["PackingCustomerDetailId"] || null,
        packingCustomerPackingId: item["PackingCustomerPackingId"] || null,
        packingCustomerCustomerId: item["PackingCustomerCustomerId"] || null,

        PackingGasDetailId: item["PackingGasDetailId"] || null,
        Sqdtlid: item["Sqdtlid"] || null,
        convertToPDL: false,
        IsSubmitted: item["IsSubmitted"] !== undefined ? item["IsSubmitted"] : null,
        IsQtyMatched: item["IsQtyMatched"] !== undefined ? item["IsQtyMatched"] : null,
      }));

      setSalesOrders(mappedData);
    }
  };

  const cancelFilter = () => {
    const hadTypedFilter = !!globalFilter && globalFilter.trim() !== "";
    const hadSelectFilter = !!selectedFilterType || !!selectedAutoItem;
    // clear UI filter selections
    setSelectedFilterType(null);
    setSelectedAutoItem(null);
    setGlobalFilter("");
    // Reset column filters
    initFilters();
    // only reload full dataset if any filter was active
    // if (hadTypedFilter || hadSelectFilter) {
    fetchSalesOrders();
    // }
  };

  const renderHeader = () => {
    return (
      <div className="row align-items-center g-3 clear-spa">
        <div className="col-12 col-lg-6">
          <Button
            className="btn btn-danger btn-label"
            onClick={() => {
              setGlobalFilter("");
              cancelFilter();
            }}
          >
            <i className="mdi mdi-filter-off label-icon" /> Clear
          </Button>
        </div>
        <div className="col-12 col-lg-3 text-end">
          <span className="me-4">
            <Tag value="S" severity={getSeverity("Saved")} /> Saved
          </span>
          <span className="me-1">
            {/* <Tag value="P" severity={getSeverity("Posted")} /> Posted */}
          </span>
        </div>
        <div className="col-12 col-lg-3">
          <input
            className="form-control"
            type="text"
            placeholder="Keyword Search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>
    );
  };

  const packerDropdown = (rowData) => {
    const selectedPacker = packerList.find(opt => opt.value === rowData.packerId);
    const label = selectedPacker?.label || "";

    // Show plain text when NOT editing
    if (editingPacker !== rowData.id) {
      return (
        <div
          onClick={() => setEditingPacker(rowData.id)}
          style={{
            cursor: "pointer",
            padding: "4px 6px",
            minHeight: 32,
            display: "flex",
            alignItems: "center",
            background: "#fff",
            fontSize: 12,
            color: label ? "#000" : "#999",
            width: "100%",
            maxWidth: 200,
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
          title={label || "Select Packer"}
        >
          {label || "Select Packer"}
        </div>
      );
    }

    // Show dropdown when editing
    return (
      <Select
        autoFocus
        menuPortalTarget={document.body}
        components={{ IndicatorSeparator: () => null }}
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }),
          control: (base) => ({
            ...base,
            minHeight: 32,
            height: 32,
            fontSize: 12,
          }),
        }}
        name="packer"
        options={packerList}
        placeholder="Select Packer"
        value={selectedPacker || null}
        onChange={(opt) => {
          handleInputChange(
            "packer",
            opt?.label,
            rowData,
            "packerId",
            opt?.value
          );
          setEditingPacker(null); // close dropdown
        }}
        onBlur={() => setEditingPacker(null)} // click outside → close
      />
    );
  };

  console.log("Gas options:", gasCodeOptions);
  console.log("Selected searchBy:", searchBy, "searchValue:", searchValue);

  const driverDropdownTemplate = (rowData) => {
    const selectedDriver = driverNameList.find(opt => opt.value === rowData.driverId);
    const label = selectedDriver?.label || "";

    // Show plain text when NOT editing
    if (editingDriver !== rowData.id) {
      return (
        <div
          onClick={() => setEditingDriver(rowData.id)}
          style={{
            cursor: "pointer",
            padding: "4px 6px",
            minHeight: 32,
            display: "flex",
            alignItems: "center",
            background: "#fff",
            fontSize: 12,
            color: label ? "#000" : "#999",
            width: "100%",
            maxWidth: 200,
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
          title={label || "Select Driver"}
        >
          {label || "Select Driver"}
        </div>
      );
    }

    // Show dropdown when editing
    return (
      <Select
        autoFocus
        menuPortalTarget={document.body}
        components={{ IndicatorSeparator: () => null }}
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }),
          control: (base) => ({
            ...base,
            minHeight: 32,
            height: 32,
            fontSize: 12,
          }),
        }}
        name="driver"
        options={driverNameList}
        value={selectedDriver || null}
        placeholder="Select Driver"
        onChange={(opt) => {
          handleInputChange(
            "driver",
            opt?.label,
            rowData,
            "driverId",
            opt?.value
          );
          setEditingDriver(null); // close dropdown
        }}
        onBlur={() => setEditingDriver(null)} // click outside → close dropdown
      />
    );
  };


  const handleInputChange = (field, value, rowData, idField = null, idValue = null) => {
    updateField(rowData.id, field, value, idField, idValue);
  };

  const header = renderHeader();
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    // Logo header HTML (matches SQPrint.js style)
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

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      // If popup was blocked, fall back to current window print
      const style = document.createElement('style');
      style.id = 'print-style';
      style.innerHTML = `
        @media print {
          body > *:not(#print-container) {
            display: none !important;
          }
          #print-container {
            display: block !important;
          }
        }
        @media screen {
          #print-container {
            display: none !important;
          }
        }
      `;

      if (!document.getElementById('print-style')) {
        document.head.appendChild(style);
      }

      // Create print container
      let printContainer = document.getElementById('print-container');
      if (!printContainer) {
        printContainer = document.createElement('div');
        printContainer.id = 'print-container';
        document.body.appendChild(printContainer);
      }
      printContainer.innerHTML = logoHeader + printContents;

      window.print();

      // Clean up after print dialog closes
      setTimeout(() => {
        if (printContainer && printContainer.parentNode) {
          printContainer.parentNode.removeChild(printContainer);
        }
        const styleEl = document.getElementById('print-style');
        if (styleEl && styleEl.parentNode) {
          styleEl.parentNode.removeChild(styleEl);
        }
      }, 250);
    } else {
      // Write content to new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            ${logoHeader}
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();

      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.focus();
        // Wait for logo image to load before printing
        const logoImg = printWindow.document.querySelector('img[alt="logo"]');
        if (logoImg) {
          logoImg.onload = function () {
            printWindow.print();
            setTimeout(() => { printWindow.close(); }, 500);
          };
          if (logoImg.complete) {
            printWindow.print();
            setTimeout(() => { printWindow.close(); }, 500);
          }
        } else {
          setTimeout(() => {
            printWindow.print();
            setTimeout(() => { printWindow.close(); }, 500);
          }, 500);
        }
      }, 250);
    }
  };


  // Sample utility for CSV export
  const exportToExcel = (data) => {
    const exportData = data.map(row => ({
      'SO No.': row.salesOrder,
      'SO Date': row.soDate,
      'Customer': row.customer,
      'Gas Code': row.gasCode,
      'Gas Description': row.gasDescription,
      'SO Qty': row.soQty,
      'Pend Qty': row.pendingQty,
      'Plan Deliv Qty': row.plannedQty || 0,
      'Seq Time': row.estTime || '',
      'Driver': row.driver,
      'Truck': row.truck,
      'Packer': row.packer,
      'Deliv Inst': row.instruction,
      'Status': row.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SalesOrders');

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `MasterSalesOrder_${today}.xlsx`;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  const OrderTable = ({ filteredOrders, globalFilter, header, setFilters }) => {
    // Cell templates
    const handleSODoubleClick = (rowData) => {
      console.log('SO Double Clicked:', rowData);
    };

    const plannedQtyTemplate = (rowData) => rowData.planDelivQty;
    const estTimeTemplate = (rowData) => rowData.seqTime;
    const driverDropdownTemplate = (rowData) => <span>{rowData.driver}</span>;
    const truckDropdown = (rowData) => <span>{rowData.truck}</span>;
    const packerDropdown = (rowData) => <span>{rowData.packer}</span>;
    const DelivInstCell = ({ inst }) => <span>{inst}</span>;
    const convertToPDLTemplate = () => <input type="checkbox" />;
    const statusTemplate = (rowData) => <span>{rowData.status}</span>;
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Distribution" breadcrumbItem="Master Sales Order" />


          {/* <Card className="p-3 mb-3">
            <Row className="align-items-center g-2">

              <Col lg="1" md="6">
                <Label for="Search_Type">Search By</Label>
              </Col>

              <Col lg="2" md="6">
                <Input
                  type="select"
                  name="Search_Type"
                  id="Search_Type"
                  value={searchBy}
                  onChange={(e) => {
                    setSearchBy(e.target.value);
                    setSearchValue(""); // Reset the value on type change
                  }}
                >
                  <option value="">Select</option>
                  <option value="customer">Customer</option>
                  <option value="gasCode">Gas Code</option>
                </Input>
              </Col>

              <Col lg="1" md="6">
                <Label for="Search_Value">
                  {searchBy === "customer"
                    ? "Customer"
                    : searchBy === "gasCode"
                      ? "Gas Code"
                      : ""}
                </Label>
              </Col>

              {searchBy && (
                <Col lg="2" md="6">
                  <Input
                    type="select"
                    name="Search_Value"
                    id="Search_Value"
                  >
                    <option value="">Select</option>
                    {(searchBy === "customer" ? customerOptions : gasCodeOptions).map((item, index) => (
                      <option key={index} value={item.label}>
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
                    onClick={() => {
                      debugger
                      const value = document.getElementById('Search_Value')?.value;
                      if (!value) return;
                      setSearchValue(value);
                      console.log('Searching with', searchBy, value);
                    }}
                  >
                    Search
                  </button>


                  <button type="button" className="btn btn-danger">
                    <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => exportToExcel(filteredOrders)}
                  >
                    <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i>
                    Export
                  </button>

                  <Button
                    type="button"
                    className="btn btn-info"
                    onClick={handlePrint}
                  >
                    <i className="bx bx-printer label-icon font-size-16 align-middle me-2"></i>
                    Print
                  </Button>

                  <button
                    type="button"
                    onClick={handleConvertToPDLClick}
                    className="btn btn-success"
                  >
                    Convert To PDL
                  </button>

                </div>
              </Col>
            </Row>
          </Card> */}

          <Card className="p-3 mb-3">
            <Row className="align-items-center g-2">


              <div className="row align-items-end g-3 quotation-mid p-3">
                {/* User Name */}
                <div className="col-12 col-lg-3 mt-1">
                  <div className="d-flex align-items-center gap-2">
                    <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                      <label htmlFor="Search_Type" className="form-label mb-0">Search By</label></div>
                    <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                      <Select
                        name="filtertype"
                        options={FilterTypes.map(f => ({ label: f.name, value: f.value }))}
                        placeholder="Select Filter Type"
                        classNamePrefix="select"
                        isClearable
                        value={selectedFilterType}
                        onChange={(selected) => {
                          setSelectedFilterType(selected);
                          setSelectedAutoItem(null);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {selectedFilterType && (
                  <div className="col-12 col-lg-3 mt-1">
                    <div className="d-flex align-items-center gap-2">
                      <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                        <label className="form-label mb-0">{getDynamicLabel()}</label>
                      </div>
                      <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                        <Select
                          name="dynamicSelect"
                          options={autoOptions}
                          placeholder={`Search ${selectedFilterType.label}`}
                          classNamePrefix="select"
                          isClearable
                          isSearchable
                          value={selectedAutoItem}
                          onChange={(selected) => setSelectedAutoItem(selected)}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999, // 🔹 ensure dropdown is on top
                            }),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}


                <div className={`col-12 ${selectedFilterType ? 'col-lg-6' : 'col-lg-9'} d-flex justify-content-end flex-wrap gap-2`} >
                  <button type="button" className="btn btn-info" onClick={searchData}> <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>
                  <button type="button" className="btn btn-danger" onClick={cancelFilter}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => exportToExcel(filteredOrders)}
                  >
                    <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i>
                    Export
                  </button>

                  <Button
                    type="button"
                    className="btn btn-info"
                    onClick={handlePrint}
                  >
                    <i className="bx bx-printer label-icon font-size-16 align-middle me-2"></i>
                    Print
                  </Button>

                  <button
                    type="button"
                    onClick={handleConvertToPDLClick}
                    className="btn btn-success"
                  >
                    Convert To PDL
                  </button>
                </div>
              </div>
            </Row>
          </Card>



          <Row>
            <Col lg="12">
              <Card>
                <DataTable
                  value={filteredOrders}
                  rows={10}
                  sortField="salesOrder"
                  sortOrder={1}
                  header={header}
                  paginator
                  filters={filters}
                  globalFilterFields={['customer', 'id', 'salesOrder', 'status', 'gasCode', 'gasDescription', 'soQty', 'pendingQty', 'plannedQty', 'driver', 'truck', 'packer', 'instruction', 'soDate']}
                  globalFilter={globalFilter}
                  scrollable
                  scrollHeight="400px"
                  responsiveLayout="scroll"
                  className='blue-bg'
                  emptyMessage="No order found."
                  onFilter={(e) => setFilters(e.filters)}
                  showGridlines
                  dataKey="id"
                >
                  <Column
                    field="salesOrder"
                    header="SO No."
                    filter
                    filterPlaceholder="Search by SO No."
                    body={(rowData) => (
                      <span
                        onClick={() => handleSODoubleClick(rowData)}
                        style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                      >
                        {rowData.salesOrder}
                      </span>
                    )}
                    style={{ textAlign: 'center' }}
                    className='text-center'
                  />

                  <Column
                    headerStyle={{ textAlign: 'center' }}
                    field="soDate"
                    header="SO Date"
                    filter
                    filterPlaceholder="Search by SO Date"
                    body={dateTemplate}
                    style={{ width: '6%', whiteSpace: 'nowrap' }}
                    bodyStyle={{ whiteSpace: 'nowrap', overflow: 'visible' }}
                  />
                  <Column
                    headerStyle={{ textAlign: 'center' }}
                    field="customer"
                    header="Customer"
                    filter
                    filterPlaceholder="Search by Customer"
                    style={{ width: '8%' }}
                  />
                  <Column
                    headerStyle={{ textAlign: 'center' }}
                    field="gasCode"
                    header="Gas Code"
                    filter
                    filterPlaceholder="Search by Gas Code"
                    style={{ width: '8%' }}
                  />
                  <Column
                    headerStyle={{ textAlign: 'center' }}
                    field="gasDescription"
                    header="Gas Description"
                    filter
                    filterPlaceholder="Search by Gas Description"
                    style={{ width: '10%' }}
                  />
                  <Column
                    headerStyle={{ textAlign: 'center' }}
                    field="soQty"
                    header="SO Qty"
                    filter
                    filterPlaceholder="Search by SO Qty"
                    style={{ width: '5%', textAlign: 'center' }}
                  />
                  <Column
                    headerStyle={{ textAlign: 'center' }}
                    field="pendingQty"
                    header="Pend Qty"
                    filter
                    filterPlaceholder="Search by Pend Qty"
                    style={{ width: '5%', textAlign: 'center' }}
                    body={(rowData) => rowData.pendingQty}
                  />

                  <Column
                    field="plannedQty"
                    header="Plan Deliv Qty"
                    body={plannedQtyTemplate}
                    style={{ width: '6%', textAlign: 'center' }} headerStyle={{ textAlign: 'center' }}
                    filter
                    filterPlaceholder="Search by Plan Deliv Qty"
                  />
                  <Column
                    field="estTime"
                    header="Seq Time"
                    filter
                    filterPlaceholder="Search by Seq Time"
                    body={estTimeTemplate}
                    style={{ width: '7%' }}
                    headerStyle={{ textAlign: 'center' }}
                  />
                  <Column
                    field="driver"
                    header="Driver"
                    filter
                    filterPlaceholder="Search by Driver"
                    body={(rowData) => driverDropdownTemplate(rowData)}
                    style={{ minWidth: '150px' }}
                    headerStyle={{ textAlign: 'center' }}
                    bodyStyle={{ overflow: 'visible', whiteSpace: 'normal' }}
                  />

                  <Column
                    field="truck"
                    headerStyle={{ textAlign: 'center' }}
                    header="Truck"
                    filter
                    filterPlaceholder="Search by Truck"
                    body={(rowData) => truckDropdown(rowData)}
                    style={{ minWidth: '180px' }}
                    bodyStyle={{ overflow: 'visible', whiteSpace: 'normal' }}
                  />
                  <Column
                    field="packer"
                    header="Packer"
                    filter
                    filterPlaceholder="Search by Packer"
                    body={(rowData) => packerDropdown(rowData)}
                    style={{ minWidth: '150px' }}
                    headerStyle={{ textAlign: 'center' }}
                    bodyStyle={{ overflow: 'visible', whiteSpace: 'normal' }}
                  />
                  <Column
                    field="instruction"
                    body={rowData => <DelivInstCell inst={rowData.instruction} />}
                    header="Deliv Inst"
                    filter
                    filterPlaceholder="Search by Deliv Inst"
                    style={{ width: '10%' }}
                    headerStyle={{ textAlign: 'center' }}
                  />

                  <Column
                    header="Select"
                    body={convertToPDLTemplate}
                    style={{ width: "4%", textAlign: "center" }}
                    headerStyle={{ textAlign: "center" }}
                  />


                  <Column
                    field="status"
                    header="Status"
                    body={statusTemplate}
                    className="text-center"
                    style={{ width: "3%" }}
                    headerStyle={{ textAlign: "center" }}
                  />


                </DataTable>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal isOpen={showModal} toggle={() => setShowModal(false)} size="xl">
        <ModalHeader toggle={() => setShowModal(false)}>
          Sales Order - {selectedSO?.salesOrder || "N/A"}
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <p>Loading order details...</p>
          ) : selectedSO ? (
            <>
              <Row>
                <Col md={6}>
                  <p><strong>SO Type:</strong> {selectedSO.soType || "N/A"}</p>
                  <p><strong>SO Date:</strong> {selectedSO.soDate || "N/A"}</p>
                  <p><strong>Customer:</strong> {selectedSO.customer || "N/A"}</p>
                  <p><strong>Phone No:</strong> {selectedSO.phone || "N/A"}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Email:</strong> {selectedSO.email || "N/A"}</p>
                  <p><strong>Order By:</strong> {selectedSO.orderBy || "N/A"}</p>
                  <p><strong>Project:</strong> {selectedSO.project || "N/A"}</p>
                </Col>
              </Row>

              <h5 className="mt-3">Order Items</h5>
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
                  {selectedSO.items?.length > 0 ? (
                    selectedSO.items.map((item, idx) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </>
          ) : (
            <p>No order details available.</p>
          )}
        </ModalBody>
      </Modal>
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <h3>Packing List</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>SO No</th>
                <th>SO Date</th>
                <th>Customer</th>
                <th>Gas Code</th>
                <th>Gas Description</th>
                <th>SO Qty</th>
                <th>Pending Qty</th>
                <th>Planned Qty</th>
                <th>Seq Time</th>
                <th>Driver</th>
                <th>Truck</th>
                <th>Packer</th>
                <th>Deliv Inst</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((item, index) => (
                <tr key={index}>
                  <td>{item.salesOrder}</td>
                  <td>{item.soDate}</td>
                  <td>{item.customer}</td>
                  <td>{item.gasCode}</td>
                  <td>{item.gasDescription}</td>
                  <td>{item.soQty}</td>
                  <td>{item.pendingQty}</td>
                  <td>{item.plannedQty}</td>
                  <td>{item.estTime}</td>
                  <td>{item.driver}</td>
                  <td>{item.truck}</td>
                  <td>{item.packer}</td>
                  <td>{item.instruction}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* New Convert to PDL Confirmation Modal */}
      <Modal isOpen={showPDLModal} toggle={() => setShowPDLModal(false)} size="xl">
        <ModalHeader toggle={() => setShowPDLModal(false)}>
          Confirm Convert to PDL
        </ModalHeader>
        <ModalBody>
          {pdlNumber ? (
            <div>
              <h5>PDL Number Generated:</h5>
              <p>
                <strong>{pdlNumber}</strong>
              </p>
            </div>
          ) : (
            <>
              <p>Please verify the following sales orders before posting:</p>
              <Table bordered responsive>
                <thead>
                  <tr>
                    <th className="text-center">SO No.</th>
                    <th className="text-center">Customer</th>
                    <th className="text-center">Gas Name</th>

                    <th className="text-center">Plan Qty</th>
                    <th className="text-center">Seq Time</th>
                    <th className="text-center">Driver</th>
                    <th className="text-center">Truck</th>
                    <th className="text-center">Packer</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedForPDL.map((row) => (
                    <tr key={row.id}>
                      <td className="text-center">{row.salesOrder}</td>
                      <td>{row.customer}</td>
                      <td>{row.gasDescription}</td>
                      <td className="text-center">{row.plannedQty}</td>
                      <td className="text-center">{row.estTime}</td>

                      <td className="text-center">{row.driver}</td>
                      <td className="text-center">{row.truck}</td>
                      <td className="text-center">{row.packer}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p className="text-danger mt-3">
                Are you sure you want to convert these orders to PDL?
              </p>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {!pdlNumber ? (
            <>
              <Button className="btn btn-info" onClick={() => confirmPDLSave(0)} disabled={pdlWorking}>
                Save
              </Button>

              <Button className="btn btn-success" onClick={() => confirmPDLSave(1)} disabled={pdlWorking}>
                Post
              </Button>
              <Button className='btn btn-danger' onClick={() => setShowPDLModal(false)} disabled={pdlWorking}>
                Cancel
              </Button>
            </>
          ) : (
            <Button color="success" onClick={() => {
              setShowPDLModal(false);
              refreshPDLData();
            }}>
              Close
            </Button>
          )}
        </ModalFooter>

      </Modal>
    </React.Fragment>
  );
};

export default TransportPlanner;