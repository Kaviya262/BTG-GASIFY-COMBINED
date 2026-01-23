import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Row, Col } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { GetSalesDetails } from "../../../common/data/invoiceapi";

const SalesItemWise = () => {
    const dt = useRef(null);
    const today = new Date();
    // Default to YYYY-MM-DD for API logic
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
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const exportExcel = () => {
        dt.current.exportCSV();
    };

    // --- UPDATED DATE FORMATTER (dd-mm-yyyy) ---
    const dateBodyTemplate = (rowData) => {
        if (!rowData.Salesinvoicesdate) return "";
        // Input: "2026-01-06" -> Output: "06-01-2026"
        const [year, month, day] = rowData.Salesinvoicesdate.split('-');
        return `${day}-${month}-${year}`;
    };

    return (
        <div className="page-content">
            <Container fluid>
                <h4>Sales Item Wise</h4>
                <Card className="p-3 mb-3">
                    <Row className="align-items-end">
                        <Col md={3}>
                            <label>From</label>
                            <Flatpickr
                                className="form-control"
                                value={fromDate}
                                // Display as dd-mm-yyyy
                                options={{ altInput: true, altFormat: "d-m-Y", dateFormat: "Y-m-d" }}
                                onChange={([d]) => setFromDate(d.toISOString().split('T')[0])}
                            />
                        </Col>
                        <Col md={3}>
                            <label>To</label>
                            <Flatpickr
                                className="form-control"
                                value={toDate}
                                // Display as dd-mm-yyyy
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
                        paginator
                        rows={20}
                        loading={loading}
                        className="p-datatable-gridlines"
                        emptyMessage="No records found"
                    >
                        <Column field="Salesinvoicesdate" header="Date" body={dateBodyTemplate} sortable />
                        <Column field="CustomerName" header="Customer Name" sortable filter />
                        <Column field="InvoiceCurrency" header="Invoice Currency" />
                        <Column field="InvoiceNo" header="Invoice No." sortable filter />
                        <Column field="ItemName" header="Item Name" sortable filter />
                        <Column field="Qty" header="Qty" className="text-end" />
                        <Column field="UnitPrice" header="Unit Price" className="text-end" body={(r) => r.UnitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })} />
                        <Column field="Total" header="Total" className="text-end" body={(r) => r.Total?.toLocaleString(undefined, { minimumFractionDigits: 2 })} />
                    </DataTable>
                </Card>
            </Container>
        </div>
    );
};
export default SalesItemWise;