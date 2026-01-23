import logo from '../../../assets/images/logo.png';
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Label,
  Button,
  FormGroup,
  InputGroup,
  Modal, ModalBody,
  UncontrolledAlert, Input
} from "reactstrap";
import { useHistory } from "react-router-dom";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Select from "react-select";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { Tag } from "primereact/tag";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import {
  uploadDOFile,
  downloadExcel,
  GetALLPackingDelivery,
  GetPackerList,
  uploadAckDOFile, downloadPackingExportExcel, packingstage, GetBarcodeDetails, packingacknoledgement, GetInvoiceData
  , CreateAutoInvoice, GetStagedata, BarcodeMachineScan, PackingConfirmed, GetgasCodeData, printExportExcel, SaveBarcodeScan,
  GetRackDetails, GetPackerautoList, GetCustomerFilter, getPackingAndDODocPrintId
} from "../../../common/data/invoiceapi";
import { AutoComplete } from "primereact/autocomplete";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useRef } from "react";
import { Checkbox } from 'primereact/checkbox';
import Swal from 'sweetalert2';

const ManagePacking = () => {
  const history = useHistory();
  const [packingList, setPackingList] = useState([]);
  const [DONOList, setDONOList] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filterSearchValue, setFilterSearchValue] = useState("");
  const [appliedFilterValue, setAppliedFilterValue] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState({});
  const [tooltipOpen2, setTooltipOpen2] = useState({});
  const [PackerList, setPackerList] = useState([]);
  const currentYear = new Date().getFullYear();
  const [isClearable, setIsClearable] = useState(true);
  const formatDate = date => date.toISOString().split("T")[0];
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const [successMsg, setSuccessMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [BarcodeOpen, setBarcodeOpen] = useState(false);
  const [InvoiceStatusOpen, setInvoiceStatusOpen] = useState(false);

  const [autoInvoiceStatusOpen, setautoInvoiceStatusOpen] = useState(false);
  const [selectedPackingId, setSelectedPackingId] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitType, setSubmitType] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedRowData, setSelectedRowData] = useState();
  const [selectedBarcodeData, setselectedBarcodeData] = useState();
  const [selectedRackid, setselectedRackid] = useState();
  const [selectedPackingRecord, setselectedPackingRecord] = useState();
  const [uploadtype, setUploadType] = useState();
  const [selectedFile, setSelectedFile] = useState();
  const [isfilter, setIsfilter] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [packingFilter, setPackingFilter] = useState({

    packerid: 0,
    FromDate: formatDate(new Date()),
    ToDate: formatDate(new Date()),
    BranchId: 1,
    GasCodeId: 0,
    Fcustomerid: 0,
    Festtime: null,
    FilterType: 0,
  });
  const [fileErrormsg, setFileErrormsg] = useState();
  const [errormsg, setErrormsg] = useState();
  const [fileSuccessmsg, setFileSuccessmsg] = useState();
  const [items, setItems] = useState([
  ]);
  const [Invoicedata, setInvoicedata] = useState([
  ]);
  const [isModalsOpen, setIsModalsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedStageOption, setSelectedStageOption] = useState(null);

  const [pendingStageChange, setPendingStageChange] = useState(null);
  const [selectedrowforinvoice, setselectedrowforinvoice] = useState();
  const DataTableWithSelect = () => {
    const [selectedStage, setSelectedStage] = useState(null);
    const [packingList, setPackingList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});
  }
  const [BarcodeData, setBarcodeData] = useState();
  const [BarcodeID, setBarcodeID] = useState();
  const [ModelType, setModelType] = useState();
  const [isConfirmationOpen, setisConfirmationOpen] = useState(false);
  const [isackConfirmationOpen, setisackConfirmationOpen] = useState(false);


  const [checkedItems, setCheckedItems] = useState([]); // This should be at the top of your component

  const [checkedInvoiceItems, setcheckedInvoiceItems] = useState([]);

  const [mappedstageOptions, setmappedstageOptions] = useState([]);
  const [selectedGasCode, setselectedGasCode] = useState(null);

  const [selectedCustomerCode, setselectedCustomerCode] = useState(null);
  const [selectedPackerCode, setselectedPackerCode] = useState(null);

  const [selectedesttime, setselectedesttime] = useState("");

  const [FilterGasList, setFilterGasList] = useState([]);
  const [FilterCustomerList, setFilterCustomerList] = useState([]);
  const [FilterPackerList, setFilterPackerList] = useState([]);
  const getLogoHeaderHtml = () => `
    <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
      <div style="min-width: 90px; margin-right: 18px;">
        <img src='${logo}' alt='logo' style='height: 70px;' />
      </div>
      <div style="text-align: left; font-size: 12px; line-height: 1.4; max-width: 260px; word-break: break-word;">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 2px;">PT. Batam Teknologi Gas</div>
        <div>Jalan Brigjen Katamso KM.3, Tanjung Uncang, Batam – Indonesia</div>
        <div>WebSite www.ptbtg.com E-mail ptbtg@ptpbtg.com</div>
        <div>Telp (+62)778 462959 391918</div>
      </div>
    </div>
  `;
  const opeConfirmationnModal = Type => {
    setModelType(Type);
    setisConfirmationOpen(true);
  };
  const handleDoPrint = async (doItem) => {
    try {
      setLoading(true);
      const filters = {
        id: doItem?.id,
      };

      const response = await getPackingAndDODocPrintId(filters);
      if (!response?.status || !response?.data || response?.data?.length === 0) {
        setErrormsg("No data found to print.");
        setTimeout(() => setErrormsg(), 2000);
        return;
      }

      const data = response.data[0];

      const logoHeaderHtml = getLogoHeaderHtml();
      const html = `
      <html>
        <head>
          <title>DO (Delivery Order) - ${data.DONo || ""}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; margin: 0; }
            h2 { margin: 0 0 20px 0; font-size: 24px; font-weight: bold; }
            table { border-collapse: collapse; width: 100%; table-layout: auto; }
            th, td { border: 1px solid #333; padding: 12px 10px; text-align: left; font-size: 14px; word-wrap: break-word; }
            th { background: #f5f5f5; font-weight: bold; white-space: nowrap; font-size: 14px; }
            .no-border td { border: none; padding: 6px 12px; font-size: 14px; }
            .no-border { width: 100%; }
            .section { margin-top: 20px; }
            .data-table { font-size: 13px; }
            .data-table th, .data-table td { padding: 12px 10px; font-size: 13px; white-space: normal; }
            .data-table th { white-space: nowrap; font-weight: bold; }
            @media print { 
              @page { 
                size: A4 landscape; 
                margin: 10mm; 
              }
              body { 
                padding: 20px; 
                margin: 0;
              }
              table { 
                width: 100%; 
                font-size: 12px;
              }
              th, td { 
                padding: 12px 10px; 
                font-size: 12px;
              }
              .data-table th, .data-table td { 
                padding: 12px 10px; 
                font-size: 12px;
              }
              .data-table th {
                font-weight: bold;
              }
              h2 { 
                font-size: 22px; 
                margin-bottom: 16px;
              }
              .no-border td {
                font-size: 13px;
                padding: 6px 12px;
              }
            }
          </style>
        </head>
        <body>
          ${logoHeaderHtml}
          <h2>DO (Delivery Order) Header</h2>
          <table class="no-border">
            <tr><td><strong>Delivery Order</strong></td><td></td></tr>
            <tr><td>DO Number System Generated</td><td>${data.DONo || "-"}</td></tr>
            <tr><td>DO Date</td><td>${data.DO_Date ? new Date(data.DO_Date).toLocaleDateString() : "-"}</td></tr>
            <tr><td>(Insert from PDL)</td><td></td></tr>
            <tr><td>Customer Name</td><td>${data.customername || "-"}</td></tr>
            <tr><td>Packer Name</td><td>${data.PackerName || "-"}</td></tr>
            <tr><td>Date of Delivery</td><td>${data.deliverdate || data.ReqDeliveryDate || "-"}</td></tr>
            <tr><td>PDL Number</td><td>${data.PackNo || "-"}</td></tr>
            <tr><td>PDL Date</td><td>${data.CreatedDate ? new Date(data.CreatedDate).toLocaleDateString() : "-"}</td></tr>
            <tr><td>Created By</td><td>${data.PackerName || "-"}</td></tr>
          </table>

          <div class="section"></div>
          <table class="data-table">
            <thead>
              <tr>
                <th style="min-width: 60px;">GasCode</th>
                <th style="min-width: 80px;">Description</th>
                <th style="min-width: 50px;">Volume</th>
                <th style="min-width: 50px;">Pressure</th>
                <th style="min-width: 40px;">UOM</th>
                <th style="min-width: 70px;">Driver Name</th>
                <th style="min-width: 70px;">Truck Number</th>
                <th style="min-width: 80px;">Req.Del.Dt.(from SO)</th>
                <th style="min-width: 100px;">Del.Address(from SO)</th>
                <th style="min-width: 100px;">Del.Instruction(from SO)</th>
                <th style="min-width: 60px;">PO Number</th>
                <th style="min-width: 60px;">BarCode</th>
              </tr>
            </thead>
                      <tbody>
      ${response.data
          .map(
            (item) => `
  <tr>
    <td>${item.GasCode || "-"}</td>
    <td>${item.GasDescriptions || "-"}</td>
    <td>${item.Volume || "-"}</td>
    <td>${item.Pressure || "-"}</td>
    <td>${item.UOM || "-"}</td>
    <td>${item.drivername || "-"}</td>
    <td>${item.trucknumber || "-"}</td>
    <td>${item.ReqDeliveryDate || "-"}</td>
    <td>${item.Deliveryaddress || "-"}</td>
    <td>${item.DeliveryInstruction || "-"}</td>
    <td>${item.PONumber || "-"}</td>
    <td>${item.Barcode || "-"}</td>
  </tr>
`
          )
          .join("")}
    </tbody>
          </table>

        </body>
      </html>`;

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
      doc.write(html);
      doc.close();

      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    } catch (err) {
      console.error("Error printing DO:", err);
      setErrormsg("Failed to print DO. Please try again.");
      setTimeout(() => setErrormsg(), 2000);
    } finally {
      setLoading(false);
    }
  };
  const [rackNumberOptions, setrackNumberOptions] = useState([]);
  const openModal = id => {
    setBarcodeID(id);
    setIsModalOpen(true);
  };
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const [shouldOpenBarcodeModal, setshouldOpenBarcodeModal] = useState(false);
  const [selectedDONOlist, setselectedDONOlist] = useState([]);
  const [selectedDONOId, setselectedDONOId] = useState([]);
  const [selectedpickqty, setselectedpickqty] = useState(0);
  const [SelectedFilter, setSelectedFilter] = useState(0);
  const [CencelledFilter, setCencelledFilter] = useState(new Date());

  const FilterTypes = [
    { name: 'PDL No', value: 1 }
  ];
  useEffect(() => {
    loadPackerList();
    initFilters();
    getAllPackingList();
    initFilters();
    loadStageList();
    getracknolist();
  }, []);
  const getracknolist = async () => {

    try {
      const response = await GetRackDetails();


      if (response?.status) {

        setrackNumberOptions(response.data)
      }
    } catch (error) {
      console.error("Error loading packer list:", error);
    }


  }

  const getSeverity = Status => {
    switch (Status) {
      case "unqualified":
        return "danger";
      case "qualified":
        return "success";
      case "Posted":
        return "success";
      case "Saved":
        return "danger";
      case "new":
        return "info";
      case "Invoiced":
        return "info";
      case " Partially Invoiced":
        return "info";
      case "negotiation":
        return "warning";
      case "renewal":
        return null;
    }
  };

  const loadPackerList = async () => {
    try {
      const data = await GetPackerList(packingFilter.BranchId);
      setPackerList(data);
    } catch (error) {
      console.error("Error loading packer list:", error);
    }
  };

  const isStageDisabled = (rowData) => {
    const anyAck = DONOList.some(
      doItem => doItem.packingid === rowData.id && doItem.isacknowledged === 1
    );
    return anyAck;
  };

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      PackNo: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      dono: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      packername: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      deliverdate: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      SOnumber: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      PickedQty: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      SOQty: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      BalanceQty: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      SQ_Nbr: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },

      Status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      createdby: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      CreatedDate: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
    });
    setGlobalFilterValue("");
  };

  const onGlobalFilterChange = e => {
    const value = e.target.value;
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
    setGlobalFilterValue(value);
  };

  const onFilterSearchChange = e => {
    const value = e.target.value;
    setFilterSearchValue(value);
    // Don't apply filter here - only update the input value
  };

  const applyFilterSearch = () => {
    setAppliedFilterValue(filterSearchValue);

    // Apply filter based on selected filter type
    if (SelectedFilter === 1) {
      // PDL No - filter by PackNo
      setFilters({
        ...filters,
        PackNo: {
          operator: FilterOperator.AND,
          constraints: [{ value: filterSearchValue || null, matchMode: FilterMatchMode.CONTAINS }],
        },
      });
    }
  };

  const clearFilter = () => {
    initFilters();
    setSelectedFilter(0);
    setGlobalFilterValue("");
    setFilterSearchValue("");
    setAppliedFilterValue("");
  };

  const toggleTooltip = id => {
    setTooltipOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleTooltip2 = id => {
    setTooltipOpen2(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePackerChange = option => {
    setPackingFilter({ ...packingFilter, packerid: option ? option.value : 0 });
  };

  const handleAddPacking = () => {
    history.push("/add-packing");
  };
  const handleEditPacking = rowData => {
    history.push(`/edit-packing/${rowData.id}`);
  };

  const handleFileUpload = async (event, rowData) => {
    const file = event.target.files[0];
    if (
      !file ||
      ![
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ].includes(file.type)
    ) {
      alert("Please select a valid Excel/CSV file.");
      return;
    }
    try {
      await uploadDOFile(rowData.id, file, rowData.PackNo);
      alert("File uploaded successfully!");
    } catch (error) {
      alert("Error uploading file. Please try again.");
      console.error(error);
    }
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      setFileErrormsg("Please select a file to upload.");
      return;
    }
    try {
      setFileSuccessmsg();
      if (uploadtype == "ackupload") {
        const response = await uploadAckDOFile(
          selectedRowData?.id,
          selectedFile,
          selectedRowData?.PackNo || selectedRowData?.id
        );
        console.log("res", response);
        if (response?.status) {
          setFileErrormsg();
          setFileSuccessmsg("File uploaded successfully!");
          setSelectedFile();
          setTimeout(() => {
            setModalOpen(false);
          }, 1000);
          getAllPackingList();
        } else {
          setFileErrormsg(response?.message);
        }
      }
      if (uploadtype == "upload") {
        const response = await uploadDOFile(
          selectedRowData?.id,
          selectedFile,
          selectedRowData?.PackNo || selectedRowData?.id
        );
        console.log("res", response);
        if (response?.status) {
          setFileErrormsg();
          setFileSuccessmsg("File uploaded successfully!");
          setSelectedFile();
          setTimeout(() => {
            setModalOpen(false);
          }, 1000);
          getAllPackingList();
        } else {
          setFileErrormsg(response?.message);
        }
      }
    } catch (error) {
      setFileErrormsg("Error uploading file. " + error);
      console.error(error);
    }
  };


  const loadStageList = async () => {
    try {
      const data = await GetStagedata(packingFilter.BranchId);
      setmappedstageOptions(data);
    } catch (error) {
      console.error("Error loading packer list:", error);
    }
  };

  // const mappedstageOptions = [
  //   { stageNo: "Loaded", label: "Loaded", stageId: 1, value: "Loaded" },
  //   { stageNo: "Delivery in Progress", label: "Delivery in Progress", stageId: 2, value: "Delivery in Progress" },
  //   { stageNo: "Delay", label: "Delay", stageId: 3, value: "Delay" },
  //   { stageNo: "Done", label: "Done", stageId: 4, value: "Done" }
  // ];
  const handleStageChange = (e, rowData) => {
    setPendingStageChange({ stage: e.value, rowData });
    setIsModalsOpen(true);
  };

  const stagehandleConfirm = async () => {
    const { stage, rowData } = pendingStageChange;

    setLoading(true);
    setIsModalsOpen(false);

    try {
      const selectedStage = mappedstageOptions.find(option => option.value === stage);

      if (!selectedStage) {
        throw new Error("Invalid stage selected");
      }
      const response = await packingstage(rowData.id, selectedStage.stageId);

      if (response?.statusCode === 200) {
        const updatedPackingList = packingList.map(item =>
          item.id === rowData.id ? { ...item, stage: selectedStage.value } : item
        );
        setPackingList(updatedPackingList);
        setFileErrormsg();
        setFileSuccessmsg(response.message);
        setSelectedFile();

        setTimeout(() => {
          setFileSuccessmsg();
        }, 2000);

        setTimeout(() => {
          setModalOpen(false);
        }, 1000);
        getAllPackingList();
      }
    } catch (err) {
      console.error("Error updating stage:", err);
    } finally {
      setLoading(false);
      setPendingStageChange(null);
    }
  };


  const stageBodyTemplate = (rowData) => {

    const selectedOption = mappedstageOptions.find(
      option => option.stageId === rowData.stageid
    );

    const disabled = isStageDisabled(rowData);

    return (
      <FormGroup className="d-flex flex-column justify-content-end mt-3" style={{ height: '100%' }}>

        <Select
          id={`stage-${rowData.id}`}
          className=" basic-single"
          options={mappedstageOptions}
          getOptionValue={option => option.value}
          getOptionLabel={option => option.label}
          value={selectedOption || null}
          onChange={(e) => handleStageChange(e, rowData)}
          placeholder="Select"
          isDisabled={disabled}
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: disabled ? "#e9ecef" : base.backgroundColor,
              cursor: disabled ? "not-allowed" : "default",
            }),
          }}
        />

      </FormGroup>
    );
  };


  const handleConfirm = () => {

    const payload = {
      packingId: selectedPackingId,
      stage: selectedStage
    };


    apiCall(payload)
      .then(response => {

        console.log("API response:", response);
        setIsModalOpen(false);
      })
      .catch(error => {

        console.error("API error:", error);
      });
  };
  const handleCheckboxChange = (e, item) => {
    const checked = e.checked; // PrimeReact uses `e.checked` instead of `e.target.checked`
    const id = item.id;

    setCheckedItems(prev =>
      checked ? [...prev, item] : prev.filter(x => x.id !== id)
    );
  };

  const handleInvoiceCheckboxChange = (e, item) => {
    const checked = e.checked; // PrimeReact uses `e.checked` instead of `e.target.checked`
    const doid = item.doid;

    setcheckedInvoiceItems(prev =>
      checked ? [...prev, doid] : prev.filter(x => x !== doid)
    );
  };


  const CustomCheckboxColumnstatus = (rowData) => {
    let filtercond = true;
    var filtered = DONOList.filter(x => x.packingid == rowData.id);
    // if (rowData.isdouploaded == 1) {
    if (filtercond) {
      return (
        <div className="d-flex flex-column">
          {filtered.map((item, index) => (
            <div key={item.DONo || index} className="d-flex align-items-center mb-2">
              <Tag
                style={{ backgroundColor: "#2196F3" }}
                value="I"
                severity={getSeverity("Invoiced")}
              />
              <span style={{ marginLeft: '8px' }}>{item.DONo}</span>
            </div>
          ))}
        </div>
      );
    }
    else {
      return (<div className="d-flex flex-column">
        {filtered.map((item, index) => (
          <div key={item.DONo || index} className="d-flex align-items-center mb-2">


            <span style={{ marginLeft: '8px' }}>{item.DONo}</span>
          </div>
        ))}
      </div>)
    }
  };


  const CustomCheckboxColumn = (rowData) => {
    let filtercond = true;
    var filtered = DONOList.filter(x => x.packingid == rowData.id);
    // if (rowData.isdouploaded == 1) {
    if (filtercond) {
      return (
        <div className="d-flex flex-column">
          {filtered.map((item, index) => (
            <div key={item.DONo || index} className="d-flex align-items-center mb-2">
              {item.isacknowledged == 1 ? (
                <Checkbox className="DOclass" inputId={`chk-${item.id}`}
                  value={item.id}
                  disabled={true}
                  checked={true} />
              ) : item.isacknowledged == 0 ? (
                <Checkbox inputId={`chk-${item.id}`}
                  value={item.id} className="DOclass" onChange={(e) => handleCheckboxChange(e, item)}

                  checked={checkedItems.some(x => x.id === item.id)} />

              ) :
                item.isacknowledged == 0 && item.isdouploaded == 0 ?
                  (
                    <Checkbox inputId={`chk-${item.id}`}
                      disabled={true} />

                  ) : (
                    <Checkbox inputId={`chk-${item.id}`}
                      disabled={true} />

                  )}
              <span style={{ marginLeft: '8px' }}>{item.DONo}</span>


              <button className="btn btn-success" title="DO Print" style={{ width: '20px', height: '20px', padding: "0px", marginLeft: "12px", marginRight: "12px" }} onClick={() => handleDoPrint(item)}>
                <i className="bx bx-printer "></i>
                {/* {loading ? "Loading..." :""} */}
              </button>




              {rowData.Status == "Invoiced" && item.isacknowledged == 1 ? (
                <Tag
                  style={{ backgroundColor: "#2196F3" }}
                  value="I"
                  severity={getSeverity("Invoiced")}
                />
              ) : item.isacknowledged == 0
                ? (<Tag

                  value="AP"
                  severity={getSeverity("negotiation")}
                />) : (
                  <Tag
                    value="A"
                    severity={getSeverity("new")}
                  />)}







            </div>
          ))}
        </div>
      );
    }
    else {
      return (<div className="d-flex flex-column">
        {filtered.map((item, index) => (
          <div key={item.DONo || index} className="d-flex align-items-center mb-2">
            <Checkbox inputId={`chk-${item.id}`}
              disabled={true} />

            <span style={{ marginLeft: '8px' }}>{item.DONo}</span>
          </div>
        ))}
      </div>)
    }
  };
  const handleDateChange = (selectedDates, dateStr, instance) => {
    const fieldName = instance.element.getAttribute("id");

    if (selectedDates.length > 0) {
      const localDate = selectedDates[0];
      const yyyy = localDate.getFullYear();
      const mm = String(localDate.getMonth() + 1).padStart(2, "0");
      const dd = String(localDate.getDate()).padStart(2, "0");
      const formatted = `${yyyy}-${mm}-${dd}`;

      setPackingFilter(prevState => ({
        ...prevState,
        [fieldName]: formatted,
      }));
    }
  };

  const getAllPackingList = async () => {
    setErrormsg("");

    // if (!packingFilter.FromDate || !packingFilter.ToDate) {
    //   setErrormsg("Please select both From and To dates.");
    //   return;
    // }

    // if (packingFilter.FromDate > packingFilter.ToDate) {
    //   setErrormsg("To date should not be earlier than From date.");
    //   return;
    // }



    var ddd = selectedGasCode;
    setLoading(true);

    try {

      const response = await GetALLPackingDelivery(
        packingFilter.packerid,
        packingFilter.FromDate,
        packingFilter.ToDate,
        packingFilter.BranchId,
        packingFilter.GasCodeId == undefined || packingFilter.GasCodeId == null ? 0 : packingFilter.GasCodeId,
        packingFilter.Fcustomerid == undefined || packingFilter.Fcustomerid == null ? 0 : packingFilter.Fcustomerid,
        packingFilter.Festtime == undefined || packingFilter.Festtime == null || packingFilter.Festtime == "" ? "0" : packingFilter.Festtime
      );

      if (response?.status) {
        const doDetails = response?.data.DoDetail || [];
        const doMap = doDetails.reduce((acc, doItem) => {
          if (!acc[doItem.packingid]) {
            acc[doItem.packingid] = [];
          }
          if (doItem.DONo) {
            acc[doItem.packingid].push(doItem.DONo);
          }
          return acc;
        }, {});

        const enrichedPackingList = (response?.data.Details || []).map(detail => ({
          ...detail,
          dono: (doMap[detail.id] || []).join(", "),
        }));

        setPackingList(enrichedPackingList);
        setDONOList(doDetails);


        if (selectedBarcodeData != undefined && selectedBarcodeData != null) {
          var filtered = doDetails.filter(x => x.packingid == selectedBarcodeData.id && x.isacknowledged == 0);

          filtered = filtered.map(cus => ({
            ...cus,
            value: cus.id,
            label: cus.DONo,
          }));
          setselectedDONOlist(filtered);

        }
      } else {
        console.log("Failed to fetch production orders");
      }
    } catch (err) {
      console.log("err > ", err);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <div className="row align-items-center g-3 clear-spa">
      <div className="col-12 col-lg-1">
        <Button className="btn btn-danger" onClick={clearFilter}>
          <i className="mdi mdi-filter-off label-icon" /> Clear
        </Button>
      </div>
      <div className="col-12 col-lg-8 text-end">
        {/* <span className="me-5">
        <Checkbox
              inputId="ackCheck"
              checked={false}
               className="DOclass"
               disabled={true}
            />
          <Tag className="p-component">
          
            <label htmlFor="ackCheck" className="mb-0">DO ACK</label>
          </Tag>
        </span> */}


        <span className="me-4">

          <input
            type="checkbox"
            className="checkbox-blue-border checkbox-size-1" disabled="true"
            style={{ cursor: "pointer", accentColor: "blue", verticalAlign: "sub" }} />
          &nbsp;
          DO ACK
        </span>
        <span className="me-4">
          <Tag value="A" severity={getSeverity("new")} /> Acked
        </span>
        <span className="me-4">
          <Tag value="AP" severity={getSeverity("negotiation")} /> Ack Pending
        </span>
        {/* <span className="me-4">
          <Tag value="S" severity={getSeverity("Saved")} /> Saved
        </span> */}
        <span className="me-4">
          <Tag value="P" severity={getSeverity("Posted")} /> Posted
        </span>
        <span className="me-4">
          <Tag
            value="I"
            className=" btn-info"
            severity={getSeverity("Saved")}
          />{" "}
          Invoiced
        </span>
        <span className="me-1">
          <Tag
            value="PI"
            className=" btn-info"
            severity={getSeverity(" partially Saved")}
          />{" "}
          Partially Invoiced
        </span>

      </div>
      <div className="col-12 col-lg-3">
        <input
          className="form-control"
          type="text"
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Keyword Search"
        />
      </div>
    </div>
  );

  const calldownload = async rowData => {
    setLoading(true);
    try {
      const response = await downloadExcel(rowData.id, rowData.PackNo);
      if (response.status) {
        getAllPackingList();
      }
    } catch (err) {
      console.log("err > ", err);
    } finally {
      setLoading(false);
    }
  };


  const ExportAll = async rowData => {
    setLoading(true);
    try {
      const response = await downloadPackingExportExcel(
        packingFilter.packerid,
        packingFilter.FromDate,
        packingFilter.ToDate,
        packingFilter.BranchId,
        packingFilter.GasCodeId == undefined || packingFilter.GasCodeId == null ? 0 : packingFilter.GasCodeId,
        packingFilter.Fcustomerid == undefined || packingFilter.Fcustomerid == null ? 0 : packingFilter.Fcustomerid,
        packingFilter.Festtime == undefined || packingFilter.Festtime == null || packingFilter.Festtime == "" ? "0" : packingFilter.Festtime
      );
      if (response.status) {
        getAllPackingList();
      }
    } catch (err) {
      console.log("err > ", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (selectedBarcodeData) {
      setselectedRackid(selectedBarcodeData?.rackid);

      BarcodeMachineScanfunc();
      toggleBarcodeModal();

      var filtered = DONOList.filter(x => x.packingid == selectedBarcodeData.id && x.isacknowledged == 0);

      filtered = filtered.map(cus => ({
        ...cus,
        value: cus.id,
        label: cus.DONo,
      }))

      setselectedDONOlist(filtered);
      console.log("Selected DO NO : ", selectedDONOlist);

    }
  }, [selectedBarcodeData]);

  const handleDONOSelectChange = (data) => {
    setselectedDONOId(data?.value ?? 0);
  }

  const handleClickBarcode = (record) => {
    setselectedBarcodeData(null); // force a change
    setTimeout(() => {
      setselectedBarcodeData(record);
      setshouldOpenBarcodeModal(true);

    }, 0); // slight delay to ensure state update triggers
  };


  const handleClick = (record) => {
    setselectedPackingRecord(null); // force a change
    setTimeout(() => {
      setselectedPackingRecord(record);
      setShouldOpenModal(true);
    }, 1000); // slight delay to ensure state update triggers
  };

  useEffect(() => {
    if (selectedPackingRecord) {
      toggleAutoInvoiceModal();

      GetInvoiceDatapopup();
    }
  }, [selectedPackingRecord]);




  const InvoiceBodyTemplate = (rowData) => {
    const isClickable = true;
    return (
      <span title="Invoice"
        onClick={
          isClickable
            ? () => {
              handleClick(rowData);

            }
            : undefined
        }

      >
        <i className="mdi mdi-file-multiple  text-success"
          style={{ fontSize: "1.3rem", cursor: "pointer" }}
        />
      </span>
    );
  }

  const BarcodeBodyTemplate = (rowData) => {
    const isClickable = true;

    var filtered = DONOList.filter(x => x.packingid == rowData.id);

    if ((rowData.IsPosted == 1 && rowData.IsBarcodeScan == 0 && rowData.IsDoCreated == 0) ||
      (rowData.IsPosted == 1 && rowData.IsBarcodeScan == 1 && rowData.IsDoCreated == 1)) {
      return (
        <span title="Barcode"
          onClick={
            isClickable
              ? () => {
                handleClickBarcode(rowData);
              }
              : undefined
          }

        >

          <i
            className="mdi mdi-barcode-scan"
            style={{ fontSize: "1.3rem", cursor: "pointer" }}
          />
        </span>
      )
    };
  }
  const actionBodyTemplate = (rowData, type) => {

    if (type === "edit" && rowData.IsPosted < 1) {
      return (
        <span title="Edit" onClick={() => handleEditPacking(rowData)}>
          <i
            className="mdi mdi-square-edit-outline"
            style={{ fontSize: "1.5rem", cursor: "pointer" }}
          />
        </span>
      );
    }
    else {
      return (
        <span title="Edit" disabled>
          <i
            className="mdi mdi-square-edit-outline"
            style={{ fontSize: "1.5rem", cursor: "pointer", color: "gray" }}
          />
        </span>
      );
    }
    if (rowData.IsPosted == 1) {
      if (type === "download" && rowData.IsPosted > 0 && rowData.IsBarcodeScan == 0) {
        const isClickable = rowData.isacknowledged === 0;

        return (
          <span
            title="Download"
            id={`tooltip-${rowData.id}`}
            style={{
              cursor: isClickable ? "pointer" : "default",
              color: isClickable ? "inherit" : "grey",
            }}
            onClick={isClickable ? () => calldownload(rowData) : undefined}
          >
            <i
              className="mdi mdi-download-box-outline"
              style={{ fontSize: "1.5rem" }}
            />
            {/* <Tooltip
                            placement="bottom"
                            isOpen={tooltipOpen[rowData.id] || false}
                            target={`tooltip-${rowData.id}`}
                            toggle={() => toggleTooltip(rowData.id)}
                        >
                            Download
                        </Tooltip> */}
          </span>
        );
      }

      if (
        type === "upload" &&
        rowData.IsPosted > 0 &&
        rowData.IsDoCreated > 0 && rowData.IsBarcodeScan == 0
      ) {
        const isClickable = rowData.isacknowledged === 0;

        return (
          <span
            title="Upload"
            id={`tooltip2-${rowData.id}`}
            style={{
              cursor: isClickable ? "pointer" : "default",
              color: isClickable ? "inherit" : "grey",
            }}
            onClick={
              isClickable
                ? () => {
                  setSelectedRowData(rowData);
                  setUploadType("upload");
                  setFileErrormsg();
                  setFileSuccessmsg();
                  toggleModal();
                }
                : undefined
            }
          >
            <i
              className="mdi mdi-folder-upload-outline"
              style={{ fontSize: "1.5rem" }}
            />
            {/* <Tooltip placement="bottom" isOpen={tooltipOpen2[rowData.id] || false} target={`tooltip2-${rowData.id}`} toggle={() => toggleTooltip2(rowData.id)}>Upload</Tooltip> */}
          </span>
        );
      }
      if (type === "ackupload" && rowData.isacknowledged == 1) {

        return (
          <span
            title="Upload"
            id={`tooltip2-${rowData.id}`}
            style={{ color: "grey" }}
          >
            <i
              className="mdi mdi-folder-upload-outline"
              style={{ fontSize: "1.5rem" }}
            />
          </span>
        );
      }
      if (
        type === "ackupload" &&
        rowData.isdouploaded == 1 &&
        rowData.isacknowledged == 0
      ) {

        return (
          <span
            title="Upload"
            id={`tooltip2-${rowData.id}`}
            style={{ cursor: "default" }}
            onClick={() => {
              setSelectedRowData(rowData);
              setUploadType("ackupload");
              setFileErrormsg();
              setFileSuccessmsg();
              toggleModal();
            }}
          >
            <i
              className="mdi mdi-folder-upload-outline"
              style={{ fontSize: "1.5rem" }}
            />
          </span>
        );
      }
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];
    if (!allowedTypes.includes(file.type)) {
      setFileErrormsg(
        "Invalid file type. Please select an Excel (.xlsx/.xls) or CSV (.csv) file."
      );
      return;
    }

    setSelectedFile(file);
  };
  const header = renderHeader();

  const toggleModal = () => {
    setModalOpen(prev => !prev);
  };

  const toggleInvoiceModal = () => {
    setInvoiceStatusOpen(prev => !prev);

  };

  const toggleAutoInvoiceModal = () => {
    setautoInvoiceStatusOpen(prev => !prev);

  };

  const toggleBarcodeModal = () => {
    setBarcodeOpen(prev => !prev);
    processBarcode("-");
  };
  const cancelFilter = async () => {
    const resetFilter = {
      packerid: 0,
      FromDate: formatDate(new Date()),
      ToDate: formatDate(new Date()),
      BranchId: 1,
      GasCodeId: 0,
      Fcustomerid: 0,
      Festtime: null,
      FilterType: 0
    };
    setSelectedFilter(0);
    setPackingFilter(resetFilter);
    setselectedpickqty(0);
    setselectedGasCode("");
    setselectedCustomerCode("");
    setselectedPackerCode("");
    setFilterSearchValue("");
    setAppliedFilterValue("");
    setCencelledFilter(new Date());
    // Reset filters
    initFilters();
    // document
    //   .getElementById("FromDate")
    //   ._flatpickr.setDate(resetFilter.FromDate, false);
    // document
    //   .getElementById("ToDate")
    //   ._flatpickr.setDate(resetFilter.ToDate, false);
    // setIsfilter(!isfilter);
  };
  useEffect(() => {
    getAllPackingList();
  }, [isfilter]);

  useEffect(() => {
    getAllPackingList();
  }, [CencelledFilter]);

  const exportToExcel = () => {
    const filteredQuotes = packingList.map(({ IsPosted, ...rest }) => rest);
    const exportData = packingList.map(item => ({
      "PDL No.": item.PackNo,
      "Packer Name": item.packername,
      "Delivery Date": item.deliverdate,
      "Created by / Date": `${item.createdby} / ${item.CreatedDate}`,
      "Modified by / Date": `${item.Modifiedby} / ${item.ModifiedDate}`,
      "SO No.": item.SOnumber,
      PickedQty: item.PickedQty,
      PackNo: item.PackNo,
      Status: item.Status,
      "DO No.": item.dono,
      "SQ No.": item.SQ_Nbr,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Returns");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString("en-US", { month: "short" }).toLowerCase(); // "mar"
    const day = now.getDate();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    const fileName = `PDL-List-${year}-${month}-${day}-${hours}-${minutes}-${ampm}.xlsx`;
    saveAs(data, fileName);
  };

  const statusBodyTemplate = rowData => {
    const isClickable = true;
    const statusShort =
      rowData.Status === "Saved"
        ? "S"
        : rowData.Status === "Posted"
          ? "P"
          : rowData.Status === "Invoiced"
            ? "I"
            : rowData.Status === "Partially Invoiced"
              ? "PI"
              : rowData.Status;
    return <span
      title="Invoice"

      style={{
        cursor: isClickable ? "pointer" : "default",
        color: isClickable ? "inherit" : "grey",
      }}



    >
      <Tag value={statusShort} className={(statusShort == "I" || statusShort == "PI") ? "btn-info" : ""} severity={getSeverity(rowData.Status)} /></span>;
  };

  const createdBodyTemplate = rowData => {
    return (
      <div className="actions row align-items-center g-3">
        <div className="col-12 col-lg-12">
          {rowData.createdby && rowData.CreatedDate ? (
            <>
              <span>{rowData.createdby}</span> /{" "}
              <span>{rowData.CreatedDate}</span>
            </>
          ) : (
            <span></span>
          )}
        </div>
      </div>
    );
  };
  // Function to trigger on barcode scan
  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter') {
      if (selectedDONOId != undefined && selectedDONOId != null && selectedDONOId != 0 && selectedDONOId != "") {
        console.log('Barcode scanned:', BarcodeData);
        // Call your function here
        processBarcode(BarcodeData);
      }

    }
  };

  const GetInvoiceDatapopup = async () => {
    setErrormsg("");
    setLoading(true);

    try {

      const response = await GetInvoiceData(
        selectedPackingRecord?.id
      );

      if (response?.status) {
        setInvoicedata(response?.data || []);
      } else {
        console.log("Failed to fetch barcode details");
      }
    } catch (err) {
      console.log("err > ", err);
    } finally {
      setLoading(false);
    }
  }

  const SaveData = async (data) => {
    if (data == 1) {

      if (selectedBarcodeData.rackid == undefined || selectedBarcodeData.rackid == null || selectedRackid == 0) {
        setFileErrormsg("Please select the rack no");
        setFileSuccessmsg("");
        setisConfirmationOpen(false);

        setTimeout(() => {
          setFileErrormsg();
        }, 2000);

      } else {
        const response = await SaveBarcodeScan(selectedBarcodeData.id, selectedRackid);
        if (response?.status) {
          getAllPackingList();
          setBarcodeOpen(false);
          setselectedBarcodeData(null);
          setItems([]);
          setselectedRackid(0);
          setselectedDONOId(0);
          setisConfirmationOpen(false);
          setFileErrormsg();
          setFileSuccessmsg(response.message);

          setTimeout(() => {
            setFileSuccessmsg();
          }, 2000);

        }
        else {
          setFileErrormsg(response.message);
          setFileSuccessmsg("");

          setTimeout(() => {
            setFileErrormsg();
          }, 2000);

        }
      }
    }

  }
  // const generateinvoice = async () => {

  //   try {


  //     let Result = checkedInvoiceItems.join(',');
  //     const response = await CreateAutoInvoice({
  //       DOID: Result,
  //       PackingId: selectedPackingRecord?.id
  //     });
  //     if (response?.status) {
  //       getAllPackingList();
  //       setautoInvoiceStatusOpen(false);

  //       setselectedPackingRecord(null);
  //       setcheckedInvoiceItems([]);
  //       setInvoicedata([]);


  //       setFileErrormsg();
  //       setFileSuccessmsg(response.message);

  //       setTimeout(() => {
  //         setFileSuccessmsg();
  //       }, 2000);


  //     } else {
  //       console.log("Failed to create invoice");


  //       setFileSuccessmsg();
  //       setFileErrormsg(response.message);

  //       setTimeout(() => {
  //         setFileErrormsg();
  //       }, 2000);
  //     }
  //   } catch (err) {
  //     console.log("err > ", err);
  //   } finally {
  //     setLoading(false);
  //   }

  // }

  const generateinvoice = async () => {
    setLoading(true);
    try {
      const Result = checkedInvoiceItems.join(',');
      const response = await CreateAutoInvoice({
        DOID: Result,
        PackingId: selectedPackingRecord?.id
      });

      if (response?.status) {
        // Success flow
        getAllPackingList();
        setautoInvoiceStatusOpen(false);
        setselectedPackingRecord(null);
        setcheckedInvoiceItems([]);
        setInvoicedata([]);

        // Success popup
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.message || "Invoice created successfully",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Error popup
        console.log("Failed to create invoice", response);
        Swal.fire({
          icon: 'warning',
          title: 'warning',
          text: response.message || "Something went wrong",
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      console.log("Unexpected err > ", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Unexpected error occurred",
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const BarcodeMachineScanfunc = async () => {
    if (selectedBarcodeData.IsBarcodeScan == 0 && selectedBarcodeData.IsDoCreated == 0) {
      try {


        const response = await BarcodeMachineScan({
          UserId: 1,
          PackingId: selectedBarcodeData?.id
        });
        if (response?.status) {

          getAllPackingList();


        } else {
          console.log("Failed to create invoice");
        }

      } catch (err) {
        console.log("err > ", err);
      } finally {
        setLoading(false);
      }
    }
  }

  const processBarcode = async (barcode) => {


    setErrormsg("");
    setLoading(true);

    try {


      const response = await GetBarcodeDetails(
        selectedBarcodeData?.id,
        barcode,
        selectedDONOId == undefined || selectedDONOId == null || selectedDONOId == "" ? 0 : selectedDONOId
      );
      if (response?.status) {
        setItems(response?.data || []);
        setBarcodeData("");
      } else {
        console.log("Failed to fetch barcode details");
      }
    } catch (err) {
      console.log("err > ", err);
    } finally {
      setLoading(false);
    }


  };

  const Saveack = async () => {

    setLoading(true);

    try {


      const response = await packingacknoledgement({
        ack: checkedItems,
        UserId: 1
      });
      if (response?.status) {
        getAllPackingList();
        setisackConfirmationOpen(false);

        setFileErrormsg();
        setFileSuccessmsg(response.message);

        setTimeout(() => {
          setFileSuccessmsg();
        }, 2000);
      } else {
        console.log("Failed to fetch barcode details");
        setFileErrormsg(response.message);
        setFileSuccessmsg();

        setTimeout(() => {
          setFileErrormsg();
        }, 2000);
      }
    } catch (err) {
      console.log("err > ", err);
    } finally {
      setLoading(false);
    }

  }
  // useEffect(() => {
  //   if (packingFilter.GasCodeId != null) {
  //     getAllPackingList();
  //   }
  // }, [packingFilter]);

  const handleGasChange = (ev) => {


    let FilteredText = ev.value !== undefined && ev.value !== null ? ev.value.PickQty : 0;

    setselectedpickqty(FilteredText);

    setPackingFilter(prevState => ({
      ...prevState,
      ["GasCodeId"]: ev.value.GasCodeId,
    }));


  }

  const handleCustomerChange = (ev) => {


    let FilteredText = ev.value !== undefined && ev.value !== null ? ev.value.PickQty : 0;



    setPackingFilter(prevState => ({
      ...prevState,
      ["Fcustomerid"]: ev.value.CustomerID,
    }));


  }

  const handlePackerlistChange = (ev) => {

    setPackingFilter({ ...packingFilter, packerid: ev.value ? ev.value.Id : 0 });




  }


  const loadGasLoad = async (ev) => {
    let FilteredText = ev.query;
    let _filteredGas = await GetgasCodeData(1, FilteredText);

    setFilterGasList(Array.isArray(_filteredGas) ? _filteredGas : []);

    //   setTimeout(() => {
    //     setFilterGasList(data);
    // }, 250);


  };

  const loadCustomerLoad = async (ev) => {
    let FilteredText = ev.query;
    let _filteredGas = await GetCustomerFilter(1, FilteredText);
    debugger;
    setFilterCustomerList(Array.isArray(_filteredGas) ? _filteredGas : []);



  };


  const loadPackerLoad = async (ev) => {
    let FilteredText = ev.query;
    let _filteredGas = await GetPackerautoList(1, FilteredText);
    debugger;
    setFilterPackerList(Array.isArray(_filteredGas) ? _filteredGas : []);



  };

  const SaveACKData = async () => {
    debugger;
    if (checkedItems == undefined || checkedItems == null || checkedItems.length == 0) {


      setFileErrormsg("Please select the DO NO.");
      setFileSuccessmsg();

      setTimeout(() => {
        setFileErrormsg();
      }, 2000);
    }
    else {
      setisackConfirmationOpen(true);
    }
  }

  const handlePrint = async () => {
    try {

      let podetails = "%";
      const blob = await printExportExcel(
        packingFilter.packerid,
        packingFilter.FromDate,
        packingFilter.ToDate,
        packingFilter.BranchId,
        packingFilter.GasCodeId == undefined || packingFilter.GasCodeId == null ? 0 : packingFilter.GasCodeId,
        packingFilter.Fcustomerid == undefined || packingFilter.Fcustomerid == null ? 0 : packingFilter.Fcustomerid,
        packingFilter.Festtime == undefined || packingFilter.Festtime == null || packingFilter.Festtime == "" ? "0" : packingFilter.Festtime

      );



      const arrayBuffer = await blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const tableRows = jsonData.map(row => `
              <tr>
                  ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
              </tr>
          `).join('');

      const tableHeaders = Object.keys(jsonData[0]).map(key => `<th>${key}</th>`).join('');

      const logoHeaderHtml = getLogoHeaderHtml();
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
    }
          }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #333; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        ${logoHeaderHtml}
        <table>
          <thead><tr>${tableHeaders}</tr></thead>
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
      console.error("Failed to print report:", err);
      setErrormsg("Failed to print packing. Please try again.");
    }
  };
  const handleRackChange = selectedrow => {
    const RackNo = selectedrow?.RackNo || "";
    const RackdetailId = selectedrow?.RackId || 0;

    setselectedRackid(RackdetailId);
  };

  const handleTypeChange = (e) => {
    debugger;
    const { name, value } = e.target;
    const filterValue = parseInt(value, 10);
    setSelectedFilter(filterValue);
    setFilterSearchValue(""); // Reset filter search input when filter type changes
    setAppliedFilterValue(""); // Reset applied filter value
    const resetFilter = {
      packerid: 0,
      FromDate: formatDate(new Date()),
      ToDate: formatDate(new Date()),
      BranchId: 1,
      GasCodeId: 0,
      Fcustomerid: 0,
      Festtime: null,
      FilterType: filterValue
    };
    setPackingFilter(resetFilter);
    setselectedpickqty(0);
    setselectedGasCode("");

    setselectedCustomerCode("");
    setselectedPackerCode("");
    // Reset filters but keep global filter
    const currentGlobal = filters.global;
    initFilters();
    if (currentGlobal) {
      setFilters(prev => ({ ...prev, global: currentGlobal }));
    }
  };

  const handleTimeChange = (selectedDates) => {
    debugger;
    if (selectedDates.length > 0) {
      const date = selectedDates[0];

      // Format to "hh:mm AM/PM"
      const formattedTime = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      setselectedesttime(formattedTime);

      setPackingFilter({ ...packingFilter, Festtime: formattedTime });



    }
  }

  // Filter packingList for DO No search
  const filteredPackingList = useMemo(() => {
    if (SelectedFilter === 2 && appliedFilterValue) {
      // Filter by DO No - find packing items that have matching DO numbers
      const searchValue = appliedFilterValue.toLowerCase();
      const matchingDOIds = DONOList
        .filter(doItem => doItem.DONo && doItem.DONo.toLowerCase().includes(searchValue))
        .map(doItem => doItem.packingid);

      // Return packing items whose id matches the DO's packingid
      return packingList.filter(item => matchingDOIds.includes(item.id));
    }
    return packingList;
  }, [packingList, DONOList, SelectedFilter, appliedFilterValue]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <style>
            {`
          .DOclass.p-checkbox .p-checkbox-box {
            border: 2px solid blue !important;
            border-radius: 4px;
          }

          .DOclass.p-checkbox .p-checkbox-box.p-highlight {
            background-color: blue !important;
            border-color: blue !important;
            color: white !important;
          }

          .DOclass.p-checkbox .p-checkbox-box.p-highlight .p-checkbox-icon {
            color: white !important;
          }
        `}
          </style>
          <Breadcrumbs title="Sales" breadcrumbItem="Delivery Order" />
          <Row>
            {errormsg && (
              <UncontrolledAlert color="danger">
                {errormsg}
              </UncontrolledAlert>
            )}
            {fileSuccessmsg && (
              <UncontrolledAlert color="success">

                {fileSuccessmsg}
              </UncontrolledAlert>
            )}
            <Card className="search-top mb-0">
              <div className="row align-items-center g-2 quotation-mid px-3 py-2">


                <div className="col-12 col-lg-3 mt-1">
                  <div className="d-flex align-items-center gap-2">



                    <div className="col-12 col-lg-3 col-md-3 col-sm-3 text-center">
                      <label htmlFor="Search_Type" className="form-label mb-0">Search By</label></div>
                    <div className="col-12 col-lg-8 col-md-8 col-sm-8">


                      <Input type="select" name="Search_Type" id="Search_Type" onChange={handleTypeChange} value={SelectedFilter} >
                        <option key="0" value="0">Select</option>
                        {FilterTypes.map((FilterTypes, index) => (
                          <option key={index} value={FilterTypes.value}>
                            {FilterTypes.name}
                          </option>
                        ))}
                      </Input>
                    </div>
                  </div>
                </div>
                {/* Filter Search Input */}
                {SelectedFilter > 0 && (
                  <div className="col-12 col-lg-3 mt-1">
                    <div className="d-flex align-items-center gap-2">
                      <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                        <label htmlFor="Filter_Search" className="form-label mb-0">
                          {SelectedFilter === 1 ? "PDL No:" : SelectedFilter === 2 ? "DO No:" : ""}
                        </label>
                      </div>
                      <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                        <input
                          type="text"
                          className="form-control"
                          id="Filter_Search"
                          value={filterSearchValue}
                          onChange={onFilterSearchChange}
                          placeholder={
                            SelectedFilter === 1 ? "Enter PDL No" :
                              SelectedFilter === 2 ? "Enter DO No" :
                                "Enter value"
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Buttons */}
                <div className={`col-12 ${SelectedFilter > 0 ? 'col-lg-6' : 'col-lg-9'} text-end`}>
                  <div className="d-flex flex-wrap justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn  btn-info text-white"
                      onClick={() => {
                        if (SelectedFilter > 0 && filterSearchValue) {
                          applyFilterSearch();
                        }
                        getAllPackingList();
                      }}
                    >
                      <i className="bx bx-search-alt font-size-16 align-middle me-1"></i> Search
                    </button>
                    <button type="button" className="btn  btn-danger text-white" onClick={cancelFilter}>
                      <i className="bx bx-window-close font-size-14 align-middle me-1"></i> Cancel
                    </button>
                    <button type="button" className="btn  btn-secondary text-white" onClick={ExportAll}>
                      <i className="bx bx-export font-size-16 align-middle me-1"></i> Export
                    </button>
                    {/* <button type="button" className="btn  btn-success text-white" onClick={handleAddPacking}>
                      <i className="bx bx-plus font-size-16 align-middle me-1"></i> New
                    </button> */}
                    {/* <button type="button" className="btn  btn-info text-white">
                      <i className="bx bx-cog font-size-16 align-middle me-1"></i> Generate Invoice
                    </button> */}
                    <button type="button" onClick={SaveACKData} className="btn  btn-info text-white">
                      <i className="bx bx-check-circle font-size-16 align-middle me-1"></i> ACK
                    </button>

                    <button type="button" className="btn btn-primary" onClick={handlePrint}>
                      <i className="bx bx-printer label-icon font-size-16 align-middle me-2"></i> Print
                    </button>
                  </div>
                </div>
              </div>
            </Card>
            <Col lg="12" class="mt-10">
              <Card>
                <DataTable
                  value={filteredPackingList}
                  paginator
                  showGridlines
                  rows={10}
                  loading={loading}
                  dataKey="id"
                  filters={filters}
                  globalFilterFields={["PackNo", "dono", "packername", "deliverdate", "esttime"]}
                  header={header}
                  emptyMessage="No order found."
                  onFilter={e => setFilters(e.filters)}
                  className="blue-bg"
                  sortField="id"
                  sortOrder={-1}
                >
                  <Column
                    field="PackNo"
                    header="PDL No."
                    filter
                    filterPlaceholder="Search by PDL No."
                    style={{ width: "105px" }}
                    className="text-center"
                  />
                  {/* <Column
                    field="SQ_Nbr"
                    header="SQ No."
                    filter
                    className="text-center"
                    filterPlaceholder="Search by SO No."
                    style={{ width: "155px" }}
                  /> */}
                  <Column
                    field="dono"
                    header="DO No."
                    filter
                    filterPlaceholder="Search by DO No."
                    className="text-center"
                    style={{ width: "155px" }}
                    body={CustomCheckboxColumn}
                  />
                  {/* <Column
                    field="dono"
                    header="DO Status"
                    
                    filterPlaceholder="Search by DO No."
                    className="text-center"
                    style={{ width: "155px" }}
                    body={CustomCheckboxColumnstatus}
                  /> */}
                  <Column
                    header="Invoice"
                    body={rowData => InvoiceBodyTemplate(rowData)}
                    className="text-center"
                    style={{ width: "4%" }}
                  />

                  {/* <Column
      header="Invoice"
      body={rowData => InvoiceBodyTemplate(rowData)}
      className="text-center"
      style={{ width: "8%" }}
    /> */}


                  {/* <Column field="packername" header="Packer Name" filter /> */}
                  <Column
                    field="deliverdate"
                    header="Delivery Date"
                    filter
                    filterPlaceholder="Search by Delivery Date"
                    className="text-center"
                    style={{ width: "155px" }}
                  />
                  {/* <Column
                    field="esttime"
                    header="Est Time"
                    filter
                    filterPlaceholder="Search by Est Time"
                    bodyClassName="text-end"
                    style={{ width: "8%" }}
                  /> */}

                  <Column
                    field="SOQty"
                    header="SO Qty"
                    filter
                    filterPlaceholder="Search by SOQty"
                    bodyClassName="text-end"
                    style={{ width: "8%" }}
                  />
                  <Column
                    field="BalanceQty"
                    header="Balance Qty"
                    filter
                    filterPlaceholder="Search by BalanceQty"
                    className="text-end"
                    style={{ width: "8%" }}
                  />
                  <Column
                    field="PickedQty"
                    header="Plan Deliv Qty"
                    filter
                    filterPlaceholder="Search by Picked Qty"
                    bodyClassName="text-end"
                    style={{ width: "9%" }}
                  />
                  {/* <Column
                    field="SOnumber"
                    header="SO No."
                    filter
                    filterPlaceholder="Search by SO No."
                    className="text-left"
                  /> */}
                  {/* <Column
      field="createdby"
      header="Created by / Date"
      filter
      filterPlaceholder="Search by created by"
      className="text-left"
      body={createdBodyTemplate}
    /> */}
                  {/* <Column
                    header="Barcode"
                    body={rowData => BarcodeBodyTemplate(rowData)}
                    className="text-center"
                    style={{ width: "8%" }}
                  /> */}
                  {/* <Column
                    header="PDL Download"
                    body={rowData => actionBodyTemplate(rowData, "download")}
                    className="text-center"
                    style={{ width: "8%" }}
                  />
                  <Column
                    header="PDL Upload"
                    body={rowData => actionBodyTemplate(rowData, "upload")}
                    className="text-center"
                    style={{ width: "8%" }}
                  /> */}
                  {/* <Column
                    header="ACK Upload"
                    body={rowData => actionBodyTemplate(rowData, "ackupload")}
                    className="text-center"
                    style={{ width: "8%" }}
                  /> */}
                  <Column
                    field="Status"
                    header="Status"
                    filterMenuStyle={{ width: "6rem" }}
                    body={statusBodyTemplate}
                    filter
                    className="text-center"
                    style={{ width: "5%" }}
                  />
                  <Column
                    header="Stage"
                    body={stageBodyTemplate}
                    className="text-left w-lg"
                  />
                  {/* <Column
                    header="Action"
                    body={rowData => actionBodyTemplate(rowData, "edit")}
                    className="text-center"
                    style={{ width: "6%" }}
                  /> */}
                </DataTable>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <Modal
        isOpen={isModalsOpen}
        toggle={() => setIsModalsOpen(false)}
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
                <h4>
                  Do you want to{" "}
                  {isEditMode
                    ? submitType === 0
                      ? "Update"
                      : "Post"
                    : submitType === 0
                      ? "Save"
                      : "Post"}{" "}
                  ?
                </h4>
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
                  onClick={stagehandleConfirm}
                >
                  Yes
                </Button>
                <Button
                  color="danger"
                  size="lg"
                  className="btn btn-danger"
                  onClick={() => setIsModalsOpen(false)}
                >
                  Cancel
                </Button>

              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <div className="modal-header">
          <h5 className="modal-title">
            {uploadtype == "upload" ? "" : "ACK"} Upload File for{" "}
            {selectedRowData?.PackNo}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setModalOpen(false)}
          ></button>
        </div>
        <div className="modal-body">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="form-control"
            onChange={handleFileChange}
          />

          {fileErrormsg && (
            <div className="red mt-1" style={{ color: "red" }}>
              {fileErrormsg}
            </div>
          )}
          {fileSuccessmsg && (
            <div className="mt-2">
              <UncontrolledAlert color="success" role="alert" className="mt-1">
                {" "}
                {fileSuccessmsg}{" "}
              </UncontrolledAlert>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleUpload}
          >
            Upload
          </button>
        </div>
      </Modal>


      <Modal size="xl" isOpen={BarcodeOpen} toggle={() => {

        setBarcodeOpen(false);
        setselectedBarcodeData(null);
        setItems([]);
        setselectedRackid(0);
        setselectedDONOId(0);
      }
      }>
        <div className="modal-header">
          <h5 className="modal-title">
            Barcode for{" "}
            {selectedBarcodeData?.PackNo}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setBarcodeOpen(false)}
          ></button>
        </div>
        <div className="modal-body">
          <div className="row">

            <div className="col-12 col-lg-4 mb-3">

              <Label className="required-label">DO No.</Label>
              <Select
                name="DOID"
                classNamePrefix="select"

                isClearable
                isSearchable
                options={selectedDONOlist.map(cus => ({
                  value: cus.id,
                  label: cus.DONo,
                }))}
                onChange={handleDONOSelectChange}
                value={selectedDONOlist.find(opt => opt.id === selectedDONOId) || null}

              />
            </div>


            <div className="col-12 col-lg-4 mb-3">
              <Label className="required-label" style={{ color: "#800517", fontWeight: "bold" }} >Start Scanning</Label>
              <Input type="text" name="BarcodeScanner" id="BarcodeScanner" value={BarcodeData}
                onChange={(e) => setBarcodeData(e.target.value)}
                onKeyDown={handleBarcodeScan}
                autoFocus
                disabled={selectedDONOId == undefined || selectedDONOId == null || selectedDONOId == "" || selectedDONOId == 0}
              />


            </div>

            <div className="col-12 col-lg-4 mb-3">
              <Label className="required-label" htmlFor="rackNumber">Rack No.</Label>
              <Select
                value={
                  rackNumberOptions.find(option => option.RackId === selectedRackid) || null
                }
                className="basic-single"
                isSearchable
                options={rackNumberOptions}
                getOptionValue={option => option.RackId}
                getOptionLabel={option => option.label}
                onChange={handleRackChange}
                placeholder="Select"
              />
            </div>

            {/* <div className="col-12 col-lg-5 mb-3">
              <span style={{ color: "#800517", fontWeight: "bold" }} >Start Scanning</span>
              <Input type="text" name="BarcodeScanner" id="BarcodeScanner" value={BarcodeData}
                onChange={(e) => setBarcodeData(e.target.value)}
                onKeyDown={handleBarcodeScan}
                autoFocus
              />


            </div> */}

            <div className="col-12">

              {fileErrormsg && (
                <div className="red mt-1" style={{ color: "red" }}>
                  {fileErrormsg}
                </div>
              )}
              <div className="table-responsive">

                <table border="1" cellPadding="8" cellSpacing="0" width="100%">
                  <thead>
                    <tr>
                      <th className="text-center">SQ No.  </th>
                      <th className="text-center">DO No.  </th>
                      <th className="text-center">Gas Code</th>
                      <th className="text-center">Gas Name</th>
                      <th className="text-center">Cylinder Number - Cylinder Name  </th>
                      <th className="text-center">Tested On</th>
                      <th className="text-center">Next Test Date</th>
                      <th className="text-center">Barcode</th>

                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.SQ_Nbr}</td>
                        <td>{item.dono}</td>
                        <td>{item.gascode}</td>
                        <td>{item.gasname}</td>
                        <td>{item.cylindername}</td>
                        <td>{item.testedon}</td>
                        <td>{item.nexttestdate}</td>
                        <td>{item.barcode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setBarcodeOpen(false);
              setselectedBarcodeData(null);
              setItems([]);
              setselectedRackid(0);
              setselectedDONOId(0);
            }
            }
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-success"

            onClick={() => opeConfirmationnModal(1)}
          >
            Save
          </button>
        </div>
      </Modal>

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
                  onClick={() => handleRemoveItem(BarcodeID)}
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

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmationOpen} toggle={() => setisConfirmationOpen(false)} centered>
        <ModalBody className="py-3 px-5">
          <Row>
            <Col lg={12}>
              <div className="text-center">
                <i
                  className="mdi mdi-alert-circle-outline"
                  style={{ fontSize: "9em", color: "orange" }}
                />
                {ModelType == 1 ? (
                  <h4>Do you want to save?</h4>
                ) : (
                  <h4>Do you want to choose Barcode scan over manual?</h4>
                )
                }
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
                  onClick={() => SaveData(ModelType)}
                >
                  Yes
                </Button>
                <Button
                  color="danger"
                  size="lg"
                  className="btn btn-danger"
                  onClick={() => setisConfirmationOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>

      <Modal isOpen={isackConfirmationOpen} toggle={() => setisackConfirmationOpen(false)} centered>
        <ModalBody className="py-3 px-5">
          <Row>
            <Col lg={12}>
              <div className="text-center">
                <i
                  className="mdi mdi-alert-circle-outline"
                  style={{ fontSize: "9em", color: "orange" }}
                />

                <h4>Do you want to Save</h4>

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
                  onClick={() => Saveack(ModelType)}
                >
                  Yes
                </Button>
                <Button
                  color="danger"
                  size="lg"
                  className="btn btn-danger"
                  onClick={() => setisackConfirmationOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>



      <Modal size="xl" isOpen={autoInvoiceStatusOpen} toggle={() => {
        setautoInvoiceStatusOpen(false); setselectedPackingRecord(null);
        setcheckedInvoiceItems([]);
        setInvoicedata([]);
      }}>
        <div className="modal-header">
          <h5 className="modal-title">
            Invoice detail for PDL No.{" : "}
            {selectedPackingRecord?.PackNo}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setautoInvoiceStatusOpen(false); setselectedPackingRecord(null);
              setcheckedInvoiceItems([]);
              setInvoicedata([]);
            }}
          ></button>
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col-12">
              <div className="table-responsive">

                <table border="1" cellPadding="8" cellSpacing="0" width="100%">
                  <thead>
                    <tr>
                      <th className="text-center">S.No.</th>
                      <th className="text-center">Customer </th>
                      <th className="text-center">DO No.</th>
                      <th className="text-center">ACK Status</th>
                      <th className="text-center">Invoice Status</th>
                      <th className="text-center">Select</th>


                    </tr>
                  </thead>
                  <tbody>


                    {Invoicedata.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="text-left">{item.CustomerName}</td>
                        <td className="text-left">{item.DONo}</td>

                        <td className="text-center">{item.ACKStatus}</td>
                        <td className="text-center">{item.Status} </td>
                        <td className="text-center">


                          {item.IsInvoiced == 0 && item.isacknowledged == 1 ? (


                            <Checkbox inputId={`chk-inv-${item.id}`}
                              value={item.id} onChange={(e) => handleInvoiceCheckboxChange(e, item)}

                              checked={checkedInvoiceItems.includes(item.doid)} />
                          ) : item.IsInvoiced == 1 && item.isacknowledged == 1 ? (

                            <Checkbox inputId={`chk-inv-${item.id}`}
                              value={item.id}
                              disabled={true}
                              checked={true} />
                          ) : (
                            <Checkbox inputId={`chk-inv-${item.id}`}
                              value={item.id}
                              disabled={true}
                            />
                          )}

                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>

              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">

          <button type="button" className="btn  btn-info text-white" disabled={checkedInvoiceItems.length === 0} onClick={generateinvoice}>
            <i className="bx bx-cog font-size-16 align-middle me-1"></i> Generate Invoice
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              setautoInvoiceStatusOpen(false);
              setselectedPackingRecord(null);
              setcheckedInvoiceItems([]);
              setInvoicedata([]);
            }}
          >
            Cancel
          </button>
        </div>
      </Modal>



      <Modal size="xl" isOpen={InvoiceStatusOpen} toggle={() => setInvoiceStatusOpen(false)}>
        <div className="modal-header">
          <h5 className="modal-title">
            Invoice Log for DO No{" : "}
            {selectedrowforinvoice?.dono}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setInvoiceStatusOpen(false)}
          ></button>
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col-12">
              <div className="table-responsive">

                <table border="1" cellPadding="8" cellSpacing="0" width="100%">
                  <thead>
                    <tr>
                      <th className="text-center">Customer </th>
                      <th className="text-center">Invoice No.</th>
                      <th className="text-center">Invoice Status</th>
                      <th className="text-center">Invoice Date</th>
                    </tr>
                  </thead>
                  <tbody>

                    <tr>
                      <td className="text-center">SMART GAS PTE LTD	</td>
                      <td className="text-center">SI0000076</td>
                      <td className="text-center">Invoiced</td>
                      <td className="text-center">14-May-2025</td>

                    </tr>
                    <tr>
                      <td className="text-left">PT. GLOBAL MARINE SAFETY INDONESIA	</td>
                      <td className="text-center"> </td>
                      <td className="text-center">Pending</td>
                      <td className="text-center"></td>

                    </tr>

                  </tbody>
                </table>

              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setInvoiceStatusOpen(false)}
          >
            Close
          </button>

        </div>
      </Modal>

    </React.Fragment>
  );
};
export default ManagePacking;
