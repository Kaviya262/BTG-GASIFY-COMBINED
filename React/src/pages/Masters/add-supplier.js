import React, { useState, useEffect } from "react";
import { useHistory,useParams } from "react-router-dom";
import { Button, Col, Container, FormGroup, Label, Row, TabContent, TabPane, NavItem, Table, NavLink, InputGroup, Card, CardBody } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import classnames from "classnames";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup"; 
import "flatpickr/dist/themes/material_blue.css"
import Flatpickr from "react-flatpickr"
import Select from "react-select";
import Swal from 'sweetalert2';
import {  GetSupplierById, GetSupplierCategoryAutoComplete, GetSupplierCityAutoComplete, GetSupplierCountries, GetSupplierCurrencies, GetSupplierDeliveryTerms, GetSupplierPaymentTerms, GetSupplierStateAutoComplete, GetSupplierTaxList, SaveSupplierMaster } from "common/data/mastersapi";


const AddSupplier = () => {
    const history = useHistory();
    const { id } = useParams();
    const supplier_id = Number(id ?? 0);
    const isEditMode = !!id;
    const [activeTab, setActiveTab] = useState(1);
    const API_URL = process.env.REACT_APP_API_URL;
    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    }; 
    const [branchId, setBranchId] = useState(1);
    const [orgId, setOrgId] = useState(1);
    const [userId, setUserId] = useState(1);
    const [categories, setCategories] = useState([]);
    const [countries, setCountries] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [taxList, setTaxList] = useState([]);
    const [banks, setBanks] = useState([]);
    const [paymentTermList, setPaymentTermList] = useState([]);
    const [deliveryTermList, setDeliveryTermList] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // --- Formik initial values ---
    const [initialValues, setInitialValues] = useState({
        supplierCode: "",
        supplierName: "",
        bankName1: "",
        bankName2: "",
        city: "",
        shortName: "",
        bankCode1: "",
        bankCode2: "",
        state: "",
        mobileNumber: "",
        bankAccount1: "",
        bankAccount2: "",
        country: "",
        email: "",
        supplierCategory: "",
        currencies: [],
        postalCode: "",
        website: "",
        uenNumber: "",
        address: "",
        tax: "",
        paymentTerm:"",
        deliveryTerm:"",
    });

    // --- Yup Validation Schema ---
    const validationSchema = Yup.object().shape({
        supplierCode: Yup.string()
            .required("Supplier Code is required")
            .max(5, "Max length is 5")
            .matches(/^[a-zA-Z0-9]*$/, "Alphanumeric only"),

        supplierName: Yup.string()
            .required("Supplier Name is required")
            .max(200, "Max length is 200")
            .matches(/^[a-zA-Z0-9\s]*$/, "Alphanumeric only"),

        //  bankName1: Yup.string().required("Bank Name 1 is required"),

         bankName1: Yup.string().nullable(),

        bankName2: Yup.string().nullable(),

        city: Yup.string()
            .max(15, "Max length is 15")
            .matches(/^[a-zA-Z0-9\s]*$/, "Alphanumeric only"),

        shortName: Yup.string()
            .max(50, "Max length is 50")
            .matches(/^[a-zA-Z0-9\s]*$/, "Alphanumeric only"),

        bankCode1: Yup.string()
            // .required("Bank Code 1 is required")
            .max(20, "Max length is 20")
            .matches(/^[a-zA-Z0-9]*$/, "Alphanumeric only"),

        bankCode2: Yup.string()
            .max(20, "Max length is 20")
            .matches(/^[a-zA-Z0-9]*$/, "Alphanumeric only"),

        state: Yup.string()
            .max(15, "Max length is 15")
            .matches(/^[a-zA-Z0-9\s]*$/, "Alphanumeric only"),

        mobileNumber: Yup.string()
            .required("Mobile Number is required")
            .matches(/^[0-9]+$/, "Numbers only")
            .max(20, "Max length is 20"),

        bankAccount1: Yup.string()
            // .required("Bank Account 1 is required")
            .matches(/^[0-9]+$/, "Numbers only")
            .max(50, "Max length is 50"),

        bankAccount2: Yup.string()
            .matches(/^[0-9]*$/, "Numbers only")
            .max(50, "Max length is 50"),

        country: Yup.string().required("Country is required"),

        email: Yup.string().email("Invalid email").max(80, "Max length is 80"),

        supplierCategory: Yup.string().required("Supplier Category is required"),

        currencies: Yup.array()
            .min(1, "Select at least one currency")
            .required("Currencies are required"),

        postalCode: Yup.string()
            .matches(/^[0-9]*$/, "Numbers only")
            .max(5, "Max length is 5"),

        website: Yup.string().max(80, "Max length is 80"),

        uenNumber: Yup.string()
            .required("Supplier Tax Number is required")
            // .matches(/^[0-9]*$/, "Numbers only")
            .max(20, "Max length is 20"),
        paymentTerm: Yup.string().required("Payment Term is required"),
        deliveryTerm: Yup.string().required("Delivery Term is required"),
        address: Yup.string()
            .max(100, "Max length is 100")
            // .matches(/^[a-zA-Z0-9\s]*$/, "Alphanumeric only"),

        // tax: Yup.string().required("Tax is required")
    });

    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [
                    catRes, 
                    countryRes, 
                    currRes, 
                    taxRes, 
                    paymentTermRes, 
                    deliveryTermRes,
                    stateRes,
                    cityRes
                ] = await Promise.all([
                    GetSupplierCategoryAutoComplete(orgId, branchId),
                    GetSupplierCountries(orgId, branchId),
                    GetSupplierCurrencies(orgId, branchId),
                    GetSupplierTaxList(orgId, branchId),
                    GetSupplierPaymentTerms(orgId, branchId),
                    GetSupplierDeliveryTerms(orgId, branchId),
                    GetSupplierStateAutoComplete(orgId, branchId, "%"),
                    GetSupplierCityAutoComplete(orgId, branchId, "%"),
                ]);

                setCategories(
                    (catRes?.data || []).map(item => ({
                        label: item.categoryName,
                        value: item.id,
                    }))
                );

                setCountries(
                    (countryRes?.data || []).map(item => ({
                        label: item.countryname,
                        value: item.countryid,
                    }))
                );

                setCurrencies(
                    (currRes?.data || []).map(item => ({
                        label: item.currencycode,
                        value: item.currencyid,
                    }))
                );

                setTaxList(
                    (taxRes?.data || []).map(item => ({
                        label: item.taxname,
                        value: item.taxid,
                    }))
                );

                setPaymentTermList(
                    (paymentTermRes?.data || []).map(item => ({
                        label: item.paymentterm,
                        value: item.paymenttermid,
                    }))
                );

                setDeliveryTermList(
                    (deliveryTermRes?.data || []).map(item => ({
                        label: item.deliveryterm,
                        value: item.deliverytermid,
                    }))
                );

                // ✅ Add State
                setStates(
                    (stateRes?.data || []).map(item => ({
                        label: item.StateName,
                        value: item.StateID,
                    }))
                );

                // ✅ Add City
                setCities(
                    (cityRes?.data || []).map(item => ({
                        label: item.CityName,
                        value: item.Cityid,
                    }))
                );

            } catch (error) {
                console.error("Failed to load master data:", error);
            }
        };

        loadMasterData();
    }, [orgId, branchId]);

    useEffect(() => {
        if (isEditMode) {
            SupplierGetById(supplier_id);
        }
    }, [isEditMode, supplier_id]);

    const mapSupplierToForm = (supplier) => ({
        supplierCode: supplier.SupplierCode || "",
        supplierName: supplier.SupplierName || "",
        bankName1: supplier.Bank1 || "",
        bankName2: supplier.Bank2 || "",
        city: supplier.CityId || 0,       
        shortName: supplier.ShortName || "",
        bankCode1: supplier.Bank1_Code || "",
        bankCode2: supplier.Bank2_Code || "",
        state: supplier.StateId || 0,
        mobileNumber: supplier.PhoneNo || "",
        bankAccount1: supplier.Bank1_AccountNumber || "",
        bankAccount2: supplier.Bank2_AccountNumber || "",
        country: supplier.CountryId || "",
        email: supplier.Email || "",
        supplierCategory: supplier.SupplierCategoryId || "",
        currencies: supplier.suppliercurrency 
            ? JSON.parse(supplier.suppliercurrency).map(c => c.CurrencyId).filter(Boolean)
            : [],
        postalCode: supplier.PostalCode || "",
        website: supplier.WebSite || "",
        uenNumber: supplier.UENNO || "",
        address: supplier.Address || "",
        tax: supplier.taxid || "",
        paymentTerm: supplier.peymenttermid || "",
        deliveryTerm: supplier.deliverytermid || "",
    });

    const SupplierGetById = async (supplier_id) => {
        try {
            const res = await GetSupplierById(supplier_id,orgId, branchId);
            if (res?.data?.length) {
                const supplier = res.data[0];
                const formValues = mapSupplierToForm(supplier);
                setInitialValues(formValues);
            }
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        }
    };


    const mapSupplierFormToPayload = (values, orgId, branchId, userId) => {
        const now = new Date().toISOString();

        return {
            master: {
            supplierId: isEditMode ? supplier_id : 0,
            supplierCode: values.supplierCode || "",
            supplierName: values.supplierName || "",
            shortName: values.shortName || "",
            supplierCategoryId: values.supplierCategory || 0,
            email: values.email || "",
            phoneNo: values.mobileNumber || "",
            webSite: values.website || "",
            uenno: values.uenNumber || "",
            bank1: values.bankName1 || "",
            bank1_Code: values.bankCode1 || "",
            bank1_AccountNumber: values.bankAccount1 || "",
            bank2: values.bankName2 || "",
            bank2_Code: values.bankCode2 || "",
            bank2_AccountNumber: values.bankAccount2 || "",
            pajakPph_Perc: 0, // map if available
            ueN_Number: 0,    // (typo in backend?)
            creditLimit: 0,   // map if available
            supplierBlockId: 0, 
            countryId: values.country || 0,
            stateId: values.state || 0,
            cityId: values.city || 0,
            postalCode: values.postalCode || "",
            address: values.address || "",
            userid: userId || 0,
            createdDate: now,
            createdIP: "string", // replace with real IP if tracked
            lastModifiedDate: now,
            lastModifiedIP: "string",
            isActive: true,
            orgId: orgId || 0,
            branchId: branchId || 0,
            taxid: values.tax || 0,
            paymenttermid: values.paymentTerm || 0,
            deliverytermid: values.deliveryTerm || 0,
            },
            currency: (values.currencies || []).map(curId => ({
            id: 0,
            supplierId: isEditMode ? supplier_id : 0,
            currencyId: curId,
            userid: userId || 0,
            createdDate: now,
            createdIP: "string",
            lastModifiedDate: now,
            lastModifiedIP: "string",
            isActive: true,
            orgId: orgId || 0,
            branchId: branchId || 0
            }))
        };
    };

    const handleSubmit = async (values) => {
        try {
            const payload = mapSupplierFormToPayload(values, orgId, branchId, userId);
            const res = await SaveSupplierMaster(isEditMode, payload);

            console.log("Save response", res);

            if (res?.status === true) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: `Supplier ${isEditMode ? 'updated' : 'added'} successfully.`,
                });

                history.push('/manage-suppliers');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: res?.message || 'Something went wrong while saving the supplier.',
                });
            }

        } catch (err) {
            console.error("Save failed", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred. Please try again later.',
            });
        }
    };
    
    const handleCancel = () => { 
        history.push("/manage-suppliers");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem={isEditMode ? "Edit Supplier" : "Add Supplier"} />
                    <Row>
                        <Card>
                            <CardBody>
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                    enableReinitialize
                                >
                                {({ values, errors, touched, setFieldValue, setTouched, validateForm, setFieldTouched }) => (
                                    <Form>
                                        <div className="row align-items-center g-3 justify-content-end mb-3">
                                            <div className="col-md-12 button-items d-flex gap-2 justify-content-end">

                                            <button
                                                type="submit"
                                                className="btn btn-info"                                                
                                            >
                                                <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2" ></i>{isEditMode ? "Update" : "Save"}

                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={handleCancel}
                                            >
                                                <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                                                Close
                                            </button>

                                            </div>
                                        </div>
                                    <Row>
                                        {/* Supplier Code */}
                                        <Col md="4">
                                            <FormGroup>
                                                <Label htmlFor="supplierCode">Supplier Code <span className="text-danger">*</span></Label>
                                                <Field
                                                name="supplierCode"
                                                placeholder="Supplier Code"
                                                type="text"
                                                maxLength="5"
                                                className={`form-control ${errors.supplierCode && touched.supplierCode ? "is-invalid" : ""}`}
                                                />
                                                {errors.supplierCode && touched.supplierCode && (
                                                <div className="text-danger">{errors.supplierCode}</div>
                                                )}
                                            </FormGroup>
                                        </Col>

                                        {/* Supplier Name */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="supplierName">Supplier Name <span className="text-danger">*</span></Label>
                                            <Field
                                            name="supplierName"
                                            placeholder="Supplier Name"
                                            type="text"
                                            maxLength="200"
                                            className={`form-control ${errors.supplierName && touched.supplierName ? "is-invalid" : ""}`}
                                            />
                                                {errors.supplierName && touched.supplierName && (
                                                <div className="text-danger">{errors.supplierName}</div>
                                                )}
                                        </FormGroup>
                                        </Col>
                                        <Col md="4">
                                            <FormGroup>
                                                <Label htmlFor="shortName">Short Name</Label>
                                                <Field
                                                name="shortName"
                                                placeholder="Short Name"
                                                type="text"
                                                maxLength="50"
                                                className={`form-control ${errors.shortName && touched.shortName ? "is-invalid" : ""}`}
                                                />
                                            </FormGroup>
                                        </Col>
                                        {/* Supplier Category */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="supplierCategory">Supplier Category <span className="text-danger">*</span></Label>
                                            <Select
                                                name="supplierCategory"
                                                options={categories}
                                                placeholder="Select Category"
                                                isClearable
                                                value={categories.find(option => option.value === values.supplierCategory)} // for controlled value
                                                onChange={(selectedOption) => {
                                                    setFieldValue("supplierCategory", selectedOption ? selectedOption.value : ""); 
                                                }}
                                                onBlur={() => setFieldTouched("supplierCategory", true)} 
                                            />
                                            {errors.supplierCategory && touched.supplierCategory && (
                                                <div className="text-danger">{errors.supplierCategory}</div>
                                                )}
                                        </FormGroup>
                                        </Col>
                                        {/* Mobile Number */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="mobileNumber">Mobile Number <span className="text-danger">*</span></Label>
                                            <Field
                                            name="mobileNumber"
                                            placeholder="Mobile Number"
                                            type="text"
                                            maxLength="20"
                                            className={`form-control ${errors.mobileNumber && touched.mobileNumber ? "is-invalid" : ""}`}
                                            />
                                            {errors.mobileNumber && touched.mobileNumber && (
                                                <div className="text-danger">{errors.mobileNumber}</div>
                                                )}
                                        </FormGroup>
                                        </Col>

                                        {/* Country */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="country">Country <span className="text-danger">*</span></Label>
                                            <Select
                                                name="country"
                                                options={countries}
                                                placeholder="Select Country"
                                                isClearable
                                                value={countries.find(option => option.value === values.country)} // for controlled value
                                                onChange={(selectedOption) => {
                                                    setFieldValue("country", selectedOption ? selectedOption.value : ""); 
                                                }}
                                                onBlur={() => setFieldTouched("country", true)} 
                                            />
                                            {errors.country && touched.country && (
                                                <div className="text-danger">{errors.country}</div>
                                                )}
                                        </FormGroup>
                                        </Col>
                                        <Col md="4">
                                            <FormGroup>
                                                <Label htmlFor="state">State <span className="text-danger">*</span></Label>
                                                <Select
                                                name="state"
                                                options={states} // your state list
                                                placeholder="Select State"
                                                isClearable
                                                value={states.find(option => option.value === values.state)} // controlled value
                                                onChange={(selectedOption) => {
                                                    setFieldValue("state", selectedOption ? selectedOption.value : "");
                                                }}
                                                onBlur={() => setFieldTouched("state", true)}
                                                />
                                                {errors.state && touched.state && (
                                                <div className="text-danger">{errors.state}</div>
                                                )}
                                            </FormGroup>
                                            </Col>

                                            <Col md="4">
                                            <FormGroup>
                                                <Label htmlFor="city">City <span className="text-danger">*</span></Label>
                                                <Select
                                                name="city"
                                                options={cities} // your city list (based on state)
                                                placeholder="Select City"
                                                isClearable
                                                value={cities.find(option => option.value === values.city)} // controlled value
                                                onChange={(selectedOption) => {
                                                    setFieldValue("city", selectedOption ? selectedOption.value : "");
                                                }}
                                                onBlur={() => setFieldTouched("city", true)}
                                                />
                                                {errors.city && touched.city && (
                                                <div className="text-danger">{errors.city}</div>
                                                )}
                                            </FormGroup>
                                            </Col>

                                        {/* Postal Code */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="postalCode">Postal Code</Label>
                                            <Field
                                            name="postalCode"
                                            placeholder="Postal Code"
                                            type="text"
                                            maxLength="5"
                                            className={`form-control ${errors.postalCode && touched.postalCode ? "is-invalid" : ""}`}
                                            />
                                        </FormGroup>
                                        </Col>

                                        {/* Email */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="email">Email</Label>
                                            <Field
                                            name="email"
                                            placeholder="Email"
                                            type="email"
                                            maxLength="80"
                                            className={`form-control ${errors.email && touched.email ? "is-invalid" : ""}`}
                                            />
                                        </FormGroup>
                                        </Col>

                                        {/* Website */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="website">Website</Label>
                                            <Field
                                            name="website"
                                            placeholder="Website"
                                            type="text"
                                            maxLength="80"
                                            className={`form-control ${errors.website && touched.website ? "is-invalid" : ""}`}
                                            />
                                        </FormGroup>
                                        </Col>

                                        {/* Currencies */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="currencies">Currencies <span className="text-danger">*</span></Label>
                                            <Select
                                                name="currencies"
                                                options={currencies}
                                                placeholder="Select Currencies"
                                                isMulti  
                                                value={currencies.filter(option => values.currencies?.includes(option.value))} 
                                                onChange={(selectedOptions) => {
                                                    setFieldValue(
                                                    "currencies",
                                                    selectedOptions ? selectedOptions.map(option => option.value) : []
                                                    );
                                                }}
                                                onBlur={() => setFieldTouched("currencies", true)}                                              
                                            />
                                            {errors.currencies && touched.currencies && (
                                                <div className="text-danger">{errors.currencies}</div>
                                                )}
                                        </FormGroup>
                                        </Col>

                                        {/* Tax */}
                                        {/* <Col md="4">
                                            <FormGroup>
                                                <Label htmlFor="tax">Tax <span className="text-danger">*</span></Label>
                                                <Select
                                                    name="tax"
                                                    options={taxList}
                                                    placeholder="Select Tax"
                                                    isClearable
                                                    value={taxList.find(option => option.value === values.tax)} // for controlled value
                                                    onChange={(selectedOption) => {
                                                        setFieldValue("tax", selectedOption ? selectedOption.value : ""); 
                                                    }}
                                                    onBlur={() => setFieldTouched("tax", true)} 
                                                />
                                                {errors.tax && touched.tax && (
                                                <div className="text-danger">{errors.tax}</div>
                                                )}
                                            </FormGroup>
                                        </Col> */}

                                        {/* UEN Number */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="uenNumber">Supplier Tax Number <span className="text-danger">*</span></Label>
                                            <Field
                                            name="uenNumber"
                                            placeholder="Supplier Tax Number"
                                            type="text"
                                            maxLength="20"
                                            className={`form-control ${errors.uenNumber && touched.uenNumber ? "is-invalid" : ""}`}
                                            />
                                             {errors.uenNumber && touched.uenNumber && (
                                                <div className="text-danger">{errors.uenNumber}</div>
                                                )}
                                        </FormGroup>
                                        </Col>

                                        <Col md="4">
                                            <FormGroup>
                                                <Label htmlFor="paymentTerm">Payment Term <span className="text-danger">*</span></Label>
                                                <Select
                                                name="paymentTerm"
                                                options={paymentTermList} // your payment term list
                                                placeholder="Select Payment Term"
                                                isClearable
                                                value={paymentTermList.find(option => option.value === values.paymentTerm)}
                                                onChange={(selectedOption) => {
                                                    setFieldValue("paymentTerm", selectedOption ? selectedOption.value : "");
                                                }}
                                                onBlur={() => setFieldTouched("paymentTerm", true)}
                                                />
                                                {errors.paymentTerm && touched.paymentTerm && (
                                                <div className="text-danger">{errors.paymentTerm}</div>
                                                )}
                                            </FormGroup>
                                        </Col>

                                        <Col md="4">
                                            <FormGroup>
                                                <Label htmlFor="deliveryTerm">Delivery Term <span className="text-danger">*</span></Label>
                                                <Select
                                                name="deliveryTerm"
                                                options={deliveryTermList} // your delivery term list
                                                placeholder="Select Delivery Term"
                                                isClearable
                                                value={deliveryTermList.find(option => option.value === values.deliveryTerm)}
                                                onChange={(selectedOption) => {
                                                    setFieldValue("deliveryTerm", selectedOption ? selectedOption.value : "");
                                                }}
                                                onBlur={() => setFieldTouched("deliveryTerm", true)}
                                                />
                                                {errors.deliveryTerm && touched.deliveryTerm && (
                                                <div className="text-danger">{errors.deliveryTerm}</div>
                                                )}
                                            </FormGroup>
                                        </Col>

                                        {/* Address */}
                                        <Col md="12">
                                            <FormGroup>
                                                <Label htmlFor="address">Address</Label>
                                                <Field
                                                    as="textarea"
                                                    name="address"
                                                    placeholder="Address"
                                                    maxLength="100"
                                                    className={`form-control ${errors.address && touched.address ? "is-invalid" : ""}`}
                                                />
                                                {errors.address && touched.address && (
                                                <div className="text-danger">{errors.address}</div>
                                                )}
                                            </FormGroup>
                                        </Col>

                                        {/* Bank Name 1 */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="bankName1">Bank Name 1 

                                            {/* <span className="text-danger">*</span> */}
                                            </Label>

                                            <Field
                                            name="bankName1"
                                            placeholder="Bank Name 1"
                                            type="text"
                                            maxLength="100"
                                            className={`form-control ${errors.bankName1 && touched.bankName1 ? "is-invalid" : ""}`}
                                            />
                                            {errors.bankName1 && touched.bankName1 && (
                                                <div className="text-danger">{errors.bankName1}</div>
                                                )}
                                        </FormGroup>
                                        </Col>

                                        {/* Bank Code 1 */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="bankCode1">Bank Code 1
                                                 {/* <span className="text-danger">*</span> */}
                                                 </Label>
                                            <Field
                                            name="bankCode1"
                                            placeholder="Bank Code 1"
                                            type="text"
                                            maxLength="20"
                                            className={`form-control ${errors.bankCode1 && touched.bankCode1 ? "is-invalid" : ""}`}
                                            />
                                            {errors.bankCode1 && touched.bankCode1 && (
                                                <div className="text-danger">{errors.bankCode1}</div>
                                                )}
                                        </FormGroup>
                                        </Col>

                                        {/* Bank Account 1 */}
                                        <Col md="4">
                                            <FormGroup>
                                                <Label htmlFor="bankAccount1">Bank Account 1 
                                                    {/* <span className="text-danger">*</span> */}
                                                    </Label>
                                                <Field
                                                name="bankAccount1"
                                                placeholder="Bank Account 1"
                                                type="text"
                                                maxLength="50"
                                                className={`form-control ${errors.bankAccount1 && touched.bankAccount1 ? "is-invalid" : ""}`}
                                                />
                                                 {errors.bankAccount1 && touched.bankAccount1 && (
                                                <div className="text-danger">{errors.bankAccount1}</div>
                                                )}
                                            </FormGroup>
                                        </Col>

                                        {/* Bank Name 2 */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="bankName2">Bank Name 2</Label>
                                            <Field
                                                name="bankName2"
                                                placeholder="Bank Name 2"
                                                type="text"
                                                maxLength="100"
                                                className={`form-control ${errors.bankName2 && touched.bankName2 ? "is-invalid" : ""}`}
                                            />
                                        </FormGroup>
                                        </Col>
                                        

                                        {/* Bank Code 2 */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="bankCode2">Bank Code 2</Label>
                                            <Field
                                            name="bankCode2"
                                            placeholder="Bank Code 2"
                                            type="text"
                                            maxLength="20"
                                            className={`form-control ${errors.bankCode2 && touched.bankCode2 ? "is-invalid" : ""}`}
                                            />
                                        </FormGroup>
                                        </Col>

                                        {/* Bank Account 2 */}
                                        <Col md="4">
                                        <FormGroup>
                                            <Label htmlFor="bankAccount2">Bank Account 2</Label>
                                            <Field
                                            name="bankAccount2"
                                            placeholder="Bank Account 2"
                                            type="text"
                                            maxLength="50"
                                            className={`form-control ${errors.bankAccount2 && touched.bankAccount2 ? "is-invalid" : ""}`}
                                            />
                                        </FormGroup>
                                        </Col>
                                    </Row>
                                    </Form>
                                )}
                                </Formik>
                            </CardBody>
                        </Card>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default AddSupplier;
