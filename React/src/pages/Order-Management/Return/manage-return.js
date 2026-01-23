import React, { useState, useEffect, useRef } from "react";
import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, Label, FormGroup, Input, InputGroup, UncontrolledAlert } from "reactstrap";
import { Tooltip } from "reactstrap";
import { useHistory } from "react-router-dom";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "flatpickr/dist/themes/material_blue.css"
import Flatpickr from "react-flatpickr";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { fetchGasList, GetCustomer } from "common/data/mastersapi";
import { searchReturnOrders } from "common/data/invoiceapi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ManageReturn = () => {
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const [customerSelect, setCustomerSelect] = useState([]);
    const history = useHistory();
    const [quotes, setquotes] = useState(null);
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [tooltipOpen, setTooltipOpen] = useState({});
    const [CustomerList, setCustomerList] = useState([]);
    const [gasCodeList, setGasCodeList] = useState([]);
    const [errormsg, setErrormsg] = useState("");
    const toggleTooltip = (id) => {
        setTooltipOpen((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const currentYear = new Date().getFullYear();
    const formatDate = (date) => date.toISOString().split('T')[0];
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const [isseacrch, setIsseacrch] = useState(false);
    const [searchFilter, setSearchFilter] = useState({
        Customer: '',
        GasCode: '',
        FromDate: formatDate(sevenDaysAgo),
        ToDate: formatDate(new Date()),
        BranchId: 1
    });
    const searchFilterRef = useRef(searchFilter);
    const [statuses] = useState([
        { label: 'Saved', value: 'Saved' },
        { label: 'Posted', value: 'Posted' },
    ]);

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
    const toggleModal2 = () => {
        setIsModalOpen2(!isModalOpen2);
    };
    useEffect(() => {
        // setquotes([
        //     { RONo: 'RT001', CustomerName: 'Paul', ReturnDate: '03-Jan-2025', DliveryOrderNumber:"DL NO 1, DL NO 2"},
        //     { RONo: 'RT002', CustomerName: 'John', ReturnDate: '23-Feb-2025', DliveryOrderNumber:"DL NO 13, DL NO 2, DL NO 4"},
        //     { RONo: 'RT003', CustomerName: 'Jack', ReturnDate: '28-Jan-2025', DliveryOrderNumber:"DL NO 134, DL NO 2, DL NO 3, DL NO 2"},
        //     { RONo: 'RT004', CustomerName: 'William', ReturnDate: '13-Jan-2025', DliveryOrderNumber:"DL NO 12, DL NO 2, DL NO 5"},
        //     { RONo: 'RT005', CustomerName: 'Jack', ReturnDate: '03-Mar-2025', DliveryOrderNumber:"DL NO 11, DL NO 62, DL NO 6"},
        //     { RONo: 'RT006', CustomerName: 'Willam', ReturnDate: '03-Feb-2025', DliveryOrderNumber:"DL NO 14, DL NO 52, DL NO 7"},
        //     { RONo: 'RT007', CustomerName: 'Willam', ReturnDate: '21-Jan-2025', DliveryOrderNumber:"DL NO 16, DL NO 42, DL NO 8"},
        //     { RONo: 'RT008', CustomerName: 'John', ReturnDate: '18-Feb-2025', DliveryOrderNumber:"DL NO 18, DL NO 22, DL NO 22"},
        //     { RONo: 'RT009', CustomerName: 'John', ReturnDate: '15-Feb-2025', DliveryOrderNumber:"DL NO 12, DL NO 32, DL NO 32"},
        // ]);
        setLoading(false);
        initFilters();
    }, []);

    useEffect(() => {
        const loadCustomerList = async () => {
            const data = await GetCustomer(1, -1);
            setCustomerList(data);
        };
        const loadGasCode = async () => {
            const data = await fetchGasList(1, -1)
            setGasCodeList(data)
        }
        loadCustomerList();
        loadGasCode();
        searchReturnOrderList();
        initFilters();
    }, []);

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters({
            ...filters,
            global: { value, matchMode: FilterMatchMode.CONTAINS },
        });
        setGlobalFilterValue(value);
    };

    const initFilters = () => {
        setFilters({
            RtndNo: { value: null, matchMode: FilterMatchMode.CONTAINS },
            customername: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            RtnDate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
            DONumber: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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

    const actionBodyTemplate = (rowData) => {
        if (rowData.Status != "Posted") {
            return (
                <div className="actions">
                    <span style={{ marginRight: '0.5rem' }} title="Edit" onClick={() => editRow(rowData)} >
                        <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
                    </span>
                </div>)
        }
    };

    const statusBodyTemplate = (rowData) => {
        const statusShort = rowData.Status === "Saved" ? "S" : rowData.Status === "Posted" ? "P" : rowData.Status;
        return <Tag value={statusShort} severity={getSeverity(rowData.Status)} />;
    };

    const statusFilterTemplate = (options) => {
        return <Dropdown value={options.value} options={statuses} onChange={(e) => options.filterCallback(e.value, options.index)} itemTemplate={statusItemTemplate} placeholder="Select One" className="p-column-filter" showClear />;
    };

    const statusItemTemplate = (option) => {
        return <Tag value={option.label} severity={getSeverity(option.value)} />;
    };

    useEffect(() => {
        setFilters(prevFilters => ({
            ...prevFilters,
            'Status': { value: null, matchMode: FilterMatchMode.EQUALS }
        }));
    }, []);
    const header = renderHeader();

    const editRow = (rowData) => {
        history.push("/edit-return-order/" + rowData.Rtn_ID);
    };

    const handleAddpk = () => {
        history.push("/add-return-order");
    };

    // Keep ref in sync with state
    useEffect(() => {
        searchFilterRef.current = searchFilter;
    }, [searchFilter]);

    // For Customer changes
    const handleCustomerChange = (option) => {
        const customerId = option ? option.value : "";
        setSearchFilter(prevState => {
            const updated = {
                ...prevState,
                Customer: customerId
            };
            searchFilterRef.current = updated;
            return updated;
        });
    };

    // For Date changes
    const handleDateChange = (selectedDates, dateStr, instance) => {
        const fieldName = instance.element.getAttribute("id");

        if (selectedDates.length > 0) {
            const localDate = selectedDates[0];
            const yyyy = localDate.getFullYear();
            const mm = String(localDate.getMonth() + 1).padStart(2, "0");
            const dd = String(localDate.getDate()).padStart(2, "0");
            const formatted = `${yyyy}-${mm}-${dd}`;

            setSearchFilter(prevState => {
                const updated = {
                    ...prevState,
                    [fieldName]: formatted,
                };
                searchFilterRef.current = updated;
                return updated;
            });
        }
    };

    // Helper function to parse date string to Date object for comparison
    const parseDate = (dateString) => {
        if (!dateString) return null;
        
        try {
            // Handle different date formats
            // Format 1: YYYY-MM-DD (e.g., "2025-01-03")
            // Format 2: DD-MMM-YYYY (e.g., "03-Jan-2025")
            // Format 3: Other formats
            
            const parts = dateString.split('-');
            if (parts.length === 3) {
                // If first part is 4 digits, it's YYYY-MM-DD
                if (parts[0].length === 4) {
                    return new Date(dateString);
                }
                // If first part is 2 digits, it might be DD-MMM-YYYY
                if (parts[0].length === 2) {
                    // Try to parse DD-MMM-YYYY format
                    const day = parseInt(parts[0], 10);
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const monthIndex = monthNames.indexOf(parts[1]);
                    const year = parseInt(parts[2], 10);
                    
                    if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
                        return new Date(year, monthIndex, day);
                    }
                    // Fallback to Date constructor
                    return new Date(dateString);
                }
            }
            
            // Try standard Date parsing
            const parsed = new Date(dateString);
            if (isNaN(parsed.getTime())) {
                return null;
            }
            return parsed;
        } catch (error) {
            console.error('Error parsing date:', dateString, error);
            return null;
        }
    };

    // Filter records by Return Date (RtnDate) between FromDate and ToDate (inclusive)
    const filterByReturnDate = (data, fromDate, toDate) => {
        if (!fromDate || !toDate || !data || !Array.isArray(data)) return data;
        
        const from = parseDate(fromDate);
        const to = parseDate(toDate);
        
        if (!from || !to) return data;
        
        // Set time to start of day for fromDate
        from.setHours(0, 0, 0, 0);
        
        // Set time to end of day for toDate to include all records on that day
        to.setHours(23, 59, 59, 999);
        
        return data.filter(item => {
            if (!item.RtnDate) return false;
            
            const returnDate = parseDate(item.RtnDate);
            if (!returnDate) return false;
            
            // Reset time to start of day for comparison
            returnDate.setHours(0, 0, 0, 0);
            
            // Check if Return Date is between or equal to FromDate and ToDate (inclusive)
            return returnDate >= from && returnDate <= to;
        });
    };

    const searchReturnOrderList = async (filterData = null) => {
        // Use provided filterData, ref (latest state), or fallback to state
        const currentFilter = filterData || searchFilterRef.current || searchFilter;
        
        setErrormsg("");
        
        // Validate dates
        if (!currentFilter.FromDate || !currentFilter.ToDate) {
            setErrormsg("Please select both From and To dates.");
            return;
        }
        
        if (currentFilter.FromDate > currentFilter.ToDate) {
            setErrormsg("To date should not be earlier than From date.");
            return;
        }
        
        setLoading(true);
        try {
            const response = await searchReturnOrders(currentFilter);
            if (response?.status) {
                let filteredData = response?.data || [];
                
                // Apply client-side filtering based on Return Date
                filteredData = filterByReturnDate(
                    filteredData,
                    currentFilter.FromDate,
                    currentFilter.ToDate
                );
                
                setquotes(filteredData);
            } else {
                console.log("Failed to fetch production orders");
                setquotes([]);
            }
        } catch (err) {
            console.log('err > ', err);
            setquotes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        // Always use the latest filter values from ref
        searchReturnOrderList(searchFilterRef.current);
    };

    const cancelFilter = async () => {
        const resetFilter = {
            Customer: '',
            GasCode: '',
            FromDate: formatDate(sevenDaysAgo),
            ToDate: formatDate(new Date()),
            BranchId: 1
        };
        setSearchFilter(resetFilter);
        searchFilterRef.current = resetFilter; // Update ref immediately
        document.getElementById("FromDate")._flatpickr.setDate(resetFilter.FromDate, false);
        document.getElementById("ToDate")._flatpickr.setDate(resetFilter.ToDate, false);
        setIsseacrch(!isseacrch);
    };
    useEffect(() => { searchReturnOrderList(); }, [isseacrch]);

    const exportToExcel = () => {
        const exportData = quotes.map((item) => ({
            "Return Order No.": item.RtndNo,
            "Return Date": item.RtnDate,
            "Customer": item.customername,
            "DO No.": item.DONumber,
            "Status": item.Status
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Returns");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const now = new Date();
        const year = now.getFullYear();
        const month = now.toLocaleString('en-US', { month: 'short' }).toLowerCase(); // "mar"
        const day = now.getDate();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        const fileName = `Return-Order-List-${year}-${month}-${day}-${hours}-${minutes}-${ampm}.xlsx`;
        saveAs(data, fileName);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Sales" breadcrumbItem="Return Order" />
                    {errormsg && (
                        <UncontrolledAlert color="danger">
                            {errormsg}
                        </UncontrolledAlert>
                    )}
                    <Row>
                        <Card className="search-top mb-2">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-3 mt-1">
                                    <div className="align-items-center gap-2">
                                        {/* <div className="col-12 col-lg-12 col-md-4 col-sm-4">
                                            <label htmlFor="CustomerName" className="form-label mb-0">Customer</label>
                                        </div> */}
                                        <div className="col-12 col-lg-12 col-md-8 col-sm-8">
                                            {/* <input id="CustomerName" type="text" className="form-control" /> */}
                                            <Select
                                                name="Customerid"
                                                id="Customerid"
                                                options={CustomerList}
                                                value={CustomerList.find(option => option.value === searchFilter.Customer) || null}
                                                classNamePrefix="select"
                                                isDisabled={isDisabled}
                                                isLoading={isLoading}
                                                isClearable={isClearable}
                                                isRtl={isRtl}
                                                isSearchable={isSearchable}
                                                placeholder="Select Customer"
                                                onChange={handleCustomerChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="col-12 col-lg-2 mt-1"> */}
                                {/* <div className="d-flex align-items-center gap-2"> */}
                                {/* <div className="col-12 col-lg-12 col-md-4 col-sm-4 text-center">
                                            <label htmlFor="Gascode" className="form-label mb-0">Gas Code</label>
                                        </div> */}
                                {/* <div className="col-12 col-lg-12 col-md-8 col-sm-8"> */}
                                {/* <input id="Gascode" type="text" className="form-control" /> */}
                                {/* <Select
                                                name="Gascode"
                                                id="Gascode"
                                                options={gasCodeList}
                                                value={gasCodeList.find(option => option.value === searchFilter.GasCode) || null}
                                                classNamePrefix="select"
                                                isDisabled={isDisabled}
                                                isLoading={isLoading}
                                                isClearable={isClearable}
                                                isRtl={isRtl}
                                                isSearchable={isSearchable}
                                                placeholder="Select Gas Code"
                                                onChange={(selected) => handleSelectChange("GasCode", selected)}
                                            />
                                        </div> */}
                                {/* </div> */}
                                {/* </div> */}
                                <div className="col-12 col-lg-2 mt-1">
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
                                                            dateFormat: "Y-m-d" 
                                                        }} 
                                                        value={searchFilter.FromDate}
                                                        onChange={handleDateChange}
                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-3 mt-1">
                                    <div className="d-flex align-items-center gap-1">
                                        <div className="col-12 col-lg-2 col-md-4 col-sm-4 text-center">
                                            <label htmlFor="toDate" className="form-label mb-0">To</label>
                                        </div>
                                        <div className="col-12 col-lg-6 col-md-8 col-sm-8">
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
                                                            dateFormat: "Y-m-d"
                                                        }} 
                                                        value={searchFilter.ToDate}
                                                        onChange={handleDateChange}
                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-4 text-end button-items">
                                    <button type="button" className="btn btn-info" onClick={handleSearch}>
                                        <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i>Search
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={cancelFilter}>
                                        <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={exportToExcel}>
                                        <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i> Export
                                    </button>
                                    <button type="button" className="btn btn-success" onClick={handleAddpk}>
                                        <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New
                                    </button>
                                </div>
                            </div>
                        </Card>
                        <Col lg="12">
                            <Card >
                                <DataTable value={quotes} paginator showGridlines rows={10} loading={loading} dataKey="Rtn_ID" filters={filters} globalFilterFields={['RtndNo', 'RtnDate', 'customername', 'DONumber']} header={header} emptyMessage="No order found." onFilter={(e) => setFilters(e.filters)} className='blue-bg' sortField="Rtn_ID" sortOrder={-1}>
                                    <Column field="RtndNo" header="Return Order No." filter filterPlaceholder="Search by System Seq. No." style={{ width: "15%" }} />
                                    <Column field="RtnDate" header="Return Date" filter filterPlaceholder="Search by date" className="text-left" style={{ width: "12%" }} />
                                    <Column field="customername" header="Customer" filter filterPlaceholder="Search by customer" />
                                    <Column field="DONumber" header="DO No." filter filterPlaceholder="Search by name" />
                                    <Column field="Status" header="Status" body={statusBodyTemplate} filter filterElement={statusFilterTemplate} className="text-center"  />
                                    <Column field="Rtn_ID" header="Action" showFilterMatchModes={false} body={actionBodyTemplate} className="text-center" />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}
export default ManageReturn
