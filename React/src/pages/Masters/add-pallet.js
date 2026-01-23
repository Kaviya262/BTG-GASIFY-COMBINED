import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Container, Row, Col, Card, CardBody, Button, FormGroup, Label, Input, Table, UncontrolledAlert } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "react-datepicker/dist/react-datepicker.css";
import { GetGasCodePalletList, GetPalletById, GetPalletType, SaveMasterPallet, fetchGasList } from "../../../src/common/data/mastersapi";
import { useHistory, useNavigate, Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';

const validationSchema = Yup.object().shape({
    palletname: Yup.string().required("Pallet Name is required"),
    gasCode: Yup.string().required("Gas Name is required"),
    containerType: Yup.string().required("Container Type is required"),
});


const containerTypeOptions = [
    { value: "G-PLTCYL40-16", label: "G-PLTCYL40-16" },
    { value: "G-PLTCYL47-12", label: "G-PLTCYL47-12" },
    { value: "G-PLTCYL47-15", label: "G-PLTCYL47-15" },
    { value: "G-PLTCYL47-16", label: "G-PLTCYL47-16" },
    { value: "G-PLTCYL47-4", label: "G-PLTCYL47-4" },
    { value: "G-PLTCYL47-64", label: "G-PLTCYL47-64" },
    { value: "G-PLTCYL47-9", label: "G-PLTCYL47-9" },
    { value: "G-PLTCYL47W-12", label: "G-PLTCYL47W-12" },
    { value: "G-PLTCYL47W-6", label: "G-PLTCYL47W-6" },
    { value: "G-PLTCYL50-4", label: "G-PLTCYL50-4" },
    { value: "G-PLTCYL50HP-16", label: "G-PLTCYL50HP-16" },
    { value: "G-PLTCYL50HP-64", label: "G-PLTCYL50HP-64" },
    { value: "G-PLTCYL65-4", label: "G-PLTCYL65-4" },
    { value: "N24PLT", label: "N24PLT" },
    { value: "PLTCYL47-12", label: "PLTCYL47-12" },
    { value: "PLTCYL47-15", label: "PLTCYL47-15" },
    { value: "PLTCYL47-16", label: "PLTCYL47-16" },
    { value: "PLTCYL47-4", label: "PLTCYL47-4" },
    { value: "PLTCYL47-64", label: "PLTCYL47-64" },
    { value: "PLTCYL47-9", label: "PLTCYL47-9" },
    { value: "PLTCYL47W-12", label: "PLTCYL47W-12" },
    { value: "PLTCYL47W-6", label: "PLTCYL47W-6" },
    { value: "PLTCYL50-4", label: "PLTCYL50-4" },
    { value: "PLTCYL50-64", label: "PLTCYL50-64" },
    { value: "PLTCYL50HP-16", label: "PLTCYL50HP-16" },
    { value: "PLTCYL65-4", label: "PLTCYL65-4" }
];

const AddPallet = () => {
    const { id: pallet_id } = useParams();
    const isEditMode = !!pallet_id;
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const [cylinderTableData, setCylinderTableData] = useState([]);
    const [pallettypelist, setPalletTypeList] = useState([]);
    const [gasCodeList, setGasCodeList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [branchId, setBranchId] = useState(1);
    const [orgId, setOrgId] = useState(1);
    const [owershiplist] = useState([
        { label: "BTG (BTG Owned Property)", value: 1 },
        { label: "COP (Customer Owned Property)", value: 2 },
        { label: "SOP (Supplier Owned Property)", value: 3 },
    ]);
    const history = useHistory();
    const [gasCodePalletList, setGasCodePalletList] = useState([]);
    const [initialValues, setInitialValues] = useState({
        palletnumber: "",
        palletname: "",
        barcode: "",
        gasCode: "",
        pallettype: ""
    });
    // const selectedGas = gasCodeList.find(c => c.GasCodeId === selectedValue);
    // Checkbox toggle
    const toggleRowSelection = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        const fetchPalletDetails = async () => {
            try {
                const response = await GetPalletById(pallet_id, orgId, branchId);
                if (response?.status) {
                    const { pallet, palletItems } = response.data;

                    setInitialValues({
                        palletnumber: pallet.palletNumber || "",
                        palletname: pallet.palletName || "",
                        barcode: pallet.barcode || "",
                        gasCode: pallet.gasCodeId || "",
                        pallettype: pallet.palletTypeId || ""
                    });

                    const mappedCylinders = (palletItems || []).map((item) => ({
                        palletItemId: item.palletItemId,
                        cylinderid: item.cylinderId,
                        cylindername: item.cylinderName,
                        ownershipid: item.ownershipid,
                        barcode: item.barcode,
                    }));


                    setCylinderTableData(mappedCylinders || []);
                    setSelectedRows(
                        palletItems
                            .filter(item => item.isActive)
                            .map(item => item.cylinderId)
                    );
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: response.message || "Unable to fetch pallet details.",
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "Something went wrong while fetching data.",
                });
            }
        };

        if (isEditMode) {
            fetchPalletDetails();
        }
    }, [isEditMode, pallet_id]);

    const removeSelectedRows = () => {
        if (cylinderTableData.length === 0) return;
        Swal.fire({
            title: "Are you sure?",
            text: "This will select all cylinders (check all checkboxes).",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, select all!",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                // setCylinderTableData(prev =>
                //     prev.filter(row => !selectedRows.includes(row.cylinderid))
                // );
                // setSelectedRows([]);
                const allCylinderIds = cylinderTableData.map(row => row.cylinderid);
                setSelectedRows(allCylinderIds); // ✅ Select all
            }
        });
    };

    const removeSingleRow = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This cylinder will be removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, remove it!",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                setCylinderTableData(prev =>
                    prev.filter(row => row.cylinderid !== id)
                );
                setSelectedRows(prev => prev.filter(rowId => rowId !== id));
            }
        });
    };

    const handleContainerTypeChange = (option) => {
        if (option) {
            const rows = Array.from({ length: 18 }, (_, index) => ({
                id: index + 1,
                cylinderName: `CYL-${index + 1}`,
                ownership: "1",
                barCode: `BC-${index + 1000}`,
            }));
            setCylinderTableData(rows);
        } else {
            setCylinderTableData([]);
        }
    };
    useEffect(() => {
        const loadGasList = async () => {
            // debugger
            const data = await fetchGasList(1, 0);
            setGasCodeList(data);
        };
        loadGasList();
    }, []);

    const [successMsg, setSuccessMsg] = useState(false);
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        const payload = buildPalletPayload(values, selectedRows, cylinderTableData);
        try {
            const res = await SaveMasterPallet(payload);

            if (res?.status === true) {
                Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Pallet Updated Successfully!' : 'Pallet Added Successfully!',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    history.push('/manage-pallet');
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: isEditMode ? 'Update Failed!' : 'Save Failed!',
                    text: res?.message || 'Something went wrong. Please try again.',
                });
            }

        } catch (err) {
            console.error('Error saving data:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error occurred while saving data.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const buildPalletPayload = (handleSubmitData, cylinderIds, cylinderData) => {
        const userId = 1;
        const userIP = "192";

        const pallet = {
            palletId: isEditMode ? parseInt(pallet_id) : 0,
            palletName: handleSubmitData.palletname,
            palletNumber: handleSubmitData.palletnumber,
            gasCodeId: handleSubmitData.gasCode,
            gasName: "",
            containerId: 0,
            userId,
            userIP,
            isActive: true,
            orgId,
            branchId,
            palletTypeId: handleSubmitData.pallettype,
            barcode: handleSubmitData.barcode
        };

        const palletItems = cylinderData.map((cylinder, index) => {
            const isSelected = cylinderIds.includes(cylinder.cylinderid);

            return {
                palletItemId: cylinder?.palletItemId || 0,
                palletId: isEditMode ? parseInt(pallet_id) : 0,
                palletItemPos: index + 1,
                cylinderId: cylinder?.cylinderid || "",
                cylinderName: cylinder?.cylindername || "",
                ownershipName: cylinder?.OwnershipName || "",
                ownershipid: cylinder?.ownershipid || "",
                barcode: cylinder?.barcode || "",
                orgId,
                branchId,
                userId,
                userIP,
                isActive: isSelected ? false : true
            };
        });

        return {
            palletModel: {
                pallet,
                palletItems
            }
        };
    };

    const loadPalletType = async () => {
        // debugger
        try {
            const branchId = 1;
            const res = await GetPalletType(branchId);
            // debugger
            if (res && Array.isArray(res.data)) {
                const formatted = res.data.map(dep => ({
                    value: dep.id,
                    label: dep.pallettype,
                    code: dep.pallettypecode
                }));
                setPalletTypeList(formatted);
            } else {
                console.error('Expected an array but got:', res.data);
            }
        } catch (error) {
            console.error('Error loading pallet types:', error);
        }
    };
    useEffect(() => {
        loadPalletType();
    }, []);

    const handleCancel = () => {
        history.push('/manage-pallet')
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem={isEditMode ? "Edit Pallet" : "Add Pallet"} />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <Formik
                                        initialValues={initialValues}
                                        enableReinitialize
                                        validationSchema={Yup.object().shape({
                                            palletnumber: Yup.string()
                                                .required("Pallet Number is required"),

                                            palletname: Yup.string()
                                                .required("Pallet Name is required"),

                                            barcode: Yup.string()
                                                .required("Barcode is required"),

                                            gasCode: Yup.string()
                                                .required("Gas Code is required"),

                                            pallettype: Yup.string()
                                                .required("Pallet Type is required"),
                                        })}
                                        onSubmit={handleSubmit}
                                    >

                                        {({ errors, touched, setFieldValue, setFieldTouched, values, resetForm }) => (
                                            <Form>
                                                <div className="row align-items-center g-3 justify-content-end">
                                                    <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                                                        {Object.keys(errors).length > 0 && (
                                                            <div className="alert alert-danger alert-new">
                                                                <ul className="mb-0">
                                                                    <li>{Object.entries(errors)[0][1]}</li>
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {successMsg && (
                                                            <UncontrolledAlert color="success" role="alert">Submitted successfully </UncontrolledAlert>
                                                        )}
                                                    </div>

                                                    <div className="col-12 col-lg-4 col-md-4 col-sm-4 button-items">
                                                        <button type="button" className="btn btn-danger fa-pull-right" onClick={handleCancel}>
                                                            <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel
                                                        </button>
                                                        {/* {selectedRows.length > 0 && (                                                                 */}
                                                        <Button
                                                            type="button"
                                                            className="btn btn-danger fa-pull-right"
                                                            onClick={() => {
                                                                if (cylinderTableData.length === 0) return;
                                                                // selectedRows.forEach(id => removeSingleRow(id));
                                                                removeSelectedRows()
                                                            }}
                                                            disabled={cylinderTableData.length === 0}
                                                        >
                                                            <i className="bx bx-trash label-icon font-size-14 align-middle me-2"></i>
                                                            Remove All
                                                        </Button>
                                                        {/* )} */}
                                                        <button type="submit" className="btn btn-info fa-pull-right">
                                                            <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>{isEditMode ? "Update" : "Save"}
                                                        </button>
                                                    </div>
                                                </div>
                                                <Row>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="palletnumber" className="required-label">Pallet Number</Label>
                                                            <Field name="palletnumber" className={`form-control ${errors.palletnumber && touched.palletnumber ? "is-invalid" : ""}`} disabled={isEditMode} />
                                                            {<ErrorMessage name="palletnumber" component="div" className="text-danger" />}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="palletname" className="required-label">Pallet Name</Label>
                                                            <Field name="palletname" className={`form-control ${errors.palletname && touched.palletname ? "is-invalid" : ""}`} />
                                                            {<ErrorMessage name="palletname" component="div" className="text-danger" />}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="barcode" className="required-label">Barcode</Label>
                                                            <Field name="barcode" className={`form-control ${errors.barcode && touched.barcode ? "is-invalid" : ""}`} />
                                                            {<ErrorMessage name="barcode" component="div" className="text-danger" />}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label htmlFor="gasCode" className="required-label">Gas Code</Label>
                                                            <Select
                                                                name="gasCode"
                                                                id="gasCode"
                                                                options={gasCodeList.map(code => ({
                                                                    value: code.GasCodeId,
                                                                    label: code.GasCode
                                                                }))}
                                                                value={
                                                                    gasCodeList
                                                                        .map(code => ({ value: code.GasCodeId, label: code.GasCode }))
                                                                        .find(option => option.value === values.gasCode) || null
                                                                }
                                                                // onChange={option => {
                                                                //     setFieldValue("gasCode", option ? option.value : "");
                                                                //     setFieldTouched("gasCode", true);
                                                                // }}
                                                                onChange={async (option) => {
                                                                    const selectedGasCodeId = option ? option.value : "";

                                                                    setFieldValue("gasCode", selectedGasCodeId);
                                                                    setFieldTouched("gasCode", true);

                                                                    if (values.pallettype && selectedGasCodeId) {
                                                                        try {
                                                                            const res = await GetGasCodePalletList(selectedGasCodeId, values.pallettype, branchId, 0);
                                                                            if (res && res.status && Array.isArray(res.data)) {
                                                                                setCylinderTableData(res.data);
                                                                            } else {
                                                                                console.warn("No data received or unexpected format", res.data);
                                                                            }
                                                                        } catch (err) {
                                                                            console.error("API call failed", err);
                                                                        }
                                                                    } else {
                                                                        setCylinderTableData([])
                                                                    }
                                                                }}
                                                                onBlur={() => setFieldTouched("gasCode", true)}
                                                                className={errors.gasCode && touched.gasCode ? "select-invalid" : ""}
                                                                classNamePrefix="select"
                                                                isDisabled={isDisabled}
                                                                isLoading={isLoading}
                                                                isClearable={isClearable}
                                                                isSearchable={isSearchable}
                                                            />
                                                            <ErrorMessage name="gasCode" component="div" className="text-danger" />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <Label className="required-label">Pallet Type</Label>
                                                            <Select
                                                                name="pallettype"
                                                                options={pallettypelist}
                                                                placeholder="Select Pallet Type"
                                                                value={pallettypelist.find(option => option.value === values.pallettype) || null}
                                                                // onChange={option => setFieldValue("pallettype", option ? option.value : "")}
                                                                onChange={async (option) => {
                                                                    const selectedPalletTypeId = option ? option.value : "";

                                                                    setFieldValue("pallettype", selectedPalletTypeId);
                                                                    setFieldTouched("pallettype", true);

                                                                    if (values.gasCode && selectedPalletTypeId) {
                                                                        try {
                                                                            const res = await GetGasCodePalletList(values.gasCode, selectedPalletTypeId, branchId, 0);
                                                                            if (res && res.status && Array.isArray(res.data)) {
                                                                                setCylinderTableData(res.data);
                                                                            } else {
                                                                                console.warn("No data received or unexpected format", res.data);
                                                                            }
                                                                        } catch (err) {
                                                                            console.error("API call failed", err);
                                                                        }
                                                                    } else {
                                                                        setCylinderTableData([])
                                                                    }
                                                                }}
                                                                onBlur={() => setFieldTouched("pallettype", true)}
                                                                className={errors.pallettype && touched.pallettype ? "is-invalid" : ""}
                                                                classNamePrefix="select"
                                                                isClearable
                                                            />
                                                            <ErrorMessage name="pallettype" component="div" className="invalid-feedback" />
                                                        </FormGroup>

                                                        {/* <FormGroup>
                                                            <Label htmlFor="containerType" className="required-label">Pallet Type</Label>
                                                            <Select
                                                                name="containerType"
                                                                options={containerTypeOptions}
                                                                value={containerTypeOptions.find(option => option.value === values.containerType)}
                                                                onChange={option => {
                                                                    setFieldValue("containerType", option ? option.value : "");
                                                                    setFieldTouched("containerType", true);
                                                                    handleContainerTypeChange(option);
                                                                }}
                                                                onBlur={() => setFieldTouched("containerType", true)}
                                                                className={errors.containerType && touched.containerType ? "select-invalid" : ""}
                                                                classNamePrefix="select"
                                                                isDisabled={isDisabled}
                                                                isLoading={isLoading}
                                                                isClearable={isClearable}
                                                                isRtl={isRtl}
                                                                isSearchable={isSearchable}
                                                            />
                                                             <ErrorMessage name="containerType" component="div" className="text-danger" /> 
                                                        </FormGroup> */}
                                                    </Col>

                                                    <Col md="12">
                                                        <p style={{ fontStyle: "italic", color: "#555", }}>
                                                            <span style={{ fontWeight: 'bold' }}>Note:- </span><span style={{ color: '#dc3545' }}>Select the checkboxes and click Save to remove cylinders from the pallet.</span>
                                                        </p>
                                                        <Table className="table-nowrap mb-0">
                                                            <thead style={{ backgroundColor: "#3e90e2" }}>
                                                                <tr>
                                                                    <th><input type="checkbox"
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedRows(cylinderTableData.map(row => row.cylinderid));
                                                                            } else {
                                                                                setSelectedRows([]);
                                                                            }
                                                                        }}
                                                                        checked={
                                                                            cylinderTableData.length > 0 &&
                                                                            selectedRows.length === cylinderTableData.length
                                                                        }
                                                                    /></th>
                                                                    <th>S.No</th>
                                                                    <th style={{ width: "33%" }}>Cylinder number & Name </th>
                                                                    <th style={{ width: "42%" }}>Ownership</th>
                                                                    <th style={{ width: "30%" }}>Bar code</th>
                                                                    {/* <th>Action</th> */}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {cylinderTableData.length > 0 ? (
                                                                    cylinderTableData.map((row, index) => (
                                                                        <tr key={index}>
                                                                            <td className="text-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedRows.includes(row.cylinderid)}
                                                                                    onChange={() => toggleRowSelection(row.cylinderid)}
                                                                                />
                                                                            </td>
                                                                            <td className="text-center vertical-center">{index + 1}</td>
                                                                            <td><span>{row.cylinderNumber}-{row.cylindername}</span></td>
                                                                            <td><span>{owershiplist.find(o => o.value === row.ownershipid)?.label}</span></td>
                                                                            <td><span>{row.barcode}</span></td>
                                                                            {/* <td>
                                                                                <Link
                                                                                to="#"
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    removeSingleRow(row.cylinderid);
                                                                                }}
                                                                                className="text-danger"
                                                                                title="Delete Row"
                                                                                >
                                                                                <i className="mdi mdi-trash-can font-size-18 text-danger"></i>
                                                                                </Link>
                                                                            </td> */}
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="6" className="text-center">No data available</td>
                                                                    </tr>
                                                                )}
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
        </React.Fragment>
    );
};










export default AddPallet;