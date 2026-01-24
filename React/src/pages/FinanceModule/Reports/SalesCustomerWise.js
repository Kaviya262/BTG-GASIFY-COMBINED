import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Row, Col } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import Select from "react-select"; 
import * as XLSX from "xlsx";       
import { GetSalesDetails, GetItemFilter } from "../../../common/data/invoiceapi";
import { GetCustomerFilter } from "../service/financeapi"; 
import { GetSalesPerson } from "../../../common/data/mastersapi"; 

const SalesCustomerWise = () => {
    const dt = useRef(null);

    const customStyles = {
        menu: (provided) => ({
            ...provided,
            zIndex: 9999 
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 })
    };

    const formatDateToLocal = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatNumber = (value) => {
        if (value === null || value === undefined) return "0.00";
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const today = new Date();
    const [fromDate, setFromDate] = useState(formatDateToLocal(new Date(today.getFullYear(), today.getMonth(), 1)));
    const [toDate, setToDate] = useState(formatDateToLocal(new Date(today.getFullYear(), today.getMonth() + 1, 0)));
    
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [salesPersons, setSalesPersons] = useState([]); 
    const [selectedSalesPerson, setSelectedSalesPerson] = useState(null);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadMasters = async () => {
            try {
                const custRes = await GetCustomerFilter(1, "%");
                setCustomers(custRes);
                
                const itemRes = await GetItemFilter(); 
                setItems(itemRes);

                const spRes = await GetSalesPerson(1, 0, "%");
                setSalesPersons(spRes);

            } catch (error) {
                console.error("Error loading masters:", error);
            }
        };
        loadMasters();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await GetSalesDetails({
                FromDate: fromDate,
                ToDate: toDate,
                customerid: selectedCustomer ? selectedCustomer.value : 0, 
                ItemId: selectedItem ? selectedItem.value : 0, 
                SalesPersonId: selectedSalesPerson ? selectedSalesPerson.value : 0, 
                BranchId: 1
            });
            
            const rawData = response || [];

            const cleanedData = rawData.map((item, index) => {
                let name = item.CustomerName ? String(item.CustomerName) : "Unknown";
                name = name.replace(/\s+/g, ' ').trim(); 
                return {
                    ...item,
                    _rowId: `row_${index}`, 
                    CustomerName: name
                };
            });

            setData(cleanedData);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const formatDateForExcel = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }).replace(/ /g, '-'); 
    };

    const exportExcel = () => {
        if (!data || data.length === 0) return;
        
        const groupedData = data.reduce((groups, item) => {
            const name = item.CustomerName || "Unknown";
            if (!groups[name]) groups[name] = [];
            groups[name].push(item);
            return groups;
        }, {});

        const excelRows = [];
        Object.keys(groupedData).forEach(customer => {
            const items = groupedData[customer];
            
            excelRows.push([customer, "", "", "", "", "", "", "", ""]); 
            
            items.forEach(item => {
                excelRows.push([
                    formatDateForExcel(item.Salesinvoicesdate),
                    item.InvoiceCurrency, 
                    item.InvoiceNo, 
                    item.DONumber || "", // --- ADDED DO Number ---
                    item.ItemName,
                    parseFloat(item.Qty), 
                    parseFloat(item.UnitPrice), 
                    parseFloat(item.OriginalTotal), 
                    parseFloat(item.ConvertedTotal) 
                ]);
            });
            
            const totalQty = items.reduce((sum, i) => sum + (parseFloat(i.Qty) || 0), 0);
            const totalOrig = items.reduce((sum, i) => sum + (parseFloat(i.OriginalTotal) || 0), 0);
            const totalIDR = items.reduce((sum, i) => sum + (parseFloat(i.ConvertedTotal) || 0), 0);
            
            // Adjust footer row spacing to align with columns
            excelRows.push(["Total", "", "", "", "", totalQty, "", totalOrig, totalIDR]);
            
            excelRows.push([]);
        });

        const ws = XLSX.utils.aoa_to_sheet([
            ["Date", "Curr", "Invoice No", "DO No.", "Item Name", "Qty", "Unit Price", "Total", "Total (IDR)"], 
            ...excelRows
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SalesCustomerWise");
        XLSX.writeFile(wb, "SalesCustomerWise.xlsx");
    };

    const headerTemplate = (data) => {
        return (
            <React.Fragment>
                <span className="image-text" style={{ fontWeight: 'bold' }}>{data.CustomerName}</span>
            </React.Fragment>
        );
    };

    const footerTemplate = (data) => {
        return (
            <React.Fragment>
                {/* Updated colSpan to account for the new column */}
                <td colSpan="5" className="text-end fw-bold" style={{ backgroundColor: '#fff9c4' }}>Total</td>
                <td className="text-end fw-bold" style={{ backgroundColor: '#fff9c4' }}>
                    {calculateGroupTotal(data.CustomerName, 'Qty')}
                </td>
                <td style={{ backgroundColor: '#fff9c4' }}></td>
                <td className="text-end fw-bold" style={{ backgroundColor: '#fff9c4' }}>
                    {formatNumber(calculateGroupTotal(data.CustomerName, 'OriginalTotal'))}
                </td>
                <td className="text-end fw-bold" style={{ backgroundColor: '#fff9c4' }}>
                    {formatNumber(calculateGroupTotal(data.CustomerName, 'ConvertedTotal'))}
                </td>
            </React.Fragment>
        );
    };

    const calculateGroupTotal = (name, field) => {
        let total = 0;
        if (data) {
            for (let item of data) {
                if (item.CustomerName === name) {
                    total += parseFloat(item[field] || 0);
                }
            }
        }
        return field === 'Qty' ? parseFloat(total.toFixed(2)) : total;
    };

    const dateBodyTemplate = (rowData) => {
        if (!rowData.Salesinvoicesdate) return "";
        const date = new Date(rowData.Salesinvoicesdate);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        }).replace(/ /g, '-'); 
    };

    return (
        <div className="page-content">
            <Container fluid>
                <h4>Sales Customer Wise</h4>
                <Card className="p-3 mb-3">
                    <Row className="align-items-end">
                        <Col md={2}>
                            <label>Customer</label>
                            <Select
                                styles={customStyles}
                                options={customers}
                                value={selectedCustomer}
                                onChange={setSelectedCustomer}
                                isClearable
                                placeholder="Select Customer"
                            />
                        </Col>
                        <Col md={2}>
                            <label>Item</label>
                            <Select
                                styles={customStyles}
                                options={items}
                                value={selectedItem}
                                onChange={setSelectedItem}
                                isClearable
                                placeholder="Select Item"
                            />
                        </Col>
                        <Col md={2}>
                            <label>Sales Person</label>
                            <Select
                                styles={customStyles}
                                options={salesPersons}
                                value={selectedSalesPerson}
                                onChange={setSelectedSalesPerson}
                                isClearable
                                placeholder="Select SP"
                            />
                        </Col>
                        <Col md={2}>
                            <label>From</label>
                            <Flatpickr
                                className="form-control"
                                value={fromDate}
                                options={{ altInput: true, altFormat: "d-m-Y", dateFormat: "Y-m-d" }}
                                onChange={([d]) => setFromDate(formatDateToLocal(d))}
                            />
                        </Col>
                        <Col md={2}>
                            <label>To</label>
                            <Flatpickr
                                className="form-control"
                                value={toDate}
                                options={{ altInput: true, altFormat: "d-m-Y", dateFormat: "Y-m-d" }}
                                onChange={([d]) => setToDate(formatDateToLocal(d))}
                            />
                        </Col>
                        <Col md={2} className="d-flex gap-2">
                            <button className="btn btn-primary" onClick={fetchData}>
                                <i className="bx bx-search-alt-2"></i>
                            </button>
                            <button className="btn btn-success" onClick={exportExcel}>
                                <i className="bx bx-export me-1"></i> Excel
                            </button>
                        </Col>
                    </Row>
                </Card>
                <Card>
                    <DataTable
                        ref={dt}
                        value={data}
                        loading={loading}
                        scrollable 
                        scrollHeight="800px" 
                        dataKey="_rowId" 
                        rowGroupMode="subheader"
                        groupRowsBy="CustomerName"
                        sortMode="single"
                        sortField="CustomerName" 
                        sortOrder={1}
                        rowGroupHeaderTemplate={headerTemplate}
                        rowGroupFooterTemplate={footerTemplate}
                        className="p-datatable-gridlines"
                        emptyMessage="No records found"
                    >
                        <Column field="CustomerName" header="Customer Name" sortable hidden /> 
                        
                        <Column field="Salesinvoicesdate" header="Date" body={dateBodyTemplate} sortable={false} style={{ minWidth: '120px' }} />
                        <Column field="InvoiceCurrency" header="Curr" style={{ maxWidth: '70px', textAlign: 'center' }} sortable={false} />
                        <Column field="InvoiceNo" header="Invoice No." sortable={false} />
                        
                        {/* --- NEW DO COLUMN --- */}
                        <Column field="DONumber" header="DO No." sortable={false} />

                        <Column field="ItemName" header="Item Name" sortable={false} />
                        <Column field="Qty" header="Qty" className="text-end" sortable={false} />
                        <Column field="UnitPrice" header="Unit Price" className="text-end" body={(r) => r.UnitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })} sortable={false} />
                        <Column field="OriginalTotal" header="Total" className="text-end" body={(r) => formatNumber(r.OriginalTotal)} sortable={false} />
                        <Column field="ConvertedTotal" header="Total (IDR)" className="text-end" body={(r) => formatNumber(r.ConvertedTotal)} sortable={false} />
                    </DataTable>
                </Card>
            </Container>
        </div>
    );
};
export default SalesCustomerWise;