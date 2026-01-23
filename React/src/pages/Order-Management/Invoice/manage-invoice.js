import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Label,
  FormGroup,
  InputGroup,
  UncontrolledAlert
} from "reactstrap";
import { useHistory } from "react-router-dom";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import * as Yup from "yup";
import Select from "react-select";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import { GetCustomer } from "../../../common/data/mastersapi";
import { GetALLInvoices } from "../../../common/data/invoiceapi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useRef } from "react";
import { use } from "react";

const ManageInvocie = () => {
  const history = useHistory();
  const [invoiceList, setInvoiceList] = useState(null);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [errormsg, setErrormsg] = useState();
  const currentYear = new Date().getFullYear();
  const formatDate = date => date.toISOString().split("T")[0];
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const [invoiceFilter, setInvoiceFilter] = useState({
    customerid: 0,
    FromDate: formatDate(sevenDaysAgo),
    ToDate: formatDate(new Date()),
    BranchId: 1,
  });
  const [isseacrch, setIsseacrch] = useState(false);
  const [CustomerList, setCustomerList] = useState([]);
  const invoiceFilterRef = useRef(invoiceFilter);
  const [statuses] = useState([
    { label: "Unqualified", value: "unqualified" },
    { label: "Qualified", value: "qualified" },
    { label: "New", value: "new" },
    { label: "Negotiation", value: "negotiation" },
    { label: "Renewal", value: "renewal" },
    { label: "Proposal", value: "proposal" },
  ]);
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
      case "negotiation":
        return "warning";
      case "renewal":
        return null;
    }
  };

  useEffect(() => {
    setLoading(false);
    initFilters();
  }, []);

  const clearFilter = () => {
    initFilters();
  };

  const onGlobalFilterChange = e => {
    const value = e.target.value;
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
    setGlobalFilterValue(value);
  };

  const initFilters = () => {
    setFilters({
      InvoiceNbr: { value: null, matchMode: FilterMatchMode.CONTAINS },
      CustomerName: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      Salesinvoicesdate: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      DONO: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      TotalAmount: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      Status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
    });
    setGlobalFilterValue("");
  };

  const renderHeader = () => {
    return (
      <div className="row align-items-center g-3 clear-spa">
        <div className="col-12 col-lg-6">
          <Button className="btn btn-danger btn-label" onClick={clearFilter}>
            <i className="mdi mdi-filter-off label-icon" /> Clear
          </Button>
        </div>
        <div className="col-12 col-lg-3 text-end">
          {/* <span className="me-4"><Tag value="S" severity={getSeverity("Saved")} /> Saved</span> */}
          <span className="me-1">
            <Tag value="P" severity={getSeverity("Posted")} /> Posted
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
  };

  const header = renderHeader();
  const linkAddinvoice = () => {
    history.push("/add-invoice");
  };

  // Keep ref in sync with state
  useEffect(() => {
    invoiceFilterRef.current = invoiceFilter;
  }, [invoiceFilter]);

  useEffect(() => {
    const loadCustomerList = async () => {
      const data = await GetCustomer(1, 0);
      setCustomerList(data);
    };
    loadCustomerList();
    GetALLInvoiceList();
    initFilters();
  }, []);

  const handleDateChange = (selectedDates, dateStr, instance) => {
    const fieldName = instance.element.getAttribute("id");

    if (selectedDates.length > 0) {
      const localDate = selectedDates[0];
      const yyyy = localDate.getFullYear();
      const mm = String(localDate.getMonth() + 1).padStart(2, "0");
      const dd = String(localDate.getDate()).padStart(2, "0");
      const formatted = `${yyyy}-${mm}-${dd}`;

      setInvoiceFilter(prevState => {
        const updated = {
          ...prevState,
          [fieldName]: formatted,
        };
        invoiceFilterRef.current = updated;
        return updated;
      });
    }
  };

  const GetALLInvoiceList = async (filterData = null) => {
    // Use provided filterData, ref (latest state), or fallback to state
    const currentFilter = filterData || invoiceFilterRef.current || invoiceFilter;
    
    setErrormsg("");
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
      const response = await GetALLInvoices(
        currentFilter.customerid || 0,
        currentFilter.FromDate,
        currentFilter.ToDate,
        currentFilter.BranchId || 1,
        0
      );
      if (response?.status) {
        setInvoiceList(response?.data || []);
      } else {
        console.log("Failed to fetch production orders");
      }
    } catch (err) {
      console.log("err > ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = option => {
    const customerId = option ? option.value : 0;
    setInvoiceFilter(prevState => {
      const updated = {
        ...prevState, 
        customerid: customerId 
      };
      invoiceFilterRef.current = updated;
      return updated;
    });
  };

  const handleSearch = () => {
    // Always use the latest filter values from ref
    GetALLInvoiceList(invoiceFilterRef.current);
  };

  const actionTotalTemplate = (rowData, index) => {
    return (
      <div className="actions">
        {rowData.TotalAmount > 0 && (
          <span className="text-end">
            {new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(rowData.TotalAmount || 0)}
          </span>
        )}
      </div>
    );
  };

  const statusBodyTemplate = rowData => {
    const statusShort =
      rowData.Status === "Saved"
        ? "S"
        : rowData.Status === "Posted"
          ? "P"
          : rowData.Status;
    return <Tag value={statusShort} severity={getSeverity(rowData.Status)} />;
  };
  const statusFilterTemplate = options => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={e => options.filterCallback(e.value, options.index)}
        itemTemplate={statusItemTemplate}
        placeholder="Select One"
        className="p-column-filter"
        showClear
      />
    );
  };
  const statusItemTemplate = option => {
    return <Tag value={option.label} severity={getSeverity(option.value)} />;
  };


  const cancelFilter = async () => {
    const resetFilter = {
      customerid: 0,
      FromDate: formatDate(sevenDaysAgo),
      ToDate: formatDate(new Date()),
      BranchId: 1,
    };
    invoiceFilterRef.current = resetFilter;
    setInvoiceFilter(resetFilter);
    document
      .getElementById("FromDate")
      ._flatpickr.setDate(resetFilter.FromDate, false);
    document
      .getElementById("ToDate")
      ._flatpickr.setDate(resetFilter.ToDate, false);
    setIsseacrch(!isseacrch);
  };
  useEffect(() => {
    GetALLInvoiceList();
  }, [isseacrch]);

  const exportToExcel = () => {
    const filteredQuotes = invoiceList.map(({ IsPosted, ...rest }) => rest);
    const exportData = invoiceList.map(item => ({
      "Invoice No.": item.InvoiceNbr,
      "Invoice Date": item.Salesinvoicesdate,
      Customer: item.CustomerName,
      "DO No.": item.DONO,
      "Total Amount": item.TotalAmount,
      Status: item.Status,
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
    const fileName = `Sales-Invoice-List-${year}-${month}-${day}-${hours}-${minutes}-${ampm}.xlsx`;
    saveAs(data, fileName);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Sales" breadcrumbItem="Sales Invoice" />
          <Row>
            {errormsg && (
              <UncontrolledAlert color="danger">
                {errormsg}
              </UncontrolledAlert>
            )}
            <Card className="search-top mb-2">
              <div className="row align-items-center g-1 quotation-mid">
                <div className="col-12 col-lg-4 mt-1">
                  <div className="d-flex align-items-center gap-2">
                    <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                      <label htmlFor="SO_ID" className="form-label mb-0">
                        Customer
                      </label>
                    </div>
                    <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                      <Select
                        name="Customerid"
                        id="Customerid"
                        options={CustomerList}
                        value={
                          CustomerList.find(
                            option => option.value === invoiceFilter.customerid
                          ) || null
                        }
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
                <div className="col-12 col-lg-2 mt-1">
                  <div className="d-flex align-items-center gap-2">
                    <div className="col-12 col-lg-3 col-md-4 col-sm-4 text-center">
                      <label htmlFor="fromDate" className="form-label mb-0">
                        From
                      </label>
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
                            value={invoiceFilter.FromDate}
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
                      <label htmlFor="toDate" className="form-label mb-0">
                        To
                      </label>
                    </div>
                    <div className="col-12 col-lg-9 col-md-8 col-sm-8">
                      <FormGroup>
                        <Label></Label>
                        <InputGroup>
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
                              value={invoiceFilter.ToDate}
                              onChange={handleDateChange}
                            />
                          </InputGroup>
                        </InputGroup>
                      </FormGroup>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-4 text-end button-items">
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={handleSearch}
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
                    onClick={exportToExcel}
                  >
                    <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i>{" "}
                    Export
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={linkAddinvoice}
                  >
                    <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>
                    New
                  </button>
                </div>
              </div>
            </Card>
            <Col lg="12">
              <Card>
                <DataTable
                  value={invoiceList}
                  paginator
                  showGridlines
                  rows={10}
                  loading={loading}
                  dataKey="InvoiceId"
                  filters={filters}
                  globalFilterFields={[
                    "InvoiceNbr",
                    "CustomerName",
                    "Salesinvoicesdate",
                    "DONO",
                    "TotalAmount",
                  ]}
                  header={header}
                  emptyMessage="No order found."
                  onFilter={e => setFilters(e.filters)}
                  className="blue-bg"
                  sortField="InvoiceId"
                  sortOrder={-1}
                >
                  <Column
                    field="InvoiceNbr"
                    header="Invoice No."
                    filter
                    filterPlaceholder="Search by Invoice Seq. No."
                  />
                  <Column
                    field="Salesinvoicesdate"
                    header="Invoice Date"
                    filter
                    filterPlaceholder="Search by date"
                    className="text-left"
                  />
                  <Column
                    field="CustomerName"
                    header="Customer"
                    filter
                    filterPlaceholder="Search by Customer"
                  />
                  <Column
                    field="DONO"
                    header="DO No."
                    filter
                    filterPlaceholder="Search by DO"
                  />
                  <Column
                    field="TotalAmount"
                    header="Total Amount (IDR)"
                    filter
                    filterPlaceholder="Search by date"
                    body={actionTotalTemplate}
                    className="text-end"
                  />
                  <Column
                    field="Status"
                    header="Status"
                    filterMenuStyle={{ width: "14rem" }}
                    body={statusBodyTemplate}
                    className="text-center"
                  />
                </DataTable>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
export default ManageInvocie;
