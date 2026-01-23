import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Col,
    Container,
    Row,
} from "reactstrap";
import Select from "react-select";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getBankBookList } from "common/data/mastersapi";
import { toast } from "react-toastify";
import { GetBankList } from "common/data/mastersapi";
import { useHistory, useLocation } from 'react-router-dom';

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

// Format date to yyyy-MM-dd
const formatDate = (date) => {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
};
const formatPrintDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

const BankBook = () => {
    const firstDayOfMonth = formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const today = formatDate(new Date());

    const history = useHistory();
    const [bankBook, setBankBook] = useState([]);
    const [loading, setLoading] = useState(false);
    const [btgBankOptions, setbtgBankOptions] = useState([]);

    const [filters, setFilters] = useState({
        description: { value: null, matchMode: FilterMatchMode.CONTAINS },
        voucherNo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        transactionType: { value: null, matchMode: FilterMatchMode.CONTAINS },
        account: { value: null, matchMode: FilterMatchMode.CONTAINS },
        party: { value: null, matchMode: FilterMatchMode.CONTAINS },
        date: { value: null, matchMode: FilterMatchMode.DATE_IS },

        glcode: { value: null, matchMode: FilterMatchMode.CONTAINS },
        currency: { value: null, matchMode: FilterMatchMode.CONTAINS },
        actamount: { value: null, matchMode: FilterMatchMode.CONTAINS },
        creditIn: { value: null, matchMode: FilterMatchMode.CONTAINS },
        debitOut: { value: null, matchMode: FilterMatchMode.CONTAINS },
        balance: { value: null, matchMode: FilterMatchMode.CONTAINS },

    });
    const [currency, setCurrency] = useState(null);
    const [currencyList, setCurrencyList] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(""); // global filter
    const [fromDate, setFromDate] = useState(firstDayOfMonth);
    const [toDate, setToDate] = useState(today);
    const [bankid, setbankid] = useState(null);

    const fetchBankBook = async () => {
        try {

            setLoading(true);
            setBankBook([]);

            const orgId = 1;
            const branchId = 1;

            const response = await getBankBookList({
                orgid: orgId,
                branchid: branchId,
                fromDate: fromDate || null,
                toDate: toDate || null,
                bankid: bankid == undefined || bankid == null ? 0 : bankid
            });


            const uniqueCurrency = [
                ...new Set(response.map((x) => x.Currency))
            ].map((c) => ({ label: c, value: c }));

            setCurrencyList(uniqueCurrency);

            console.log(uniqueCurrency);

            // --- AUTO SELECT CURRENCY LOGIC START ---
            if (bankid) {
                // 1. Find the selected bank object to get the full name (e.g. "Cash in Bank - BCA IDR")
                const selectedBank = btgBankOptions.find(opt => opt.value === bankid);
                
                if (selectedBank) {
                    const bankName = selectedBank.label;

                    // 2. Try to find if one of the currencies returned by the API is in the bank name
                    let targetCurrency = uniqueCurrency.find(c => bankName.includes(c.value));

                    // 3. Fallback: If API returned no data (uniqueCurrency empty), try to match common currencies
                    // directly from the bank string so the filter is still set correctly.
                    if (!targetCurrency) {
                        const commonCurrencies = ["IDR", "SGD", "USD", "EUR", "AUD", "JPY", "CNY"];
                        const match = commonCurrencies.find(c => bankName.includes(c));
                        if (match) {
                            targetCurrency = { label: match, value: match };
                        }
                    }

                    // 4. Update state
                    if (targetCurrency) {
                        setCurrency(targetCurrency);
                    }
                }
            }
            // --- AUTO SELECT CURRENCY LOGIC END ---

            const transformed = response.map((item) => ({
                date: item.Date ? (item.Date) : null,
                voucherNo: item["Voucher No"] || "-",
                transactionType: item.TransactionType || "-",
                glcode: item.glcode || "",
                account: item.Account || "-",
                party: item.Party || "-",
                description: item.Description || "-",
                currency: item.Currency || "",
                actamount: item.actamount,
                creditIn: parseFloat(item["Credit(In)"]?.replace(/,/g, "") || 0),
                debitOut: parseFloat(item["Debit(Out)"]?.replace(/,/g, "") || 0),
                balance: parseFloat(item["Balance"]?.replace(/,/g, "") || 0),
            }));

            setBankBook(transformed);
        } catch (error) {
            console.error(error); // Log error for debugging
            toast.error("Error fetching bank book data.");
        } finally {
            setLoading(false);
        }
    };
    const Bankmaster = async () => {
        const data = await GetBankList(1, 1); // Mock your API call
        const options = data.map(item => ({
            value: item.value,
            label: item.BankName
        }));
        setbtgBankOptions(options);
    }
    
    // Filter logic: This will automatically re-run when `currency` state is updated by the logic above
    const filtered = currency
        ? bankBook.filter(item => item.currency === currency.value)
        : []; // If you want to show ALL records when no currency is found, change [] to bankBook

    const exportToExcel = () => {
        const exportData = filtered.map((ex) => ({
            Date: ex.date ? ex.date.toLocaleDateString() : "",
            "Voucher No": ex.voucherNo,
            "Transaction Type": ex.transactionType,
            "Account": ex.account,
            "Party": ex.party,
            Description: ex.description,
            "Credit In (IDR)": ex.creditIn,
            "Debit Out (IDR)": ex.debitOut,
            "Balance (IDR)": ex.balance,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bank Book");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(data, `BankBook-${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handlePrint = () => {
        const tableHTML = document.getElementById("print-section").innerHTML;
        const from = formatPrintDate(fromDate);
        const to = formatPrintDate(toDate);

        const printWindow = window.open("", "_blank");

        printWindow.document.write(`
            <html>
                <head>
                    <title>Bank Book Report</title> 
                    <style>
                        body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
                        h2 { text-align: center; font-size: 12px; margin-bottom: 5px; }
                        p { text-align: center; font-size: 10px; margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; font-size: 9px; }
                        th, td { padding: 5px; border: 1px solid #ccc; text-align: left; }
                        th { background-color: #f8f8f8; }
                        .text-end { text-align: right; }
                    </style>
                </head>
                <body>
                    <h2>Bank Book Report</h2>
                    <p>From: ${from} To: ${to}</p>
                    ${tableHTML}
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

    const handleCancelFilters = () => {
        setCurrency(null);
        setFromDate(firstDayOfMonth);
        setToDate(today);
        setbankid(0);
        setFilters({
            description: { value: null, matchMode: FilterMatchMode.CONTAINS },
            voucherNo: { value: null, matchMode: FilterMatchMode.CONTAINS },
            transactionType: { value: null, matchMode: FilterMatchMode.CONTAINS },
            account: { value: null, matchMode: FilterMatchMode.CONTAINS },
            party: { value: null, matchMode: FilterMatchMode.CONTAINS },
            date: { value: null, matchMode: FilterMatchMode.DATE_IS },
        });
        setGlobalFilter("");
        fetchBankBook();
    };

    useEffect(() => {
        fetchBankBook();
        Bankmaster();

    }, []);
    const addBankBook = () => {
        history.push("/AddBankBook");
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Finance" breadcrumbItem="Bank Book" />

                {/* Filter Section */}
                <Row className="pt-2 pb-3 align-items-end">
                    <Col md="3">

                        <Select
                            name="depositBankId"
                            id="depositBankId"

                            options={btgBankOptions}
                            value={
                                btgBankOptions.find((o) => o.value === bankid) ||
                                null
                            }
                            onChange={(option) => {
                                setbankid(option?.value || 0);

                            }}
                            placeholder="Select BTG Bank"
                        />
                    </Col>
                    
                    {/* COMMENTED OUT CURRENCY DROPDOWN AS REQUESTED */}
                    {/* <Col md="3" className="d-flex align-items-center">
                        <Select
                            options={currencyList}
                            placeholder="Filter Currency"
                            value={currency}
                            onChange={setCurrency}
                            isClearable
                            styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                        /> 
                    </Col> */}

                    <Col md="3">
                        <input
                            type="date"
                            className="form-control"
                            value={fromDate ?? ""}
                            onChange={(e) => setFromDate(e.target.value)}
                            max={toDate}
                        />
                    </Col>

                    <Col md="3">
                        <input
                            type="date"
                            className="form-control"
                            value={toDate ?? ""}
                            onChange={(e) => setToDate(e.target.value)}
                            min={fromDate}
                            max={today}
                        />
                    </Col>

                    <Col md="12" className="text-end mt-2">
                        <button type="button" className="btn btn-primary me-2" onClick={fetchBankBook}>
                            Search
                        </button>
                        {/*<button type="button" className="btn btn-success me-2" onClick={addBankBook}>
                            <i className="bx bx-plus me-2"></i> New
                        </button>*/}
                        <button type="button" className="btn btn-danger me-2" onClick={handleCancelFilters}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-info me-2" onClick={handlePrint}>
                            <i className="bx bx-printer me-2"></i> Print
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={exportToExcel}>
                            <i className="bx bx-export me-2"></i> Export
                        </button>
                    </Col>
                </Row>

                {/* DataTable with global filter */}
                <Row>
                    <Col lg="12">
                        <Card>
                            <CardBody>
                                <div className="d-flex justify-content-end mb-2">
                                    <input
                                        type="text"
                                        placeholder="Global Search"
                                        className="form-control w-auto"
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                    />
                                </div>
                                <DataTable
                                    value={filtered}
                                    loading={loading}
                                    paginator
                                    rows={20}

                                    filters={filters}
                                    onFilter={(e) => setFilters(e.filters)}
                                    globalFilterFields={["glcode", "currency", "actamount", "date", "creditIn", "debitOut", "balance", "description", "voucherNo", "account", "party", "transactionType"]}
                                    globalFilter={globalFilter}
                                    emptyMessage="No records found."
                                    showGridlines
                                    filterDisplay="menu"
                                    filter
                                >
                                    {/* <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} style={{ width: '60px' }} /> */}
                                    <Column field="date" header="Date" style={{ width: '120px' }} />
                                    <Column field="voucherNo" header="Voucher No" filter filterPlaceholder="Search Voucher" />
                                    <Column field="glcode" header="GL Code" filter filterPlaceholder="Search GL" />

                                    <Column field="transactionType" header="Transaction Type" filter filterPlaceholder="Search Type" />
                                    <Column field="account" header="Account" filter filterPlaceholder="Search Account" />
                                    <Column field="party" header="Party" filter filterPlaceholder="Search Party" />
                                    <Column field="description" header="Description" filter filterPlaceholder="Search Description" />

                                    <Column field="currency" header="Currency" filter filterPlaceholder="Search Currency" />
                                    <Column field="actamount" className="text-end" header="Currency Amount" body={(d) => d.actamount?.toLocaleString('en-US', {
                                        style: 'decimal',
                                        minimumFractionDigits: 2
                                    })}
                                        filter filterPlaceholder="Search Amount" />
                                    <Column field="creditIn" header="Credit (In)" body={(d) => d.creditIn.toLocaleString('en-US', {
                                        style: 'decimal',
                                        minimumFractionDigits: 2
                                    })} className="text-end" />
                                    <Column field="debitOut" header="Debit (Out)" body={(d) => d.debitOut.toLocaleString('en-US', {
                                        style: 'decimal',
                                        minimumFractionDigits: 2
                                    })} className="text-end" />
                                    <Column field="balance" header="Balance (IDR)" body={(d) => d.balance.toLocaleString('en-US', {
                                        style: 'decimal',
                                        minimumFractionDigits: 2
                                    })} className="text-end" />
                                </DataTable>

                                <div id="print-section" style={{ display: "none" }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>S.No.</th>
                                                <th>Date</th>
                                                <th>Voucher No</th>
                                                <th>Transaction Type</th>
                                                <th>Account</th>
                                                <th>Party</th>
                                                <th>Description</th>
                                                <th>Credit (In)</th>
                                                <th>Debit (Out)</th>
                                                <th>Balance (IDR)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{formatPrintDate(item.date)}</td>
                                                    <td>{item.voucherNo}</td>
                                                    <td>{item.transactionType}</td>
                                                    <td>{item.account}</td>
                                                    <td>{item.party}</td>
                                                    <td>{item.description}</td>
                                                    <td className="text-end">{item.creditIn.toLocaleString('en-US', {
                                                        style: 'decimal',
                                                        minimumFractionDigits: 2
                                                    })}</td>
                                                    <td className="text-end">{item.debitOut.toLocaleString('en-US', {
                                                        style: 'decimal',
                                                        minimumFractionDigits: 2
                                                    })}</td>
                                                    <td className="text-end">{item.balance.toLocaleString('en-US', {
                                                        style: 'decimal',
                                                        minimumFractionDigits: 2
                                                    })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BankBook;