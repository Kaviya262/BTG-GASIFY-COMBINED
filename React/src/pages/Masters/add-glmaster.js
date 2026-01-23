import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
    Button,
    Col,
    Container,
    FormGroup,
    Label,
    Row,
    Card,
    CardBody,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import Swal from "sweetalert2";
import {
    GetAllAccountCategory,
    GetAllAccountType,
    GenerateGLSequence,
    SaveGlCodeMaster,
    GetGLDetailsById,
} from "common/data/mastersapi";

const AddGLMaster = () => {
    const history = useHistory();
    const { id } = useParams();
    const isEditMode = !!id;

    const [categories, setCategories] = useState([]);
    const [accountTypes, setAccountTypes] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedAccountType, setSelectedAccountType] = useState(null);

    const [glCode, setGlCode] = useState("");
    const [glName, setGlName] = useState("");
    const [glDescription, setGlDescription] = useState("");

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const catRes = await GetAllAccountCategory();
                if (Array.isArray(catRes)) {
                    setCategories(
                        catRes.map((c) => ({
                            label: c.categoryName,
                            value: c.id,
                        }))
                    );
                }

                const accRes = await GetAllAccountType();
                if (Array.isArray(accRes)) {
                    setAccountTypes(
                        accRes.map((a) => ({
                            label: a.categoryName,
                            value: a.id,
                            categoryId: a.categoryId,
                        }))
                    );
                }
            } catch (err) {
                console.error("Dropdown fetch error:", err);
            }
        };
        fetchDropdowns();
    }, []);

    // Fetch GL details in edit mode
    useEffect(() => {
        const fetchGLDetails = async () => {
            if (isEditMode) {
                try {
                    const res = await GetGLDetailsById(id);

                    if (res) {
                        setGlCode(res.gLcode || "");
                        setGlName(res.categoryName || "");
                        setGlDescription(res.description || "");

                        setSelectedCategory({
                            label: res.accountCategoryCategoryName,
                            value: res.accountCategoryId,
                        });

                        setSelectedAccountType({
                            label: res.accountTypeCategoryName,
                            value: res.accountTypeId,
                            categoryId: res.accountTypeCategoryId,
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch GL details:", err);
                }
            }
        };
        fetchGLDetails();
    }, [id, isEditMode]);

    useEffect(() => {
        const fetchSequence = async () => {
            if (selectedCategory?.value && selectedAccountType?.value) {
                try {
                    const res = await GenerateGLSequence(
                        selectedCategory.value,
                        selectedAccountType.value
                    );
                    setGlCode(res?.glSequenceId || "");
                } catch (err) {
                    console.error("Failed to generate GL code", err);
                }
            }
        };
        if (!isEditMode) {
        fetchSequence();
        }
    }, [selectedCategory, selectedAccountType]); // remove !isEditMode


    const initialValues = {
        glName: glName,
        glDescription: glDescription,
        category: selectedCategory,
        accountType: selectedAccountType,
        glCode: glCode || "",
    };

    const validationSchema = Yup.object().shape({
        glName: Yup.string().required("GL Name is required"),
        glDescription: Yup.string().nullable(),
        category: Yup.object().required("Category is required"),
        accountType: Yup.object().required("Account Type is required"),
        glCode: Yup.string().required("GL Code is required"),
    });

    const handleSubmit = async (values) => {
        try {
            const payload = {
                id: isEditMode ? id : 0,
                categoryName: values.glName || "",
                gLcode: values.glCode || "",
                categoryId: values.category?.value || 0,
                accountTypeId: values.accountType?.value || 0,
                description: values.glDescription || "",
                createdBy: 1,
                createdDate: new Date().toISOString(),
                createdIP: "0.0.0.0",
                lastModifiedBy: 1,
                lastModifiedDate: new Date().toISOString(),
                lastModifiedIP: "0.0.0.0",
                isActive: true,
                orgId: 1,
                branchId: 1,
            };

            await SaveGlCodeMaster(isEditMode, payload);

            await Swal.fire({
                icon: "success",
                title: "Success",
                text: `GL Master ${isEditMode ? "updated" : "added"} successfully.`,
            });

            history.push("/manage-gl");
        } catch (err) {
            console.error("Save failed", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An unexpected error occurred. Please try again later.",
            });
        }
    };

    const handleCancel = () => history.push("/manage-gl");

    return (
        <Container fluid className="page-content">
            <Breadcrumbs
                title="Masters"
                breadcrumbItem={isEditMode ? "Edit GL Master" : "Add GL Master"}
            />
            <Row>
                <Col>
                    <Card className="vh-100">
                        <CardBody style={{ overflowY: "auto" }}>
                            <Formik
                                enableReinitialize
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ setFieldValue, errors, touched }) => (
                                    <Form>
                                        <div className="row align-items-center g-3 justify-content-end mb-3">
                                            <div className="col-md-12 d-flex gap-2 justify-content-end">
                                                <Button type="submit" color="info">
                                                    {isEditMode ? "Update" : "Save"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    color="danger"
                                                    onClick={handleCancel}
                                                >
                                                    Close
                                                </Button>
                                            </div>
                                        </div>

                                        <Row className="mb-3">

                                            <Col md="4">
                                                <FormGroup>
                                                    <Label>GL Name</Label>
                                                    <Field
                                                        name="glName"
                                                        type="text"
                                                        className={`form-control ${errors.glName && touched.glName
                                                            ? "is-invalid"
                                                            : ""
                                                            }`}
                                                        value={glName}
                                                        onChange={(e) => {
                                                            setGlName(e.target.value);
                                                            setFieldValue("glName", e.target.value);
                                                        }}
                                                    />
                                                    <ErrorMessage
                                                        name="glName"
                                                        component="div"
                                                        className="text-danger"
                                                    />
                                                </FormGroup>
                                            </Col>

                                            <Col md="4">
                                                <FormGroup>
                                                    <Label>GL Description</Label>
                                                    <Field
                                                        name="glDescription"
                                                        type="text"
                                                        className={`form-control ${errors.glDescription &&
                                                            touched.glDescription
                                                            ? "is-invalid"
                                                            : ""
                                                            }`}
                                                        value={glDescription}
                                                        onChange={(e) => {
                                                            setGlDescription(e.target.value);
                                                            setFieldValue(
                                                                "glDescription",
                                                                e.target.value
                                                            );
                                                        }}
                                                    />
                                                    <ErrorMessage
                                                        name="glDescription"
                                                        component="div"
                                                        className="text-danger"
                                                    />
                                                </FormGroup>
                                            </Col>

                                            <Col md="4">
                                                <FormGroup>
                                                    <Label>Category</Label>
                                                    <Select
                                                        options={categories}
                                                        value={selectedCategory}
                                                        onChange={(option) => {
                                                            setSelectedCategory(option);
                                                            setFieldValue("category", option);
                                                        }}
                                                        isClearable
                                                    />
                                                    <ErrorMessage
                                                        name="category"
                                                        component="div"
                                                        className="text-danger"
                                                    />
                                                </FormGroup>
                                            </Col>

                                            <Col md="4">
                                                <FormGroup>
                                                    <Label>Account Type</Label>
                                                    <Select
                                                        options={accountTypes}
                                                        value={selectedAccountType}
                                                        onChange={(option) => {
                                                            setSelectedAccountType(option);
                                                            setFieldValue("accountType", option);
                                                        }}
                                                        isClearable
                                                    />
                                                    <ErrorMessage
                                                        name="accountType"
                                                        component="div"
                                                        className="text-danger"
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label>GL Code</Label>
                                                    <Field
                                                        name="glCode"
                                                        type="text"
                                                        className={`form-control ${errors.glCode && touched.glCode
                                                            ? "is-invalid"
                                                            : ""
                                                            }`}
                                                        onChange={(e) => {
                                                            setGlCode(e.target.value);
                                                            setFieldValue("glCode", e.target.value);
                                                        }}
                                                        value={glCode}
                                                        readOnly
                                                    />
                                                    <ErrorMessage
                                                        name="glCode"
                                                        component="div"
                                                        className="text-danger"
                                                    />
                                                </FormGroup>
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
    );
};

export default AddGLMaster;
