import React, { useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import {
  Card, CardBody, Col, Container, Row, FormGroup, Label, Input, Modal, ModalBody, ModalHeader,
} from "reactstrap";
import Select from "react-select";
import { Button } from "primereact/button";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { getARByCustomer, GetCustomerFilter } from "./service/financeapi";
import { GetBankList, GetAllCurrencies } from "common/data/mastersapi"; 
import axios from "axios";
import { toast } from 'react-toastify';
import { PYTHON_API_URL } from "common/pyapiconfig";

const Breadcrumbs = ({ title, breadcrumbItem }) => (
  <div className="page-title-box d-sm-flex pb-3 align-items-center justify-content-between">
    <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
    <div className="page-title-right">
      <ol className="breadcrumb m-0">
        <li className="breadcrumb-item"><a href="/#">{title}</a></li>
        <li className="breadcrumb-item active"><a href="/#">{breadcrumbItem}</a></li>
      </ol>
    </div>
  </div>
);

const bankPaymentViaMap = { cheque: 1, bankTransfer: 2, giro: 3 };

const getPaymentViaString = (id) => {
    return Object.keys(bankPaymentViaMap).find(key => bankPaymentViaMap[key] === id) || "";
};

const initialValues = {
  currencyMode: "Transaction",
  receiptDate: new Date(),
  taxRate: 0,
  proofMissing: false,
  modes: { cash: false, bank: false, contra: false },
  cashAmount: "",
  bankPaymentVia: "",
  bankAmount: "",
  depositBankId: "", 
  depositAccountNumber: "", 
  contraReference: "",
  contraAmount: "",
  receipt_id: 0,
};

const AccountsReceivable = () => {

  // --- 1. Define State Variables ---
  const [formValues, setFormValues] = useState(initialValues);
  const [btgBankOptions, setbtgBankOptions] = useState([]);
  const [accountOptionsMap, setaccountOptionsMap] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [invoiceList, setInvoiceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [currencyRates, setCurrencyRates] = useState({});

  const validationSchema = Yup.object().shape({
    taxRate: Yup.number().required("Tax Rate is required"),
    modes: Yup.object().shape({
      cash: Yup.boolean(),
      bank: Yup.boolean(),
      contra: Yup.boolean(),
    }),
    cashAmount: Yup.number().when("modes.cash", {
      is: true,
      then: Yup.number().min(0, "Cannot be negative").required("Cash amount required"),
    }),
    bankAmount: Yup.number().when("modes.bank", {
      is: true,
      then: Yup.number().min(0, "Cannot be negative").required("Bank amount required"),
    }),
    contraAmount: Yup.number().when("modes.contra", {
      is: true,
      then: Yup.number().min(0, "Cannot be negative").required("Contra amount required"),
    }),
  });

  const getAccountOptions = (bankId) => accountOptionsMap[bankId] || [];

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  useEffect(() => {
    const load = async () => {
      const customers = await GetCustomerFilter(1, "%");
      setOptions(customers);
    };

    const loadBankList = async () => {
      const data = await GetBankList(1, 1);
      const options = data.map(item => ({
        value: item.value,
        label: item.BankName
      }));
      setbtgBankOptions(options);

      const accountOptions = data.reduce((acc, item) => {
        const key = item.value; 
        const accountInfo = {
          value: item.AccountNumber,
          label: item.AccountNumber, 
        };
        
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(accountInfo);
        return acc;
      }, {});
      setaccountOptionsMap(accountOptions);
    };

    const loadRates = async () => {
        const result = await GetAllCurrencies({});
        if (result.status && result.data) {
            const rateMap = {};
            result.data.forEach(curr => {
                rateMap[curr.CurrencyCode] = curr.ExchangeRate;
            });
            setCurrencyRates(rateMap);
        }
    };

    getinvoice(0);
    load();
    loadBankList();
    loadRates();
  }, []);

  const getinvoice = async (customerid) => {
    setLoading(true);
    try {
      console.log("Fetching Data for Customer:", customerid);

      const invoicePromise = getARByCustomer({ customerId: customerid, orgId: 1, branchId: 1 });

      const bookPromise = axios.get(`${PYTHON_API_URL}/AR/get-book`, {
          params: { 
              customer_id: customerid,
              from_date: "2000-01-01", 
              to_date: "2099-12-31" 
          }
      });

      const [arData, bookResponse] = await Promise.all([invoicePromise, bookPromise]);

      let history = [];
      if(bookResponse.data && bookResponse.data.status === "success") {
          history = bookResponse.data.data;
      }

      if (arData.status && arData.data?.length > 0) {
        const response = arData.data.map(item => {
          
          const matchingReceipt = history.find(h => h.ar_id === item.ar_id);
          let flagValue = 0; 

          if (matchingReceipt) {
              flagValue = matchingReceipt.flag === true || matchingReceipt.flag === 1 ? 1 : 0;
          }

          return {
            id: item.ar_id,
            invoiceNo: item.invoice_no,
            invDate: new Date(item.invoice_date),
            customerName: item.customer_name,
            invAmount: item.inv_amount,
            
            // NOTE: We keep raw DB value here, but will override it in the 'processedList' for display
            invoice_amt_idr: item.invoice_amt_idr, 
            
            alreadyReceived: item.already_received,
            advance_payment: item.advance_payment,
            balanceAmount: item.balance_amount,
            paymentAmount: item.balance_amount,
            CurrencyCode: item.CurrencyCode,
            isPartial: item.is_partial,
            
            receipt_id: matchingReceipt ? matchingReceipt.receipt_id : 0,
            flag: flagValue, 
            
            saved_cash_amount: matchingReceipt ? matchingReceipt.cash_amount : 0,
            saved_bank_amount: matchingReceipt ? matchingReceipt.bank_amount : 0,
            saved_contra_amount: matchingReceipt ? matchingReceipt.contra_amount : 0,
            saved_deposit_bank_id: matchingReceipt ? matchingReceipt.deposit_bank_id : "",
            saved_deposit_account_number: matchingReceipt ? matchingReceipt.deposit_account_number : "",
            saved_bank_payment_via: matchingReceipt ? matchingReceipt.bank_payment_via : 0,
            saved_receipt_date: matchingReceipt ? matchingReceipt.receipt_date : null,
            saved_tax_rate: matchingReceipt ? matchingReceipt.tax_rate : 0
          };
        });
        setInvoiceList(response);
      } else setInvoiceList([]);
    } catch (err) {
      console.error("Data Load Error:", err);
      toast.error("Failed to load AR data");
      setInvoiceList([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Derived List for Display: Calculates IDR Amount on the fly ---
  const processedInvoiceList = invoiceList.map(item => {
      const rate = currencyRates[item.CurrencyCode] || 1;
      return {
          ...item,
          // Recalculate IDR amount: Invoice Amount * Exchange Rate
          invoice_amt_idr: (item.invAmount * rate)
      };
  });

  const handleEditReceipt = async (rowData) => {
    if (!rowData.receipt_id) return;

    try {
        const response = await axios.get(`${PYTHON_API_URL}/AR/get-by-id`, {
            params: { receipt_id: rowData.receipt_id }
        });

        if (response.data && response.data.status === "success") {
            const data = response.data.data;

            const totalSaved = (parseFloat(data.cash_amount) || 0) + 
                               (parseFloat(data.bank_amount) || 0) + 
                               (parseFloat(data.contra_amount) || 0);

            const invoiceWithPayment = {
                ...rowData,
                paymentAmount: totalSaved 
            };
            setSelectedInvoices([invoiceWithPayment]); 

            const hasCash = parseFloat(data.cash_amount) > 0;
            const hasBank = parseFloat(data.bank_amount) > 0;
            const hasContra = parseFloat(data.contra_amount) > 0;

            setFormValues({
                ...initialValues, 
                currencyMode: "Transaction", 
                receiptDate: data.receipt_date ? new Date(data.receipt_date) : new Date(),
                taxRate: data.tax_rate || 0,
                proofMissing: data.proof_missing || false,
                modes: { 
                    cash: hasCash, 
                    bank: hasBank, 
                    contra: hasContra 
                },
                cashAmount: hasCash ? data.cash_amount : "",
                bankAmount: hasBank ? data.bank_amount : "",
                contraAmount: hasContra ? data.contra_amount : "",
                bankPaymentVia: getPaymentViaString(data.bank_payment_via),
                depositBankId: data.deposit_bank_id ? parseInt(data.deposit_bank_id) : "",
                depositAccountNumber: data.deposit_account_number || "",
                contraReference: data.contra_reference || "",
                receipt_id: data.receipt_id, 
            });

            setIsModalOpen(true);
        }
    } catch (err) {
        console.error("Error loading receipt:", err);
        toast.error("Failed to load receipt details.");
    }
  };

  const openReceipt = () => {
    if (!selectedCustomer) {
      toast.error("Please select a Customer first.");
      return;
    }

    const freshSelection = invoiceList.filter(item => 
        selectedInvoices.some(sel => sel.id === item.id)
    );

    if (freshSelection.length === 0) {
        toast.error("Please select at least one invoice checkbox.");
        return;
    }

    const selectedWithZeroPayment = freshSelection.filter(i => 
        !i.paymentAmount || parseFloat(String(i.paymentAmount).replace(/,/g, '')) === 0
    );
    
    if (selectedWithZeroPayment.length > 0) {
      toast.error("Enter a valid Payment Amount for the selected rows.");
      return;
    }
    
    let totalGridAmount = 0;
    freshSelection.forEach(inv => {
        const val = parseFloat(String(inv.paymentAmount || "0").replace(/,/g, '')) || 0;
        totalGridAmount += val;
    });

    setFormValues({
        ...initialValues,
        currencyMode: "Transaction", 
        modes: { cash: true, bank: false, contra: false },
        cashAmount: totalGridAmount > 0 ? totalGridAmount : "",
        bankAmount: "",
        bankPaymentVia: "bankTransfer", 
        receipt_id: 0 
    });
    
    setSelectedInvoices(freshSelection);
    setIsModalOpen(true);
  };

  const update = async (values) => {
    const parseSafeFloat = (val) => {
        if (!val) return 0;
        return parseFloat(String(val).replace(/,/g, '')) || 0;
    };

    const cashVal = values.modes.cash ? parseSafeFloat(values.cashAmount) : 0;
    const bankVal = values.modes.bank ? parseSafeFloat(values.bankAmount) : 0;
    const contraVal = values.modes.contra ? parseSafeFloat(values.contraAmount) : 0;
    const totalEntered = cashVal + bankVal + contraVal; 

    let totalTransactionCurrency = 0;
    let totalIDRCurrency = 0;

    selectedInvoices.forEach(inv => {
        const payAmt = parseSafeFloat(inv.paymentAmount);
        totalTransactionCurrency += payAmt;
        const currentRate = currencyRates[inv.CurrencyCode] || 1;
        totalIDRCurrency += (payAmt * currentRate);
    });

    const targetForValidation = values.currencyMode === "IDR" ? totalIDRCurrency : totalTransactionCurrency;
    if (Math.abs(totalEntered - targetForValidation) > 1.00) {
      toast.error(`Total Mismatch! Entered: ${totalEntered.toLocaleString()} | Required: ${targetForValidation.toLocaleString()}`);
      return;
    }

    let payloadCash = 0;
    let payloadBank = 0;

    if (values.currencyMode === "IDR" && totalIDRCurrency > 0) {
        const cashRatio = cashVal / totalEntered;
        const bankRatio = bankVal / totalEntered;
        payloadCash = totalTransactionCurrency * cashRatio;
        payloadBank = totalTransactionCurrency * bankRatio;
    } else {
        payloadCash = cashVal;
        payloadBank = bankVal;
    }

    const payload = {
      orgId: 1,
      branchId: 1,
      userId: 1,
      userIp: "0.0.0.0",
      currency_mode: values.currencyMode,
      header: selectedInvoices.map(inv => {
        const payAmt = parseSafeFloat(inv.paymentAmount);
        
        return {
            customer_id: selectedCustomer?.value ? parseInt(selectedCustomer.value) : 0, 
            ar_id: inv.id, 
            receipt_id: values.receipt_id || 0,
            payment_amount: payAmt,
            cash_amount: payloadCash,
            bank_amount: payloadBank,
            contra_amount: values.modes.contra ? parseSafeFloat(values.contraAmount) : 0,
            tax_rate: Number(values.taxRate),
            bank_payment_via: values.bankPaymentVia ? bankPaymentViaMap[values.bankPaymentVia] : 0,
            deposit_bank_id: values.depositBankId ? String(values.depositBankId) : "0", 
            deposit_account_number: values.depositAccountNumber ? String(values.depositAccountNumber) : "",
            bank_name: "", 
            cheque_number: "", 
            giro_number: "", 
            contra_reference: values.contraReference || "",
            proof_missing: values.proofMissing || false,
        };
      })
    };
    
    setIsSubmitting(true);
    try {
      let response;
      if (values.receipt_id && values.receipt_id > 0) {
          console.log("Updating existing receipt via Python...");
          const res = await axios.put(`${PYTHON_API_URL}/AR/update`, payload);
          response = res.data;
      } else {
          console.log("Creating new receipt via Python...");
          const res = await axios.post(`${PYTHON_API_URL}/AR/create`, payload);
          response = res.data;
      }

      if (response.status === "success" || response.status === true) {
        toast.success("Receipt saved successfully!");
        setIsModalOpen(false);
        getinvoice(selectedCustomer?.value || 0); 
      } else {
        toast.error("Failed to save receipt");
      }

    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Error while saving receipt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplay = (val) => {
    if (val === undefined || val === null) return "";
    const strVal = String(val);
    const [integer, decimal] = strVal.split(".");
    const withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimal !== undefined ? `${withCommas}.${decimal}` : withCommas;
  };

  // --- Updated Export to use Calculated IDR Amount ---
  const exportToCSV = () => {
    if (processedInvoiceList.length === 0) {
      toast.warn("No data available to export");
      return;
    }
  
    const header = [
      "Ref No",
      "Ref Date",
      "Customer Name",
      "Currency",
      "Invoice Amount",
      "Invoice Amount (IDR)",
      "Already Received",
      "Advance Amount",
      "Balance Amount",
      "Payment Amount",
    ];
  
    const rows = processedInvoiceList.map(inv => [
      inv.invoiceNo,
      new Intl.DateTimeFormat("en-GB").format(inv.invDate),
      inv.customerName,
      inv.CurrencyCode,
      inv.invAmount,
      inv.invoice_amt_idr, // This is now calculated correctly
      inv.alreadyReceived,
      inv.advance_payment,
      inv.balanceAmount,
      inv.paymentAmount || 0,
    ]);
  
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header.join(","), ...rows.map(r => r.join(","))].join("\n");
  
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `AccountsReceivable_${selectedCustomer?.label || "All"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderHeader = () => {
    return (
        <div className="row align-items-center g-3 clear-spa">
          <div className="col-12 col-lg-6"></div>
            <div className="col-12 col-lg-6 text-end">
              <div className="d-inline-block" style={{ minWidth: '250px' }}>
                   <input className="form-control" type="text" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
              </div>
            </div>
        </div>
    );
};

const header = renderHeader();

const statusBodyTemplate = (rowData) => {
    if (!rowData.receipt_id || rowData.receipt_id === 0) {
        return null; 
    }
    if (rowData.flag === 1) {
        return (
            <span className="text-success fw-bold" style={{ fontSize: '13px' }}>
                Cleared
            </span>
        );
    }
    return (
        <span className="text-danger fw-bold" style={{ fontSize: '13px' }}>
            Uncleared
        </span>
    );
};

const paymentBodyTemplate = (rowData) => (
  <Input
    type="text"
    value={rowData.paymentAmount ? formatDisplay(rowData.paymentAmount) : ""}
    onChange={(e) => {
      let value = e.target.value.replace(/,/g, "");

      if (value === "") {
        const updateInvoices = (list) =>
          list.map(inv =>
            inv.id === rowData.id ? { ...inv, paymentAmount: "" } : inv
          );
        setInvoiceList(updateInvoices(invoiceList));
        setSelectedInvoices(updateInvoices(selectedInvoices));
        return;
      }
      const regex = /^\d{0,12}(\.\d{0,2})?$/;
      if (!regex.test(value)) return;
  
      const entered1 = parseFloat(value);
      const entered = (value);

      if (entered1 > rowData.balanceAmount) {
        toast.warn("Payment amount cannot exceed Balance Amount");
        return;
      }

      const updatedList = invoiceList.map(inv =>
        inv.id === rowData.id ? { ...inv, paymentAmount: entered } : inv
      );
      setInvoiceList(updatedList);

      const updatedSelected = selectedInvoices.map(inv =>
        inv.id === rowData.id ? { ...inv, paymentAmount: entered } : inv
      );
      setSelectedInvoices(updatedSelected);
    }}
    placeholder="Payment"
    min={0}
    max={rowData.balanceAmount}
  />
);

  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2 align-items-center">
        <button
            type="button"
            className="btn btn-success btn-sm text-white shadow-none"
            onClick={openReceipt}
            style={{ 
                fontSize: '12px', 
                padding: '4px 12px',
                lineHeight: '1.2' 
            }}
        >
            Receipt
        </button>

        {rowData.receipt_id > 0 && rowData.flag === 0 && (
            <button 
                type="button"
                className="btn btn-primary btn-sm text-white shadow-none"
                onClick={() => handleEditReceipt(rowData)}
                title="Edit Receipt"
                style={{ 
                    fontSize: '12px', 
                    padding: '4px 12px',
                    lineHeight: '1.2'
                }}
            >
                Edit
            </button>
        )}
    </div>
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Finance" breadcrumbItem="Receipt" />
          
<Row className="align-items-center ">
  <Col md="6" lg="4">
  <div className="row align-items-end g-1 quotation-mid">
      <div className="col-12 col-lg-12 mt-1">
          <div className="d-flex align-items-center gap-2">
              <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                  <label htmlFor="Search_Type" className="form-label mb-0">Customer</label></div>
              <div className="col-12 col-lg-8 col-md-8 col-sm-8">

    <Select
      options={options}
      onInputChange={(value) => setSearch(value)}
      onChange={async (option) => {
        setSelectedCustomer(option);
        if (!option) return;
        getinvoice(option.value);
      }}
      placeholder="Select Customer"
      value={selectedCustomer}
    />
        </div>
      </div>
    </div>
    </div>
  </Col>

  <Col md="6" lg="8" className="text-end">
  <div className={`col-12  col-lg-12 d-flex justify-content-end flex-wrap gap-2`} >
<button
    type="button"
    className="btn btn-danger"
    onClick={() => {
        setSelectedCustomer(null);
        setInvoiceList([]);
        setSelectedInvoices([]);
        getinvoice(0);
    }}
>
    <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>{" "}
    Cancel
</button>
<button
    type="button"
    className="btn btn-secondary"
    onClick={() => exportToCSV()}
>
    {" "}
    <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i>{" "}
    Export
</button>
</div>
  </Col>
</Row>

          <Row className="mt-3">
            <Col lg="12">
              <Card>
                  <DataTable
                    /* Changed to processedInvoiceList for correct IDR calculation */
                    value={processedInvoiceList} 
                    paginator
                    rows={20}
                    selection={selectedInvoices}
                    onSelectionChange={e => setSelectedInvoices(e.value)}
                    dataKey="id"
                    responsiveLayout="scroll"
                    size="small"
                    filters={filters}
                    globalFilterFields={[
                      "invoiceNo",
                      "customerName",
                      "invAmount",
                      "invoice_amt_idr",
                      "alreadyReceived",
                      "balanceAmount",
                      "CurrencyCode","advance_payment"
                    ]}

                    header={header}
                  >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} />
                    <Column field="invoiceNo" header="Ref No." sortable />
                    <Column field="invDate" header="Ref Date" body={d => d.invDate ? new Intl.DateTimeFormat("en-GB").format(d.invDate) : ""} sortable />
                    <Column field="customerName" header="Customer Name" sortable />
                    <Column field="CurrencyCode" header="Currency" sortable />
                    <Column field="invAmount" header="Invoice Amount" sortable
                      body={(rowData) =>
                        rowData.invAmount?.toLocaleString('en-US', {
                            style: 'decimal',
                            minimumFractionDigits: 2
                        })
                    }
                    />
                      <Column field="invoice_amt_idr" header="Invoice Amount (IDR)" sortable
                      body={(rowData) =>
                        rowData.invoice_amt_idr?.toLocaleString('en-US', {
                            style: 'decimal',
                            minimumFractionDigits: 2
                        })
                    }
                    />
                      <Column field="advance_payment" header="Advance Amount" sortable
                      body={(rowData) =>
                        rowData.advance_payment?.toLocaleString('en-US', {
                            style: 'decimal',
                            minimumFractionDigits: 2
                        })
                    }
                  />
                    <Column field="alreadyReceived" header="Already Received" sortable
                      body={(rowData) =>
                        rowData.alreadyReceived?.toLocaleString('en-US', {
                            style: 'decimal',
                            minimumFractionDigits: 2
                        })
                    }
                   />
                    <Column field="balanceAmount" header="Balance Amount" sortable
                      body={(rowData) =>
                        rowData.balanceAmount?.toLocaleString('en-US', {
                            style: 'decimal',
                            minimumFractionDigits: 2
                        })
                    }
                    />
                    <Column header="Payment" body={paymentBodyTemplate} />
                    <Column header="Status" body={statusBodyTemplate} style={{ minWidth: '100px', textAlign: 'center' }} />
                    <Column header="Action" body={actionBodyTemplate} />
                  </DataTable>
                
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} size="lg" centered>
        <ModalHeader toggle={() => setIsModalOpen(false)}>
        </ModalHeader>
        <ModalBody className="py-3 px-4">
         <Row className="mb-3">
              <Col lg={12}>
                <div className="text-danger">
                </div>
              </Col>
            </Row>
          
            <Formik
              enableReinitialize
              initialValues={formValues}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                update(values);
              }}
            >
              {({ errors, touched, setFieldValue, values }) => {
                
                const parseSafeFloat = (val) => {
                    if (!val) return 0;
                    return parseFloat(String(val).replace(/,/g, '')) || 0;
                };

                const depositAccountOptions = getAccountOptions(values.depositBankId);
                
                const targetTotalToReceive = selectedInvoices.reduce((acc, i) => {
                    const paymentVal = parseSafeFloat(i.paymentAmount); 

                    if (values.currencyMode === "IDR") {
                        const currentRate = currencyRates[i.CurrencyCode] || 1;
                        return acc + (paymentVal * currentRate);
                    } else {
                        return acc + paymentVal;
                    }
                }, 0);
          
                return (
                  <Form>
                    <Row className="mb-3">
                        <Col md="12">
                            <div className="d-flex align-items-center gap-3 bg-light p-2 rounded border" style={{width: 'fit-content'}}>
                                <span className="fw-bold text-primary">Receipt of:</span>
                                <div className="form-check mb-0">
                                    <Input
                                            type="radio"
                                            name="currencyMode"
                                            id="modeTransaction"
                                            className="form-check-input"
                                            checked={values.currencyMode === "Transaction"}
                                            onChange={() => {
                                                setFieldValue("currencyMode", "Transaction");
                                                setFieldValue("cashAmount", "");
                                                setFieldValue("bankAmount", "");
                                            }}
                                    />
                                    <Label htmlFor="modeTransaction" className="form-check-label mb-0 cursor-pointer">
                                        Transaction Currency
                                    </Label>
                                </div>
                                <div className="form-check mb-0">
                                    <Input
                                            type="radio"
                                            name="currencyMode"
                                            id="modeIDR"
                                            className="form-check-input"
                                            checked={values.currencyMode === "IDR"}
                                            onChange={() => {
                                                setFieldValue("currencyMode", "IDR");
                                                setFieldValue("cashAmount", "");
                                                setFieldValue("bankAmount", "");
                                            }}
                                    />
                                    <Label htmlFor="modeIDR" className="form-check-label mb-0 cursor-pointer">
                                        IDR
                                    </Label>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                      <Col md="3">
                        <FormGroup>
                          <Label className="required-label">Tax Rate (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            name="taxRate"
                            placeholder="e.g., 7"
                            value={values.taxRate}
                            onChange={(e) =>
                              setFieldValue(
                                "taxRate",
                                e.target.value === "" ? "" : Number(e.target.value)
                              )
                            }
                          />
                          {errors.taxRate && touched.taxRate && (
                            <div className="text-danger small mt-1">{errors.taxRate}</div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label className="required-label">Date</Label>
                          <Flatpickr
                            name="receiptDate"
                            className="form-control d-block"
                            placeholder="Select Date"
                            options={{
                              dateFormat: "d-M-Y",
                              defaultDate: values.receiptDate,
                            }}
                            onChange={([date]) => setFieldValue("receiptDate", date)}
                          />
                          {errors.receiptDate && touched.receiptDate && (
                            <div className="text-danger small mt-1">{errors.receiptDate}</div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md="12">
                        <FormGroup>
                          <Label className="required-label">Mode of payment</Label>
                          <div className="row ps-2">
                            <div className="col-12 col-lg-4 col-md-4 col-sm-4 form-check ps-0">
                              <Input
                                type="checkbox"
                                name="modes.cash"
                                className="form-check-input"
                                checked={values.modes.cash}
                                onChange={(e) => setFieldValue("modes.cash", e.target.checked)}
                              />
                              <label className="form-check-label">Cash</label>
                            </div>
                            <div className="col-12 col-lg-4 col-md-4 col-sm-4 form-check">
                              <Input
                                type="checkbox"
                                name="modes.bank"
                                className="form-check-input"
                                checked={values.modes.bank}
                                onChange={(e) => setFieldValue("modes.bank", e.target.checked)}
                              />
                              <label className="form-check-label">Bank</label>
                            </div>
                            <div className="col-12 col-lg-4 col-md-4 col-sm-4 form-check">
                              <Input
                                type="checkbox"
                                name="modes.contra"
                                className="form-check-input"
                                checked={values.modes.contra}
                                onChange={(e) => setFieldValue("modes.contra", e.target.checked)}
                              />
                              <label className="form-check-label">Contra Receivables</label>
                            </div>
                          </div>
                          {errors.modes && typeof errors.modes === "string" && (
                            <div className="text-danger small mt-1">{errors.modes}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
          
                    {values.modes.cash && (
                      <Row className="border-top pt-3">
                        <Col md="12">
                          <Card body className="w-100 border">
                            <FormGroup>
                              <Label>Cash Amount</Label>
                              <Input
                                type="text"
                                name="cashAmount"
                                placeholder="Amount"
                                value={values.cashAmount  ? formatDisplay(values.cashAmount) : ""}
                                onChange={(e) => {let value = e.target.value;
                                  value = value.replace(/,/g, "");
                                  if (value === "") {
                                    setFieldValue("cashAmount", "");
                                    return;
                                  }
                                  const regex = /^\d{0,12}(\.\d{0,2})?$/;
                                  if (!regex.test(value)) return;
                                  setFieldValue("cashAmount", value);
                                }}
                               />
                               {errors.cashAmount && touched.cashAmount && (
                                 <div className="text-danger small mt-1">{errors.cashAmount}</div>
                               )}
                              </FormGroup>
                            </Card>
                          </Col>
                        </Row>
                      )}
          
                    {values.modes.bank && (
                      <Card body className="w-100 mt-2 border">
                        <Row className="pt-3 align-items-center">
                          <Col md="12">
                            <div className="d-flex align-items-center">
                              <Label className="required-label me-4 mb-0">Payment via</Label>
                              
                              <div className="d-flex gap-4">
                                <div className="form-check mb-0">
                                  <Input
                                    type="radio"
                                    name="bankPaymentVia"
                                    value="cheque"
                                    id="viaCheque"
                                    className="form-check-input"
                                    checked={values.bankPaymentVia === "cheque"}
                                    onChange={() => setFieldValue("bankPaymentVia", "cheque")}
                                  />
                                  <label className="form-check-label" htmlFor="viaCheque">Cheque</label>
                                </div>

                                <div className="form-check mb-0">
                                  <Input
                                    type="radio"
                                    name="bankPaymentVia"
                                    value="bankTransfer"
                                    id="viaTransfer"
                                    className="form-check-input"
                                    checked={values.bankPaymentVia === "bankTransfer"}
                                    onChange={() => setFieldValue("bankPaymentVia", "bankTransfer")}
                                  />
                                  <label className="form-check-label" htmlFor="viaTransfer">Bank Transfer</label>
                                </div>

                                <div className="form-check mb-0">
                                  <Input
                                    type="radio"
                                    name="bankPaymentVia"
                                    value="giro"
                                    id="viaGiro"
                                    className="form-check-input"
                                    checked={values.bankPaymentVia === "giro"}
                                    onChange={() => setFieldValue("bankPaymentVia", "giro")}
                                  />
                                  <label className="form-check-label" htmlFor="viaGiro">Giro</label>
                                </div>
                              </div>
                            </div>
                            
                            {errors.bankPaymentVia && touched.bankPaymentVia && (
                              <div className="text-danger small mt-1">{errors.bankPaymentVia}</div>
                            )}
                          </Col>
                        </Row>

                        <Row className="pt-3">
                          <Col md="4">
                            <FormGroup>
                              <Label className="required-label">Amount</Label>
                              <Input
                                type="text"
                                name="bankAmount"
                                placeholder="Amount"
                                value={values.bankAmount ? formatDisplay(values.bankAmount) : ""}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/,/g, "");
                                  if (value === "") {
                                    setFieldValue("bankAmount", "");
                                    return;
                                  }
                                  const regex = /^\d{0,12}(\.\d{0,2})?$/;
                                  if (!regex.test(value)) return;
                                  setFieldValue("bankAmount", value);
                                }}
                              />
                              {errors.bankAmount && touched.bankAmount && (
                                <div className="text-danger small mt-1">{errors.bankAmount}</div>
                              )}
                            </FormGroup>
                          </Col>

                          <Col md="4">
                            <FormGroup>
                              <Label>Deposit to (BTG Bank)</Label>
                              <Select
                                name="depositBankId"
                                id="depositBankId"
                                options={btgBankOptions}
                                value={btgBankOptions.find((o) => o.value === values.depositBankId) || null}
                                onChange={(option) => {
                                  setFieldValue("depositBankId", option?.value || "");
                                  setFieldValue("depositAccountNumber", "");
                                }}
                                placeholder="Select BTG Bank"
                              />
                            </FormGroup>
                          </Col>

                          <Col md="4">
                            <FormGroup>
                              <Label>Select Account number</Label>
                              <Select
                                name="depositAccountNumber"
                                id="depositAccountNumber"
                                options={depositAccountOptions}
                                value={depositAccountOptions.find((o) => o.value === values.depositAccountNumber) || null}
                                onChange={(option) => setFieldValue("depositAccountNumber", option?.value || "")}
                                isDisabled={!values.depositBankId}
                                placeholder="Select Account number"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </Card>
                    )}
          
                    {values.modes.contra && (
                      <Card className="border p-3">
                      <Row className="border-top pt-3">
                        <Col md="5">
                          <FormGroup>
                            <Label className="required-label">Debit</Label>
                            <Select
                              name="contraReference"
                              id="contraReference"
                              className={
                                errors.contraReference && touched.contraReference ? "select-invalid" : ""
                              }
                              options={[
                                { value: "sales", label: "Sales Account" },
                                { value: "customer", label: "Customer Account" },
                                { value: "other", label: "Other Receivable" },
                              ]}
                              value={
                                [
                                  { value: "sales", label: "Sales Account" },
                                  { value: "customer", label: "Customer Account" },
                                  { value: "other", label: "Other Receivable" },
                                ].find((o) => o.value === values.contraReference) || null
                              }
                              onChange={(option) => setFieldValue("contraReference", option?.value || "")}
                              placeholder="Select Debit Account"
                            />
                            {errors.contraReference && touched.contraReference && (
                              <div className="text-danger small mt-1">{errors.contraReference}</div>
                            )}
                          </FormGroup>
                        </Col>
                        <Col md="5">
                          <FormGroup>
                            <Label className="required-label">Credit</Label>
                            <Select
                              name="contraAmount"
                              id="contraAmount"
                              className={
                                errors.contraAmount && touched.contraAmount ? "select-invalid" : ""
                              }
                              options={[
                                { value: 1000, label: "₹ 1,000" },
                                { value: 5000, label: "₹ 5,000" },
                                { value: 10000, label: "₹ 10,000" },
                              ]}
                              value={
                                [
                                  { value: 1000, label: "₹ 1,000" },
                                  { value: 5000, label: "₹ 5,000" },
                                  { value: 10000, label: "₹ 10,000" },
                                ].find((o) => o.value === values.contraAmount) || null
                              }
                              onChange={(option) => setFieldValue("contraAmount", option?.value || "")}
                              placeholder="Select Credit Amount"
                            />
                            {errors.contraAmount && touched.contraAmount && (
                              <div className="text-danger small mt-1">{errors.contraAmount}</div>
                            )}
                          </FormGroup>
                        </Col>
                      </Row>
                        </Card>
                    )}
          
                    <Row className="pt-2">
                      <Col md="6" className="d-flex align-items-center gap-2">
                        <Input
                          type="checkbox"
                          name="proofMissing"
                          checked={values.proofMissing}
                          onChange={(e) => setFieldValue("proofMissing", e.target.checked)}
                        />
                        <Label className="mb-0">
                          Tax paid proof not received / unavailable on govt website
                        </Label>
                      </Col>
                      <Col md="6" className="text-end">
                        <div>
                          <strong>
                            Total Amount ({values.currencyMode === "IDR" ? "IDR" : (selectedInvoices[0]?.CurrencyCode || "Transaction")}):{" "}
                          </strong> 
                          
                          {targetTotalToReceive.toLocaleString('en-US', {
                                    style: 'decimal',
                                    minimumFractionDigits: 2
                                })}  
                        </div>
                      </Col>
                    </Row>
          
                    <Row className="mt-4">
                      <Col>
                        <div className="text-center button-items">
                          <Button type="submit" className="btn btn-info me-2" disabled={isSubmitting}>
                            Save
                          </Button>
                          <Button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                );
              }}
            </Formik>
        </ModalBody>
      </Modal>

    </React.Fragment>
  );
};

export default AccountsReceivable;