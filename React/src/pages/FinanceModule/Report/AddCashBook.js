import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Col,
    Container,
    Row,
    Label,
    Input,
    Button,
    Table,
    Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";

import { GetCustomerFilter } from "../../FinanceModule/service/financeapi";
import { PYTHON_API_URL } from "common/pyapiconfig";

const AddCashBook = () => {
    // --- UI STATES ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const [loading, setLoading] = useState(false);
    
    // --- DATA STATES ---
    const [customerList, setCustomerList] = useState([]);
    const [entryList, setEntryList] = useState([]);
    const [salesList, setSalesList] = useState([]);
    const [customerDefaults, setCustomerDefaults] = useState({}); 

    // --- BATCH ENTRY STATES ---
    const [rows, setRows] = useState([]); 
    const [totals, setTotals] = useState({ receipt: 0, payment: 0 });
    const [editMode, setEditMode] = useState(false); 

    // --- INITIAL LOAD ---
    useEffect(() => {
        const loadInitialData = async () => {
            const customers = await GetCustomerFilter(1, "%");
            setCustomerList(Array.isArray(customers) ? customers.map(c => ({ value: c.CustomerID, label: c.CustomerName })) : []);
            
            loadSalesPersons();
            loadCustomerDefaults();
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (customerList.length > 0) {
            loadEntryList();
        }
    }, [customerList]);

    useEffect(() => {
        const t = rows.reduce((acc, row) => {
            const amt = parseFloat(row.amount || 0);
            if (row.type === 'Receipt') acc.receipt += amt;
            else acc.payment += amt;
            return acc;
        }, { receipt: 0, payment: 0 });
        setTotals(t);
    }, [rows]);

    const loadSalesPersons = async () => {
        try {
            const response = await axios.get(`${PYTHON_API_URL}/AR/get-sales-persons`);
            if (response.data?.status === "success") {
                setSalesList(response.data.data);
            }
        } catch (err) { console.error(err); }
    };

    const loadCustomerDefaults = async () => {
        try {
            const response = await axios.get(`${PYTHON_API_URL}/AR/get-customer-defaults`);
            if (response.data?.status === "success") {
                setCustomerDefaults(response.data.data); 
            }
        } catch (err) { console.error("Failed to load customer defaults", err); }
    };

    const loadEntryList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${PYTHON_API_URL}/AR/cash/get-daily-entries`);
            
            if (response.data?.status === "success" && Array.isArray(response.data.data)) {
                const mapped = response.data.data.map(item => ({
                    ...item,
                    customerName: customerList.find(c => c.value === item.customer_id)?.label || item.customer_id,
                    displayDate: item.date ? format(new Date(item.date), "dd-MMM-yyyy") : "-",
                    verificationStatus: item.verification_status,
                    customerId: item.customer_id 
                }));
                
                setEntryList(mapped);
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    // --- HANDLERS ---
    const handleAddRow = () => {
        setRows(prevRows => [...prevRows, {
            id: Date.now(), 
            rowId: 0, 
            type: "Receipt",
            date: new Date(),
            customerId: "",
            referenceNo: "",
            amount: "",
            bankCharges: "", 
            salesPersonId: "",
            sendNotification: false
        }]);
    };

    const handleRemoveRow = (index) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;

        if (field === 'customerId') {
            const defaultSP = customerDefaults[value];
            if (defaultSP) {
                newRows[index]['salesPersonId'] = defaultSP;
            } else {
                newRows[index]['salesPersonId'] = ""; 
            }
        }

        setRows(newRows);
    };

    const openNewModal = () => {
        setEditMode(false);
        setTotals({ receipt: 0, payment: 0 });
        
        const initialRow = {
            id: Date.now(), 
            rowId: 0, 
            type: "Receipt",
            date: new Date(),
            customerId: "",
            referenceNo: "",
            amount: "",
            bankCharges: "",
            salesPersonId: "",
            sendNotification: false
        };
        
        setRows([initialRow]);
        setIsModalOpen(true);
    };

    const openEditModal = (rowData) => {
        setEditMode(true);
        const amount = parseFloat(rowData.bank_amount);
        const type = amount < 0 ? "Payment" : "Receipt";

        setRows([{
            id: Date.now(),
            rowId: rowData.receipt_id,
            type: type,
            date: new Date(rowData.date || new Date()),
            customerId: rowData.customer_id,
            referenceNo: rowData.reference_no,
            amount: Math.abs(amount),
            bankCharges: rowData.bank_charges,
            salesPersonId: rowData.sales_person_id,
            sendNotification: rowData.send_notification
        }]);

        setIsModalOpen(true);
    };

    const handleBatchSubmit = async (mode) => {
        if (rows.length === 0) {
            toast.error("Please add at least one transaction row");
            return;
        }

        try {
            const isPosted = mode === "POST";
            const headerPayload = rows.map(row => ({
                receipt_id: row.rowId || 0,
                customer_id: parseInt(row.customerId),
                bank_amount: row.type === 'Payment' ? -Math.abs(parseFloat(row.amount)) : Math.abs(parseFloat(row.amount)),
                bank_charges: parseFloat(row.bankCharges) || 0,
                deposit_bank_id: 0, 
                receipt_date: format(row.date, "yyyy-MM-dd"), 
                reference_no: row.referenceNo,
                sales_person_id: row.salesPersonId,
                send_notification: row.sendNotification,
                status: isPosted ? "Posted" : "Saved",
                is_posted: isPosted,
                payment_amount: 0,
                cash_amount: 0,
                contra_amount: 0,
                tax_rate: 0,
                bank_payment_via: 0,
                proof_missing: false
            }));

            const payload = {
                orgId: 1, 
                branchId: 1, 
                userId: 505, 
                userIp: "127.0.0.1", 
                header: headerPayload
            };
            
            const endpoint = editMode ? `${PYTHON_API_URL}/AR/cash/update` : `${PYTHON_API_URL}/AR/cash/create`;
            if(editMode) await axios.put(`${endpoint}/${rows[0].rowId}`, payload); 
            else await axios.post(endpoint, payload);
            
            toast.success(`${rows.length} Entries ${isPosted ? 'Posted' : 'Saved'} Successfully`);
            setIsModalOpen(false);
            loadEntryList();
        } catch (err) { 
            console.error(err);
            toast.error("Error saving entries"); 
        }
    };

    const handleSubmitRow = async (id) => {
        try {
            await axios.put(`${PYTHON_API_URL}/AR/cash/submit/${id}`);
            toast.success("Submitted successfully!");
            loadEntryList();
        } catch (err) {
            toast.error("Submit failed");
        }
    };

    // --- TEMPLATES ---
    const statusBodyTemplate = (rowData) => (
        <div className="d-flex justify-content-center">
            <span className={`circle-badge ${rowData.is_posted ? 'bg-posted' : 'bg-saved'}`}>
                {rowData.is_posted ? 'P' : 'S'}
            </span>
        </div>
    );

    const verificationBodyTemplate = (rowData) => {
        if (!rowData.is_posted) return null;
        const isCompleted = rowData.verificationStatus === 'Completed';
        const isPending = rowData.verificationStatus === 'Pending';
        
        if (isPending) return <div className="d-flex justify-content-center"><div className="verif-badge bg-pend">Pending</div></div>;
        if (isCompleted) return <div className="d-flex justify-content-center"><div className="verif-badge bg-comp">Completed</div></div>;
        return null;
    };

    const actionBodyTemplate = (rowData) => {
        const isPosted = rowData.is_posted;
        const isEditable = !isPosted;
        const isActionable = rowData.verificationStatus === 'Completed';

        return (
            <div className="d-flex justify-content-center gap-2 align-items-center table-actions">
                <span 
                    className="action-link edit" 
                    onClick={() => { if(isEditable) openEditModal(rowData); }}
                    style={{ 
                        cursor: isEditable ? 'pointer' : 'not-allowed', 
                        opacity: isEditable ? 1 : 0.5,
                        pointerEvents: isEditable ? 'auto' : 'none'
                    }}
                >
                    Edit
                </span>
                
                <span className="divider">|</span>
                
                <span 
                    className="action-link submit" 
                    onClick={() => { if(isActionable) handleSubmitRow(rowData.receipt_id); }}
                    style={{ 
                        cursor: isActionable ? 'pointer' : 'not-allowed', 
                        opacity: isActionable ? 1 : 0.5,
                        color: isActionable ? '#27ae60' : '#a0a0a0',
                        pointerEvents: isActionable ? 'auto' : 'none'
                    }}
                >
                    Submit
                </span>
            </div>
        );
    };

    const customSelectStyles = {
        control: (base) => ({ ...base, minHeight: '32px', fontSize: '12px', borderColor: '#ced4da' }),
        menu: (base) => ({ ...base, fontSize: '12px', zIndex: 9999 }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 })
    };

    return (
        <div className="page-content bg-modern">
            <Container fluid>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="page-heading mb-0">CASH BOOK ENTRY</h5>
                    <div className="d-flex align-items-center">
                        <div className="d-flex gap-2">
                            <button className="btn-toolbar btn-new-green" onClick={openNewModal}><i className="bx bx-plus"></i> New Entry</button>
                        </div>
                    </div>
                </div>

                <Card className="main-card border-0">
                    <CardBody>
                        <DataTable value={entryList} paginator rows={10} loading={loading} globalFilter={globalFilter} className="p-datatable-modern" responsiveLayout="scroll">
                            <Column field="displayDate" header="Date" sortable filter style={{ width: '10%' }} />
                            <Column field="customerName" header="Party" sortable filter style={{ width: '25%' }} />
                            <Column field="reference_no" header="Reference" sortable filter style={{ width: '15%' }} />
                            <Column field="bank_amount" header="Amount" textAlign="right" body={(d) => parseFloat(d.bank_amount || 0).toLocaleString()} style={{ width: '10%' }} />
                            <Column header="Status" body={statusBodyTemplate} style={{ width: '8%' }} />
                            <Column header="Verification Status" body={verificationBodyTemplate} style={{ width: '12%' }} />
                            <Column header="Action" body={actionBodyTemplate} style={{ width: '15%', textAlign: 'center' }} />
                        </DataTable>
                    </CardBody>
                </Card>

                {/* --- BATCH ENTRY MODAL --- */}
                <Modal 
                    isOpen={isModalOpen} 
                    toggle={() => setIsModalOpen(false)} 
                    centered
                    size="xl"
                    style={{ maxWidth: '1250px' }}
                >
                    <ModalHeader toggle={() => setIsModalOpen(false)}>
                        {editMode ? "Edit Cash Entry" : "New Cash Book Entry (Batch)"}
                    </ModalHeader>
                    <ModalBody>
                        <div className="bg-light p-3 rounded mb-3 d-flex justify-content-end align-items-center">
                            <div className="d-flex gap-4">
                                <div className="text-end border-end pe-4">
                                    <small className="text-muted d-block text-uppercase" style={{fontSize: '10px', letterSpacing: '1px'}}>Total Receipts</small>
                                    <h5 className="text-success m-0 fw-bold">{totals.receipt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h5>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted d-block text-uppercase" style={{fontSize: '10px', letterSpacing: '1px'}}>Total Payments</small>
                                    <h5 className="text-danger m-0 fw-bold">{totals.payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h5>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive" style={{maxHeight: '450px', overflowY: 'auto', border: '1px solid #e9ecef', borderRadius: '4px'}}>
                            <Table className="table table-bordered align-middle table-sm table-hover mb-0">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th style={{width: '90px'}} className="text-center">Type</th>
                                        <th style={{width: '110px'}} className="text-center">Date</th>
                                        <th style={{width: '220px'}}>Party</th>
                                        <th style={{width: '120px'}}>Reference No.</th>
                                        <th style={{width: '130px'}} className="text-end">Amount</th>
                                        <th style={{width: '160px'}}>Sales Person</th>
                                        <th style={{width: '40px'}} className="text-center">Del</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={row.id}>
                                            <td>
                                                <select 
                                                    className="form-select form-select-sm"
                                                    value={row.type}
                                                    onChange={(e) => handleRowChange(index, 'type', e.target.value)}
                                                    style={{fontSize: '12px'}}
                                                >
                                                    <option value="Receipt">Receipt</option>
                                                    <option value="Payment">Payment</option>
                                                </select>
                                            </td>
                                            <td>
                                                <Flatpickr
                                                    className="form-control form-control-sm"
                                                    value={row.date}
                                                    onChange={(date) => handleRowChange(index, 'date', date[0])}
                                                    options={{ dateFormat: "d-M-Y" }}
                                                    style={{fontSize: '12px'}}
                                                />
                                            </td>
                                            <td>
                                                <Select 
                                                    options={customerList}
                                                    value={customerList.find(c => c.value === row.customerId)}
                                                    onChange={(opt) => handleRowChange(index, 'customerId', opt?.value)}
                                                    styles={customSelectStyles}
                                                    menuPortalTarget={document.body} 
                                                    placeholder="Select..."
                                                />
                                            </td>
                                            <td>
                                                <Input bsSize="sm" value={row.referenceNo} onChange={(e) => handleRowChange(index, 'referenceNo', e.target.value)} style={{fontSize: '12px'}} />
                                            </td>
                                            <td>
                                                <Input type="number" bsSize="sm" value={row.amount} onChange={(e) => handleRowChange(index, 'amount', e.target.value)} className="text-end" style={{fontSize: '12px'}} />
                                            </td>
                                            <td>
                                                <Select 
                                                    options={salesList}
                                                    value={salesList.find(c => c.value === row.salesPersonId)}
                                                    onChange={(opt) => handleRowChange(index, 'salesPersonId', opt?.value)}
                                                    styles={customSelectStyles}
                                                    menuPortalTarget={document.body}
                                                    placeholder="Select..."
                                                />
                                            </td>
                                            <td className="text-center">
                                                <i className="bx bx-trash text-danger cursor-pointer" onClick={() => handleRemoveRow(index)}></i>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        
                        <div className="mt-2">
                            {/* --- FIXED: Added color: 'white' to inline style --- */}
                            <Button color="primary" size="sm" onClick={handleAddRow} style={{ fontSize: '12px', padding: '5px 12px', color: 'white' }}>
                                <i className="bx bx-plus me-1"></i> Add Entry
                            </Button>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn-modal btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="btn-modal btn-save" onClick={() => handleBatchSubmit("SAVE")}>{editMode ? "Update" : "Save Draft"}</button>
                        <button className="btn-modal btn-post" onClick={() => handleBatchSubmit("POST")}>Post</button>
                    </ModalFooter>
                </Modal>

            </Container>

            <style>{`
                .bg-modern { background-color: #f4f7f9; min-height: 100vh; font-family: 'Public Sans', sans-serif; }
                .page-heading { font-size: 16px; color: #495057; font-weight: 700; text-transform: uppercase; }
                .btn-toolbar { display: flex; align-items: center; gap: 6px; padding: 8px 18px; font-size: 13px; font-weight: 500; border: none; border-radius: 4px; color: white; transition: opacity 0.2s; line-height: 1.2; }
                .btn-toolbar:hover { opacity: 0.9; }
                .btn-new-green { background-color: #6ea354; } 
                .verif-badge { padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; width: 90px; text-align: center; }
                .bg-pend { background-color: #ffe8d6; color: #c05621; } 
                .bg-comp { background-color: #d1fae5; color: #065f46; border: 1px solid #065f46; } 
                .circle-badge { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 11px; }
                .bg-saved { background-color: #f46a6a; }
                .bg-posted { background-color: #34c38f; }
                .action-link { cursor: pointer; font-weight: 700; font-size: 12px; }
                .edit { color: #495057; }
                .submit { color: #27ae60; }
                .divider { color: #ced4da; }
                .btn-modal { padding: 8px 24px; font-size: 13px; font-weight: 600; border-radius: 4px; border: none; transition: 0.2s; }
                .btn-cancel { background: white; border: 1px solid #ced4da; color: #74788d; }
                .btn-save { background: white; border: 1px solid #556ee6; color: #556ee6; }
                .btn-save:hover { background: #556ee6; color: white; }
                .btn-post { background: #34c38f; color: white; }
            `}</style>
        </div>
    );
};

export default AddCashBook;