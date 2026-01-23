import React, { useState, useEffect } from "react";
import { AutoComplete } from "primereact/autocomplete";
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
  uploadAckDOFile, downloadPackingExportExcel, packingstage, GetBarcodeDetails
} from "../../../common/data/invoiceapi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useRef } from "react";
import { color } from "echarts/lib/export";

const ManagePackingDemo = () => {
  const history = useHistory();
  const [packingList, setPackingList] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState({});
  const [tooltipOpen2, setTooltipOpen2] = useState({});
  const [PackerList, setPackerList] = useState([]);
  const currentYear = new Date().getFullYear();
  const [isClearable, setIsClearable] = useState(true);
  const formatDate = date => date.toISOString().split("T")[0];
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [modalOpen, setModalOpen] = useState(false);
  const [BarcodeOpen, setBarcodeOpen] = useState(false);
  const [InvoiceStatusOpen, setInvoiceStatusOpen] = useState(false);
  const [selectedPackingId, setSelectedPackingId] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitType, setSubmitType] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedRowData, setSelectedRowData] = useState();
  const [selectedBarcodeData, setselectedBarcodeData] = useState();
  const [uploadtype, setUploadType] = useState();
  const [selectedFile, setSelectedFile] = useState();
  const [isfilter, setIsfilter] = useState(false);
  const [packingFilter, setPackingFilter] = useState({
    packerid: 0,
    FromDate: formatDate(sevenDaysAgo),
    ToDate: formatDate(new Date()),
    BranchId: 1,
  });
  const [fileErrormsg, setFileErrormsg] = useState();
  const [errormsg, setErrormsg] = useState();
  const [fileSuccessmsg, setFileSuccessmsg] = useState();
  const [items, setItems] = useState([
  ]);
  const [isModalsOpen, setIsModalsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedStageOption, setSelectedStageOption] = useState(null);

  const [pendingStageChange, setPendingStageChange] = useState(null);
