import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Row, Col } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { GetSalesDetails } from "../../../common/data/invoiceapi";

const SalesCustomerWise = () => {
    const dt = useRef(null);
    const today = new Date();
    const [fromDate, setFromDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await GetSalesDetails({
                FromDate: fromDate,
                ToDate: toDate,
                customerid: 0,
                BranchId: 1
            });
            setData(response || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const exportExcel = () => {
        dt.current.exportCSV();
    };

    // --- DATE FORMATTER (dd-mm-yyyy) ---
    const dateBodyTemplate = (rowData) => {
        if (!rowData.Salesinvoicesdate) return "";
        const [year, month, day] = rowData.Salesinvoicesdate.split('-');
        return `${day}-${month}-${year}`;
    };

    const headerTemplate = (data) => {
        return (
            <React.Fragment>
                <span className="image-text" style={{ fontWeight: 'bold' }}>{data.CustomerName}</span>
            </React.Fragment>
        );
    };

    // --- FOOTER TEMPLATE ---
    const footerTemplate = (data) => {
        return (
            <React.Fragment>
                <td colSpan="4" className="text-end fw-bold">Total</td>
                <td className="text-end fw-bold">{calculateGroupTotal(data.CustomerName, 'Qty')}</td>
                <td></td>
                <td className="text-end fw-bold">{calculateGroupTotal(data.CustomerName, 'Total').toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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

    return (
        <div className="page-content">
            <Container fluid>
                <h4>Sales Customer Wise</h4>
                <Card className="p-3 mb-3">
                    <Row className="align-items-end">
                        <Col md={3}>
                            <label>From</label>
                            <Flatpickr
                                className="form-control"
                                value={fromDate}
                                options={{ altInput: true, altFormat: "d-m-Y", dateFormat: "Y-m-d" }}
                                onChange={([d]) => setFromDate(d.toISOString().split('T')[0])}
                            />
                        </Col>
                        <Col md={3}>
                            <label>To</label>
                            <Flatpickr
                                className="form-control"
                                value={toDate}
                                options={{ altInput: true, altFormat: "d-m-Y", dateFormat: "Y-m-d" }}
                                onChange={([d]) => setToDate(d.toISOString().split('T')[0])}
                            />
                        </Col>
                        <Col md={4} className="d-flex gap-2">
                            <button className="btn btn-primary" onClick={fetchData}>
                                <i className="bx bx-search-alt-2 me-1"></i> Search
                            </button>
                            <button className="btn btn-success" onClick={exportExcel}>
                                <i className="bx bx-export me-1"></i> Export Excel
                            </button>
                        </Col>
                    </Row>
                </Card>
                <Card>
                    <DataTable
                        ref={dt}
                        value={data}
                        loading={loading}
                        // --- PAGINATION ADDED HERE ---
                        paginator
                        rows={20}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        // -----------------------------
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
                        <Column field="Salesinvoicesdate" header="Date" body={dateBodyTemplate} />
                        <Column field="CustomerName" header="Customer Name" />
                        <Column field="InvoiceCurrency" header="Invoice Currency" />
                        <Column field="InvoiceNo" header="Invoice No." />
                        <Column field="ItemName" header="Item Name" />
                        <Column field="Qty" header="Qty" className="text-end" />
                        <Column field="UnitPrice" header="Unit Price" className="text-end" body={(r) => r.UnitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })} />
                        <Column field="Total" header="Total" className="text-end" body={(r) => r.Total?.toLocaleString(undefined, { minimumFractionDigits: 2 })} />
                    </DataTable>
                </Card>
            </Container>
        </div>
    );
};
export default SalesCustomerWise;