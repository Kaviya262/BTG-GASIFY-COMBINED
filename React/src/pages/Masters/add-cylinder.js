import React, { useState, useEffect } from "react";
import {
    Container, Row, Col, Card, CardBody, FormGroup, Label, UncontrolledAlert
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { useSelector } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { saveOrUpdateCylinder, cylinderSizeList, getchGasList, GetFilteredCylinders } from "../../../src/common/data/mastersapi";
import { useHistory, useLocation } from "react-router-dom";
import { useDispatch } from 'react-redux';


const SyncGasDescription = ({ GasCodeList }) => {
    const { values, setFieldValue } = useFormikContext();

    useEffect(() => {
        debugger
        const selectedGas = GasCodeList.find(g => g.value === values.gascode);
        if (selectedGas) {
            setFieldValue("gasdescription", selectedGas.description);
        }
    }, [values.gascode, GasCodeList, setFieldValue]);
    return null;
};

const AddCylinder = ({ props }) => {
    const [existingCylinders, setExistingCylinders] = useState([]);
    const history = useHistory();
    const location = useLocation();
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrormsg] = useState("");
    const [ownership, setOwnership] = useState("");
    const [cylindersizelist, setCylinderSizeList] = useState([]);
    const [gascodelist, setGasCodeList] = useState([]);

    const handleMonthYearChange = (month, year) => {
        if (month && year) {
            const nextTestDate = new Date(year, month - 1, 1);
            nextTestDate.setFullYear(nextTestDate.getFullYear() + 5);
            setFieldValue("nexttestdate", nextTestDate);
        }
    };

    const statusList = [
        { label: "Full-In", value: "1", id: 1 },
        { label: "Full-Out", value: "2", id: 2 },
        { label: "Empty-In", value: "3", id: 3 },
        { label: "Empty-Out", value: "4", id: 4 }
    ];

    const owershiplist = [
        { label: "BTG (BTG Owned Property)", value: "1", id: 1 },
        { label: "COP (Customer Owned Property)", value: "2", id: 2 },
        { label: "SOP (Supplier Owned Property)", value: "3", id: 3 }
    ];

    const cylinderTypeList = [
        { label: "Part of Pallet", value: "1", id: 1 },
        { label: "Stand alone", value: "2", id: 2 },
    ];



    useEffect(() => {
        if (!existingCylinders.length) {
            debugger
            const loadCylinders = async () => {
                const result = await GetFilteredCylinders({ fromDate: "", toDate: "", name: "" });
                if (result.status) {
                    setExistingCylinders(result.data);
                }
            };
            loadCylinders();
        }
    }, [existingCylinders]);

    useEffect(() => {
        const loadcylinderSizeList = async () => {
            try {
                debugger
                const data = await cylinderSizeList();
                if (data) {

                    const formatted = data.map(item => ({
                        label: `${item.label}`,
                        value: item.id.toString()
                    }));
                    setCylinderSizeList(formatted);
                }
            } catch (err) {
                console.error("Failed to load cylinder sizes:", err);
            }
        };

        loadcylinderSizeList();
    }, []);

    useEffect(() => {
        const loadGasCodeList = async () => {
            try {
                debugger
                const branchId = 1;
                const response = await getchGasList(branchId);
                if (response) {
                    const formatted = response.map(item => ({
                        label: item.GasCode,
                        value: item.GasCodeId.toString(),
                    }));

                    setGasCodeList(formatted);
                }
            } catch (error) {
                console.error(error);
            }
        };

        loadGasCodeList();
    }, []);



    const cylinderData = location.state?.userData?.[0] || null;

    const initformvalues = cylinderData ? {
        barcode: cylinderData.barcode || "",
        branchId: cylinderData.branchId || null,
        cylinderCode: cylinderData.cylinderName || "",
        cylinderSize: cylinderData.cylinderSize?.toString() || null,
        cylinderid: cylinderData.cylinderid || null,
        cylinderNumber: cylinderData.cylinderNumber || "",
        cylindertype: cylinderData.cylindertype || "",
        cylindertypeid: cylinderData.cylindertypeid || null,
        docNumber: cylinderData.docNumber || null,
        fileData: cylinderData.fileData || null,
        fileName: cylinderData.fileName || null,
        gasCodeId: cylinderData.gasCodeId?.toString() || "",
        hsCode: cylinderData.hsCode || "",
        isActive: cylinderData.isActive || false,
        location: cylinderData.location || "",
        manufacturer: cylinderData.manufacturer || "",
        nexttestdate: cylinderData.nexttestdate ? new Date(cylinderData.nexttestdate) : null,
        orgId: cylinderData.orgId || null,
        ownershipName: cylinderData.ownershipName || "",
        ownershipid: cylinderData.ownershipid || null,
        palletBarcode: cylinderData.palletBarcode || "",
        palletRegNumber: cylinderData.palletRegNumber || "",
        path: cylinderData.path || null,
        remarks: cylinderData.remarks || "",
        serialno: cylinderData.serialno || "",
        statusId: cylinderData.statusId || null,
        testedMonth: cylinderData.testedMonth || 0,
        testedYear: cylinderData.testedYear || 0,
        testedon: cylinderData.testedon ? new Date(cylinderData.testedon) : null,
        userIP: cylinderData.userIP || null,
        userId: cylinderData.userId || 0,
        workingPressure: typeof cylinderData.workingPressure === "number" ? cylinderData.workingPressure : null,
        gasdescription: cylinderData.gasDescription || ""
    } : {
        barcode: "",
        branchId: null,
        cylinderSize: null,
        cylinderid: "",
        cylinderName: "",
        cylindertype: "",
        cylindertypeid: null,
        docNumber: null,
        fileData: null,
        fileName: null,
        gasCodeId: null,
        hsCode: "",
        isActive: false,
        location: "",
        manufacturer: "",
        nexttestdate: null,
        orgId: null,
        ownershipName: "",
        ownershipid: null,
        palletBarcode: "",
        palletRegNumber: "",
        path: null,
        remarks: "",
        serialno: "",
        statusId: null,
        testedMonth: 0,
        testedYear: 0,
        testedon: null,
        userIP: null,
        userId: 0,
        workingPressure: null,
        gasDescription: ""
    };



    const handleCancel = () => {
        history.push("/manage-cylinder");
    };

    const handleTestedOnChange = (month, year, setFieldValue) => {
        if (month && year) {
            const testedDate = new Date(year, month - 1, 1);
            const nextTestDate = new Date(testedDate);
            nextTestDate.setFullYear(testedDate.getFullYear() + 5);

            setFieldValue("testedon", testedDate);
            setFieldValue("nexttestdate", nextTestDate);
        }
    };



    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        const isUpdate = !!values.cylinderid;
        const errors = {};
        debugger
        // Basic field validations     
        if (values.cylinderCode) {
            debugger
            const duplicate = existingCylinders.find(cyl =>
                cyl.cylindername?.toLowerCase() === values.cylinderCode.toLowerCase() &&
                (!isUpdate || String(cyl.cylinderid) !== String(values.cylinderid))
            );
            if (duplicate) {
                errors.cylinderCode = 'Cylinder Code already exists';
            }
        }

        if (values.barcode) {
            const duplicate = existingCylinders.find(cyl =>
                cyl.barcode?.toLowerCase() === values.barcode.toLowerCase() &&
                (!isUpdate || String(cyl.cylinderid) !== String(values.cylinderid))
            );
            if (duplicate) {
                errors.barcode = 'Barcode already exists';
            }
        }

        if (!values.cylinderNumber || values.cylinderNumber.trim() === '') {
            errors.cylinderNumber = 'Cylinder Number is required';
        }
        else if (values.cylinderNumber.length > 7) {
            errors.cylinderNumber = 'Cylinder Number must be below 7 Characters';
        }

        if (!values.gasstatus || values.gasstatus.trim() === '') {
            errors.gasstatus = 'Gas Status is required';
        }

        if (!values.ownership || values.ownership.trim() === '') {
            errors.ownership = 'Ownership is required';
        }

        if (!values.cylindertypeid || values.cylindertypeid.toString().trim() === '') {
            errors.cylindertypeid = 'Cylinder Type is required';
        }

        if (!values.cylinderSize || values.cylinderSize.trim() === '') {
            errors.cylinderSize = 'Cylinder Size is required';
        }

        if (!values.gasCodeId || values.gasCodeId.toString().trim() === '') {
            errors.gasCodeId = 'Gas Code is required';
        }
        if (values.gasdescription && values.gasdescription.length > 50) {
            errors.gasdescription = 'Gas Description must be below 50 characters';
        }

        if (
            values.testedMonth === undefined ||
            values.testedMonth === null ||
            values.testedMonth < 1 ||
            values.testedMonth > 12
        ) {
            errors.testedMonth = 'Tested Month is required and must be between 1 and 12';
        }

        const currentYear = new Date().getFullYear();
        if (
            values.testedYear === undefined ||
            values.testedYear === null ||
            values.testedYear < 2000 ||
            values.testedYear > currentYear
        ) {
            errors.testedYear = `Tested Year is required and must be between 2000 and ${currentYear}`;
        }

        if (!values.nexttestdate) {
            errors.nexttestdate = 'Next Test Date is required';
        }

        if (
            values.workingPressure === undefined ||
            values.workingPressure === null ||
            values.workingPressure === '' ||
            isNaN(values.workingPressure) ||
            Number(values.workingPressure) <= 0
        ) {
            errors.workingPressure = 'Working Pressure is required and must be a positive number';
        }

        // If validation errors exist, show them and stop submission
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            setSubmitting(false);
            return;
        }

        setSubmitting(true);
        setErrormsg("");
        setSuccessMsg("");
        ;

        const selectedOwnership = owershiplist.find(x => x.value === Number(values.ownership));
        const selectedStatus = statusList.find(x => x.value === Number(values.gasstatus));
        const selectedCylinderType = cylinderTypeList.find(x => x.value === Number(values.cylindertypeid));
        const selectedCylinderSize = cylindersizelist.find(x => x.label === values.cylinderSize);
        const selectedGasCode = gascodelist.find(x => x.value === Number(values.gasCodeId));

        const formatDateLocal = (date) => {
            debugger
            const year = date.getFullYear();
            const month = (`0${date.getMonth() + 1}`).slice(-2);
            const day = (`0${date.getDate()}`).slice(-2);
            return `${year}-${month}-${day}`;
        };
        debugger
        const payload = {
            cylinder: {

                cylinderid: values.cylinderid ? parseInt(values.cylinderid, 10) : 0,
                barcode: values.barcode,
                cylindernumber: values.cylinderNumber,
                CylinderCode: values.cylinderCode,

                gasCodeId: Number(values.gasCodeId),
                gasCodeName: selectedGasCode?.label || "",
                gasdescription: values.gasdescription || "",

                cylindertypeid: Number(values.cylindertypeid),
                cylindertype: selectedCylinderType?.label || "",

                ownershipid: Number(values.ownership),
                ownershipName: selectedOwnership?.label || "",

                statusId: Number(values.gasstatus),
                gasStatusName: selectedStatus?.label || "",

                cylindersizeid: selectedCylinderSize?.value || 0,
                cylindersize: values.cylinderSize || "",

                testedon: values.testedon ? formatDateLocal(values.testedon) : null,
                nexttestdate: values.nexttestdate ? formatDateLocal(values.nexttestdate) : null,

                remarks: values.remarks || "",
                userId: 1,
                userIP: "0",
                isActive: values.activestatus === "1",
                branchId: 1,
                orgId: 1,
                IsDelivered: 0,
                location: values.location || "",
                hsCode: values.hsCode || "",
                manufacturer: values.manufacturer || "",
                palletRegNumber: values.palletRegNumber || "",
                palletBarcode: values.palletBarcode || "",
                workingPressure: values.workingPressure || "",

                docNumber: values.docNumber || "",
                fileName: values.file?.name || "",
                fileData: values.fileBase64 || "",

                testedMonth: values.testedMonth || 0,
                testedYear: values.testedYear || 0,
            }
        };

        const duplicateFields = {};

        existingCylinders.forEach(cyl => {
            debugger
            const isSameRecord = isUpdate && String(cyl.cylinderid) === String(values.cylinderid);
            if (isSameRecord) return;

            if (
                values.cylinderCode &&
                cyl.cylindername?.toLowerCase() === values.cylinderCode.toLowerCase()
            ) {
                debugger
                duplicateFields.cylinderCode = "Cylinder Code already exists";
            }

            if (
                values.barcode &&
                cyl.barcode?.toLowerCase() === values.barcode.toLowerCase()
            ) {
                debugger
                duplicateFields.barcode = "Barcode already exists";
            }

            if (
                values.cylinderNumber &&
                cyl.cylindernumber?.toLowerCase() === values.cylinderNumber.toLowerCase()
            ) {
                debugger
                duplicateFields.cylinderNumber = "Cylinder Number already exists";
            }
        });

        if (Object.keys(duplicateFields).length > 0) {
            setErrors(duplicateFields);
            setSubmitting(false);
            return;
        }

        try {
            debugger
            const response = await saveOrUpdateCylinder(payload);
            console.log("Submission error:", response);
            if (response.statusCode === 0) {
                setSuccessMsg(response.message);
                setTimeout(() => history.push("/manage-cylinder"), 2000);
            } else {
                setErrormsg(response.message || "Submission failed");
            }
        } catch (error) {
            console.error("Submission error:", error);
            setErrormsg("An unexpected error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };
    console.log("sample ", initformvalues);

    const CylinderSchema = Yup.object().shape({
        cylinderCode: Yup.string().trim()
            .required('Cylinder Code is required')
            .max(20, 'Cylinder Code must be below 20 Characters'),
        barcode: Yup.string().trim()
            .required('Barcode is required')
            .max(12, 'Barcode must be below 12 Characters')
            .test('unique-barcode', 'Barcode already exists', function (value) {
                const { existingCylinders } = this.options.context || {};
                const currentId = this.parent.cylinderid;
                if (!value || !existingCylinders) return true;
                return !existingCylinders.some(cyl =>
                    cyl.barcode?.toLowerCase() === value.toLowerCase() &&
                    String(cyl.cylinderid) !== String(currentId)
                );
            }),
        cylinderNumber: Yup.string().trim()
            .required('Cylinder Number is required')
            .max(12, 'Cylinder Number must be below 12 Characters')
            .test('unique-cylinderNumber', 'Cylinder Number already exists', function (value) {
                const { existingCylinders } = this.options.context || {};
                const currentId = this.parent.cylinderid;
                if (!value || !existingCylinders) return true;
                return !existingCylinders.some(cyl =>
                    cyl.cylindernumber?.toLowerCase() === value.toLowerCase() &&
                    String(cyl.cylinderid) !== String(currentId)
                );
            }),
        gasstatus: Yup.string().required('Gas Status is required'),
        ownership: Yup.string().required('Ownership is required'),
        cylindertypeid: Yup.string().required('Cylinder Type is required'),
        cylinderSize: Yup.string().required('Cylinder Size is required'),
        gasCodeId: Yup.string().required('Gas Code is required'),
        gasdescription: Yup.string().max(50, 'Gas Description must be below 50 characters'),
        testedMonth: Yup.number()
            .required('Tested Month is required')
            .min(1, 'Tested Month is required')
            .max(12, 'Month must be between 1 and 12'),
        testedYear: Yup.number()
            .required('Tested Year is required')
            .min(2000, 'Tested Year is required')
            .max(new Date().getFullYear(), `Year must be <= ${new Date().getFullYear()}`),
        nexttestdate: Yup.date().required('Next Test Date is required'),
        workingPressure: Yup.number()
            .required('Working Pressure is required')
            .positive('Must be a positive number'),
    });

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Masters" breadcrumbItem={cylinderData ? "Edit Cylinder" : "New Cylinder"} />
                <Row>
                    <Col lg="12">
                        <Card>
                            <CardBody>
                                {errorMsg && <UncontrolledAlert color="danger">{errorMsg}</UncontrolledAlert>}
                                {successMsg && <UncontrolledAlert color="success">{successMsg}</UncontrolledAlert>}
                                <Formik

                                    initialValues={{
                                        barcode: initformvalues.barcode || "",
                                        cylinderid: initformvalues.cylinderid || "",
                                        cylinderCode: initformvalues.cylinderCode || "",
                                        cylinderNumber: initformvalues.cylinderNumber || "",
                                        gasCodeId: initformvalues.gasCodeId ? initformvalues.gasCodeId.toString() : "",
                                        ownership: initformvalues.ownershipid ? initformvalues.ownershipid.toString() : "",
                                        cylindertypeid: initformvalues.cylindertypeid ? initformvalues.cylindertypeid.toString() : "",
                                        cylindertypename: initformvalues.cylindertype || "",
                                        cylinderSize: initformvalues.cylinderSize ? initformvalues.cylinderSize.toString() : "",
                                        testedMonth: initformvalues.testedMonth || 0,
                                        testedYear: initformvalues.testedYear || 0,
                                        nexttestdate: initformvalues.nexttestdate || null,
                                        activestatus: initformvalues.isActive ? "1" : "0",
                                        gasstatus: "3",
                                        remarks: initformvalues.remarks || "",
                                        workingPressure: initformvalues.workingPressure || "",
                                        manufacturer: initformvalues.manufacturer || "",
                                        hsCode: initformvalues.hsCode || "",
                                        palletRegNumber: initformvalues.palletRegNumber || "",
                                        palletBarcode: initformvalues.palletBarcode || "",
                                        location: initformvalues.location || "",
                                        gasdescription: initformvalues.gasdescription || "",
                                        statusId: initformvalues.statusId
                                    }}
                                    onSubmit={handleSubmit}
                                    validationSchema={CylinderSchema}
                                    validateOnBlur={true}
                                    validateOnChange={true}
                                    validateOnMount={true}
                                    context={{ existingCylinders }}
                                >


                                    {({ values, errors, touched, setFieldValue, setFieldTouched }) => (
                                        <Form>
                                            <Row>
                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Cylinder Code</Label>
                                                        <Field
                                                            name="cylinderCode"
                                                            placeholder="Enter Cylinder code"
                                                            className={`form-control ${errors.cylinderCode && touched.cylinderCode ? "is-invalid" : ""
                                                                }`}
                                                        />
                                                        <ErrorMessage name="cylinderCode" component="div" className="invalid-feedback" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Barcode</Label>
                                                        <Field
                                                            name="barcode"
                                                            placeholder="Enter Barcode"
                                                            className={`form-control ${errors.barcode && touched.barcode ? "is-invalid" : ""
                                                                }`}
                                                        />
                                                        <ErrorMessage name="barcode" component="div" className="invalid-feedback" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Cylinder Number</Label>
                                                        <Field
                                                            name="cylinderNumber"
                                                            placeholder="Enter Cylinder Number"
                                                            className={`form-control ${errors.cylinderNumber && touched.cylinderNumber ? "is-invalid" : ""
                                                                }`}
                                                        />
                                                        <ErrorMessage name="cylinderNumber" component="div" className="invalid-feedback" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Gas Code</Label>
                                                        <Select
                                                            name="gasCodeId"
                                                            options={gascodelist}
                                                            placeholder="Select Gas Code"
                                                            className={errors.gasCodeId && touched.gasCodeId ? "is-invalid" : ""}
                                                            onChange={(option) => {
                                                                const val = option ? option.value : "";
                                                                setFieldValue("gasCodeId", val);
                                                            }}
                                                            onBlur={() => setFieldTouched("gasCodeId", true)}
                                                            value={
                                                                gascodelist.find(option => option.value === values.gasCodeId?.toString()) || null
                                                            }
                                                        />
                                                        {errors.gasCodeId && touched.gasCodeId && (
                                                            <div className="invalid-feedback">{errors.gasCodeId}</div>
                                                        )}

                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label>Gas Description</Label>
                                                        <Field
                                                            name="gasdescription"
                                                            placeholder="Enter Gas Description"
                                                            className="form-control"
                                                        />

                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Gas Status</Label>
                                                        <div className={errors.gasstatus && touched.gasstatus ? 'is-invalid' : ''}>
                                                            <Select
                                                                name="gasstatus"
                                                                options={statusList}

                                                                onChange={(option) => setFieldValue('gasstatus', option ? option.value : '')}
                                                                onBlur={() => setFieldTouched('gasstatus', true)}
                                                                value={statusList.find(option => option.value === values.gasstatus) || null}
                                                                isDisabled={true}
                                                            />

                                                        </div>
                                                        <ErrorMessage name="gasstatus" component="div" className="invalid-feedback" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Ownership</Label>
                                                        <Select
                                                            name="ownership"
                                                            options={owershiplist}
                                                            placeholder="Select Ownership"
                                                            classNamePrefix="react-select"
                                                            className={errors.ownership && touched.ownership ? "is-invalid" : ""}
                                                            onChange={(option) => {
                                                                const val = option ? option.value : "";
                                                                setOwnership(val);
                                                                setFieldValue("ownership", val);
                                                            }}
                                                            onBlur={() => setFieldTouched("ownership", true)}
                                                            value={owershiplist.find(option => option.value === values.ownership) || null}
                                                        />
                                                        {errors.ownership && touched.ownership && (
                                                            <div className="invalid-feedback">{errors.ownership}</div>
                                                        )}
                                                    </FormGroup>

                                                </Col>

                                                {(values.ownership === 2 || values.ownership === 3) && (
                                                    <>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label className="required-label">Document Number</Label>
                                                                <Field
                                                                    name="docNumber"
                                                                    placeholder="Enter Document Number"
                                                                    className={`form-control ${errors.docNumber && touched.docNumber ? "is-invalid" : ""
                                                                        }`}
                                                                />
                                                                <ErrorMessage name="docNumber" component="div" className="invalid-feedback" />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Label className="required-label">File Upload</Label>
                                                                <input
                                                                    type="file"
                                                                    name="file"
                                                                    className={`form-control ${errors.file && touched.file ? "is-invalid" : ""}`}
                                                                    onChange={(e) => {
                                                                        const file = e.currentTarget.files[0];
                                                                        setFieldValue("file", file);

                                                                        if (file) {
                                                                            const reader = new FileReader();
                                                                            reader.onloadend = () => {
                                                                                const base64 = reader.result.split(",")[1];
                                                                                setFieldValue("fileBase64", base64);
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                    onBlur={() => setFieldTouched("file", true)}
                                                                />
                                                                <ErrorMessage name="file" component="div" className="invalid-feedback" />
                                                            </FormGroup>
                                                        </Col>
                                                    </>
                                                )}

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Cylinder Type</Label>
                                                        <Select
                                                            name="cylindertypeid"
                                                            options={cylinderTypeList}
                                                            placeholder="Select Cylinder Type"
                                                            className={errors.cylindertypeid && touched.cylindertypeid ? "is-invalid" : ""}
                                                            onChange={(option) => {
                                                                const val = option ? option.value : "";
                                                                setFieldValue("cylindertypeid", val);
                                                            }}
                                                            onBlur={() => setFieldTouched("cylindertypeid", true)}
                                                            value={cylinderTypeList.find(option => option.value === values.cylindertypeid?.toString()) || null}
                                                        />
                                                        <ErrorMessage name="cylindertypeid" component="div" className="invalid-feedback" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Cylinder Size</Label>
                                                        <div className={errors.cylinderSize && touched.cylinderSize ? 'is-invalid' : ''}>
                                                            <Select
                                                                name="cylinderSize"
                                                                options={cylindersizelist}
                                                                placeholder="Select Cylinder Size"
                                                                onChange={(option) => setFieldValue('cylinderSize', option ? option.value : '')}
                                                                onBlur={() => setFieldTouched('cylinderSize', true)}
                                                                value={cylindersizelist.find(option => option.value === values.cylinderSize) || null}

                                                            />

                                                        </div>
                                                        <ErrorMessage name="cylinderSize" component="div" className="invalid-feedback" />
                                                    </FormGroup>
                                                </Col>
                                                {initformvalues.statusId === 2 && (
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label>Location</Label>
                                                            <Field
                                                                name="location"
                                                                placeholder="At Customer Site"
                                                                className="form-control"
                                                                value="At Customer Site"
                                                                readOnly
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                )}

                                                {(initformvalues.statusId === 1 || initformvalues.statusId === 3) && (
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label>Location</Label>
                                                            <Field
                                                                name="location"
                                                                placeholder="BTG"
                                                                className="form-control"
                                                                value="BTG"
                                                                readOnly
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                )}
                                                {(initformvalues.statusId === 4 || !initformvalues.statusId) && (
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label>Location</Label>
                                                            <Field
                                                                name="location"
                                                                placeholder="BTG"
                                                                className="form-control"
                                                                value="BTG"
                                                                readOnly
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                )}

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label>Pallet Reg Number</Label>
                                                        <Field name="palletRegNumber" placeholder="Enter Pallet Reg Number" className="form-control" />

                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label>Pallet Barcode</Label>
                                                        <Field name="palletBarcode" placeholder="Enter Pallet Barcode" className="form-control" />

                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label>HS Code</Label>
                                                        <Field name="hsCode" placeholder="Enter HS Code" className="form-control" />

                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Tested Month</Label>
                                                        <Field
                                                            as="select"
                                                            name="testedMonth"
                                                            className={`form-control ${errors.testedMonth && touched.testedMonth ? "is-invalid" : ""
                                                                }`}
                                                            onChange={(e) => {
                                                                const month = parseInt(e.target.value, 10);
                                                                setFieldValue("testedMonth", month);
                                                                handleTestedOnChange(month, values.testedYear, setFieldValue);
                                                            }}
                                                        >
                                                            <option value="">Select Month</option>
                                                            {[...Array(12)].map((_, i) => (
                                                                <option key={i + 1} value={i + 1}>
                                                                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="testedMonth" component="div" className="invalid-feedback" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Tested Year</Label>
                                                        <Field
                                                            as="select"
                                                            name="testedYear"
                                                            className={`form-control ${errors.testedYear && touched.testedYear ? "is-invalid" : ""
                                                                }`}
                                                            onChange={(e) => {
                                                                const year = parseInt(e.target.value, 10);
                                                                setFieldValue("testedYear", year);
                                                                handleTestedOnChange(values.testedMonth, year, setFieldValue);
                                                            }}
                                                        >
                                                            <option value="">Select Year</option>
                                                            {Array.from({ length: 30 }, (_, i) => 2000 + i).map((year) => (
                                                                <option key={year} value={year}>
                                                                    {year}
                                                                </option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name="testedYear" component="div" className="invalid-feedback" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Next Test Date</Label>
                                                        <DatePicker
                                                            name="nexttestdate"
                                                            selected={values.nexttestdate}
                                                            dateFormat="yyyy-MM-dd"
                                                            className={`form-control ${errors.nexttestdate && touched.nexttestdate ? "is-invalid" : ""
                                                                }`}
                                                            disabled
                                                        />
                                                        <ErrorMessage name="nexttestdate" component="div" className="invalid-feedback" />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label>Manufacturer</Label>
                                                        <Field
                                                            name="manufacturer"
                                                            placeholder="Enter Manufacturer Name"
                                                            className="form-control"
                                                        />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label>Remarks</Label>
                                                        <Field
                                                            name="remarks"
                                                            as="textarea"
                                                            placeholder="Enter Remarks"
                                                            className="form-control"
                                                            rows="1"
                                                        />
                                                    </FormGroup>
                                                </Col>

                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label className="required-label">Working Pressure</Label>
                                                        <Field
                                                            name="workingPressure"
                                                            type="text"
                                                            placeholder="Enter Working Pressure"
                                                            className={`form-control ${errors.workingPressure && touched.workingPressure ? "is-invalid" : ""
                                                                }`}
                                                            value={values.workingPressure}
                                                            onChange={(e) => setFieldValue("workingPressure", e.target.value)}
                                                            onBlur={() => {
                                                                const val = parseFloat(values.workingPressure);
                                                                if (!isNaN(val)) {
                                                                    setFieldValue("workingPressure", val.toFixed(1));
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                const allowedKeys = [
                                                                    "Backspace",
                                                                    "Tab",
                                                                    "ArrowLeft",
                                                                    "ArrowRight",
                                                                    "Delete",
                                                                    ".",
                                                                    "-",
                                                                ];
                                                                if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                        <ErrorMessage name="workingPressure" component="div" className="invalid-feedback" />
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            <div className="d-flex justify-content-end mt-4">
                                                <button type="submit" className="btn btn-info me-2">
                                                    {cylinderData ? "Update" : "Save"}
                                                </button>
                                                <button type="button" className="btn btn-danger me-2" onClick={handleCancel}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AddCylinder;
