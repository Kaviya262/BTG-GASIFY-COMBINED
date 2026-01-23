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
import {  GetAllItems, GetItemCategoryAutoComplete, GetItemGroupAutoComplete, GetItemMasterSeqNo, GetItemUomList, GetSupplierById, GetSupplierCategoryAutoComplete, GetSupplierCountries, GetSupplierCurrencies, GetSupplierTaxList, SaveItemMaster, SaveSupplierMaster } from "common/data/mastersapi";

const AddItems = () => {
    const history = useHistory();
    const { id } = useParams();
    const itemId = Number(id ?? 0);
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

    // --- Formik initial values ---
    const [initialValues, setInitialValues] = useState({
        itemCode: "",
        itemName: "",
        itemDescription: "",
        sellingItemName: "",
        itemGroup: "",
        itemCategory: "",
        uom: "",
    });

    // --- Yup Validation Schema ---
    const validationSchema = Yup.object().shape({
         itemCode: Yup.string()
            .max(15, "Item Code must be at most 15 characters")
            .matches(/^[a-zA-Z0-9]*$/, "Only alphanumeric characters allowed")
            .required("Item Code is required"),
        itemName: Yup.string()
            .trim()
            .max(100, "Item Name must be at most 100 characters")
           // .matches(/^[a-zA-Z0-9 ]*$/, "Only alphanumeric characters allowed")
            .required("Item Name is required"),
        itemDescription: Yup.string()
            .max(200, "Item Description must be at most 200 characters")
           // .matches(/^[a-zA-Z0-9 ]*$/, "Only alphanumeric characters allowed")
            .nullable(),
        sellingItemName: Yup.string()
            .max(100, "Selling Item Name must be at most 100 characters")
           // .matches(/^[a-zA-Z0-9 ]*$/, "Only alphanumeric characters allowed")
            .nullable(),
        itemGroup: Yup.string().required("Item Group is required"),
        itemCategory: Yup.string().required("Item Category is required"),
        uom: Yup.string().nullable(),
    });

    useEffect(() => {
        const fetchSeqNum = async () => {
            const res = await GetItemMasterSeqNo(orgId, branchId);
            if (res.status) {
                const data = res.data
                setInitialValues((prev) => ({
                    ...prev,
                    itemCode: data[0]?.itemcode,
                }));
            }
        };
        if (!isEditMode) {
            fetchSeqNum();
        }
    }, []);

    useEffect(() => {
        const loadMasterData = async () => {
            try {
            const [groupRes, catRes, uomRes] = await Promise.all([
                GetItemGroupAutoComplete(orgId, branchId),
                GetItemCategoryAutoComplete(orgId, branchId),
                GetItemUomList(orgId, branchId),
            ]);

            setItemGroups(
                (groupRes?.data || []).map(item => ({
                label: item.groupname,
                value: item.groupid,
                }))
            );

            setItemCategories(
                (catRes?.data || []).map(item => ({
                label: item.categoryname,
                value: item.categoryid,
                }))
            );

            setUoms(
                (uomRes?.data || []).map(item => ({
                label: item.uom,
                value: item.id,
                }))
            );
            } catch (error) {
            console.error("Failed to load item master data:", error);
            }
        };

        if (orgId && branchId) {
            loadMasterData();
        }
        }, [orgId, branchId]);

        useEffect(() => {
        if (isEditMode && itemId) {
            ItemGetById(itemId);
        }
        }, [isEditMode, itemId]);

    const mapItemToForm = (item) => ({
        itemCode: item.itemcode || "",
        itemName: item.itemname || "",
        itemDescription: item.description || "",
        sellingItemName: item.sellingitemname || "",
        itemGroup: item.groupid || "",
        itemCategory: item.categoryid || "",
        uom: item.UOMID || "",
    });

    const ItemGetById = async (itemId) => {
        try {
            const res = await GetAllItems(orgId, branchId,0,0,0,0,itemId);
            if (res?.data?.length) {
            const item = res.data[0];
            const formValues = mapItemToForm(item);
            setInitialValues(formValues);
            }
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        }
    };


   const buildSavePayload = (values, orgId, branchId, userId, userIp) => {
    return {
        master: {
        itemId: isEditMode ? itemId : 0,
        itemCode: values.itemCode,
        itemName: values.itemName,
        description: values.itemDescription,
        categoryId: values.itemCategory,
        groupId: values.itemGroup,
        uomid: values.uom || 0,
        locationId: 0,
        isActive: true,
        userid: userId ?? 0,
        createdIP: userIp ?? "0.0.0.0",
        createdDate: new Date().toISOString(),
        lastModifiedIP: userIp ?? "0.0.0.0",
        lastModifiedDate: new Date().toISOString(),
        orgId: orgId,
        branchId: branchId,
        taxPerc: 0,
        unitPrice: 0,
        vat: 0,
        sellingItemName: values.sellingItemName,
        },
    };
    };

    const handleSubmit = async (values) => {
        try {
            const payload = buildSavePayload(values, orgId, branchId, userId, ""); // from earlier mapping
            const res = await SaveItemMaster(isEditMode, payload);

            if (res?.status === true) {
            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Item ${isEditMode ? 'updated' : 'added'} successfully.`,
            });

            history.push('/manage-items');
            } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: res?.message || 'Something went wrong while saving the item.',
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
        history.push("/manage-items");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem={isEditMode ? "Edit Item" : "Add Item"} />
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
                                            {/* Item Code */}
                                            <Col md="4">
                                                <FormGroup>
                                                <Label htmlFor="itemCode">Item Code <span className="text-danger">*</span></Label>
                                                <Field
                                                    disabled
                                                    name="itemCode"
                                                    placeholder="Enter Item Code"
                                                    type="text"
                                                    maxLength="10"
                                                    className={`form-control ${errors.itemCode && touched.itemCode ? "is-invalid" : ""}`}
                                                />
                                                {errors.itemCode && touched.itemCode && (
                                                    <div className="text-danger">{errors.itemCode}</div>
                                                )}
                                                </FormGroup>
                                            </Col>

                                            {/* Item Name */}
                                            <Col md="4">
                                                <FormGroup>
                                                <Label htmlFor="itemName">Item Name <span className="text-muted">(Max 100 characters)</span> <span className="text-danger">*</span></Label>
                                                <Field
                                                    name="itemName"
                                                    placeholder="Enter Item Name"
                                                    type="text"
                                                    maxLength="100"
                                                    className={`form-control ${errors.itemName && touched.itemName ? "is-invalid" : ""}`}
                                                />
                                                {errors.itemName && touched.itemName && (
                                                    <div className="text-danger">{errors.itemName}</div>
                                                )}
                                                </FormGroup>
                                            </Col>

                                            {/* Item Description */}
                                            <Col md="4">
                                                <FormGroup>
                                                <Label htmlFor="itemDescription">Item Description </Label>
                                                <Field
                                                    name="itemDescription"
                                                    placeholder="Enter Item Description"
                                                    type="text"
                                                    maxLength="200"
                                                    className={`form-control ${errors.itemDescription && touched.itemDescription ? "is-invalid" : ""}`}
                                                />
                                                {errors.itemDescription && touched.itemDescription && (
                                                    <div className="text-danger">{errors.itemDescription}</div>
                                                )}
                                                </FormGroup>
                                            </Col>

                                            {/* Selling Item Name */}
                                            <Col md="4">
                                                <FormGroup>
                                                <Label htmlFor="sellingItemName">Selling Item Name</Label>
                                                <Field
                                                    name="sellingItemName"
                                                    placeholder="Enter Selling Item Name"
                                                    type="text"
                                                    maxLength="100"
                                                    className={`form-control ${errors.sellingItemName && touched.sellingItemName ? "is-invalid" : ""}`}
                                                />
                                                {errors.sellingItemName && touched.sellingItemName && (
                                                    <div className="text-danger">{errors.sellingItemName}</div>
                                                )}
                                                </FormGroup>
                                            </Col>


                                            {/* Item Category */}
                                           <Col md="4">
                                                <FormGroup>
                                                <Label htmlFor="itemCategory">
                                                    Item Category <span className="text-danger">*</span>
                                                </Label>
                                                <div className="d-flex align-items-center">
                                                    <div style={{ flex: 1 }}>
                                                    <Select
                                                        name="itemCategory"
                                                        options={itemCategories}
                                                        placeholder="Select Item Category"
                                                        isClearable
                                                        value={itemCategories.find(option => option.value === values.itemCategory)}
                                                        onChange={(selectedOption) => {
                                                        setFieldValue("itemCategory", selectedOption ? selectedOption.value : "");
                                                        }}
                                                        onBlur={() => setFieldTouched("itemCategory", true)}
                                                        styles={{
                                                        control: (provided) => ({
                                                            ...provided,
                                                            minHeight: "38px",
                                                            height: "38px",
                                                            borderTopRightRadius: 0,
                                                            borderBottomRightRadius: 0,
                                                        }),
                                                        valueContainer: (provided) => ({
                                                            ...provided,
                                                            height: "38px",
                                                            padding: "0 8px",
                                                        }),
                                                        }}
                                                    />
                                                    </div>
                                                    {/* <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    style={{
                                                        height: "38px",
                                                        borderTopLeftRadius: 0,
                                                        borderBottomLeftRadius: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                    onClick={() => console.log("Open Add Item Category modal")}
                                                    >
                                                    <i className="pi pi-plus"></i>
                                                    </button> */}
                                                </div>

                                                {errors.itemCategory && touched.itemCategory && (
                                                    <div className="text-danger">{errors.itemCategory}</div>
                                                )}
                                                </FormGroup>
                                            </Col>

                                            
                                            {/* Item Group */}
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label htmlFor="itemGroup">
                                                    Item Group <span className="text-danger">*</span>
                                                    </Label>
                                                    <div className="d-flex align-items-center">
                                                    <div style={{ flex: 1 }}>
                                                        <Select
                                                        name="itemGroup"
                                                        options={itemGroups}
                                                        placeholder="Select Item Group"
                                                        isClearable
                                                        value={itemGroups.find(option => option.value === values.itemGroup)}
                                                        onChange={(selectedOption) => {
                                                            setFieldValue("itemGroup", selectedOption ? selectedOption.value : "");
                                                        }}
                                                        onBlur={() => setFieldTouched("itemGroup", true)}
                                                        styles={{
                                                            control: (provided) => ({
                                                            ...provided,
                                                            minHeight: "38px",           // dropdown height
                                                            height: "38px",
                                                            borderTopRightRadius: 0,
                                                            borderBottomRightRadius: 0,
                                                            }),
                                                            valueContainer: (provided) => ({
                                                            ...provided,
                                                            height: "38px",
                                                            padding: "0 8px",
                                                            }),
                                                        }}
                                                        />
                                                    </div>
                                                    {/* <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        style={{
                                                        height: "38px",                 // match dropdown height
                                                        borderTopLeftRadius: 0,
                                                        borderBottomLeftRadius: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        }}
                                                        onClick={() => console.log("Open Add Item Group modal")}
                                                    >
                                                        <i className="pi pi-plus"></i>
                                                    </button> */}
                                                    </div>

                                                    {errors.itemGroup && touched.itemGroup && (
                                                    <div className="text-danger">{errors.itemGroup}</div>
                                                    )}
                                                </FormGroup>
                                                </Col>

                                            {/* UOM */}
                                            {/* <Col md="4">
                                                <FormGroup>
                                                <Label htmlFor="uom">UOM</Label>
                                                <Select
                                                    name="uom"
                                                    options={uoms} // your UOM master dropdown
                                                    placeholder="Select UOM"
                                                    isClearable
                                                    value={uoms.find(option => option.value === values.uom)}
                                                    onChange={(selectedOption) => {
                                                    setFieldValue("uom", selectedOption ? selectedOption.value : "");
                                                    }}
                                                    onBlur={() => setFieldTouched("uom", true)}
                                                />
                                                {errors.uom && touched.uom && (
                                                    <div className="text-danger">{errors.uom}</div>
                                                )}
                                                </FormGroup>
                                            </Col> */}
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

export default AddItems;
