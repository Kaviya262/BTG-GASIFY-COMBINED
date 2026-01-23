import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, Label, FormGroup, Input, InputGroup } from "reactstrap";
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
import {
    GetAllProductionOrders,
    getProductionNo
} from "../../../common/data/mastersapi";
import { AutoComplete } from "primereact/autocomplete";
import * as XLSX from "xlsx";
const ProductOrder = () => {
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const history = useHistory();
    const [quotes, setquotes] = useState(null);
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [tooltipOpen, setTooltipOpen] = useState({});
    const toggleTooltip = (id) => {
        setTooltipOpen((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const currentDate = new Date();
    const currentYear = new Date().getFullYear();
    const formatDate = (date) => date.toISOString().split('T')[0];
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const [quotefilter, setQuoteFilter] = useState({
        // SQID: 0,
        ProdId: "%",
        FromDate: formatDate(sevenDaysAgo), // January 1st of current year
        ToDate: formatDate(new Date()),
        BranchId: 1
    });
    const [productionOptions, setProductionOptions] = useState([]);
    const [selectedProductionNo, setSelectedProductionNo] = useState("");
    const [statuses] = useState([
        { label: 'Unqualified', value: 'unqualified' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'New', value: 'new' },
        { label: 'Negotiation', value: 'negotiation' },
        { label: 'Renewal', value: 'renewal' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Posted', value: 'posted' },
        { label: 'Saved', value: 'saved' }
    ]);
    const [isseacrch, setIsseacrch] = useState(false);
    const getSeverity = (Status) => {
        if (!Status) return null; // Prevent errors if Status is undefined
        switch (Status.toLowerCase()) {
            case 'unqualified':
            case 'saved':
                return 'danger';
            case 'qualified':
            case 'posted':
                return 'success';
            case 'new':
                return 'info';
            case 'negotiation':
                return 'warning';
            case 'renewal':
                return null;
            default:
                return null;
        }
    };

    useEffect(() => {
        fetchProductionNumbers();
        //fetchProductionOrders();
    }, []);

    const fetchProductionNumbers = async (searchText) => {
        setIsLoading(true);
        try {
            const response = await getProductionNo({
                SearchText: searchText || "%", // Use '%' as wildcard for search
                BranchId: 1
            });

            if (response?.status && response?.data?.length) {
                const options = response.data.map((order) => ({
                    label: order.prodno,
                    value: order.Prod_ID // Using Prod_ID as unique identifier
                }));
                setProductionOptions(options);
            } else {
                setProductionOptions([]);
            }
        } catch (err) {
            console.error("Error fetching production numbers:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setLoading(false);
        initFilters();
    }, []);

    const fetchProductionOrders = async () => {
        try {
            const updatedFilter = {
                ...quotefilter,
                ProdId: selectedProductionNo?.value || 0
            };

            const response = await GetAllProductionOrders(updatedFilter);
            // const response = await GetAllProductionOrders(quotefilter);
            if (response?.status) {
                setquotes(response?.data || []);
            } else {
                console.log("Failed to fetch production orders");
            }
        } catch (err) {
            console.log('err > ', err)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            ProdNo: { value: null, matchMode: FilterMatchMode.CONTAINS },
            ProdDate: { value: null, matchMode: FilterMatchMode.CONTAINS },
            TypeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
            GasCode: { value: null, matchMode: FilterMatchMode.CONTAINS },
            createdby: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Modifiedby: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Status: { value: null, matchMode: FilterMatchMode.EQUALS }
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

    const handleDateChange = (selectedDates, dateStr, instance) => {
        const fieldName = instance.element.getAttribute("id");
        const newDate = dateStr;
        setQuoteFilter(prevState => {
            let updatedFilter = { ...prevState, [fieldName]: newDate };
            if (updatedFilter.FromDate && updatedFilter.ToDate && updatedFilter.FromDate > updatedFilter.ToDate) {
                c
                return prevState;
            }
            return updatedFilter;
        });
    };

    const header = renderHeader();

    const handleAddpk = () => {
        history.push("/add-production-order");
    };

    const editRow = (rowData) => {
        history.push(`/update-production-order/${rowData.prod_id}`);
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
                        <span>-</span>
                    )}
                </div>
            </div>
        );
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
                        <span>-</span>
                    )}
                </div>
            </div>
        );
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

    const exportToExcel = () => {
        const exportData = quotes.map((item) => ({
            "PRD No.": item.ProdNo,
            "PO Date": item.ProdDate,
            "Gas Type": item.TypeName,
            "Gas Code": item.GasCode,
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
        const fileName = `Production-Order-List-${year}-${month}-${day}-${hours}-${minutes}-${ampm}.xlsx`;
        saveAs(data, fileName);
    };

    const cancelFilter = async () => {

        const resetFilter = {
            ProdId: "%",
            FromDate: formatDate(sevenDaysAgo),
            ToDate: formatDate(new Date()),
            BranchId: 1
        };
        setQuoteFilter(resetFilter);
        document.getElementById("FromDate")._flatpickr.setDate(resetFilter.FromDate, false);
        document.getElementById("ToDate")._flatpickr.setDate(resetFilter.ToDate, false);
        setIsseacrch(!isseacrch);
        setSelectedProductionNo(null);
    };
    useEffect(() => { fetchProductionOrders() }, [isseacrch]);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Sales" breadcrumbItem="Production Order" />
                    <Row>
                        <Card className="search-top mb-2">
                            <div className="row align-items-center g-1 quotation-mid">
                                <div className="col-12 col-lg-4 mt-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-12 col-lg-3 col-md-3 col-sm-4 text-center">
                                            <label htmlFor="ProductionNo" className="form-label mb-0">PRD No.</label>
                                        </div>
                                        <div className="col-12 col-lg-9 col-md-9 col-sm-8">
                                            {/* <AutoComplete
                                        value={selectedProductionNo}
                                        suggestions={productionOptions}
                                        completeMethod={(e) => fetchProductionNumbers(e.query)}
                                        field="label" // Display label
                                        onChange={(e) =>  setSelectedProductionNo(e.value)}
                                        placeholder="Search Production No..."
                                        dropdown
                                        style={{
                                            width: "100%", // Full width
                                            borderRadius: "5px",
                                            border: "1px solid #ccc",
                                            fontSize: "14px"
                                        }}
                                    /> */}
                                            <Select
                                                className="basic-single"
                                                classNamePrefix="select"
                                                isDisabled={isDisabled}
                                                isLoading={isLoading}
                                                isClearable={isClearable}
                                                isRtl={isRtl}
                                                isSearchable={isSearchable}
                                                name="Gascode"
                                                // options={CodeList}
                                                options={productionOptions}
                                                value={selectedProductionNo}
                                                onChange={setSelectedProductionNo}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-2 mt-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-12 col-lg-3 col-md-4 col-sm-4 text-center">
                                            <label htmlFor="fromDate" className="form-label mb-0">From</label>
                                        </div>
                                        <div className="col-12 col-lg-9 col-md-8 col-sm-8">
                                            <FormGroup>
                                                <Label></Label>
                                                <InputGroup>
                                                    <Flatpickr name="FromDate" id="FromDate" className="form-control d-block" placeholder="dd-mm-yyyy" options={{ altInput: true, altFormat: "d-M-Y", dateFormat: "Y-m-d", defaultDate: quotefilter.FromDate }} onChange={handleDateChange} />
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
                                                    <Flatpickr name="ToDate" id="ToDate" className="form-control d-block" placeholder="dd-mm-yyyy" options={{
                                                        altInput: true,
                                                        altFormat: "d-M-Y",
                                                        dateFormat: "Y-m-d", defaultDate: quotefilter.ToDate
                                                    }} onChange={handleDateChange} />
                                                </InputGroup>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-4 text-end button-items">
                                    <button type="button" className="btn btn-info" onClick={fetchProductionOrders}>
                                        <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2" ></i>Search
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={cancelFilter} >
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
                                <DataTable
                                    value={quotes}
                                    paginator
                                    showGridlines
                                    rows={10}
                                    loading={loading}
                                    dataKey="prod_id"
                                    filters={filters}
                                    globalFilterFields={['ProdNo', 'ProdDate', 'TypeName', 'GasCode', 'createdby', 'Modifiedby', 'Status']}
                                    header={header}
                                    emptyMessage="No order found."
                                    onFilter={(e) => setFilters(e.filters)}
                                    className='blue-bg'
                                    sortField="prod_id" sortOrder={-1}
                                >
                                    <Column field="ProdNo" header="PRD No." filter filterPlaceholder="Search by PRD No." style={{ width: "15%" }} />
                                    <Column field="ProdDate" header="PO Date" filter filterPlaceholder="Search by date" className="text-left" style={{ width: "12%" }} />
                                    <Column field="TypeName" header="Gas Type" filter filterPlaceholder="Search by GasType." />
                                    <Column field="GasCode" header="Gas Code" filter filterPlaceholder="Search by Gas Code" />
                                    {/* <Column field="createdby" header="Created by / Date" 
                                        filter filterPlaceholder="Search by Created by / Date" 
                                        className="text-left" body={createdBodyTemplate}/> */}

                                    {/* <Column field="Modifiedby" header="Modified by / Date" 
                                        filter filterPlaceholder="Search by Modified by / Date" 
                                        className="text-left" body={modifiedBodyTemplate}/> */}
                                    <Column field="Status" header="Status" filterMenuStyle={{ width: '14rem' }} body={statusBodyTemplate} filter filterElement={statusFilterTemplate} className="text-center" />
                                    <Column field="Action" header="Action" showFilterMatchModes={false} body={actionBodyTemplate} className="text-center" />
                                </DataTable>

                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}
export default ProductOrder
