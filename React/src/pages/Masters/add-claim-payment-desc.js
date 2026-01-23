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
import 'primeicons/primeicons.css';
import {  GetAllItems, GetClaimCategoryAutoComplete, GetClaimPaymentDescriptionById, GetClaimTypeAutoComplete, GetItemCategoryAutoComplete, GetItemGroupAutoComplete, GetItemUomList, GetSupplierById, GetSupplierCategoryAutoComplete, GetSupplierCountries, GetSupplierCurrencies, GetSupplierTaxList, SaveClaimPaymentDescription, SaveItemMaster, SaveSupplierMaster } from "common/data/mastersapi";

// // Claim Category Options
// const claimCategoryOptions = [
//   { label: "Health Insurance", value: "1" },
//   { label: "Vehicle Insurance", value: "2" },
//   { label: "Travel Insurance", value: "3" },
// ];

// // Claim Type Options (normally loaded after selecting category)
// const claimTypeOptions = [
//   { label: "Hospitalization", value: "101", categoryId: "1" },
//   { label: "Accident", value: "102", categoryId: "2" },
//   { label: "Flight Cancellation", value: "103", categoryId: "3" },
// ];

const AddClaimPaymentDesc = () => {
    const history = useHistory();
    const { id } = useParams();
    const payment_id = Number(id ?? 0);
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
    const [itemGroups, setItemGroups] = useState([]);
    const [itemCategories, setItemCategories] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [claimCategoryOptions, setClaimCategoryOptions] = useState([]);
    const [claimTypeOptions, setClaimTypeOptions] = useState([]);

    // --- Formik initial values ---
    const [initialValues, setInitialValues] = useState({
        paymentId:0,
        claimCategoryId: "",
        claimTypeId: "",
        paymentCode:"",
        description: "",
    });

    // --- Yup Validation Schema ---
    const validationSchema = Yup.object().shape({
        claimCategoryId: Yup.string().required("Claim Category is required"),
        claimTypeId: Yup.string().required("Claim Type is required"),
        description: Yup.string()
            .max(250, "Payment Description must be at most 250 characters")
            .required("Payment Description is required")
            .nullable(),
    });

    useEffect(() => {
        const fetchCategories = async () => {
        try {
            const res = await GetClaimCategoryAutoComplete(orgId, branchId, "%");
            if (res?.status) {
            const options = res.data.map((item) => ({
                value: item.Id,
                label: item.claimcategory,
                categorycode: item.categorycode,
            }));
            setClaimCategoryOptions(options);
            }
        } catch (error) {
            console.error("Error fetching claim categories:", error);
        }
        };

        fetchCategories();
    }, [orgId, branchId]);

    const mapClaimPaymentDescriptionToForm = (data) => {
        return {
            claimCategoryId: data?.categoryid || "",
            claimTypeId: data?.claimtypeid || "",
            paymentCode: data?.paymentCode || "",
            description: data?.paymentdescription || "",
            isActive: data?.isactive === 1,
        };
    };

    const ClaimPaymentDescriptionGetById = async (paymentId) => {
        try {
            const res = await GetClaimPaymentDescriptionById(paymentId);
            if (res?.data?.length) {
            const item = res.data[0];
            const formValues = mapClaimPaymentDescriptionToForm(item);
            setInitialValues(formValues);

            // preload claim types if editing existing record
            const typeRes = await GetClaimTypeAutoComplete(orgId, branchId, item.categoryid, "%");
            setClaimTypeOptions(
                (typeRes?.data || []).map(t => ({
                label: t.claimtype,
                value: t.claimtypeid,
                paymentcode: t.paymentcode,
                }))
            );
            }
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        }
    };

    useEffect(() => {
        if (isEditMode && payment_id) {
            ClaimPaymentDescriptionGetById(payment_id);
        }
    }, [isEditMode, payment_id]);


   const buildSavePayload = (
        values,
        orgId,
        branchId,
        userId,
        clientIp = "",
        paymentid = 0,
        isEditMode = false
        ) => {
        const now = new Date().toISOString();

        return {
            payment: {
            paymentid: isEditMode ? paymentid : 0, // keep existing id in edit
            paymentCode: values.paymentCode || "",
            paymentdescription: values.description || "",
            claimtypeid: values.claimTypeId || 0,
            createdby: isEditMode ? values.createdby || userId : userId,
            createdIP: isEditMode ? values.createdIP || clientIp : clientIp,
            createdDate: isEditMode ? values.createdDate || now : now,
            isActive: true,
            lastmodifiedby: userId,
            lastModifiedIP: clientIp,
            lastModifiedDate: now,
            orgId: orgId,
            branchId: branchId,
            },
            id: isEditMode ? paymentid : 0,
        };
    };

    const handleSubmit = async (values) => {
        try {
            const payload = buildSavePayload(
            values,
            orgId,
            branchId,
            userId,
            "",
            payment_id,
            isEditMode
            );

            const res = await SaveClaimPaymentDescription(isEditMode, payload);

            if (res?.status === true) {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: `Claim Payment Description ${isEditMode ? "updated" : "added"} successfully.`,
                });

                history.push("/manage-claim-payment-desc");
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: res?.message || "Something went wrong while saving Claim Payment Description.",
                });
            }
        } catch (err) {
            console.error("SaveClaimPaymentDescription Error:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An unexpected error occurred. Please try again later.",
            });
        }
    };
    
    const handleCancel = () => { 
        history.push("/manage-claim-payment-desc");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem={isEditMode ? "Edit Claim & Payment Description" : "Add Claim & Payment Description"} />
                    <Row>
                        <Card className="vh-100">
                            <CardBody style={{ overflowY: "auto" }}>
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
                                            {/* Claim Category Type */}
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label htmlFor="claimCategoryId">
                                                        Claim Category <span className="text-danger">*</span>
                                                    </Label>
                                                    <Select
                                                        id="claimCategoryId"
                                                        name="claimCategoryId"
                                                        options={claimCategoryOptions}
                                                        value={claimCategoryOptions.find(opt => opt.value === values.claimCategoryId) || null}
                                                        onChange={async (option) => {
                                                            setFieldValue("claimCategoryId", option ? option.value : "");

                                                            // reset claimType if category changes
                                                            setFieldValue("claimTypeId", "");
                                                            setFieldValue("paymentCode", "");

                                                            // load claim types based on category
                                                            if (option) {
                                                                const res = await GetClaimTypeAutoComplete(orgId, branchId, option.value, "%");
                                                                setClaimTypeOptions(
                                                                    (res?.data || []).map(item => ({
                                                                        label: item.claimtype,
                                                                        value: item.claimtypeid,
                                                                        paymentcode: item.paymentcode,
                                                                    }))
                                                                );
                                                            } else {
                                                                setClaimTypeOptions([]);
                                                            }
                                                        }}
                                                        className={errors.claimCategoryId && touched.claimCategoryId ? "is-invalid" : ""}
                                                        placeholder="Select Category"
                                                    />
                                                    {errors.claimCategoryId && touched.claimCategoryId && (
                                                        <div className="text-danger">{errors.claimCategoryId}</div>
                                                    )}
                                                </FormGroup>
                                            </Col>

                                            {/* Claim Type (category-based) */}
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label htmlFor="claimTypeId">
                                                    Claim Type <span className="text-danger">*</span>
                                                    </Label>
                                                    <Select
                                                    id="claimTypeId"
                                                    name="claimTypeId"
                                                    options={claimTypeOptions}
                                                    value={claimTypeOptions.find(opt => opt.value === values.claimTypeId) || null}
                                                    onChange={(option) => {
                                                        setFieldValue("claimTypeId", option ? option.value : "");
                                                        setFieldValue("paymentCode", option ? option.paymentcode : ""); // auto-fill payment code
                                                    }}
                                                    className={errors.claimTypeId && touched.claimTypeId ? "is-invalid" : ""}
                                                    placeholder="Select Claim Type"
                                                    />
                                                    {errors.claimTypeId && touched.claimTypeId && (
                                                    <div className="text-danger">{errors.claimTypeId}</div>
                                                    )}
                                                </FormGroup>
                                            </Col>
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label htmlFor="paymentCode">Payment Code</Label>
                                                    <input
                                                    type="text"
                                                    id="paymentCode"
                                                    name="paymentCode"
                                                    className="form-control"
                                                    value={values.paymentCode || ""}
                                                    disabled
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col >
                                                <FormGroup>
                                                    <Label htmlFor="description">Payment Description</Label>
                                                    <Field
                                                        as="textarea"
                                                        name="description"
                                                        placeholder="Enter description"
                                                        rows="3"
                                                        className={`form-control ${errors.description && touched.description ? "is-invalid" : ""}`}
                                                    />
                                                    {errors.description && touched.description && (
                                                        <div className="text-danger">{errors.description}</div>
                                                    )}
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

export default AddClaimPaymentDesc;
