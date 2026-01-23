import React, { useState, useEffect } from "react";
import logo from '../../../assets/images/logo.png';
import { Card, Col, Container, Row, Label, Button, FormGroup, InputGroup, UncontrolledAlert, Input } from "reactstrap";
import { useHistory } from "react-router-dom";
import { Modal, ModalHeader, ModalBody, ModalFooter, Table } from "reactstrap";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Select from "react-select";
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";;
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { GetAllSO, GetCustomer, downloadExportExcel, printExportExcel, GetSOGasCodeDetails, OrderGetbyid } from "../../../common/data/mastersapi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useRef } from "react";
import { use } from "react";
import { orderBy } from "lodash";
import ReactToPrint from "react-to-print";
import PrintColumn from './PrintColumn';


const ManageOrders = () => {

    const [Gasdeliverydetails, setGasdeliverydetails] = useState([]);
    // Format number with commas
    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '';
        return num.toLocaleString();
    };
    const history = useHistory();
    const printRef = useRef();
    const [salesOrder, setSalesOrder] = useState(null);
    const [filters, setFilters] = useState(null);
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [errormsg, setErrormsg] = useState();
    const [statuses] = useState([
        { label: 'Saved', value: 'Saved' },
        { label: 'Posted', value: 'Posted' },
        // { label: 'New', value: 'new' },
        // { label: 'Negotiation', value: 'negotiation' },
        // { label: 'Renewal', value: 'renewal' },
        // { label: 'Proposal', value: 'proposal' }
    ]);
    const [isseacrch, setIsseacrch] = useState(false);
    const currentYear = new Date().getFullYear();
    const formatDate = (date) => date.toISOString().split('T')[0];
    const today = new Date();
    const sevenDaysAgo = new Date();
    const [SelectedFilter, setSelectedFilter] = useState(0);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const [salesOrderFilter, setSalesorderFilter] = useState({
        FCustomerId: 0,
        FromDate: formatDate(sevenDaysAgo),
        ToDate: formatDate(new Date()),
        BranchId: 1,
        FilterType: 0,
        PO: "%"
    });
    const [CustomerList, setCustomerList] = useState([]);


    const [printData, setPrintData] = useState(null);


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
    // const handlePrint = () => {

    //     const printContent = document.getElementById('printableArea');
    //     const originalContent = document.body.innerHTML;
    //     document.body.innerHTML = printContent.innerHTML;
    //     window.print();
    //     document.body.innerHTML = originalContent;
    //     window.location.reload();
    // };
    const FilterTypes = [
        { name: 'Customer', value: 1 }, { name: 'PO', value: 2 }
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(prev => !prev);
    };

    useEffect(() => {
        const loadCustomerList = async () => {
            const data = await GetCustomer(1, -1);
            setCustomerList(data);
        };
        setSelectedFilter(0);
        loadCustomerList();
        initFilters();
    }, []);

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };



    const handleBeforePrint = async (rowdata) => {
        setIsLoading(true);
        try {
            const response = await OrderGetbyid(rowdata.id);

            setPrintData(response.data);
        } catch (error) {
            console.error("Failed to fetch print data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            SO_ID: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            SO_Number: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            customername: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            SO_Date: {
                operator: FilterOperator.AND,
                constraints: [
                    { value: null, matchMode: FilterMatchMode.DATE_IS }, // Filter for an exact date
                ]
            },
            createdby: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            OrderBy: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            Modifiedby: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            Qty: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            POnumber: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            Status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            Price: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        });
        setGlobalFilterValue('');
    };

    const renderHeader = () => {
        return (
            <div className="row align-items-center g-3 clear-spa">
                <div className="col-12 col-lg-6">
                    <Button className="btn btn-danger btn-label" onClick={clearFilter} >
                        <i className="mdi mdi-filter-off label-icon" /> Clear
                    </Button>
                </div>
                <div className="col-12 col-lg-3 text-end">
                    <span className="me-4"><Tag value="S" severity={getSeverity("Saved")} /> Saved</span>
                    <span className="me-1"><Tag value="P" severity={getSeverity("Posted")} /> Posted</span>
                </div>
                <div className="col-12 col-lg-3">
                    <input className="form-control" type="text" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </div>
            </div>
        );
    };

    const statusBodyTemplate = (rowData) => {
        const statusShort = rowData.Status === "Saved" ? "S" : rowData.Status === "Posted" ? "P" : rowData.Status;
        return <Tag value={statusShort} severity={getSeverity(rowData.Status)} />;
    };

    const CustomerBodyTemplate = (rowData) => {

        return <span style={{ cursor: "pointer", color: "blue" }} className="btn-rounded btn btn-link"
            onClick={() => openSOGasHistory(rowData)}>{rowData.customername}</span>;
    };
    const openSOGasHistory = async rowData => {
        debugger;
        const data = await GetSOGasCodeDetails(rowData.SO_ID);
        setGasdeliverydetails(data);
        toggleModal();
    }
    const statusFilterTemplate = (options) => {
        return <Dropdown value={options.value} options={statuses} onChange={(e) => options.filterCallback(e.value, options.index)} itemTemplate={statusItemTemplate} placeholder="Select One" className="p-column-filter" showClear />;
    };

    const statusItemTemplate = (option) => {
        return <Tag value={option.label} severity={getSeverity(option.value)} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                {rowData.Status != "Posted" && (
                    <span style={{ marginRight: '0.5rem' }} title="Edit" onClick={() => editRow(rowData)} >
                        <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
                    </span>
                )}
            </div>
        )
    };
    const dateFilterTemplate = options => {
        return (
            <Calendar
                value={options.value}
                onChange={e => options.filterCallback(e.value, options.index)}
                dateFormat="dd-MMM-yyyy"
                placeholder="Filter by Date"
                showIcon
            />
        );
    };

    const header = renderHeader();
    const editRow = (rowData) => {
        debugger
        localStorage.setItem('quotationId', rowData.quotationId);
        console.log('Edit row:', rowData);
        history.push(`/edit-order/${rowData.SO_ID}`);
    };

    const dAddOrder = () => {
        history.push("/add-order");
    };
    const createdBodyTemplate = (rowData) => {
        return (
            <div className="actions row align-items-center g-3">
                <div className="col-12 col-lg-12">
                    {rowData.createdby && rowData.CreatedDate ? (
                        <>
                            <span>{rowData.createdby}</span> / <span>{rowData.CreatedDate}</span>
                        </>
                    ) : (
                        <span></span>
                    )}
                </div>
            </div>
        )
    };
    const modifiedBodyTemplate = (rowData) => {
        return (
            <div className="actions row align-items-center g-3">
                <div className="col-12 col-lg-12">
                    {rowData.Modifiedby && rowData.ModifiedDate ? (
                        <>
                            <span>{rowData.Modifiedby}</span> / <span>{rowData.ModifiedDate}</span>
                        </>
                    ) : (
                        <span></span>
                    )}
                </div>
            </div>
        );
    };

    const searchData = async () => {
        setErrormsg("");
        setLoading(true);
        try {
            let podetails = "%";
            let customerId = salesOrderFilter.FCustomerId || 0;

            if (salesOrderFilter.FilterType === "1") {
                if (!customerId || customerId === 0) {
                    setErrormsg("Please select a customer.");
                    setSalesOrder([]);
                    setLoading(false);
                    return;
                }
                podetails = "%";
            } else if (salesOrderFilter.FilterType === "2") {
                if (!salesOrderFilter.PO || salesOrderFilter.PO.trim() === "") {
                    setErrormsg("Please enter a PO number.");
                    setSalesOrder([]);
                    setLoading(false);
                    return;
                }
                podetails = salesOrderFilter.PO;
                customerId = 0;
            } else {
                podetails = "%";
                customerId = 0;
            }

            const response = await GetAllSO(
                customerId,
                salesOrderFilter.FromDate,
                salesOrderFilter.ToDate,
                salesOrderFilter.BranchId,
                salesOrderFilter.FilterType,
                podetails
            );

            const uniqueOrders = Array.isArray(response)
                ? [...new Map(response.map(item => [item.SO_ID, item])).values()]
                : [];

            if (salesOrderFilter.FilterType === "1" && uniqueOrders.length > 0) {
                const selectedCustomer = CustomerList.find(c => c.value === customerId)?.label;
                const filteredData = uniqueOrders.filter(order => order.customername === selectedCustomer);
                setSalesOrder(filteredData);
            } else if (salesOrderFilter.FilterType === "2" && uniqueOrders.length > 0) {
                const filteredData = uniqueOrders.filter(order => order.POnumber === salesOrderFilter.PO);
                setSalesOrder(filteredData);
            } else {
                setSalesOrder(uniqueOrders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setErrormsg("Failed to fetch data. Please try again.");
            setSalesOrder([]);
        } finally {
            setLoading(false);
        }
    };


    const cancelFilter = async () => {
        const resetFilter = {
            FCustomerId: 0,
            FromDate: formatDate(sevenDaysAgo),
            ToDate: formatDate(new Date()),
            BranchId: 1,
            FilterType: 0,
            PO: ""
        };
        setSelectedFilter(resetFilter.FilterType);
        setSalesorderFilter(resetFilter);
        setIsseacrch(!isseacrch);

        // Reload all orders
        setLoading(true);
        try {
            const response = await GetAllSO(
                0,
                resetFilter.FromDate,
                resetFilter.ToDate,
                1,
                0,
                "%"
            );
            const uniqueOrders = Array.isArray(response)
                ? [...new Map(response.map(item => [item.SO_ID, item])).values()]
                : [];
            setSalesOrder(uniqueOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setErrormsg("Failed to fetch data. Please try again.");
            setSalesOrder([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAllOrders = async () => {
            setLoading(true);
            try {
                const response = await GetAllSO(
                    0, // FCustomerId
                    formatDate(sevenDaysAgo), // FromDate
                    formatDate(new Date()), // ToDate
                    1, // BranchId
                    0, // FilterType
                    "%" // PO
                );
                const uniqueOrders = Array.isArray(response)
                    ? [...new Map(response.map(item => [item.SO_ID, item])).values()]
                    : [];
                setSalesOrder(uniqueOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setErrormsg("Failed to fetch data. Please try again.");
                setSalesOrder([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllOrders();
    }, []);


    const exportCSV = () => {
        if (dt.current) {
            dt.current.exportCSV({
                filename: 'Sales_Order_List',
            });
        }
    };
    const calldownload = async rowData => {
        setLoading(true);
        try {
            let podetails = "%";
            podetails = salesOrderFilter.PO;
            if (salesOrderFilter.FilterType == 1) {
                if (salesOrderFilter.FCustomerId == undefined || salesOrderFilter.FCustomerId == null || salesOrderFilter.FCustomerId == "") {
                    salesOrderFilter.FCustomerId = 0;
                }
                podetails = "%";
            }
            else if (salesOrderFilter.FilterType == 2) {
                if (salesOrderFilter.PO == undefined || salesOrderFilter.PO == null || salesOrderFilter.PO == "") {
                    podetails = "%";
                }
                salesOrderFilter.FCustomerId = 0;
            }
            else {
                podetails = "%";
                salesOrderFilter.FCustomerId = 0;
            }
            const response = await downloadExportExcel(salesOrderFilter.FCustomerId, salesOrderFilter.FromDate, salesOrderFilter.ToDate, salesOrderFilter.BranchId, salesOrderFilter.FilterType,
                podetails);
            if (response.status) {

            }
        } catch (err) {
            console.log("err > ", err);
        } finally {
            setLoading(false);
        }
    };
    const handlePrint = async () => {
        try {

            let podetails = "%";
            podetails = salesOrderFilter.PO;
            if (salesOrderFilter.FilterType == 1) {
                if (salesOrderFilter.FCustomerId == undefined || salesOrderFilter.FCustomerId == null || salesOrderFilter.FCustomerId == "") {
                    salesOrderFilter.FCustomerId = 0;
                }
                podetails = "%";
            }
            else if (salesOrderFilter.FilterType == 2) {
                if (salesOrderFilter.PO == undefined || salesOrderFilter.PO == null || salesOrderFilter.PO == "") {
                    podetails = "%";
                }
                salesOrderFilter.FCustomerId = 0;
            }
            else {
                podetails = "%";
                salesOrderFilter.FCustomerId = 0;
            }

            const blob = await printExportExcel(
                salesOrderFilter.FCustomerId,
                salesOrderFilter.FromDate,
                salesOrderFilter.ToDate,
                salesOrderFilter.BranchId,
                salesOrderFilter.FilterType,
                podetails
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

            const logoHeader = `
    <div style="display:flex; align-items:flex-start; margin-bottom:20px;">
      <div style="min-width:90px; margin-right:18px;"><img src='${logo}' alt='logo' style='height:70px;' /></div>
      <div style="text-align:left; font-size:12px; line-height:1.4; max-width:260px; word-break:break-word;">
        <div style="font-weight:700; font-size:15px; margin-bottom:2px;">PT. Batam Teknologi Gas</div>
        <div>Jalan Brigjen Katamso KM.3, Tanjung Uncang, Batam – Indonesia</div>
        <div>WebSite www.ptbtg.com E-mail ptbtg@ptpbtg.com</div>
        <div>Telp (+62)778 462959 391918</div>
      </div>
    </div>
    `;

            const printHtml = `
    <html>
        <head>
            <title>Sales Order Print</title>
            <style>
                @media print {
                    @page {
                      size: A4 landscape;
                      margin: 20mm 10mm 20mm 0mm;
                    }
                }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #333; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            ${logoHeader}
            <h3>Sales Order List</h3>
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
            setErrormsg("Failed to print sales order. Please try again.");
        }
    };

    // const handlePrint = async () => {
    //    debugger
    //     const printWindow = window.open('', '_blank');

    //     if (!printWindow) {
    //         setErrormsg("Popup blocked. Please allow popups for this site.");
    //         return;
    //     }

    //     try {
    //         const blob = await printExportExcel(
    //             salesOrderFilter.FCustomerId,
    //             salesOrderFilter.FromDate,
    //             salesOrderFilter.ToDate,
    //             salesOrderFilter.BranchId
    //         );

    //         const arrayBuffer = await blob.arrayBuffer();
    //         const workbook = XLSX.read(arrayBuffer, { type: "array" });
    //         const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    //         const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    //         const tableRows = jsonData.map(row => `
    //         <tr>
    //             ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
    //         </tr>
    //     `).join('');

    //         const tableHeaders = Object.keys(jsonData[0]).map(key => `<th>${key}</th>`).join('');

    //         printWindow.document.write(`
    //         <html>
    //             <head>
    //                 <title>Sales Order Print</title>
    //                 <style>
    //                     table { border-collapse: collapse; width: 100%; }
    //                     th, td { border: 1px solid #333; padding: 8px; text-align: left; }
    //                     th { background-color: #f2f2f2; }
    //                 </style>
    //             </head>
    //             <body>
    //                 <h3>Sales Order List</h3>
    //                 <table>
    //                     <thead><tr>${tableHeaders}</tr></thead>
    //                     <tbody>${tableRows}</tbody>
    //                 </table>
    //             </body>
    //         </html>
    //     `);
    //         printWindow.document.close();
    //         printWindow.focus();
    //         printWindow.print();
    //         printWindow.close();

    //     } catch (err) {
    //         console.error("Failed to print report:", err);
    //         setErrormsg("Failed to print sales order. Please try again.");
    //     }
    // };


    useEffect(() => {
        debugger
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await GetAllSO(salesOrderFilter.FCustomerId, salesOrderFilter.FromDate, salesOrderFilter.ToDate, salesOrderFilter.BranchId, salesOrderFilter.FilterType,
                    salesOrderFilter.PO);
                setSalesOrder(response);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCustomerChange = async (option) => {
        if (!option) {
            setSalesorderFilter(prevState => ({ ...prevState, ['FCustomerId']: 0 }));
        } else {
            setSalesorderFilter(prevState => ({ ...prevState, ['FCustomerId']: option.value }));
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

            setSalesorderFilter(prevState => ({
                ...prevState,
                [fieldName]: formatted,
            }));
        }
    };

    const handleTypeChange = (e) => {
        debugger;
        const { name, value } = e.target;
        salesOrderFilter.FilterType = value;
        setSelectedFilter(value);
        salesOrderFilter.PO = "";
        salesOrderFilter.FCustomerId = 0;
    };

    // Handle input change
    const handleInputChange = (e) => {
        debugger;
        const { name, value } = e.target;
        setSalesorderFilter((prevState) => ({
            ...prevState,
            [name]: value, // Update the specific field in state
        }));
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Sales" breadcrumbItem="Orders" />
                    <Row>
                        {errormsg && (
                            <UncontrolledAlert color="danger">
                                {errormsg}
                            </UncontrolledAlert>
                        )}
                        <Card className="search-top">
                            <div className="row align-items-center g-1 quotation-mid">


                                <div className="col-12 col-lg-3 mt-1">
                                    <div className="d-flex align-items-center gap-2">



                                        <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                                            <label htmlFor="Search_Type" className="form-label mb-0">Search By</label></div>
                                        <div className="col-12 col-lg-8 col-md-8 col-sm-8">


                                            <Input type="select" name="Search_Type" id="Search_Type" onChange={handleTypeChange} value={salesOrderFilter.FilterType} >
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

                                {SelectedFilter == 0 && (
                                    <div className="col-12 col-lg-4 mt-1">
                                    </div>
                                )}
                                {SelectedFilter == 2 && (

                                    <div className="col-12 col-lg-4 mt-1">
                                        <div className="d-flex align-items-center gap-2">



                                            <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                                                <label htmlFor="PO_ID" className="form-label mb-0">PO</label></div>
                                            <div className="col-12 col-lg-8 col-md-8 col-sm-8">

                                                <Input type="text" name="PO" id="PO" value={salesOrderFilter.PO || ""} onChange={handleInputChange}  ></Input>

                                            </div>
                                        </div>
                                    </div>
                                )}
                                {SelectedFilter == 1 && (


                                    <div className="col-12 col-lg-4 mt-1">
                                        <div className="d-flex align-items-center gap-2">



                                            <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                                                <label htmlFor="SO_ID" className="form-label mb-0">Customer</label></div>
                                            <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                                                <Select
                                                    name="FCustomerId"
                                                    id="FCustomerId"
                                                    options={CustomerList}
                                                    value={CustomerList.find(option => option.value === salesOrderFilter.FCustomerId) || null}
                                                    onChange={option => handleCustomerChange(option)}
                                                    classNamePrefix="select"
                                                    isDisabled={isDisabled}
                                                    isLoading={isLoading}
                                                    isClearable={isClearable}
                                                    isRtl={isRtl}
                                                    isSearchable={isSearchable}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* <div className="col-12 col-lg-2 mt-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-12 col-lg-3 col-md-4 col-sm-4 text-center">
                                            <label htmlFor="fromDate" className="form-label mb-0">From</label>
                                        </div>
                                        <div className="col-12 col-lg-9 col-md-8 col-sm-8">
                                            <FormGroup>
                                                <Label></Label>
                                                <InputGroup>
                                                    <Flatpickr
                                                        name="FromDate"
                                                        id="FromDate"
                                                        className="form-control d-block"
                                                        placeholder="dd-mm-yyyy"
                                                        options={{
                                                            altInput: true,
                                                            altFormat: "d-M-Y",
                                                            dateFormat: "Y-m-d",
                                                        }}
                                                        value={salesOrderFilter.FromDate}
                                                        onChange={handleDateChange}
                                                        style={{ cursor: "default" }}
                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-2 mt-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-12 col-lg-3 col-md-4 col-sm-4 text-center">
                                            <label htmlFor="toDate" className="form-label mb-0">To</label>
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
                                                        }}
                                                        value={salesOrderFilter.ToDate}
                                                        onChange={handleDateChange}
                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </div> */}
                                <div className="col-12 col-lg-5 text-end button-items">
                                    <button type="button" className="btn btn-info" onClick={searchData}> <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>
                                    <button type="button" className="btn btn-danger" onClick={cancelFilter}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                    <button type="button" className="btn btn-secondary" onClick={calldownload}> <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i> Export</button>
                                    <button type="button" className="btn btn-primary" onClick={handlePrint}>
                                        <i className="bx bx-printer label-icon font-size-16 align-middle me-2"></i> Print
                                    </button>

                                    <button type="button" className="btn btn-success" onClick={dAddOrder}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
                                </div>
                            </div>
                        </Card>
                        <Col lg="12">
                            <Card >
                                <DataTable value={salesOrder} paginator showGridlines rows={10} loading={loading} dataKey="SO_ID"
                                    filters={filters} globalFilterFields={['customername', 'SO_ID', 'SO_Number', 'Status']} header={header}
                                    emptyMessage="No order found." onFilter={(e) => setFilters(e.filters)} className='blue-bg' sortField="ReqDate" sortOrder={-1} >
                                    <Column field="SO_Number" header="System Seq. No." filter filterPlaceholder="Search by System Seq. No." style={{ width: '155px' }} className="text-center" />
                                    <Column field="SO_Date" header="SO Date" filter className="text-center" filterPlaceholder="Search by SO Date" />
                                    {/* <Column field="customername" header="Customer Name" filter filterPlaceholder="Search by customer name" className="text-left" /> */}

                                    <Column field="customername" header="Customer Name" filter filterPlaceholder="Search by customer name"
                                        body={CustomerBodyTemplate}
                                        className="text-left" />

                                    {/* <Column field="createdby" header="Created by / Date" filter filterPlaceholder="Search by Created by / Date" className="text-left" body={createdBodyTemplate}/> */}
                                    {/* <Column field="Modifiedby" header="Modified by / Date" filter filterPlaceholder="Search by Modified by / Date" className="text-left" body={modifiedBodyTemplate}/>  */}
                                    <Column field="Qty" header="Qty" filter filterPlaceholder="Search by Qty" bodyClassName="text-end" body={(rowData) => formatNumber(rowData.Qty)} />
                                    <Column
                                        field="OrderBy"
                                        header="Ordered By"
                                        filter
                                        filterPlaceholder="Search by Ordered By"
                                        className="text-left"
                                        body={(rowData) => {
                                            const value = rowData.OrderBy;
                                            return (typeof value === 'string' && value.trim().toLowerCase() === 'string') || value.trim() === ''
                                                ? ''
                                                : value;
                                        }}
                                    />
                                    <Column field="POnumber" header="PO No." filter filterPlaceholder="Search by PO No." className="text-left" />
                                    <Column field="Status" header="Status" filterMenuStyle={{ width: '14rem' }} body={statusBodyTemplate} filter filterElement={statusFilterTemplate} className="text-center" />
                                    <Column field="SO_Number" header="Action" showFilterMatchModes={false} body={actionBodyTemplate} className="text-center" />
                                    <Column field="SO_ID" header="Print" showFilterMatchModes={false}
                                        body={(rowData) => <PrintColumn soId={rowData.SO_ID} />}
                                        className="text-center" />


                                </DataTable>
                                <div ref={printRef} style={{ display: 'none' }} id="printableArea">
                                    <h4>Sales Order List</h4>
                                    <table border="1" cellPadding="8" cellSpacing="0" width="100%">
                                        <thead>

                                            <tr>
                                                <th>System Seq. No.</th>
                                                <th>SO Date</th>
                                                <th>Customer Name</th>
                                                <th>Gas Code</th>
                                                <th>Gas Description</th>
                                                <th>Qty</th>
                                                <th>Delivery Address</th>
                                                <th>Delivery Instruction</th>
                                                <th>Delivery Req Date</th>
                                                <th>Ordered By</th>
                                                <th>PO No.</th>
                                                <th>SQ No.</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesOrder && salesOrder.map((order, idx) => (
                                                <tr key={idx}>
                                                    <td>{order.SO_Number}</td>
                                                    <td>{order.SO_Date}</td>
                                                    <td>{order.customername}</td>
                                                    <td>{order.GasCode}</td>
                                                    <td>{order.GasDescription}</td>
                                                    <td className="text-end">{formatNumber(order.qty)}</td>
                                                    <td>{order.DeliveryAddress}</td>
                                                    <td>{order.DeliveryInstruction}</td>
                                                    <td>{order.DeliveryReqDate}</td>
                                                    <td>{order.OrderBy}</td>
                                                    <td>{order.POnumber}</td>
                                                    <td>{order.SQ_No}</td>
                                                    <td>{order.Status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>


            <Modal
                isOpen={isModalOpen}
                role="dialog"
                autoFocus
                centered
                toggle={toggleModal}
                size="xl"
                className="exampleModal"
            >
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal}>SO Delivery Details</ModalHeader>
                    <ModalBody>
                        <div className="table-responsive">
                            <Table className="table align-middle table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-center">SO</th>
                                        <th className="text-center">PO No.</th>
                                        <th className="text-center">Gas Name</th>
                                        <th className="text-center">SO Qty</th>
                                        <th className="text-center">Delivered Qty</th>
                                        <th className="text-center">Bal Qty</th>
                                        <th className="text-center">Delivery Date</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {Gasdeliverydetails.length > 0 ? (
                                        Gasdeliverydetails.map((item, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{item.SO_Number}</td>
                                                <td className="text-center"> {item.PONumber}</td>
                                                <td className="text-center"> {item.GasCode}</td>
                                                <td className="text-center"> {formatNumber(item.SO_Qty)}</td>
                                                <td className="text-center"> {formatNumber(item.so_issued_qty)}</td>

                                                <td className="text-center"> {formatNumber(item.bal_to_issue)}</td>
                                                <td className="text-center">{item.ReqDeliveryDate}</td>

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </div>
            </Modal>
        </React.Fragment>
    )
}
export default ManageOrders
