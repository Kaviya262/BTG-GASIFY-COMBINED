import React, { useState, useEffect } from "react";
import {
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  Table, // Kept for the modal table
  Spinner
} from "reactstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import { PYTHON_API_URL } from "common/pyapiconfig";

// --- NEW IMPORTS FOR GRID MATCHING ---
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css"; // Ensures Blue Theme Match

// Existing service calls
import { GetCustomerFilter } from "../FinanceModule/service/financeapi";
import { GetBankList } from "common/data/mastersapi";

const Breadcrumbs = ({ title, breadcrumbItem }) => (
  <div className="page-title-box d-sm-flex align-items-center justify-content-between">
    <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
    <div className="page-title-right">
      <ol className="breadcrumb m-0">
        <li className="breadcrumb-item"><a href="/#">{title}</a></li>
        <li className="breadcrumb-item active"><a href="/#">{breadcrumbItem}</a></li>
      </ol>
    </div>
  </div>
);

const VerifyCustomer = () => {
  const [rows, setRows] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [customerList, setCustomerList] = useState([]);

  // Modal States
  const [verifyModal, setVerifyModal] = useState(false);
  const [replyModal, setReplyModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Verification Form State
  const [verificationData, setVerificationData] = useState({
    taxDeduction: 0,
    bankCharges: 0,
    invoices: []
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const banks = await GetBankList(1, 1);
      const customers = await GetCustomerFilter(1, "%");
      setBankList(banks.map(b => ({ value: b.value, label: b.BankName })));
      const custOptions = Array.isArray(customers) ? customers.map(c => ({ value: c.CustomerID, label: c.CustomerName })) : [];
      setCustomerList(custOptions);
      loadPendingList(custOptions);
    } catch (err) { console.error(err); }
  };

  const loadPendingList = async (customers) => {
    try {
      const response = await axios.get(`${PYTHON_API_URL}/AR/get-pending-list`);
      if (response.data?.status === "success") {
        setRows(response.data.data.map(item => ({
          ...item,
          receiptDate: item.receipt_date || "N/A", 
          notificationDate: new Date().toLocaleDateString(), 
          customerNameDisplay: customers.find(c => c.value === item.customer_id)?.label || `Cust: ${item.customer_id}`,
          isPosted: false
        })));
      }
    } catch (err) { toast.error("Failed to load list."); }
  };

  // -------------------- GRID ACTIONS --------------------
  const handleVerifyOpen = async (record) => {
    setSelectedRecord(record);
    setVerifyModal(true);
    setLoadingInvoices(true);

    const initialBankCharges = parseFloat(record.bank_charges) || 0;
    const initialTaxDeduction = parseFloat(record.tax_rate) || parseFloat(record.tax_deduction) || 0;

    try {
        const res = await axios.get(`${PYTHON_API_URL}/AR/get-outstanding-invoices/${record.customer_id}`);
        
        let invoiceList = [];
        if(res.data && res.data.status === "success") {
            invoiceList = res.data.data.map(inv => ({
                id: inv.invoice_id,
                invNo: inv.invoice_no,
                date: inv.invoice_date,
                balanceDue: parseFloat(inv.balance_due),
                paymentType: "", 
                amount: "",      
                selected: false
            }));
        }

        setVerificationData({
            taxDeduction: initialTaxDeduction,
            bankCharges: initialBankCharges,
            invoices: invoiceList
        });

    } catch (error) {
        console.error("Error fetching invoices", error);
        toast.error("Could not load customer invoices");
        setVerificationData({ taxDeduction: initialTaxDeduction, bankCharges: initialBankCharges, invoices: [] });
    } finally {
        setLoadingInvoices(false);
    }
  };

  const handleSubmitRow = (id) => {
    Swal.fire({
      title: "Confirm Verification",
      text: "Are you sure you want to verify this record? It will move to Completed status.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#34c38f",
      cancelButtonColor: "#f46a6a",
      confirmButtonText: "Yes, Verify it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            await axios.put(`${PYTHON_API_URL}/AR/verify/${id}`, { 
                customer_id: 0, 
                bank_charges: 0, 
                tax_deduction: 0, 
                allocations: [] 
            });
            setRows(prev => prev.filter(r => r.receipt_id !== id));
            toast.success("Record verified successfully.");
        } catch(err) {
            toast.error("Error verifying record");
        }
      }
    });
  };

  // -------------------- POPUP LOGIC --------------------
  const handleInvoiceChange = (index, field, value) => {
    const updated = [...verificationData.invoices];
    
    if (field === "selected") {
        updated[index].selected = value;
        if (value && !updated[index].paymentType) {
             updated[index].paymentType = "Full";
             updated[index].amount = updated[index].balanceDue;
        }
        if (!value) {
            updated[index].paymentType = "";
            updated[index].amount = "";
        }
    } 
    else if (field === "paymentType") {
        updated[index].paymentType = value;
        updated[index].selected = true; 
        if (value === "Full") {
            updated[index].amount = updated[index].balanceDue;
        } else {
            updated[index].amount = ""; 
        }
    }
    else if (field === "amount") {
        updated[index].amount = parseFloat(value) || 0;
    }

    setVerificationData({ ...verificationData, invoices: updated });
  };

  // --- FORMULA CALCULATIONS ---
  const totalSelected = verificationData.invoices
    .filter(inv => inv.selected)
    .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

  const receiptAmount = selectedRecord ? parseFloat(selectedRecord.bank_amount) : 0;
  
  // FORMULA: Total Allocated + Bank Charges - Tax Deduction
  const currentTotal = totalSelected + verificationData.bankCharges - verificationData.taxDeduction;
  
  const variance = receiptAmount - currentTotal;
  const isBalanced = Math.abs(variance) < 1; 

  // --- NEW: SAVE DRAFT HANDLER ---
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    const payload = {
        customer_id: selectedRecord.customer_id,
        bank_charges: verificationData.bankCharges,
        tax_deduction: verificationData.taxDeduction,
        allocations: verificationData.invoices
            .filter(inv => inv.selected)
            .map(inv => ({
                invoice_id: inv.id,
                invoice_no: inv.invNo,
                payment_type: inv.paymentType,
                amount_allocated: parseFloat(inv.amount) || 0
            }))
    };

    try {
        await axios.put(`${PYTHON_API_URL}/AR/save-draft/${selectedRecord.receipt_id}`, payload);
        toast.info("Draft Saved! You can continue editing later.");
        
        // Update local rows state
        setRows(prevRows => prevRows.map(row => 
            row.receipt_id === selectedRecord.receipt_id 
            ? { ...row, bank_charges: verificationData.bankCharges, tax_rate: verificationData.taxDeduction } 
            : row
        ));

    } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.detail || "Failed to save draft.");
    } finally {
        setSavingDraft(false);
    }
  };

  const handlePostVerification = async () => {
    if (!isBalanced) {
        toast.error(`Amounts do not match! Variance: ${variance.toLocaleString()}`);
        return;
    }

    const payload = {
        customer_id: selectedRecord.customer_id,
        bank_charges: verificationData.bankCharges,
        tax_deduction: verificationData.taxDeduction,
        allocations: verificationData.invoices
            .filter(inv => inv.selected && inv.amount > 0)
            .map(inv => ({
                invoice_id: inv.id,
                invoice_no: inv.invNo,
                payment_type: inv.paymentType,
                amount_allocated: parseFloat(inv.amount)
            }))
    };

    try {
        await axios.put(`${PYTHON_API_URL}/AR/verify/${selectedRecord.receipt_id}`, payload);
        toast.success("Verification Posted Successfully!");
        setVerifyModal(false);
        setRows(prev => prev.filter(r => r.receipt_id !== selectedRecord.receipt_id));
    } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.detail || "Failed to post verification.");
    }
  };

  // --- DATATABLE COLUMN TEMPLATES ---
  const actionBodyTemplate = (rowData) => {
    return (
        <div className="d-flex justify-content-center gap-2">
            <button className="btn btn-link p-0 text-dark fw-bold" onClick={() => handleVerifyOpen(rowData)}>Verify</button>
            <span className="text-muted">|</span>
            <button className="btn btn-link p-0 text-danger fw-bold" onClick={() => { setSelectedRecord(rowData); setReplyModal(true); }}>Reply</button>
        </div>
    );
  };

  const receiptAmountTemplate = (rowData) => {
      return parseFloat(rowData.bank_amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const bankChargesTemplate = (rowData) => {
      return parseFloat(rowData.bank_charges).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  // --- STYLE OBJECT FOR HEADERS ---
  const headerStyleObj = { backgroundColor: '#3e90e2', color: 'white' };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Marketing" breadcrumbItem="AR Verification" />

        <div className="table-responsive">
          {/* UPDATED TO USE PRIME-REACT DATATABLE TO MATCH AR BOOK STYLE */}
          <DataTable 
            value={rows} 
            paginator 
            rows={20} 
            className="p-datatable-gridlines"
            style={{ fontSize: '15px' }} // Matches the 15px font size request
            responsiveLayout="scroll"
            emptyMessage="No pending verifications found."
          >
            <Column field="receiptDate" header="Receipt Date" headerStyle={headerStyleObj}></Column>
            <Column field="notificationDate" header="Notification Date" headerStyle={headerStyleObj}></Column>
            <Column field="customerNameDisplay" header="Customer" headerStyle={headerStyleObj}></Column>
            <Column field="bank_amount" header="Receipt" body={receiptAmountTemplate} className="text-end" headerStyle={headerStyleObj}></Column>
            <Column field="bank_charges" header="Bank Charges" body={bankChargesTemplate} className="text-end" headerStyle={headerStyleObj}></Column>
            <Column header="Action" body={actionBodyTemplate} className="text-center" headerStyle={headerStyleObj}></Column>
          </DataTable>
        </div>

        {/* ================= VERIFY MODAL ================= */}
        <Modal isOpen={verifyModal} toggle={() => setVerifyModal(false)} size="xl" centered>
          <ModalHeader toggle={() => setVerifyModal(false)}>AR Verification</ModalHeader>
          <ModalBody className="pb-4">
            <Row className="mb-3 bg-light p-3 rounded mx-0">
              <Col md={6}>
                  <span className="fw-bold">Customer:</span> <span className="ms-2">{selectedRecord?.customerNameDisplay}</span>
              </Col>
              <Col md={6} className="text-end">
                  <span className="fw-bold text-danger">Overdue Payment:</span> 
                  <span className="ms-2 fw-bold fs-5">0</span>
              </Col>
            </Row>

            {loadingInvoices ? (
                 <div className="text-center p-5">
                    <Spinner color="primary" /> 
                    <div className="mt-2 text-muted">Loading Outstanding Invoices...</div>
                 </div>
            ) : (
                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                <Table bordered hover className="align-middle mb-0 table-sm">
                <thead className="table-light text-center sticky-top" style={{top:0, zIndex: 10}}>
                    <tr>
                    <th>Invoice No.</th>
                    <th>Date</th>
                    <th>Balance Due</th>
                    <th style={{ width: '25%' }}>Payment Type</th>
                    <th>Allocate Amount</th>
                    <th style={{ width: '60px' }}>Select</th>
                    </tr>
                </thead>
                <tbody>
                    {verificationData.invoices.length === 0 ? (
                        <tr><td colSpan="6" className="text-center text-muted p-4">No Outstanding Invoices Found for this Customer.</td></tr>
                    ) : (
                        verificationData.invoices.map((inv, idx) => (
                        <tr key={inv.id} className={inv.selected ? "table-active" : ""}>
                            <td className="text-center">{inv.invNo}</td>
                            <td className="text-center">{inv.date}</td>
                            <td className="text-end">{inv.balanceDue.toLocaleString()}</td>
                            <td className="text-center">
                            <FormGroup check inline>
                                <Input type="radio" name={`pay-${idx}`} 
                                    checked={inv.paymentType === "Full"} 
                                    onChange={() => handleInvoiceChange(idx, "paymentType", "Full")} />
                                <Label check className="ms-1 small">Full</Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Input type="radio" name={`pay-${idx}`} 
                                    checked={inv.paymentType === "Partial"} 
                                    onChange={() => handleInvoiceChange(idx, "paymentType", "Partial")} />
                                <Label check className="ms-1 small">Partial</Label>
                            </FormGroup>
                            </td>
                            <td>
                            <Input 
                                type="number" 
                                className="text-end form-control-sm"
                                value={inv.amount} 
                                disabled={inv.paymentType === "Full" || !inv.selected}
                                onChange={(e) => handleInvoiceChange(idx, "amount", e.target.value)}
                                style={{ maxWidth: '150px', margin: '0 auto' }}
                            />
                            </td>
                            <td className="text-center">
                            <Input type="checkbox" checked={inv.selected} onChange={(e) => handleInvoiceChange(idx, "selected", e.target.checked)} />
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
                </Table>
                </div>
            )}

            <Row className="mt-4 pt-3 border-top align-items-end">
                <Col md={3}>
                    <Label className="fw-bold mb-1 small text-muted">Total Allocated</Label>
                    <Input type="text" className="fw-bold bg-white" value={totalSelected.toLocaleString()} readOnly />
                </Col>
                <Col md={1} className="text-center pb-2">
                    <span className="fw-bold fs-4">+</span>
                </Col>
                
                <Col md={2}>
                    <Label className="fw-bold mb-1 small text-muted">Bank Charges</Label>
                    <Input 
                        type="number" 
                        placeholder="Enter amount"
                        value={verificationData.bankCharges === 0 ? "" : verificationData.bankCharges} 
                        onChange={(e) => setVerificationData({...verificationData, bankCharges: parseFloat(e.target.value) || 0})} 
                    />
                </Col>
                
                <Col md={1} className="text-center pb-2">
                    <span className="fw-bold fs-4 text-dark">-</span>
                </Col>
                
                <Col md={2}>
                    <Label className="fw-bold mb-1 small text-muted">Tax Deduction</Label>
                    <Input 
                        type="number" 
                        placeholder="Enter amount"
                        value={verificationData.taxDeduction === 0 ? "" : verificationData.taxDeduction} 
                        onChange={(e) => setVerificationData({...verificationData, taxDeduction: parseFloat(e.target.value) || 0})} 
                    />
                </Col>
                
                <Col md={3}>
                    <Label className={`fw-bold mb-1 small ${isBalanced ? "text-success" : "text-danger"}`}>
                        Total (Must match {receiptAmount.toLocaleString()})
                    </Label>
                    <div className="input-group">
                          <Input type="text" 
                            className={`fw-bold ${isBalanced ? "is-valid" : "is-invalid"}`} 
                            value={currentTotal.toLocaleString()} readOnly />
                         {!isBalanced && <span className="input-group-text text-danger bg-light" style={{fontSize: '0.8rem'}}>Diff: {variance.toLocaleString()}</span>}
                    </div>
                </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button 
                    color="primary" 
                    onClick={handleSaveDraft} 
                    disabled={savingDraft || loadingInvoices}
                    style={{width: '120px'}}
                >
                    {savingDraft ? <Spinner size="sm" /> : "Save"}
                </Button>
                
                <Button 
                    color="success" 
                    onClick={handlePostVerification} 
                    disabled={!isBalanced || loadingInvoices} 
                    style={{width: '140px'}}
                >
                    Post
                </Button>
                
                <Button 
                    onClick={() => setVerifyModal(false)} 
                    style={{ width: '100px', backgroundColor: '#d9534f', borderColor: '#d9534f', color: 'white' }}
                >
                    Cancel
                </Button>
            </div>

          </ModalBody>
        </Modal>

        {/* ================= REPLY MODAL ================= */}
        <Modal isOpen={replyModal} toggle={() => setReplyModal(false)} centered>
          <ModalHeader toggle={() => setReplyModal(false)}>Send Reply</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Message</Label>
              <Input type="textarea" rows="4" placeholder="Enter your reply to Marketing..." />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => { toast.success("Reply Sent!"); setReplyModal(false); }}>Send <i className="bx bx-send ms-1"></i></Button>
          </ModalFooter>
        </Modal>

      </div>
    </div>
  );
};

export default VerifyCustomer;