const[selectedrowforinvoice,setselectedrowforinvoice]=useState();
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


  const opeConfirmationnModal = Type => {
    setModelType(Type);
    setisConfirmationOpen(true);
  };

  const openModal = id => {
    setBarcodeID(id);
    setIsModalOpen(true);
  };

  useEffect(() => {
    loadPackerList();
    initFilters();
    getAllPackingList();
    initFilters();
  }, []);

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

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      PackNo: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
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
      dono: {
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

  const clearFilter = () => {
    initFilters();
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
  const mappedstageOptions = [
    { stageNo: "Loaded", label: "Loaded", stageId: 1, value: "Loaded" },
    { stageNo: "Delivery in Progress", label: "Delivery in Progress", stageId: 2, value: "Delivery in Progress" },
    { stageNo: "Delay", label: "Delay", stageId: 3, value: "Delay" },
    { stageNo: "Done", label: "Done", stageId: 4, value: "Done" }
  ];
  const handleStageChange = (e, rowData) => {
    setPendingStageChange({ stage: e.value, rowData });
    setIsModalsOpen(true);
  };

  const stagehandleConfirm = async () => {
    debugger
    const { stage, rowData } = pendingStageChange;

    setLoading(true);
    setIsModalsOpen(false);

    try {
      const response = await packingstage(rowData.id, stage);

      if (response?.status) {

        const updatedPackingList = packingList.map(item =>
          item.id === rowData.id ? { ...item, stage } : item
        );
        setPackingList(updatedPackingList);
      }
    } catch (err) {
      console.error("Error updating stage:", err);
    } finally {
      setLoading(false);
      setPendingStageChange(null);
    }
  };

  const stageBodyTemplate = (rowData) => {
    return (
      <FormGroup>
        <Select
          id={`stage-${rowData.id}`}
          className="basic-single"
          options={mappedstageOptions}
          getOptionValue={option => option.value}
          getOptionLabel={option => option.label}
          value={rowData.stageId}
          onChange={(e) => handleStageChange(e, rowData)}
          placeholder="Select"
        />
      </FormGroup>
    );
  };

  const handleConfirm = () => {
    debugger
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

    if (!packingFilter.FromDate || !packingFilter.ToDate) {
      setErrormsg("Please select both From and To dates.");
      return;
    }

    if (packingFilter.FromDate > packingFilter.ToDate) {
      setErrormsg("To date should not be earlier than From date.");
      return;
    }

    setLoading(true);

    try {

      const response = await GetALLPackingDelivery(
        packingFilter.packerid,
        packingFilter.FromDate,
        packingFilter.ToDate,
        packingFilter.BranchId
      );
      if (response?.status) {
        setPackingList(response?.data || []);
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
      <div className="col-12 col-lg-3">
        <Button className="btn btn-danger" onClick={clearFilter}>
          <i className="mdi mdi-filter-off label-icon" /> Clear
        </Button>
      </div>
      <div className="col-12 col-lg-6 text-end">
      <span className="me-4">
      
      <input
  type="checkbox"
  className="checkbox-blue-border checkbox-size-1"
  style={{ cursor: "pointer", accentColor: "blue",verticalAlign:"sub" }} />
&nbsp;  
ACK
  </span>

        <span className="me-4">
          <Tag value="S" severity={getSeverity("Saved")} /> Saved
        </span>
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

        <span className="me-1" >
          <Tag
            value="PI"
            className=" btn-info"
            severity={getSeverity("Saved")}
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
        packingFilter.BranchId
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
      toggleBarcodeModal();
    }
  }, [selectedBarcodeData]);

  

  const DONOBodyTemplate = (rowData) => {
    const isClickable = true;
    return (
      <div title="Invoice">
     <input
  type="checkbox"
  className="checkbox-blue-border checkbox-size-1"
  style={{ cursor: "pointer", accentColor: "blue" }}
/> <span style={{verticalAlign:"top"}}>{rowData.dono}</span>
    </div>
    );
  } 

  const InvoiceBodyTemplate = (rowData) => {
    const isClickable = true;
    return (
      <div title="Invoice">
      <input
        type="checkbox"
        className="checkbox-size-1"
        style={{ cursor: "pointer" }}
      />
    </div>
    );
  }

  const BarcodeBodyTemplate = (rowData) => {
    const isClickable = true;
    return (
      <span title="Barcode"
        onClick={
          isClickable
            ? () => {
              setselectedBarcodeData(rowData);
            }
            : undefined
        }

      >
        <i
          className="mdi mdi-barcode-scan"
          style={{ fontSize: "1.3rem", cursor: "pointer" }}
        />
      </span>
    );
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
    if (rowData.IsPosted == 1) {
      if (type === "download" && rowData.IsPosted > 0) {
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
        rowData.IsDoCreated > 0
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

  const toggleBarcodeModal = () => {
    setBarcodeOpen(prev => !prev);
    processBarcode("-");
  };
  const cancelFilter = async () => {
    const resetFilter = {
      packerid: 0,
      FromDate: formatDate(sevenDaysAgo),
      ToDate: formatDate(new Date()),
      BranchId: 1,
    };
    setPackingFilter(resetFilter);
    document
      .getElementById("FromDate")
      ._flatpickr.setDate(resetFilter.FromDate, false);
    document
      .getElementById("ToDate")
      ._flatpickr.setDate(resetFilter.ToDate, false);
    setIsfilter(!isfilter);
  };
  useEffect(() => {
    getAllPackingList();
  }, [isfilter]);

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
    const isClickable =true;
    const statusShort =
      rowData.Status === "Saved"
        ? "S"
        : rowData.Status === "Posted"
          ? "P"
          : rowData.Status === "Invoiced"
            ? "I"
            : rowData.Status;
    return <span
    title="Invoice"
     
    style={{
      cursor: isClickable ? "pointer" : "default",
      color: isClickable ? "inherit" : "grey",
    }}
    onClick={
      isClickable
        ? () => {
          setselectedrowforinvoice(rowData);
        
          toggleInvoiceModal();
        }
        : undefined
    }
  
    
     > <Tag value={statusShort} severity={getSeverity(rowData.Status)} /></span>;
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
      console.log('Barcode scanned:', BarcodeData);
      // Call your function here
      processBarcode(BarcodeData);
    }
  };

  const processBarcode = async (barcode) => {


    setErrormsg("");
    setLoading(true);

    try {
      debugger;

      const response = await GetBarcodeDetails(
        selectedBarcodeData?.id,
        barcode,

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
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Sales" breadcrumbItem="Packing & Delivery" />
          <Row>
            {errormsg && (
              <UncontrolledAlert color="danger">
                {errormsg}
              </UncontrolledAlert>
            )}
            <Card className="search-top">
              <div className="row align-items-center g-1 quotation-mid">
                <div className="col-12 col-lg-3 mt-1 ms-1">
                  <div className="d-flex align-items-center gap-2">
                    <div className="col-12 col-lg-3 col-md-3 col-sm-4">
                      <label htmlFor="PackerName" className="form-label mb-0">
                        Gas Name
                      </label>
                    </div>
                    <div className="col-12 col-lg-9 col-md-9 col-sm-8">
                      {/* <Select
                        name="Customerid"
                        id="Customerid"
                        options={PackerList}
                        value={
                          PackerList.find(
                            option => option.value === packingFilter.packerid
                          ) || null
                        }
                        onChange={option => handlePackerChange(option)}
                        isClearable={isClearable}
                        classNamePrefix="select"
                      /> */}

                          <AutoComplete  className={`my-autocomplete `}
                         value={'CARBON DIOXIDE GAS CYLINDER 25 KG	'}
                         style={{ width: "100%" }}
                                                                 />
                      
                    </div>
                  </div>
                </div>
 


               <div className="col-12 col-lg-4 mt-1">
                  <div className="d-flex align-items-center gap-2">
                    <div className="col-12 col-lg-5 col-md-8 col-sm-8 text-center">
                      <label htmlFor="fromDate" className="form-label mb-0">
                        Total Pick Qty
                      </label>
                    </div>
                    <div className="col-12 col-lg-2 col-md-4 col-sm-4">
                      <FormGroup>
                        <Label></Label>
                          <Input
                                                                   type="text"
                                                                   
                                                                   disabled
                                                                   className="text-end"
                                                                   style={{ color: '#b22222',fontWeight:'bold' }}
                                                                   value={20}
                                                                 />
                      </FormGroup>
                    </div>
                  </div>
                </div>
                {/*  <div className="col-12 col-lg-2 mt-1">
                  <div className="d-flex align-items-center gap-2">
                    <div className="col-12 col-lg-3 col-md-4 col-sm-4 text-center">
                      <label htmlFor="toDate" className="form-label mb-0">
                        To
                      </label>
                    </div>
                    <div className="col-12 col-lg-9 col-md-8 col-sm-8">
                      <FormGroup>
                        <Label></Label>
                        <InputGroup>
                          <Flatpickr
                            name="ToDate"
                            id="ToDate"
                            className="form-control d-block"
                            placeholder="dd-mm-yyyy"
                            options={{
                              altInput: true,
                              altFormat: "d-M-Y",
                              dateFormat: "Y-m-d",
                              defaultDate: packingFilter.ToDate,
                            }}
                            onChange={handleDateChange}
                          />
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div> */}
                <div className="col-12 col-lg-5 text-end button-items">
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={getAllPackingList}
                  >
                    <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i>
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={cancelFilter}
                  >
                    <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={ExportAll}
                  >
                    <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i>
                    Export
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleAddPacking}
                  >
                    <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>
                    New
                  </button>

                  <button
                    type="button"
                    className="btn btn-info"
                    
                  >
                    <i className="bx bx-cog label-icon font-size-16 align-middle me-2"></i>
                    Generate Invoice
                  </button>
                </div>
              </div>
            </Card>

            <Col lg="12">
              <Card>
                <DataTable
                  value={packingList}
                  paginator
                  showGridlines
                  rows={10}
                  loading={loading}
                  dataKey="id"
                  filters={filters}
                  globalFilterFields={["PackNo", "packername", "deliverdate"]}
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
                  <Column
                    field="SQ_Nbr"
                    header="SQ No."
                    filter
                    className="text-center"
                    filterPlaceholder="Search by SO No."
                    style={{ width: "155px" }}
                  />
                  <Column
                    // field="dono"
                    header="DO No."
                    filter
                    className="text-center"
                    filterPlaceholder="Search by DO No."
                    body={rowData => DONOBodyTemplate(rowData)}
                    style={{ width: "505px" }}
                  />


                  <Column
                    header="Invoice"
                    body={rowData => InvoiceBodyTemplate(rowData)}
                    className="text-center"
                    style={{ width: "8%" }}
                  />


                  <Column field="packername" header="Packer Name" filter />
                  <Column
                    field="deliverdate"
                    header="Delivery Date"
                    filter
                    filterPlaceholder="Search by Delivery Date"
                    className="text-center"
                    style={{ width: "155px" }}
                  />
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
                    className="text-left"
                    style={{ width: "8%" }}
                  />
                  <Column
                    field="PickedQty"
                    header="Picked Qty"
                    filter
                    filterPlaceholder="Search by Picked Qty"
                    bodyClassName="text-end"
                    style={{ width: "9%" }}
                  />
                  <Column
                    field="SOnumber"
                    header="SO No."
                    filter
                    filterPlaceholder="Search by SO No."
                    className="text-left"
                  />
                  {/* <Column
                    field="createdby"
                    header="Created by / Date"
                    filter
                    filterPlaceholder="Search by created by"
                    className="text-left"
                    body={createdBodyTemplate}
                  /> */}
                  <Column
                    header="Barcode"
                    body={rowData => BarcodeBodyTemplate(rowData)}
                    className="text-center"
                    style={{ width: "8%" }}
                  />
                  <Column
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
                  />
                  <Column
                    header="ACK Upload"
                    body={rowData => actionBodyTemplate(rowData, "ackupload")}
                    className="text-center"
                    style={{ width: "8%" }}
                  />
                  <Column
                    field="Status"
                    header="Status"
                    filterMenuStyle={{ width: "14rem" }}
                    body={statusBodyTemplate}
                    filter
                    className="text-center"
                  />
                  <Column
                    header="Stage"
                    body={stageBodyTemplate}
                    className="text-left w-lg"

                  />

                  <Column
                    header="Action"
                    body={rowData => actionBodyTemplate(rowData, "edit")}
                    className="text-center"
                    style={{ width: "6%" }}
                  />
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


      <Modal size="xl" isOpen={BarcodeOpen} toggle={() => setBarcodeOpen(false)}>
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

            <div className="col-12 col-lg-5 mb-3">
              <span style={{ color: "#800517", fontWeight: "bold" }} >Start Scanning</span>
              <Input type="text" name="BarcodeScanner" id="BarcodeScanner" value={BarcodeData}
                onChange={(e) => setBarcodeData(e.target.value)}
                onKeyDown={handleBarcodeScan}
                autoFocus
              />


            </div>

            <div className="col-12">
              <div className="table-responsive">

                <table border="1" cellPadding="8" cellSpacing="0" width="100%">
                  <thead>
                    <tr>
                      <th className="text-center">SQ No.  </th>
                      <th className="text-center">Gas Code</th>
                      <th className="text-center">Gas Name</th>
                      <th className="text-center">Cylinder Name</th>
                      <th className="text-center">Tested On</th>
                      <th className="text-center">Next Test Date</th>
                      <th className="text-center">Barcode</th>

                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.SQ_Nbr}</td>
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
            onClick={() => setBarcodeOpen(false)}
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
              {  ModelType==1 ? (
                <h4>Do you want to save?</h4>
              ):(
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
                        <td  className="text-center">SMART GAS PTE LTD	</td>
                        <td  className="text-center">SI0000076</td>
                        <td  className="text-center">Invoiced</td>
                        <td  className="text-center">14-May-2025</td>
                        
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
export default ManagePackingDemo;
