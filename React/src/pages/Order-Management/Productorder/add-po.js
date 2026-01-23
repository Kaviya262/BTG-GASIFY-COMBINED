import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Collapse, Container, Row, Button, FormGroup, Label, Input, Table, Modal, ModalBody, ModalFooter, ModalHeader, InputGroup, UncontrolledAlert, InputGroupText } from "reactstrap";
import { Tooltip } from "reactstrap";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import {
    getGasTypes,
    getGasCodesByGasType,
    getCylinderDetails,
    CreateProductionOrder,
    getProductionOrderSeqNo,
    GetProductionOrderById,
    UpdateProductionOrder
} from "../../../common/data/mastersapi";
import { AutoComplete } from "primereact/autocomplete";
import { toast } from "react-toastify";

const animatedComponents = makeAnimated();

const AddPo = () => {
    const history = useHistory();
    const { id: PO_ID } = useParams();
    const isEditMode = !!PO_ID;

    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    // const [customerSelect, setCustomerSelect] = useState([]);
    const [tooltipOpen, setTooltipOpen] = useState({});
    const toggleTooltip = (id) => {
        setTooltipOpen((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [branchId, setBranchId] = useState(1);
    const [cylinderOptions, setCylinderOptions] = useState([]);
    const [cylinderOrgList, setCylinderOrgList] = useState([]);
    const [selectedCylinder, setSelectedCylinder] = useState(null);
    const [gasTypeId, setGasTypeId] = useState(null);
    const [gasCodes, setGasCodes] = useState([]);
    const [gasTypes, setGasTypes] = useState([]);
    const [selectedGasType, setSelectedGasType] = useState(null);
    const [productionOrderDetails, setProductionOrderDetails] = useState(null);
    const [errorClass, setErrorClass] = useState({});
    const [errorMsg, setErrorMsg] = useState([]);
    const [successStatus, setSuccessStatus] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [formData, setFormData] = useState({
        selectedDate: new Date(),
        gasType: null,
        gasCode: null,
        cylinder: [],
        barcode: "",
        prodNo: ""
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitType, setSubmitType] = useState(null);

    const [selectedGascode, setSelectedGascode] = useState()
    const [isGasCodeLoading, setIsGasCodeLoading] = useState(false);
    const [barcodeData, setBarcodeData] = useState("");
    const [isFetched, setIsFetched] = useState(false);


    useEffect(() => {
        // Ensure dependencies are available before fetching production order details
        if (isEditMode && gasTypes.length > 0 && !isFetched) {
            fetchProductionOrderDetails(PO_ID);
            setIsFetched(true);
        }
    }, [gasTypes, isFetched, isEditMode, PO_ID]);

    const fetchProductionOrderDetails = async (orderId) => {
        try {
            const response = await GetProductionOrderById(orderId);
            if (response?.status) {
                const data = response.data;
                // Find the correct gas type from the existing list
                const selectedGasType = gasTypes.find(
                    (type) => type.value === data.Header.GasTypeId
                );
                setGasTypeId(data.Header.GasTypeId)

                // Map cylinders from Detail and set isSelected based on IsChecked
                const cylindersWithSelection = data.Detail.map((item) => ({
                    ...item,
                    isSelected: item.IsChecked === 1 ? true : false || false
                }));

                setCylinderOrgList(cylindersWithSelection);

                const selectedCylinders = cylindersWithSelection
                    .filter(c => c.isSelected)
                    .map(c => ({ label: c.cylindername, value: c.cylinderid }));

                setFormData({
                    selectedDate: data.Header.ProdDate ? new Date(data.Header.ProdDate) : new Date(),
                    gasType: selectedGasType || null, // Ensure it comes from the available options
                    gasCode: data.Header.GasCodeId
                        ? { label: data.Header.GasCode, value: data.Header.GasCodeId }
                        : null,
                    cylinder: selectedCylinders,
                    barcode: data.Detail.length > 0 ? data.Detail[0].barcode : "",
                    prodNo: data.Header.ProdNo
                });
                setProductionOrderDetails(data);
                setSelectedGascode(data.Header.GasCodeId)
            }
        } catch (error) {
            console.error("Error fetching production order:", error);
        }
    };

    useEffect(() => {
        // setCustomerSelect([])
        const fetchGasTypes = async () => {
            const data = await getGasTypes(1);
            // setGasTypes(data);
            setGasTypes(data.map(g => ({ label: g.GasTypeName, value: g.GasTypeId })));
        };

        fetchGasTypes();

    }, []);

    useEffect(() => {
        if (gasTypeId && selectedGascode !== undefined) {
            fetchCylinders("%");
        }
        else {
            setCylinderOptions([]);
            setCylinderOrgList([]);
        }
    }, [gasTypeId, selectedGascode]); // Only trigger when both are ready

    useEffect(() => {
        const fetchGasCodes = async () => {
            if (!gasTypeId) {
                setGasCodes([]);
                setIsGasCodeLoading(false);
                setFormData(prev => ({ ...prev, gasCode: null }));
                setSelectedGascode(undefined);
                return;
            }

            setIsGasCodeLoading(true);
            try {
                const data = await getGasCodesByGasType(gasTypeId, 1);
                const formatted = data.map(g => ({ label: g.GasCodeName, value: g.GasCodeId }));
                setGasCodes(formatted);

                // If no gas codes, clear selection
                if (formatted.length === 0) {
                    setFormData(prev => ({ ...prev, gasCode: null }));
                    setSelectedGascode(undefined);
                }
            } catch (error) {
                console.error("Error fetching gas codes:", error);
                setGasCodes([]);
            } finally {
                setIsGasCodeLoading(false);
            }
        };

        fetchGasCodes();
    }, [gasTypeId]); // Only depend on gasTypeId


    const fetchCylinders = async (query = "%") => {
        if (!gasTypeId || selectedGascode === undefined) {
            setCylinderOptions([]);
            setCylinderOrgList([]);
            return;
        }

        try {
            const searchQuery = query && query.trim() !== "" ? query : "%";
            const gasCodeFilter = selectedGascode ?? 0;
            const data = await getCylinderDetails(
                searchQuery,
                branchId,
                gasCodeFilter,
                PO_ID || 0
            );

            if (data && Array.isArray(data)) {
                // Merge existing isSelected flags for edit mode
                const mergedCylinders = data.map(cylinder => {
                    // Find if this cylinder was previously selected
                    const existing = cylinderOrgList.find(c => c.cylinderid === cylinder.cylinderid);
                    return {
                        ...cylinder,
                        isSelected: existing?.isSelected || cylinder.IsChecked === 1 || false
                    };
                });

                setCylinderOrgList(mergedCylinders);
                loadCylinderOptions(mergedCylinders, isEditMode);
            } else {
                setCylinderOrgList([]);
                setCylinderOptions([]);
            }
        } catch (error) {
            console.error("Error fetching cylinders:", error);
            setCylinderOptions([]);
        }
    };

    const loadCylinderOptions = (data, isEdit) => {
        const allOptions = data.map(c => ({ label: c.cylindername, value: c.cylinderid }));

        let filteredOptions = allOptions;

        if (!isEdit) {
            filteredOptions = allOptions.filter(option =>
                data.find(d => d.cylinderid === option.value)?.IsAlreadyFilled === 0
            );
        }

        setCylinderOptions(filteredOptions);

        // Only update formData.cylinder if in edit mode AND we have pre-selected values
        // if (isEdit && formData.cylinder.length > 0) {
        //     const currentValues = formData.cylinder.map(c => c.value);
        //     const validSelections = filteredOptions.filter(opt => currentValues.includes(opt.value));
        //     setFormData(prev => ({ ...prev, cylinder: validSelections }));
        // }
    };

    // useEffect(() => {
    //     if (productionOrderDetails) {
    //         loadCylinderOptions(cylinderOrgList, !!productionOrderDetails);
    //     }
    // }, [productionOrderDetails]);

    const validationSchema = Yup.object().shape({
        CustomerId: Yup.string().required("Customer is required"),
        INDate: Yup.string().required("Invoice date is required"),
        DOId: Yup.string().required("Delivery Order Ids is required"),
    });

    const handleSubmit = async (isSubmitted) => {
        setIsSubmitting(true);
        try {
            const errors = [];

            if (!formData.selectedDate) {
                errors.push("Production Date is required.");
            }
            if (!formData.gasType?.value) {
                errors.push("Gas Type is required.");
            }
            if (!formData.gasCode?.value) {
                errors.push("Gas Code is required.");
            }
            if (!formData.cylinder || formData.cylinder.length === 0) {
                errors.push("At least one Cylinder must be selected.");
            }

            // If there are errors, stop execution and show messages
            if (errors.length > 0) {
                setErrorMsg(errors);
                return;
            }

            // Reset error messages if validation passes
            setErrorMsg([]);

            const prod_ID = isEditMode ? PO_ID : 0;

            let prodNo = "";
            if (!isEditMode) {
                const prodSeqData = await getProductionOrderSeqNo(branchId);
                if (!prodSeqData) {
                    setErrorMsg(["Failed to fetch Production Order Sequence Number"]);
                    return;
                }
                prodNo = prodSeqData.ProdNO || "";
            }

            const header = {
                prod_ID: Number(prod_ID),
                prodDate: new Date(formData.selectedDate).toISOString().split("T")[0],
                gasTypeId: formData.gasType?.value || 0,
                prodNo: (prodNo?.toString() || formData?.prodNo?.toString() || ""),
                gasCodeId: formData.gasCode?.value || 0,
                gasCode: formData.gasCode?.label || "",
                gasTypeName: formData.gasType?.label,
                isSubmitted,
                userId: 1,
                branchId: 1,
                orgId: 1
            };
            const details = cylinderOrgList
                .filter(c => c.isSelected)
                .map(cylinderInfo => {
                    const detailInfo = productionOrderDetails?.Detail.find(item => item.cylinderid === cylinderInfo.cylinderid) || {};
                    return {
                        prod_ID: Number(prod_ID),
                        prod_dtl_Id: detailInfo.Prod_dtl_Id || 0,
                        cylinderid: cylinderInfo.cylinderid,
                        barcode: cylinderInfo.barcode || "",
                        gascodeid: cylinderInfo.gascodeid || 0,
                        ownershipid: cylinderInfo.ownershipid,
                        cylindertypeid: cylinderInfo.cylindertypeid,
                        cylindername: cylinderInfo.cylindername || "",
                        gasCode: cylinderInfo.GasCode || "",
                        ownershipName: cylinderInfo.OwnershipName || "",
                        cylindertype: cylinderInfo.cylindertype || "",
                        testedon: cylinderInfo.testedon || "",
                        nexttestdate: cylinderInfo.nexttestdate ? cylinderInfo.nexttestdate.split("T")[0] : "",
                        IsChecked: cylinderInfo.IsChecked === 1 || false
                    };
                });

            const finalPayload = { header, details };

            let response;
            if (isEditMode) {
                response = await UpdateProductionOrder(finalPayload);
            } else {
                response = await CreateProductionOrder(finalPayload);
            }

            const resData = response?.data || response; // handle axios/fetch both

            if (resData?.status === true) {
                setSuccessStatus(true);
                setSuccessMsg(`Production Order ${isEditMode ? "Updated" : "Created"} Successfully!`);

                // Disable buttons on success
                setIsSubmitting(true);

                // Redirect after a short delay
                setTimeout(() => {
                    history.push("/production-order");
                }, 1000);
            } else {
                setErrorMsg([`Failed to ${isEditMode ? "update" : "create"} production order`]);
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMsg([`Error ${isEditMode ? "updating" : "creating"} production order. Please try again.`]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        history.push("/production-order");
    };


    const handleGasTypeChange = (selectedOption) => {
        setSelectedGasType(selectedOption);
        setGasTypeId(selectedOption?.value || null);

        // Reset dependent fields
        setFormData(prev => ({
            ...prev,
            gasType: selectedOption,
            gasCode: null,
            cylinder: []
        }));
        setSelectedGascode(undefined);
        setCylinderOptions([]);
        setCylinderOrgList([]);
        setGasCodes([]); // Will be populated by useEffect
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({ ...prev, selectedDate: date[0] }));
    };

    const handleGasCodeChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            gasCode: selectedOption || null,
            cylinder: [] // Clear cylinder selections when gas code changes
        }));

        if (selectedOption) {
            // If a new gas code is selected
            setSelectedGascode(selectedOption.value);
        } else {
            // If cleared, reset everything related to cylinder
            setSelectedGascode(undefined);
            setCylinderOptions([]);
            setCylinderOrgList([]);
        }
    };


    const handleCylinderChange = (selectedValues) => {
        // Ensure selectedValues is always an array
        const updatedSelection = Array.isArray(selectedValues) ? selectedValues : [];

        // Update form data
        setFormData(prevData => ({
            ...prevData,
            cylinder: updatedSelection
        }));

        // Sync isSelected flags
        setCylinderOrgList(prevList =>
            prevList.map(item => ({
                ...item,
                isSelected: updatedSelection.some(sel => sel.value === item.cylinderid)
            }))
        );
    };


    const handleBarcodeChange = (e) => {
        setFormData(prev => ({ ...prev, barcode: e.target.value }));
    };

    const openpopup = (e, submitype) => {
        const errors = [];
        if (!formData.selectedDate) {
            errors.push("Production Date is required.");
        }
        if (!formData.gasType?.value) {
            errors.push("Gas Type is required.");
        }
        if (!formData.gasCode?.value) {
            errors.push("Gas Code is required.");
        }
        if (!formData.cylinder || formData.cylinder.length === 0) {
            errors.push("At least one Cylinder must be selected.");
        }
        const selectedCylinders = cylinderOrgList.filter(c => c.isSelected);
        if (selectedCylinders.length === 0) {
            errors.push("Please select at least one cylinder.");
        }

        // If there are errors, stop execution and show messages
        if (errors.length > 0) {
            setErrorMsg(errors);
            return;
        }
        // Reset error messages if validation passes
        setErrorMsg([]);
        setSubmitType(submitype);  // 0 for Save
        setIsModalOpen(true);
    }

    const handleBarcodeInputChange = (cylinderId, value) => {
        setCylinderOrgList(prevList =>
            prevList.map(item =>
                item.cylinderid === cylinderId
                    ? { ...item, barcode: value }
                    : item
            )
        );

        setFormData(prev => ({
            ...prev,
            cylinder: prev.cylinder.map(c =>
                c.value === cylinderId ? { ...c, barcode: value } : c
            )
        }));
    };

    const handleCylinderCheckboxChange = (cylinderId, isChecked) => {
        // Update isSelected in the cylinder list
        setCylinderOrgList(prevList =>
            prevList.map(item =>
                item.cylinderid === cylinderId
                    ? { ...item, isSelected: isChecked }
                    : item
            )
        );
    };

    const handleBarcodeEnter = () => {
        if (!barcodeData) return;

        // Split input by comma, trim spaces, and remove empty entries
        const barcodes = barcodeData
            .split(",")
            .map(b => b.trim())
            .filter(b => b !== "");

        if (barcodes.length === 0) return;

        let matchedCylinders = cylinderOrgList.filter(c =>
            barcodes.includes(c.barcode)
        );

        if (matchedCylinders.length > 0) {
            // Mark all matched cylinders as selected
            setCylinderOrgList(prevList =>
                prevList.map(c =>
                    barcodes.includes(c.barcode)
                        ? { ...c, isSelected: true }
                        : c
                )
            );

            // Update formData.cylinder selections
            setFormData(prev => {
                const existing = prev.cylinder || [];
                const newSelections = matchedCylinders.map(c => ({
                    label: c.cylindername,
                    value: c.cylinderid
                }));

                // Merge existing + new unique selections
                const merged = [
                    ...existing,
                    ...newSelections.filter(
                        n => !existing.some(e => e.value === n.value)
                    )
                ];

                return { ...prev, cylinder: merged };
            });

            setErrorMsg([]);
        } else {
            setErrorMsg(["No matching barcodes found."]);
        }

        // Clear barcode input after processing
        setBarcodeData("");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs
                        title="Sales"
                        breadcrumbItem="Production Order"
                    />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <Formik initialValues={{ CustomerId: "", INDate: "", DOId: "" }} validationSchema={validationSchema} onSubmit={handleSubmit} >
                                        {({ errors, touched, setFieldValue, setFieldTouched, values }) => (
                                            <Form>
                                                <Row>
                                                    <Col md="8">

                                                        {errorMsg.length > 0 && (
                                                            <div className="alert alert-danger alert-new">
                                                                {errorMsg[0]}
                                                            </div>
                                                        )}
                                                        {successStatus && (
                                                            <UncontrolledAlert color="success" role="alert">
                                                                {successMsg}
                                                            </UncontrolledAlert>
                                                        )}
                                                    </Col>
                                                    <Col md="4">
                                                        <div className="justify-content-end text-end" >
                                                            <div className="button-items" style={{ marginRight: "12px" }}>
                                                                <button type="button" className="btn btn-info" onClick={(e) => openpopup(e, 0)} disabled={isSubmitting} >
                                                                    <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>
                                                                    {isEditMode ? "Save" : "Save"}
                                                                </button>
                                                                <button type="button" className="btn btn-success" onClick={(e) => openpopup(e, 1)} disabled={isSubmitting} >
                                                                    <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>Post
                                                                </button>
                                                                <button type="button" className="btn btn-danger" onClick={handleCancel} disabled={isSubmitting}>
                                                                    <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label>Date</Label>
                                                            <Flatpickr
                                                                className="form-control d-block"
                                                                placeholder="Select Date & Time"
                                                                options={{
                                                                    enableTime: true,
                                                                    noCalendar: false,
                                                                    dateFormat: "Y-m-d H:i",
                                                                    altInput: true,
                                                                    altFormat: "d-M-Y h:i K",
                                                                    time_24hr: false,
                                                                    defaultDate: new Date(),
                                                                }}
                                                                value={formData.selectedDate}
                                                                onChange={handleDateChange}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label className="required-label form-label">Gas Type</Label>
                                                            <Select
                                                                name="GasType"
                                                                id="GasType"
                                                                className="basic-single"
                                                                classNamePrefix="select"
                                                                isDisabled={isDisabled}
                                                                isLoading={isLoading}
                                                                isClearable={isClearable}
                                                                isRtl={isRtl}
                                                                isSearchable={isSearchable}
                                                                options={gasTypes}
                                                                value={formData.gasType}
                                                                // onChange={(selectedOptions) => setCustomerSelect(selectedOptions)}
                                                                onChange={handleGasTypeChange}
                                                                // value={formData.gasType}
                                                                styles={{
                                                                    menu: (provided) => ({
                                                                        ...provided,
                                                                        zIndex: 9999,
                                                                        maxHeight: 300,
                                                                        overflowY: 'auto'
                                                                    }),
                                                                    menuList: (provided) => ({
                                                                        ...provided,
                                                                        maxHeight: 300,
                                                                        overflowY: 'auto'
                                                                    })
                                                                }}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label for="salesContact" className="required-label form-label">Gas Code</Label>

                                                            <Select
                                                                key={`gascode-select-${gasTypeId}`} // Forces remount when gas type changes
                                                                className="basic-single"
                                                                classNamePrefix="select"
                                                                isDisabled={isDisabled}
                                                                isLoading={isGasCodeLoading}
                                                                isClearable={isClearable}
                                                                isRtl={isRtl}
                                                                isSearchable={true}
                                                                name="Gascode"
                                                                options={gasCodes}
                                                                value={formData.gasCode}
                                                                onChange={handleGasCodeChange}
                                                                placeholder={gasTypeId ? "Select Gas Code..." : "Select Gas Type first"}
                                                                menuPortalTarget={document.body}
                                                                styles={{
                                                                    menu: (provided) => ({
                                                                        ...provided,
                                                                        zIndex: 9999,
                                                                        maxHeight: 300,
                                                                        overflowY: 'auto'
                                                                    }),
                                                                    menuList: (provided) => ({
                                                                        ...provided,
                                                                        maxHeight: 300,
                                                                        overflowY: 'auto'
                                                                    })
                                                                }}
                                                                // Optional: Show message when no options
                                                                noOptionsMessage={() =>
                                                                    isGasCodeLoading
                                                                        ? "Loading gas codes..."
                                                                        : gasTypeId
                                                                            ? "No gas codes found"
                                                                            : "Select a Gas Type first"
                                                                }
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup >
                                                            <Label for="salesContact" className="required-label form-label">Cylinder </Label>

                                                            <Select
                                                                // key={`cylinder-select-${gasTypeId}-${selectedGascode}`} // Forces remount when filters change
                                                                isMulti
                                                                className="basic-single"
                                                                classNamePrefix="select"
                                                                isDisabled={isDisabled || isLoading}
                                                                isLoading={isLoading}
                                                                isClearable={isClearable}
                                                                isRtl={isRtl}
                                                                isSearchable={true}
                                                                name="cylinder"
                                                                options={cylinderOptions}
                                                                value={formData.cylinder}
                                                                onChange={handleCylinderChange}
                                                                onInputChange={(input) => {
                                                                    if (input.length >= 2 || input === "") {
                                                                        fetchCylinders(input);
                                                                    }
                                                                }}
                                                                placeholder="Search and select cylinders..."
                                                                menuPortalTarget={document.body}
                                                                styles={{
                                                                    menu: (provided) => ({
                                                                        ...provided,
                                                                        zIndex: 9999,
                                                                        maxHeight: 300,
                                                                        overflowY: 'auto'
                                                                    }),
                                                                    menuList: (provided) => ({
                                                                        ...provided,
                                                                        maxHeight: 300,
                                                                        overflowY: 'auto'
                                                                    })
                                                                }}
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        {/* Barcode field commented
                                                        <FormGroup>
                                                            <Label htmlFor="barcode">Barcode</Label>
                                                            <InputGroup>
                                                                <Input
                                                                    type="textarea"
                                                                    name="BarcodeScanner"
                                                                    id="BarcodeScanner"
                                                                    autoFocus
                                                                    style={{ flexGrow: 1 }}
                                                                    value={barcodeData}
                                                                    maxLength={90}
                                                                    onChange={(e) => setBarcodeData(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            e.preventDefault();
                                                                            handleBarcodeEnter();
                                                                        }
                                                                    }}
                                                                />
                                                                <InputGroupText>
                                                                    <Button onClick={handleBarcodeEnter}>
                                                                        Enter
                                                                    </Button>
                                                                </InputGroupText>
                                                            </InputGroup>
                                                        </FormGroup>
                                                        */}
                                                    </Col>

                                                    <Col md="12">
                                                        <Table className="table mb-0">
                                                            <thead style={{ backgroundColor: "#3e90e2" }}>
                                                                <tr>
                                                                    <th className="text-center">#</th>
                                                                    <th className="text-center">Cylinder Name</th>
                                                                    <th className="text-center">Ownership</th>
                                                                    <th className="text-center">Gas Code</th>
                                                                    <th className="text-center">Barcode</th>
                                                                    <th className="text-center">Cylinder Type</th>
                                                                    <th className="text-center">Tested On</th>
                                                                    <th className="text-center">Next Test Date</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody key="s">
                                                                {formData.cylinder.map((cylinder, index) => {
                                                                    // Find matching cylinder details from cylinderOrgList
                                                                    const cylinderInfo = cylinderOrgList.find(gas => gas.cylinderid === cylinder.value) || {};

                                                                    const tooltipId = `gas-code-${index}`;

                                                                    return (
                                                                        <tr key={cylinderInfo.cylinderid || index}>
                                                                            <td className="text-center align-middle">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={cylinderInfo.isSelected || false}
                                                                                    onChange={(e) => handleCylinderCheckboxChange(cylinder.value, e.target.checked)}
                                                                                />
                                                                            </td>
                                                                            <td className="text-left">{cylinderInfo.cylindername || ""}</td>
                                                                            <td className="text-left">{cylinderInfo.OwnershipName || ""}</td>
                                                                            <td className="text-center">
                                                                                <span
                                                                                    id={tooltipId}
                                                                                    style={{ cursor: "pointer", color: "blue" }}
                                                                                    className="btn-rounded btn-link"
                                                                                >
                                                                                    {cylinderInfo.GasCode || ""}
                                                                                </span>
                                                                                <Tooltip
                                                                                    isOpen={tooltipOpen[tooltipId] || false}
                                                                                    target={tooltipId}
                                                                                    toggle={() => toggleTooltip(tooltipId)}
                                                                                    style={{ maxWidth: "300px", width: "300px" }}
                                                                                >
                                                                                    <div style={{ textAlign: "left" }} className="font-size-13">
                                                                                        <div className="d-flex align-items-center gap-2">
                                                                                            <div className="col-4 text-left"><strong>Barcode:</strong></div>
                                                                                            <div className="col-8 text-left">{cylinderInfo.barcode || ""}</div>
                                                                                        </div>
                                                                                        <div className="d-flex align-items-center gap-2">
                                                                                            <div className="col-4 text-left"><strong>Gas Code:</strong></div>
                                                                                            <div className="col-8 text-left">{cylinderInfo.GasCode || ""}</div>
                                                                                        </div>
                                                                                        <div className="d-flex align-items-center gap-2">
                                                                                            <div className="col-4 text-left"><strong>Description:</strong></div>
                                                                                            <div className="col-8 text-left">{cylinderInfo.cylindername || ""}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                </Tooltip>
                                                                            </td>
                                                                            <td className="text-center">{cylinderInfo.barcode || ""}</td>

                                                                            <td className="text-center">{cylinderInfo.cylindertype || ""}</td>
                                                                            <td className="text-center">{cylinderInfo.testedon || ""}</td>
                                                                            <td className="text-center">
                                                                                {cylinderInfo.nexttestdate ? cylinderInfo.nexttestdate.split("T")[0] : ""}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </Table>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        )}
                                    </Formik>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered tabIndex="1">
                <ModalBody className="py-3 px-5">
                    <Row>
                        <Col lg={12}>
                            <div className="text-center">
                                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />
                                <h4>
                                    Do you want to {isEditMode
                                        ? (submitType === 0 ? "Update" : "Post")
                                        : (submitType === 0 ? "Save" : "Post")
                                    }?
                                </h4>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="text-center mt-3 button-items">
                                <Button
                                    className="btn btn-info"
                                    color="success"
                                    size="lg"
                                    onClick={() => {
                                        handleSubmit(submitType);
                                        setIsModalOpen(false);
                                    }}>
                                    Yes
                                </Button>
                                <Button color="danger" size="lg" className="btn btn-danger" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

        </React.Fragment>
    );
};

export default AddPo;
