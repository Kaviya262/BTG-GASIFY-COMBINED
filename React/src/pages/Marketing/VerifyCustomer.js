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
  Table,
  Spinner
} from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { PYTHON_API_URL } from "common/pyapiconfig";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";

import { GetCustomerFilter } from "../FinanceModule/service/financeapi";
import { GetBankList } from "common/data/mastersapi";

// --- IMPORT LOGO ---
// Adjust the '../' depth if your file is deeper in the folder structure
import logo from "../../assets/images/logo.png";

// --- HELPER: Number to Words ---
const numberToWords = (amount) => {
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const thousands = ["", "Thousand", "Million", "Billion"];

  const toWords = (num) => {
    if (num === 0) return "";
    else if (num < 10) return units[num];
    else if (num < 20) return teens[num - 10];
    else if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + units[num % 10] : "");
    else return units[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " " + toWords(num % 100) : "");
  };

  if (amount === 0) return "Zero";

  let str = "";
  let i = 0;

  const parts = amount.toString().split(".");
  let num = parseInt(parts[0]);

  while (num > 0) {
    if (num % 1000 !== 0) {
      str = toWords(num % 1000) + " " + thousands[i] + " " + str;
    }
    num = Math.floor(num / 1000);
    i++;
  }

  return str.trim();
};

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
  const [printModal, setPrintModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Verification Form State
  const [verificationData, setVerificationData] = useState({
    taxDeduction: 0,
    bankCharges: 0,
    advancePayment: 0,
    exchangeRate: 1,
    replyMessage: "",
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
          currencyCode: item.CurrencyCode || "IDR",
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
    const initialExchangeRate = parseFloat(record.exchange_rate) || 1;
    const initialAdvance = parseFloat(record.cash_amount) || 0;

    try {
      const res = await axios.get(`${PYTHON_API_URL}/AR/get-outstanding-invoices/${record.customer_id}`);

      let invoiceList = [];
      if (res.data && res.data.status === "success") {
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
        advancePayment: initialAdvance,
        exchangeRate: initialExchangeRate,
        replyMessage: "",
        invoices: invoiceList
      });

    } catch (error) {
      console.error("Error fetching invoices", error);
      toast.error("Could not load customer invoices");
      setVerificationData({
        taxDeduction: initialTaxDeduction,
        bankCharges: initialBankCharges,
        advancePayment: 0,
        exchangeRate: initialExchangeRate,
        replyMessage: "",
        invoices: []
      });
    } finally {
      setLoadingInvoices(false);
    }
  };

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

  // --- LOGIC ---
  const totalAllocated = verificationData.invoices.filter(inv => inv.selected).reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
  const receiptAmount = selectedRecord ? parseFloat(selectedRecord.bank_amount) : 0;
  const totalDeductions = verificationData.bankCharges + verificationData.taxDeduction;
  const utilizedAmount = totalAllocated + totalDeductions + verificationData.advancePayment;
  const variance = receiptAmount - utilizedAmount;
  const isValid = Math.abs(variance) < 1;

  const getPayload = () => ({
    customer_id: selectedRecord.customer_id,
    bank_charges: verificationData.bankCharges,
    tax_deduction: verificationData.taxDeduction,
    advance_payment: verificationData.advancePayment,
    exchange_rate: verificationData.exchangeRate,
    reply_message: verificationData.replyMessage,
    allocations: verificationData.invoices
      .filter(inv => inv.selected)
      .map(inv => ({
        invoice_id: inv.id,
        invoice_no: inv.invNo,
        payment_type: inv.paymentType,
        amount_allocated: parseFloat(inv.amount) || 0
      }))
  });

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      await axios.put(`${PYTHON_API_URL}/AR/save-draft/${selectedRecord.receipt_id}`, getPayload());
      toast.info("Draft Saved successfully.");
      setRows(prevRows => prevRows.map(row =>
        row.receipt_id === selectedRecord.receipt_id
          ? { ...row, bank_charges: verificationData.bankCharges, tax_rate: verificationData.taxDeduction }
          : row
      ));
    } catch (err) { toast.error("Failed to save draft."); } finally { setSavingDraft(false); }
  };

  const handleSendReply = async () => {
    if (!verificationData.replyMessage) { toast.warn("Please enter a message."); return; }
    try {
      await axios.put(`${PYTHON_API_URL}/AR/save-draft/${selectedRecord.receipt_id}`, {
        ...getPayload(),
        reply_message: verificationData.replyMessage
      });
      toast.success("Reply Sent!");
      setReplyModal(false);
      setVerificationData({ ...verificationData, replyMessage: "" });
    } catch (err) { toast.error("Failed to send reply."); }
  };

  const handlePostVerification = async () => {
    if (!isValid) {
      toast.error(`Amounts do not match! Variance: ${variance.toLocaleString()}`);
      return;
    }
    try {
      await axios.put(`${PYTHON_API_URL}/AR/verify/${selectedRecord.receipt_id}`, getPayload());
      toast.success("Verification Posted Successfully!");
      setVerifyModal(false);
      setRows(prev => prev.filter(r => r.receipt_id !== selectedRecord.receipt_id));
    } catch (err) { toast.error("Failed to post verification."); }
  };

  // --- PRINT FUNCTIONALITY ---
  const handlePrintPreview = (rowData) => {
    setSelectedRecord(rowData);
    setPrintModal(true);
  };

  const triggerPrint = () => {
    const printContent = document.getElementById("receipt-print-section").innerHTML;
    const printWindow = window.open("", "_blank");

    // We add <base href> so that the relative path to the image works in the new window
    printWindow.document.write(`
        <html>
            <head>
                <title>Official Receipt - ${selectedRecord?.receipt_id}</title>
                <base href="${window.location.origin}/" />
                <style>
                    body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; }
                    .receipt-container { border: 2px solid #1a2c5b; padding: 30px; position: relative; width: 100%; max-width: 1000px; margin: auto; height: 650px; }
                    
                    /* Header */
                    .header { display: flex; align-items: center; border-bottom: 2px solid #1a2c5b; padding-bottom: 10px; margin-bottom: 20px; }
                    .logo { width: 120px; margin-right: 25px; }
                    .company-details h2 { margin: 0; color: #1a2c5b; font-size: 26px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                    .company-details p { margin: 3px 0; font-size: 13px; color: #333; }
                    .receipt-no { position: absolute; top: 40px; right: 30px; font-size: 22px; color: #d92525; font-weight: bold; font-family: monospace; }
                    
                    /* Title */
                    .receipt-title { text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0 35px 0; color: #1a2c5b; letter-spacing: 2px; text-decoration: underline double; }

                    /* Body Grid */
                    .content-grid { display: grid; grid-template-columns: 180px 15px 1fr; grid-gap: 15px 5px; align-items: baseline; margin-bottom: 30px; }
                    .label { font-weight: bold; color: #1a2c5b; font-size: 16px; white-space: nowrap; }
                    .colon { font-weight: bold; color: #1a2c5b; font-size: 16px; text-align: center; }
                    .value { border-bottom: 1px solid #1a2c5b; padding-left: 10px; font-size: 16px; position: relative; min-height: 24px; color: #000; }
                    
                    /* Slanted Box Effect */
                    .slanted-container {
                        position: relative;
                        display: inline-block;
                        width: 100%;
                        padding: 5px 10px;
                    }
                    .slanted-box {
                        border: 1px solid #1a2c5b;
                        transform: skewX(-20deg);
                        padding: 8px;
                        background: #fff;
                    }
                    .slanted-content {
                        transform: skewX(20deg); /* Counter skew text */
                        font-weight: bold;
                    }

                    /* Amount Row */
                    .amount-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; }
                    .amount-label { font-weight: bold; color: #1a2c5b; font-size: 16px; margin-right: 15px; }
                    
                    .amount-box-container {
                        border: 1px solid #1a2c5b;
                        width: 300px;
                        padding: 10px;
                        transform: skewX(-20deg);
                        text-align: center;
                        background-color: white;
                    }
                    .amount-text {
                        transform: skewX(20deg);
                        font-weight: bold;
                        font-size: 20px;
                        color: #000;
                    }

                    /* Footer */
                    .footer { display: flex; justify-content: space-between; margin-top: 50px; align-items: flex-end; }
                    .bank-note { font-size: 11px; color: #1a2c5b; width: 60%; line-height: 1.5; font-weight: 500; }
                    .signature { text-align: center; width: 35%; }
                    .signature-line { border-bottom: 1px solid #000; margin-top: 80px; width: 100%; }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
        </html>
      `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="d-flex justify-content-center gap-2 align-items-center">
        <button className="btn btn-link p-0 text-dark fw-bold" onClick={() => handleVerifyOpen(rowData)}>Verify</button>
        <span className="text-muted">|</span>
        <button className="btn btn-link p-0 text-danger fw-bold" onClick={() => {
          setSelectedRecord(rowData);
          setVerificationData(prev => ({ ...prev, replyMessage: "" }));
          setReplyModal(true);
        }}>Reply</button>
        <span className="text-muted">|</span>
        <button className="btn btn-link p-0 text-secondary" onClick={() => handlePrintPreview(rowData)} title="Print Receipt">
          <i className="bx bx-printer font-size-18"></i>
        </button>
      </div>
    );
  };

  const headerStyleObj = { backgroundColor: '#3e90e2', color: 'white' };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Marketing" breadcrumbItem="AR Verification" />

        <div className="table-responsive">
          <DataTable
            value={rows}
            paginator
            rows={20}
            className="p-datatable-gridlines"
            style={{ fontSize: '15px' }}
            responsiveLayout="scroll"
            emptyMessage="No pending verifications found."
          >
            <Column field="receiptDate" header="Receipt Date" headerStyle={headerStyleObj}></Column>
            <Column field="customerNameDisplay" header="Customer" headerStyle={headerStyleObj}></Column>
            <Column field="bank_amount" header="Receipt" body={(r) => parseFloat(r.bank_amount).toLocaleString()} className="text-end" headerStyle={headerStyleObj}></Column>
            <Column field="currencyCode" header="Currency" className="text-center" headerStyle={headerStyleObj}></Column>
            <Column header="Action" body={actionBodyTemplate} className="text-center" headerStyle={headerStyleObj}></Column>
          </DataTable>
        </div>

        {/* ================= VERIFY MODAL ================= */}
        <Modal isOpen={verifyModal} toggle={() => setVerifyModal(false)} size="xl" centered>
          {/* ... [KEEP VERIFY MODAL CONTENT AS IS] ... */}
          <ModalHeader toggle={() => setVerifyModal(false)}>AR Verification</ModalHeader>
          <ModalBody className="pb-4">
            <Row className="mb-3 bg-light p-3 rounded mx-0">
              <Col md={4}><span className="fw-bold">Customer:</span> <span className="ms-2">{selectedRecord?.customerNameDisplay}</span></Col>
              <Col md={4} className="text-center"><span className="fw-bold">Amount:</span> <span className="ms-2 text-primary fs-5">{receiptAmount.toLocaleString()} {selectedRecord?.currencyCode}</span></Col>
              <Col md={4}>
                <FormGroup className="mb-0 d-flex align-items-center justify-content-end">
                  <Label className="me-2 mb-0 fw-bold">Exchange Rate:</Label>
                  <Input type="number" style={{ width: '100px' }} value={verificationData.exchangeRate} disabled={selectedRecord?.currencyCode === "IDR"} onChange={(e) => setVerificationData({ ...verificationData, exchangeRate: e.target.value })} />
                </FormGroup>
              </Col>
            </Row>
            {loadingInvoices ? <div className="text-center p-5"><Spinner color="primary" /></div> : (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <Table bordered hover className="align-middle mb-0 table-sm">
                  <thead className="table-light text-center sticky-top" style={{ top: 0, zIndex: 10 }}>
                    <tr><th>Invoice No.</th><th>Date</th><th>Balance Due</th><th style={{ width: '25%' }}>Payment Type</th><th>Allocate Amount</th><th style={{ width: '60px' }}>Select</th></tr>
                  </thead>
                  <tbody>
                    {verificationData.invoices.length === 0 ? <tr><td colSpan="6" className="text-center text-muted p-4">No Outstanding Invoices Found.</td></tr> : verificationData.invoices.map((inv, idx) => (
                      <tr key={inv.id} className={inv.selected ? "table-active" : ""}>
                        <td className="text-center">{inv.invNo}</td><td className="text-center">{inv.date}</td><td className="text-end">{inv.balanceDue.toLocaleString()}</td>
                        <td className="text-center">
                          <FormGroup check inline><Input type="radio" name={`pay-${idx}`} checked={inv.paymentType === "Full"} onChange={() => handleInvoiceChange(idx, "paymentType", "Full")} /><Label check className="ms-1 small">Full</Label></FormGroup>
                          <FormGroup check inline><Input type="radio" name={`pay-${idx}`} checked={inv.paymentType === "Partial"} onChange={() => handleInvoiceChange(idx, "paymentType", "Partial")} /><Label check className="ms-1 small">Partial</Label></FormGroup>
                        </td>
                        <td><Input type="number" className="text-end form-control-sm" value={inv.amount} disabled={inv.paymentType === "Full" || !inv.selected} onChange={(e) => handleInvoiceChange(idx, "amount", e.target.value)} style={{ maxWidth: '150px', margin: '0 auto' }} /></td>
                        <td className="text-center"><Input type="checkbox" checked={inv.selected} onChange={(e) => handleInvoiceChange(idx, "selected", e.target.checked)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            <Row className="mt-4 pt-3 border-top align-items-end">
              <Col md={2}><Label className="fw-bold mb-1 small text-muted">Allocated</Label><Input type="text" className="fw-bold bg-white" value={totalAllocated.toLocaleString()} readOnly /></Col>
              <Col md={2}><Label className="fw-bold mb-1 small text-muted">Bank Charges</Label><Input type="number" value={verificationData.bankCharges === 0 ? "" : verificationData.bankCharges} onChange={(e) => setVerificationData({ ...verificationData, bankCharges: parseFloat(e.target.value) || 0 })} /></Col>
              <Col md={2}><Label className="fw-bold mb-1 small text-muted">Tax Deduction</Label><Input type="number" value={verificationData.taxDeduction === 0 ? "" : verificationData.taxDeduction} onChange={(e) => setVerificationData({ ...verificationData, taxDeduction: parseFloat(e.target.value) || 0 })} /></Col>
              <Col md={3}><Label className="fw-bold mb-1 small text-success">Advance Payment</Label><Input type="number" className="fw-bold text-success" value={verificationData.advancePayment === 0 ? "" : verificationData.advancePayment} onChange={(e) => setVerificationData({ ...verificationData, advancePayment: parseFloat(e.target.value) || 0 })} placeholder="Enter advance..." /></Col>
              <Col md={3}><Label className={`fw-bold mb-1 small ${isValid ? "text-success" : "text-danger"}`}>Total Utilized</Label><div className="input-group"><Input type="text" className={`fw-bold ${isValid ? "is-valid" : "is-invalid"}`} value={utilizedAmount.toLocaleString()} readOnly />{!isValid && <span className="input-group-text text-danger bg-light" style={{ fontSize: '0.8rem' }}>Diff: {variance.toLocaleString()}</span>}</div></Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button color="primary" onClick={handleSaveDraft} disabled={savingDraft || loadingInvoices} style={{ width: '120px' }}>{savingDraft ? <Spinner size="sm" /> : "Save Draft"}</Button>
              <Button color="success" onClick={handlePostVerification} disabled={!isValid || loadingInvoices} style={{ width: '140px' }}>Verify (Post)</Button>
              <Button onClick={() => setVerifyModal(false)} color="secondary">Cancel</Button>
            </div>
          </ModalBody>
        </Modal>

        {/* ================= REPLY MODAL ================= */}
        <Modal isOpen={replyModal} toggle={() => setReplyModal(false)} centered>
          <ModalHeader toggle={() => setReplyModal(false)}>Send Reply</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Message to Finance:</Label>
              <Input type="textarea" rows="4" placeholder="Enter your reply..." value={verificationData.replyMessage} onChange={(e) => setVerificationData({ ...verificationData, replyMessage: e.target.value })} />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setReplyModal(false)}>Cancel</Button>
            <Button color="primary" onClick={handleSendReply}>Send <i className="bx bx-send ms-1"></i></Button>
          </ModalFooter>
        </Modal>

        {/* ================= PRINT PREVIEW MODAL ================= */}
        <Modal
          isOpen={printModal}
          toggle={() => setPrintModal(false)}
          size="xl"
          centered
          style={{ maxWidth: '1100px', width: '95%' }}
        >
          <ModalHeader toggle={() => setPrintModal(false)}>Receipt Preview</ModalHeader>
          <ModalBody className="p-4" style={{ backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
            <div id="receipt-print-section" className="receipt-container" style={{
              backgroundColor: 'white',
              border: '2px solid #1a2c5b',
              padding: '40px',
              position: 'relative',
              width: '100%',
              height: '650px',
              color: '#000',
              fontFamily: "'Times New Roman', serif"
            }}>
              {/* Header */}
              <div className="header" style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #1a2c5b', paddingBottom: '15px', marginBottom: '30px' }}>
                <div className="logo" style={{ width: '120px', marginRight: '30px' }}>
                  {/* --- UPDATED LOGO: Uses the imported logo variable --- */}
                  <img src={logo} alt="BTG Logo" style={{ width: '100%' }} />
                </div>
                <div className="company-details" style={{ flexGrow: 1 }}>
                  <h2 style={{ margin: 0, color: '#1a2c5b', fontSize: '28px', fontWeight: 'bold' }}>PT. BATAM TEKNOLOGI GAS</h2>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}>Jalan Brigjen Katamso KM. 3, Tanjung Uncang, Batam - Indonesia</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}>Telp: (+62) 778 462959, 391918</p>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#333' }}>Website: www.ptbtg.com | E-mail: ptbtg@ptbtg.com</p>
                </div>
                <div className="receipt-no" style={{ fontSize: '22px', color: '#d92525', fontWeight: 'bold', position: 'absolute', top: '40px', right: '40px', fontFamily: 'monospace' }}>
                  No. : {selectedRecord?.receipt_id}
                </div>
              </div>

              {/* Title */}
              <div className="receipt-title" style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', textDecoration: 'underline double', marginBottom: '40px', color: '#1a2c5b', letterSpacing: '2px' }}>
                OFFICIAL RECEIPT
              </div>

              {/* Content Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '180px 15px 1fr', gridGap: '20px 5px', alignItems: 'baseline', marginBottom: '40px' }}>

                {/* Received From */}
                <div className="label" style={{ fontWeight: 'bold', color: '#1a2c5b', fontSize: '16px', whiteSpace: 'nowrap' }}>Received From</div>
                <div className="colon" style={{ fontWeight: 'bold', color: '#1a2c5b', fontSize: '16px', textAlign: 'center' }}>:</div>
                <div className="value" style={{ borderBottom: '1px solid #1a2c5b', paddingLeft: '10px', fontSize: '16px' }}>
                  {selectedRecord?.customerNameDisplay}
                </div>

                {/* The Sum Of (Slanted Box) */}
                <div className="label" style={{ fontWeight: 'bold', color: '#1a2c5b', fontSize: '16px', whiteSpace: 'nowrap' }}>The Sum Of</div>
                <div className="colon" style={{ fontWeight: 'bold', color: '#1a2c5b', fontSize: '16px', textAlign: 'center' }}>:</div>
                <div className="slanted-box" style={{ border: '1px solid #1a2c5b', transform: 'skewX(-20deg)', padding: '8px', background: '#fff' }}>
                  <div style={{ transform: 'skewX(20deg)', fontWeight: 'bold', fontSize: '16px' }}>
                    {numberToWords(parseFloat(selectedRecord?.bank_amount || 0))} {selectedRecord?.currencyCode === "IDR" ? "Rupiah" : selectedRecord?.currencyCode} Only
                  </div>
                </div>

                {/* Being Payment Of */}
                <div className="label" style={{ fontWeight: 'bold', color: '#1a2c5b', fontSize: '16px', whiteSpace: 'nowrap' }}>Being Payment Of</div>
                <div className="colon" style={{ fontWeight: 'bold', color: '#1a2c5b', fontSize: '16px', textAlign: 'center' }}>:</div>
                <div className="value" style={{ borderBottom: '1px solid #1a2c5b', paddingLeft: '10px', fontSize: '16px' }}>
                  {selectedRecord?.reference_no || "Payment for Invoices"}
                </div>
              </div>

              {/* Amount & Signature Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>

                {/* Left Side: Amount & Cash/Cheque */}
                <div style={{ width: '60%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
                    <div className="label" style={{ fontWeight: 'bold', color: '#1a2c5b', fontSize: '16px', marginRight: '15px' }}>
                      Amount {selectedRecord?.currencyCode === 'IDR' ? 'Rp' : '$'} :
                    </div>
                    <div style={{
                      border: '1px solid #1a2c5b',
                      width: '300px',
                      padding: '10px',
                      transform: 'skewX(-20deg)',
                      textAlign: 'center',
                      background: '#fff'
                    }}>
                      <span style={{ display: 'inline-block', transform: 'skewX(20deg)', fontWeight: 'bold', fontSize: '20px' }}>
                        {parseFloat(selectedRecord?.bank_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <div className="label" style={{ fontWeight: 'bold', color: '#1a2c5b', fontSize: '16px', marginRight: '10px', whiteSpace: 'nowrap' }}>
                      Cash/Cheque/Transfer :
                    </div>
                    <div style={{ borderBottom: '1px solid #1a2c5b', flexGrow: 1 }}></div>
                  </div>
                </div>

                {/* Right Side: Date & Signature */}
                <div style={{ textAlign: 'center', width: '35%' }}>
                  <div style={{ fontSize: '16px', marginBottom: '5px', color: '#000' }}>Batam, {selectedRecord?.receiptDate}</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a2c5b' }}>Received by,</div>
                  <div style={{ borderBottom: '1px solid #000', marginTop: '80px', width: '100%' }}></div>
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>( .............................................. )</div>
                </div>
              </div>

              {/* Footer Note */}
              <div style={{ marginTop: '40px' }}>
                <div style={{ fontSize: '11px', color: '#1a2c5b', width: '60%', lineHeight: '1.5', fontWeight: '500' }}>
                  <strong>Note :</strong><br />
                  Cheque should be crossed and made payable to PT. BATAM TEKNOLOGI GAS<br />
                  Payment Via Transfer, Bank details are as follows :<br />
                  Bank Name : <strong>MAYBANK (Batam Branch)</strong>, A/C No. 2502-0000-59<br />
                  A/C Name : <strong>PT. BATAM TEKNOLOGI GAS</strong><br />
                  Payment is valid if the cheque can be withdrawn or cleared into our bank account
                </div>
              </div>

            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setPrintModal(false)}>Close</Button>
            <Button color="info" onClick={triggerPrint}><i className="bx bx-printer me-1"></i> Print</Button>
          </ModalFooter>
        </Modal>

      </div>
    </div>
  );
};

export default VerifyCustomer;