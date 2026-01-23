import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Col,
    Container,
    Row,
    FormGroup,
    Label,
    Input,
    Button,
    Table, // Table is used in the Preview Modal
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Spinner
} from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";

// Configuration
import { GetCustomerFilter } from "../../FinanceModule/service/financeapi";
import { GetBankList } from "common/data/mastersapi";
import { PYTHON_API_URL } from "common/pyapiconfig";

const AddBankBook = () => {
    // --- UI STATES ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const [loading, setLoading] = useState(false);
    
    // --- DATA STATES ---
    const [bankList, setBankList] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const [entryList, setEntryList] = useState([]);
    const [salesList, setSalesList] = useState([]);

    // --- BATCH ENTRY STATES ---
    const [selectedBank, setSelectedBank] = useState(null);
    const [rows, setRows] = useState([]); 
    const [totals, setTotals] = useState({ receipt: 0, payment: 0 });
    const [editMode, setEditMode] = useState(false); 

    // --- PREVIEW MODAL STATES ---
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [invoiceList, setInvoiceList] = useState([]); // Stores fetched invoices
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    // --- INITIAL LOAD ---
    useEffect(() => {
        const loadInitialData = async () => {
            const banks = await GetBankList(1, 1);
            setBankList(banks.map(item => ({ value: item.value, label: item.BankName })));
            
            const customers = await GetCustomerFilter(1, "%");
            setCustomerList(Array.isArray(customers) ? customers.map(c => ({ value: c.CustomerID, label: c.CustomerName })) : []);
            
            loadSalesPersons();
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (bankList.length > 0 && customerList.length > 0) {
            loadEntryList();
        }
    }, [bankList, customerList]);

    // --- CALCULATE TOTALS ---
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

    const loadEntryList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${PYTHON_API_URL}/AR/get-daily-entries`);
            if (response.data?.status === "success" && Array.isArray(response.data.data)) {
                const mapped = response.data.data.map(item => ({
                    ...item,
                    bankName: bankList.find(b => b.value === parseInt(item.deposit_bank_id))?.label || item.deposit_bank_id,
                    customerName: customerList.find(c => c.value === item.customer_id)?.label || item.customer_id,
                    displayDate: item.date ? format(new Date(item.date), "dd-MMM-yyyy") : "-",
                    verificationStatus: item.verification_status,
                    // Ensure customerId is available for preview
                    customerId: item.customer_id 
                }));
                setEntryList(mapped);
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    // --- HANDLERS ---
    const handleAddRow = () => {
        setRows([...rows, {
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
        setRows(newRows);
    };

    const openNewModal = () => {
        setEditMode(false);
        setRows([]); 
        setSelectedBank(null);
        setTotals({ receipt: 0, payment: 0 });
        handleAddRow(); 
        setIsModalOpen(true);
    };

    const openEditModal = (rowData) => {
        setEditMode(true);
        const bank = bankList.find(b => b.value === parseInt(rowData.deposit_bank_id));
        setSelectedBank(bank || null);
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
        if (!selectedBank) {
            toast.error("Please select a Bank first");
            return;
        }
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
                deposit_bank_id: parseInt(selectedBank.value),
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
            
            const endpoint = editMode ? `${PYTHON_API_URL}/AR/update` : `${PYTHON_API_URL}/AR/create`;
            if(editMode) await axios.put(endpoint, payload); 
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
            await axios.put(`${PYTHON_API_URL}/AR/submit/${id}`);
            toast.success("Submitted successfully!");
            loadEntryList();
        } catch (err) {
            toast.error("Submit failed");
        }
    };

    // --- PREVIEW HANDLER ---
    const handlePreview = async (rowData) => {
        setSelectedEntry(rowData);
        setIsPreviewOpen(true);
        setLoadingInvoices(true);
        setInvoiceList([]); // Clear previous data

        if (rowData.customerId) {
            try {
                const response = await axios.get(`${PYTHON_API_URL}/AR/get-outstanding-invoices/${rowData.customerId}`);
                if (response.data && response.data.status === "success") {
                    setInvoiceList(response.data.data);
                } else {
                    setInvoiceList([]);
                }
            } catch (error) {
                console.error("Error fetching outstanding invoices:", error);
                toast.error("Failed to fetch invoice details");
            }
        }
        setLoadingInvoices(false);
    };

    // --- GENERATE VERIFICATION ---
    const handleGenerateVerification = async () => {
        if (!selectedEntry) return;
        try {
            await axios.put(`${PYTHON_API_URL}/AR/submit/${selectedEntry.receipt_id}`);
            toast.success("Marketing Verification Generated!");
            setIsPreviewOpen(false);
            loadEntryList();
        } catch (err) {
            toast.error("Failed to generate verification");
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

    // --- ACTION COLUMN TEMPLATE ---
    const actionBodyTemplate = (rowData) => {
        const isPosted = rowData.is_posted;
        const isCompleted = rowData.verificationStatus === 'Completed';
        const isEditable = !isPosted;
        // Preview allowed for both Saved and Posted entries
        const isPreviewable = true; 
        const isActionable = isCompleted; 

        return (
            <div className="d-flex justify-content-center gap-2 align-items-center table-actions">
                {/* EDIT */}
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

                {/* PREVIEW BUTTON - Added Here */}
                <span 
                    className="action-link preview" 
                    onClick={() => { if(isPreviewable) handlePreview(rowData); }}
                    style={{ 
                        cursor: isPreviewable ? 'pointer' : 'not-allowed', 
                        opacity: isPreviewable ? 1 : 0.5,
                        pointerEvents: isPreviewable ? 'auto' : 'none'
                    }}
                >
                    Preview
                </span>

                <span className="divider">|</span>
                
                {/* QUERY */}
                <span 
                    className="action-link query"
                    style={{ 
                        cursor: isActionable ? 'pointer' : 'not-allowed', 
                        opacity: isActionable ? 1 : 0.5,
                        pointerEvents: isActionable ? 'auto' : 'none'
                    }}
                >
                    Query
                </span>
                
                <span className="divider">|</span>
                
                {/* SUBMIT */}
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
                    <h5 className="page-heading mb-0">BANK BOOK ENTRY</h5>
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
                            <Column field="coaCode" header="COA" sortable filter style={{ width: '10%' }} />
                            <Column field="customerName" header="Customer" sortable filter style={{ width: '20%' }} />
                            <Column field="reference_no" header="Reference" sortable filter style={{ width: '10%' }} />
                            <Column field="bank_amount" header="Amount" textAlign="right" body={(d) => parseFloat(d.bank_amount || 0).toLocaleString()} style={{ width: '10%' }} />
                            <Column field="bank_charges" header="Bank Charges" textAlign="right" body={(d) => parseFloat(d.bank_charges || 0).toLocaleString()} style={{ width: '10%' }} />
                            <Column header="Status" body={statusBodyTemplate} style={{ width: '8%' }} />
                            <Column header="Verification Status" body={verificationBodyTemplate} style={{ width: '12%' }} />
                            
                            {/* --- ACTION COLUMN (Visible) --- */}
                            <Column header="Action" body={actionBodyTemplate} style={{ width: '22%', textAlign: 'center' }} />
                        </DataTable>
                    </CardBody>
                </Card>

                {/* --- BATCH ENTRY MODAL --- */}
                <Dialog 
                    header={editMode ? "Edit Entry" : "New Bank Book Entry (Batch)"}
                    visible={isModalOpen} 
                    onHide={() => setIsModalOpen(false)} 
                    className="modern-dialog" 
                    style={{ width: '90vw', maxWidth: '1250px' }}
                    draggable={false}
                    resizable={false}
                >
                    <div className="bg-light p-3 rounded mb-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3" style={{width: '40%'}}>
                            <Label className="fw-bold mb-0 text-nowrap">Bank Account:</Label>
                            <Select 
                                className="flex-grow-1"
                                options={bankList} 
                                value={selectedBank}
                                onChange={setSelectedBank}
                                placeholder="Select Bank..."
                                styles={customSelectStyles}
                                isDisabled={editMode}
                            />
                        </div>
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
                                    <th style={{width: '220px'}}>Customer</th>
                                    <th style={{width: '120px'}}>Reference No.</th>
                                    <th style={{width: '130px'}} className="text-end">Amount</th>
                                    <th style={{width: '100px'}} className="text-end">Charges</th>
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
                                            <Input type="number" bsSize="sm" value={row.bankCharges} onChange={(e) => handleRowChange(index, 'bankCharges', e.target.value)} className="text-end" style={{fontSize: '12px'}} />
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
                        <Button color="primary" size="sm" onClick={handleAddRow} style={{ fontSize: '12px', padding: '5px 12px' }}>
                            <i className="bx bx-plus me-1"></i> Add Entry
                        </Button>
                    </div>

                    <div className="d-flex justify-content-end gap-2 border-top pt-3 mt-3">
                        <button className="btn-modal btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="btn-modal btn-save" onClick={() => handleBatchSubmit("SAVE")}>{editMode ? "Update" : "Save Draft"}</button>
                        <button className="btn-modal btn-post" onClick={() => handleBatchSubmit("POST")}>Post</button>
                    </div>
                </Dialog>

                {/* --- OUTSTANDING INVOICES MODAL (PREVIEW) --- */}
                <Dialog 
                    header="Customer Preview" 
                    visible={isPreviewOpen} 
                    onHide={() => setIsPreviewOpen(false)} 
                    className="modern-dialog"
                    style={{ width: '650px' }}
                    draggable={false}
                    resizable={false}
                >
                    {selectedEntry && (
                        <div className="pt-2">
                            <div className="p-3 bg-light rounded mb-3">
                                <span className="fw-bold text-secondary me-2">Customer:</span>
                                <span className="fw-bold text-dark">{selectedEntry.customerName}</span>
                            </div>
                            
                            {loadingInvoices ? (
                                <div className="text-center py-4"><Spinner color="primary" /></div>
                            ) : (
                                <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                                    <Table bordered className="mb-0 text-center align-middle table-hover">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th>Invoice No.</th>
                                                <th>Date</th>
                                                <th>Balance Due</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceList.length > 0 ? (
                                                invoiceList.map((inv, idx) => (
                                                    <tr key={idx}>
                                                        <td>{inv.invoice_no}</td>
                                                        <td>{inv.invoice_date}</td>
                                                        <td className="text-end fw-bold">
                                                            {parseFloat(inv.balance_due).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-muted py-3">No outstanding invoices found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )}
                    <ModalFooter className="border-0 pt-3">
                        <Button color="secondary" onClick={() => setIsPreviewOpen(false)}>Close</Button>
                        <Button color="primary" onClick={handleGenerateVerification}>Generate Mktg Verification</Button>
                    </ModalFooter>
                </Dialog>

            </Container>

            <style>{`
                .bg-modern { background-color: #f4f7f9; min-height: 100vh; font-family: 'Public Sans', sans-serif; }
                .page-heading { font-size: 16px; color: #495057; font-weight: 700; text-transform: uppercase; }
                .btn-toolbar { display: flex; align-items: center; gap: 6px; padding: 8px 18px; font-size: 13px; font-weight: 500; border: none; border-radius: 4px; color: white; transition: opacity 0.2s; line-height: 1.2; }
                .btn-toolbar:hover { opacity: 0.9; }
                .btn-search-blue { background-color: #556ee6; }
                .btn-cancel-red { background-color: #c7625a; }
                .btn-export-grey { background-color: #74788d; }
                .btn-print-blue { background-color: #5584d4; }
                .btn-new-green { background-color: #6ea354; } 
                .btn-clear { display: flex; align-items: center; border: none; background: #c5645d; color: white; border-radius: 4px; padding: 0; overflow: hidden; height: 32px; width: 32px; justify-content: center; }
                .clear-icon { display: flex; align-items: center; justify-content: center; }
                .legend-label { font-size: 14px; font-weight: 700; color: #2a3142; }
                .minimal-search { border: 1px solid #ced4da; border-radius: 4px; padding: 5px 12px; font-size: 13px; width: 280px; outline: none; }
                .p-datatable-modern .p-datatable-thead > tr > th { background-color: #5584d4 !important; color: white !important; font-size: 12px; padding: 12px; border: 1px solid #ffffff22; }
                .verif-badge { padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; width: 90px; text-align: center; }
                .bg-pend { background-color: #ffe8d6; color: #c05621; } 
                .bg-comp { background-color: #d1fae5; color: #065f46; border: 1px solid #065f46; } 
                .circle-badge { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 11px; }
                .bg-saved { background-color: #f46a6a; }
                .bg-posted { background-color: #34c38f; }
                .action-link { cursor: pointer; font-weight: 700; font-size: 12px; }
                .edit { color: #495057; }
                .query { color: #8e44ad; }
                .submit { color: #27ae60; }
                .preview { color: #17a2b8; } 
                .divider { color: #ced4da; }
                .modern-dialog .p-dialog-header { padding: 1.25rem; border-bottom: 1px solid #eff2f7; background: #fff; border-top-left-radius: 8px; border-top-right-radius: 8px; }
                .modern-dialog .p-dialog-content { padding: 1.5rem; background: #fff; }
                .modal-label { font-size: 13px; font-weight: 600; color: #495057; margin-bottom: 6px; }
                .btn-modal { padding: 8px 24px; font-size: 13px; font-weight: 600; border-radius: 4px; border: none; transition: 0.2s; }
                .btn-cancel { background: white; border: 1px solid #ced4da; color: #74788d; }
                .btn-save { background: white; border: 1px solid #556ee6; color: #556ee6; }
                .btn-save:hover { background: #556ee6; color: white; }
                .btn-post { background: #34c38f; color: white; }
            `}</style>
        </div>
    );
};

export default AddBankBook;