import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    CardBody,
    Col,
    Container,
    Row,
    Button,
    FormGroup,
    Label,
    Input,
    Modal,
    ModalBody,
    ModalHeader,
} from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import "flatpickr/dist/themes/material_blue.css";
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Tag } from "primereact/tag";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { getPettyCashList, getPettyCashById, getPettyCashCurrency, saveOrUpdatePettyCash, getPettyCashCategories, getPettyCashExpenseTypes, getPettyCashImagePath } from "../../../src/common/data/mastersapi";
const PYTHON_API_URL = process.env.REACT_APP_PYTHON_API_URL || "http://127.0.0.1:8000/";
import makeAnimated from "react-select/animated";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";


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
const animatedComponents = makeAnimated();

const EditExpense = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitType, setSubmitType] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [expenseOptions, setExpenseOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const history = useHistory();
    const location = useLocation();
    const { id } = useParams();
    const [pettyCashData, setPettyCashData] = useState(null);
    const [localPettyCashData, setLocalPettyCashData] = useState([]);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const formikRef = React.useRef(null);

    const [currencySuggestions, setCurrencySuggestions] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(null);


    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [imageInfo, setImageInfo] = useState(null);

    useEffect(() => {
        debugger;
        console.log("pettyCashData received on Page Load:", pettyCashData);

        const initializePage = async () => {
            // If we have an ID, we are in EDIT mode -> Always fetch fresh data by ID
            if (id) {
                try {
                    const [data, imgData] = await Promise.all([
                        getPettyCashById(id),
                        getPettyCashImagePath(id)
                    ]);

                    if (data) {
                        console.log("Fetched fresh data by ID:", data);
                        setPettyCashData(data);
                    }
                    if (imgData && imgData.status && imgData.data) {
                        console.log("Fetched Image Info:", imgData.data);
                        setImageInfo(imgData.data);
                    }

                } catch (err) {
                    console.error("Failed to fetch petty cash data", err);
                    toast.error("Failed to load data");
                }
            }

            // Always fetch dropdown data
            fetchDropdownData();
        };

        initializePage();
    }, [id]);

    useEffect(() => {
        const inferCategory = async () => {
            if (!pettyCashData) return;

            let catId = pettyCashData.category_id || pettyCashData.Category;

            // If category is missing but we have an expense type, try to infer it
            if (!catId && (pettyCashData.expense_type_id || pettyCashData.ExpenseType)) {
                try {
                    // Fetch ALL expense types (pass null for categoryId)
                    const allTypes = await getPettyCashExpenseTypes(1, 1, null);
                    const expTypeId = pettyCashData.expense_type_id || pettyCashData.ExpenseType;

                    const match = allTypes.find(t => String(t.id) === String(expTypeId));
                    if (match && match.category_id) {
                        console.log(`Auto-inferred Category ID ${match.category_id} from Expense Type ID ${expTypeId}`);
                        catId = match.category_id;

                        // Update formik state if ref is available
                        if (formikRef.current) {
                            formikRef.current.setFieldValue("category", catId);
                        }
                    }
                } catch (err) {
                    console.error("Failed to infer category", err);
                }
            }

            if (catId) {
                setEditCategoryId(catId);
            }
        };

        inferCategory();
    }, [pettyCashData]);

    useEffect(() => {
        if (editCategoryId) {
            loadExpenseDescriptions(editCategoryId);
        }
    }, [editCategoryId]);

    useEffect(() => {
        if (
            pettyCashData?.Amount &&
            pettyCashData?.ExchangeRate
        ) {
            const idr =
                parseFloat(pettyCashData.Amount) *
                parseFloat(pettyCashData.ExchangeRate);

            formikRef.current?.setFieldValue(
                "amountIDR",
                idr.toFixed(2)
            );
        }
    }, [pettyCashData]);

    // Memoize currency options to avoid re-mapping on every render
    const currencyOptions = useMemo(() => {
        return currencySuggestions.map(cat => ({
            value: cat.CurrencyId || cat.currencyid || cat.id,
            label: cat.Currency || cat.CurrencyCode || cat.currency || cat.currency_code,
            currencyid: cat.CurrencyId || cat.currencyid || cat.id,
            Currency: cat.Currency || cat.CurrencyCode || cat.currency || cat.currency_code,
            ExchangeRate: cat.ExchangeRate || cat.exchange_rate || cat.rate || 1
        }));
    }, [currencySuggestions]);



    const fetchDropdownData = async () => {
        try {
            const [cuurencydtl, categories] = await Promise.all([
                getPettyCashCurrency(1, 1),
                getPettyCashCategories(1, 1),
            ]);

            setCurrencySuggestions(cuurencydtl);
            console.log("Raw currency from API:", cuurencydtl);

            console.log("Raw categories from API:", categories);

            // Column names: id, gl_code, category_name
            const formattedCategories = categories.map(item => ({
                value: item.id,
                label: item.category_name
            })).filter(cat => cat.value && cat.label);

            console.log("Formatted categories:", formattedCategories);
            setCategoryOptions(formattedCategories);
        } catch (err) {
            console.error("Failed to load dropdown data", err);
            toast.error("Failed to load dropdown data");
        }
    };




    // useEffect(() => {
    //   if (generatedVoucherNo) {
    //     setFieldValue("voucherNo", generatedVoucherNo);
    //   }
    // }, [generatedVoucherNo]);



    const loadExpenseDescriptions = async (categoryId) => {
        try {
            if (!categoryId) {
                setExpenseOptions([]);
                return;
            }
            const rows = await getPettyCashExpenseTypes(1, 1, categoryId);
            console.log("Raw expense types from API:", rows);

            // Column names: id, glcode, category_id, expense_type
            const formatted = rows.map(item => ({
                value: item.id,
                label: item.expense_type
            })).filter(exp => exp.value && exp.label);

            console.log("Formatted expense types:", formatted);
            setExpenseOptions(formatted);

            // Sync Formik values AFTER options load, but only if it matches existing data
            const originalCatId = pettyCashData?.category_id || pettyCashData?.Category;
            // Use loose equality to handle number vs string
            if (pettyCashData && (originalCatId == categoryId)) {
                setTimeout(() => {
                    formikRef.current?.setFieldValue(
                        "expenseType",
                        pettyCashData?.expense_type_id || pettyCashData?.ExpenseType || null
                    );
                }, 0);
            }

        } catch (err) {
            console.error("Failed to load expense types", err);
            toast.error("Failed to load expense types");
        }
    };


    const handleSaveOrUpdate = async (values, resetForm, type) => {
        try {
            setIsSubmitting(true);

            const isEdit = !!pettyCashData?.PettyCashId;

            const payload = {
                PCNumber: values.pcNumber,
                VoucherNo: values.voucherNo,
                ExpDate: formatDate(values.expDate),
                Expense_type_id: values.expenseType ? parseInt(values.expenseType) : null,
                category_id: values.category ? parseInt(values.category) : null,
                ExpenseDescription: values.expenseDescription,
                // BillNumber: values.billNumber,
                ExpenseFileName: "default.pdf",
                ExpenseFilePath: "",
                FileUpdatedDate: new Date().toISOString(),
                Who: values.who,
                Whom: values.whom,
                AmountIDR: parseFloat(values.amountIDR),
                Amount: parseFloat(values.amount),
                currencyid: values.currencyid || 0,
                IsSubmitted: type === 1 ? 1 : 0,
                exchangeRate: values.exchangeRate,
                OrgId: 1,
                BranchId: 1,
                IsActive: true,
                ...(isEdit
                    ? {
                        PettyCashId: pettyCashData.PettyCashId,
                    }
                    : {
                    }),
            };
            const body = {
                command: isEdit ? "Update" : "Insert",
                Header: payload,
            };
            console.log("Payload being sent:", body);
            await saveOrUpdatePettyCash(body, isEdit, values.attachment);

            toast.success(`Petty Cash ${isEdit ? "updated" : "saved"} successfully`);
            resetForm();
            setIsModalOpen(false);
            history.push("/pettyCash");
        } catch (error) {
            toast.error("Failed to save or update petty cash");
        } finally {
            setIsSubmitting(false);
        }
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("/Upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        return response.data.filePath; // Adjust based on your backend response
    };


    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters["global"].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const clearFilter = () => {
        setFilters({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
        setGlobalFilterValue("");
    };

    const exportToExcel = () => {
        const exportData = expenses.map((ex) => ({
            "Date": new Date(ex.expDate).toLocaleDateString(),
            "Expense Type": ex.expenseType,
            "Description": ex.expenseDescription,
            // "Bill Number": ex.billNumber,
            "Amount(IDR)": ex.amountIDR,
            "Attachment": ex.attachment ? ex.attachment.name : "",
            "Status": ex.status,
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(data, `Expenses-${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const renderHeader = () => {
        return (
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <Button color="danger" onClick={clearFilter}>
                    <i className="mdi mdi-filter-off me-1"></i> Clear
                </Button>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Global Search"
                    />
                </span>
            </div>
        );
    };
    const formatToTwoDecimals = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return "0.00";
        return num.toFixed(2);
    };


    const formatDisplay = (val) => {
        if (val === undefined || val === null) return "";
        const strVal = String(val); // Convert number to string
        const [integer, decimal] = strVal.split(".");
        const withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return decimal !== undefined ? `${withCommas}.${decimal}` : withCommas;
    };


    const validationSchema = Yup.object().shape({
        voucherNo: Yup.string(),
        expDate: Yup.date().required("Date is required"),
        expenseType: Yup.string().required("Expense Type is required"),
        expenseDescription: Yup.string()
            .max(100, "Expense Description cannot exceed 100 characters")
            .required("Expense Description is required"),
        category: Yup.string().required("Category is required"),
        amount: Yup.number().typeError("Enter a valid amount").positive("Amount must be positive").required("Amount is required"),
        attachment: Yup.mixed().nullable(),
        who: Yup.string().required("Please select who"),
        whom: Yup.string().required("Whom field is required"),
    });

    const formatDate = (date) => {
        const d = date.getDate().toString().padStart(2, "0");
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const y = date.getFullYear();
        return `${y}-${m}-${d}`;
    };



    const statusBodyTemplate = (rowData) => (
        <Tag value={rowData.status} severity={rowData.status === "Posted" ? "success" : "info"} />
    );

    const actionBodyTemplate = () => (
        <div className="d-flex gap-2 justify-content-center">
            <Button color="link" size="sm"><i className="mdi mdi-pencil"></i></Button>
            <Button color="link" size="sm"><i className="mdi mdi-delete"></i></Button>
        </div>
    );

    const header = renderHeader();

    const initialValues = useMemo(() => {
        console.log("EditExpense initialValues pettyCashData:", pettyCashData);
        return {
            voucherNo: pettyCashData?.VoucherNo || "",
            // Robustly check for PC Number in various casings
            pcNumber: pettyCashData?.pc_number || pettyCashData?.PCNumber || pettyCashData?.PC_Number || "",
            expDate: pettyCashData?.ExpDate ? new Date(pettyCashData.ExpDate) : new Date(),
            expenseType: pettyCashData?.expense_type_id || pettyCashData?.ExpenseType || pettyCashData?.Expense_type_id || null,
            expenseDescription: pettyCashData?.ExpenseDescription || pettyCashData?.ExpenseDescriptionId || "",
            amountIDR: pettyCashData?.AmountIDR || "",
            currencyid: pettyCashData?.currencyid || pettyCashData?.CurrencyId || null,
            amount: pettyCashData?.Amount || "",
            category: pettyCashData?.category_id || pettyCashData?.Category || pettyCashData?.Category_id || null,
            attachment: pettyCashData?.Attachment || null,
            who: pettyCashData?.Who || "Payer",
            whom: pettyCashData?.Whom || "",
            exchangeRate: pettyCashData?.ExchangeRate || pettyCashData?.exchangeRate || 0
        };
    }, [pettyCashData]);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Finance" breadcrumbItem="PettyCash" />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    {(
                                        <Formik
                                            innerRef={formikRef}
                                            initialValues={initialValues}

                                            enableReinitialize={true}
                                            validationSchema={validationSchema}

                                        >
                                            {({ errors, touched, setFieldValue, values, resetForm }) => {
                                                console.log("Formik values:", values);
                                                return (
                                                    <Form>
                                                        <Row>
                                                            <Col md="8"></Col>
                                                            <Col md="4" className="text-end mb-3">
                                                                <div className="button-items">
                                                                    <button
                                                                        type="submit"
                                                                        className="btn btn-info me-2"
                                                                        onClick={() => handleSaveOrUpdate(values, resetForm, 0)}
                                                                        disabled={pettyCashData?.IsSubmitted}
                                                                    >
                                                                        <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2" ></i>{pettyCashData ? "Update" : "Save"}
                                                                    </button>
                                                                    <button
                                                                        type="submit"
                                                                        className="btn btn-success me-2"
                                                                        onClick={() => handleSaveOrUpdate(values, resetForm, 1)}
                                                                        disabled={pettyCashData?.IsSubmitted}
                                                                    >
                                                                        Post
                                                                    </button>
                                                                    <button type="button" className="btn btn-danger" onClick={() => history.push("/pettyCash")} disabled={isSubmitting}>Cancel</button>
                                                                </div>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label className="required-label">PC Number</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="pcNumber"
                                                                        placeholder="PC Number"
                                                                        value={values.pcNumber}
                                                                        readOnly
                                                                        style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
                                                                    />
                                                                </FormGroup>
                                                            </Col>

                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label className="required-label">Voucher No</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="voucherNo"
                                                                        placeholder="Enter Voucher No"
                                                                        value={values.voucherNo}
                                                                        onChange={e => setFieldValue("voucherNo", e.target.value)}
                                                                        disabled={pettyCashData?.IsSubmitted}
                                                                    />
                                                                    {errors.voucherNo && touched.voucherNo && (
                                                                        <div className="text-danger small mt-1">{errors.voucherNo}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label className="required-label">Date</Label>
                                                                    <Flatpickr
                                                                        name="expDate"
                                                                        className="form-control d-block"
                                                                        options={{
                                                                            dateFormat: "d-m-Y", // keep the format
                                                                        }}
                                                                        value={values.expDate}
                                                                        disabled={pettyCashData?.IsSubmitted}
                                                                        onChange={([date]) => {
                                                                            const twoDaysAgo = new Date();
                                                                            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

                                                                            // Only restrict user when selecting/changing date
                                                                            if (date < twoDaysAgo) {
                                                                                alert("Date cannot be more than 2 days in the past.");
                                                                                setFieldValue("expDate", twoDaysAgo); // or leave unchanged
                                                                            } else {
                                                                                setFieldValue("expDate", date);
                                                                            }
                                                                        }}
                                                                    />


                                                                    {errors.expDate && touched.expDate && <div className="text-danger small mt-1">{errors.expDate}</div>}
                                                                </FormGroup>
                                                            </Col>

                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label className="required-label">Category</Label>
                                                                    <Select
                                                                        name="category"
                                                                        options={categoryOptions}
                                                                        value={categoryOptions.find(o => String(o.value) === String(values.category)) || null}
                                                                        isDisabled={pettyCashData?.IsSubmitted}
                                                                        onChange={selectedOption => {
                                                                            const catId = selectedOption?.value || null;
                                                                            console.log("Category selected:", selectedOption, "Category ID:", catId);
                                                                            setFieldValue("category", catId);
                                                                            setFieldValue("expenseType", null);
                                                                            setExpenseOptions([]);
                                                                            if (catId) {
                                                                                loadExpenseDescriptions(catId);
                                                                            }
                                                                        }}
                                                                        placeholder="Select Category"
                                                                        isClearable
                                                                    />
                                                                    {errors.category && touched.category && <div className="text-danger small mt-1">{errors.category}</div>}
                                                                </FormGroup>
                                                            </Col>

                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label className="required-label">Expense Type</Label>
                                                                    <Select
                                                                        name="expenseType"
                                                                        options={expenseOptions}
                                                                        value={expenseOptions.find(o => String(o.value) === String(values.expenseType)) || null}
                                                                        isDisabled={pettyCashData?.IsSubmitted}
                                                                        onChange={selectedOption => {
                                                                            const expTypeId = selectedOption?.value || null;
                                                                            console.log("Expense Type selected:", selectedOption, "Expense Type ID:", expTypeId);
                                                                            setFieldValue("expenseType", expTypeId);
                                                                        }}
                                                                        placeholder="Select ExpenseType"
                                                                        isClearable
                                                                    />
                                                                    {errors.expenseType && touched.expenseType && <div className="text-danger small mt-1">{errors.expenseType}</div>}
                                                                </FormGroup>
                                                            </Col>

                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label className="required-label">Expense Description</Label>
                                                                    {/* <Select
                                    name="expenseDescription"
                                    options={expenseOptions}
                                    value={expenseOptions.find(o => o.value === values.expenseDescription) || null}
                                    onChange={selectedOption => setFieldValue("expenseDescription", selectedOption?.value || "")}
                                    placeholder="Select Description"
                                  /> */}

                                                                    <Input
                                                                        type="text" maxLength={100}
                                                                        name="expenseDescription"
                                                                        value={values.expenseDescription}
                                                                        onChange={e => setFieldValue("expenseDescription", e.target.value)}
                                                                        disabled={pettyCashData?.IsSubmitted}
                                                                    />

                                                                    {errors.expenseDescription && touched.expenseDescription && <div className="text-danger small mt-1">{errors.expenseDescription}</div>}
                                                                </FormGroup>
                                                            </Col>

                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label className="required-label">Who</Label>
                                                                    <div className="d-flex gap-3">
                                                                        <FormGroup check inline>
                                                                            <Input
                                                                                type="radio"
                                                                                name="who"
                                                                                value="Payer"
                                                                                checked={values.who === "Payer"}
                                                                                onChange={() => setFieldValue("who", "Payer")}
                                                                                disabled={pettyCashData?.IsSubmitted}
                                                                            />{" "}
                                                                            <Label check>Payer</Label>
                                                                        </FormGroup>
                                                                        <FormGroup check inline>
                                                                            <Input
                                                                                type="radio"
                                                                                name="who"
                                                                                value="Receiver"
                                                                                checked={values.who === "Receiver"}
                                                                                onChange={() => setFieldValue("who", "Receiver")}
                                                                                disabled={pettyCashData?.IsSubmitted}
                                                                            />{" "}
                                                                            <Label check>Receiver</Label>
                                                                        </FormGroup>
                                                                    </div>
                                                                    {errors.who && touched.who && (
                                                                        <div className="text-danger small mt-1">{errors.who}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>

                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label className="required-label">Whom</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="whom"
                                                                        placeholder="Enter Whom"
                                                                        value={values.whom}
                                                                        onChange={e => setFieldValue("whom", e.target.value)}
                                                                        disabled={pettyCashData?.IsSubmitted}
                                                                    />
                                                                    {errors.whom && touched.whom && (
                                                                        <div className="text-danger small mt-1">{errors.whom}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                            <Col md={4}>   <FormGroup>
                                                                <Label for="currency">Currency <span className="text-danger">*</span></Label>

                                                                <Select
                                                                    name="currencyid"
                                                                    id="currencyid"
                                                                    options={currencyOptions}
                                                                    value={currencyOptions.find(option => String(option.value) === String(values.currencyid)) || null}
                                                                    onChange={(option) => {
                                                                        const currId = option?.value || null;
                                                                        console.log("Currency selected:", option, "Currency ID:", currId);
                                                                        setFieldValue("currencyid", currId);
                                                                        setFieldValue("exchangeRate", option?.ExchangeRate || 0);
                                                                        const AmountIDR = formatToTwoDecimals(parseFloat(values.amount || 0) * parseFloat(option?.ExchangeRate || 0));
                                                                        setFieldValue("amountIDR", AmountIDR);
                                                                    }}
                                                                    classNamePrefix="select"
                                                                    isDisabled={pettyCashData?.IsSubmitted}
                                                                    menuPortalTarget={document.body}
                                                                    isClearable={true}
                                                                    isSearchable={true}
                                                                    components={{}}
                                                                    placeholder="Select Transaction Currency"
                                                                />
                                                            </FormGroup>
                                                            </Col>

                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label className="required-label">Amount </Label>
                                                                    {/* <Input type="number" name="amount" placeholder="Enter Amount" value={values.amount} onChange={e =>
                                    { 
                                      
                                      setFieldValue("amount", e.target.value);
                                      debugger;
                                      const exchangeRate = parseFloat(values?.exchangeRate);
                                      
                                      const AmountIDR = formatToTwoDecimals(parseFloat(e.target.value)   * exchangeRate);
                                  
                                      setFieldValue("amountIDR", AmountIDR);
                                    }
                                   } /> */}
                                                                    <Input
                                                                        type="text"
                                                                        name="amount"
                                                                        placeholder="Enter Amount"
                                                                        value={values.amount ? formatDisplay(values.amount) : ""}
                                                                        disabled={pettyCashData?.IsSubmitted}
                                                                        onChange={(e) => {
                                                                            debugger;
                                                                            let val = e.target.value;

                                                                            // Remove all characters except digits and dot
                                                                            val = val.replace(/[^0-9.]/g, "");

                                                                            // Only allow the first dot
                                                                            const firstDotIndex = val.indexOf(".");
                                                                            if (firstDotIndex !== -1) {
                                                                                // Keep only the first dot
                                                                                val = val.substring(0, firstDotIndex + 1) + val.substring(firstDotIndex + 1).replace(/\./g, "");
                                                                            }

                                                                            // Split integer and decimal parts
                                                                            const [integerPart, decimalPart] = val.split(".");

                                                                            // Limit integer to 12 digits
                                                                            const limitedInteger = integerPart.slice(0, 12);

                                                                            // decimalPart can be "" if user typed a dot but no digits yet
                                                                            const limitedDecimal =
                                                                                decimalPart !== undefined ? decimalPart.slice(0, 2) : undefined;

                                                                            // Combine
                                                                            let cleanNumber;
                                                                            if (decimalPart !== undefined) {
                                                                                // user typed dot, even if empty
                                                                                cleanNumber = `${limitedInteger}${decimalPart !== "" ? "." + limitedDecimal : "."}`;
                                                                            } else {
                                                                                // no dot typed yet
                                                                                cleanNumber = limitedInteger;
                                                                            }

                                                                            // Store clean number
                                                                            setFieldValue("amount", cleanNumber);

                                                                            // Calculate IDR
                                                                            const exchangeRate = parseFloat(values?.exchangeRate || 0);
                                                                            const amountValue = parseFloat(cleanNumber || 0);
                                                                            const AmountIDR = formatToTwoDecimals(amountValue * exchangeRate);
                                                                            setFieldValue("amountIDR", AmountIDR);
                                                                        }}
                                                                    />




                                                                    {errors.amount && touched.amount && <div className="text-danger small mt-1">{errors.amount}</div>}
                                                                </FormGroup>
                                                            </Col>

                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label className="required-label">Amount(IDR)</Label>
                                                                    <Input disabled={true} type="text" name="amountIDR" placeholder="Enter Amount"


                                                                        value={values.amountIDR ? formatDisplay(values.amountIDR) : ""}
                                                                        onChange={e => setFieldValue("amountIDR", e.target.value)} />
                                                                    {errors.amountIDR && touched.amountIDR && <div className="text-danger small mt-1">{errors.amountIDR}</div>}
                                                                </FormGroup>
                                                            </Col>

                                                            {/* <Col md="4">
                                <FormGroup>
                                  <Label className="required-label">Bill Number</Label>
                                  <Input type="text" name="billNumber" placeholder="Enter Bill Number" value={values.billNumber} onChange={e => setFieldValue("billNumber", e.target.value)} />
                                  {errors.billNumber && touched.billNumber && <div className="text-danger small mt-1">{errors.billNumber}</div>}
                                </FormGroup>
                              </Col> */}

                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <Label>Attachment (if any)</Label>
                                                                    <Input
                                                                        type="file"
                                                                        name="attachment"
                                                                        disabled={pettyCashData?.IsSubmitted}
                                                                        onChange={(e) => {
                                                                            const file = e.currentTarget.files[0];
                                                                            setFieldValue("attachment", file || null);
                                                                        }}
                                                                    />
                                                                    {imageInfo && imageInfo.ExistsOnServer && (
                                                                        <div className="mt-2">
                                                                            <a
                                                                                href={`${PYTHON_API_URL}pettycash/download/${imageInfo.PettyCashId}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-primary fw-bold"
                                                                            >
                                                                                <i className="mdi mdi-eye me-1"></i> View Attached Image ({imageInfo.ExpenseFileName})
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </Form>
                                                );
                                            }}
                                        </Formik>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>


                </Container>
            </div>

            {/* Confirmation Modal */}
            <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
                <ModalHeader toggle={() => setIsModalOpen(false)}>Confirm Action</ModalHeader>
                <ModalBody className="py-3 px-5 text-center">
                    <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "6em", color: "orange" }} />
                    <h4>Do you want to {submitType === 0 ? "Save" : "Post"}?</h4>
                    <div className="mt-3 d-flex justify-content-center gap-3">
                        <Button color="success" size="lg" onClick={() => setIsModalOpen(false)}>Yes</Button>
                        <Button color="danger" size="lg" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    </div>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default EditExpense;