import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Label,
  UncontrolledAlert,
} from "reactstrap";
import Select from "react-select";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useHistory, useLocation } from "react-router-dom";
import { CreateMasterUser, GetDepartmentById, GetDepartmentByCode, GetDepartmentByName } from "../../../src/common/data/mastersapi";

const AddUser = () => {
  const history = useHistory();
  const location = useLocation();
  const editUserData = location.state?.userData || null;
  const userListCheck = location.state?.allUsers || null;

  const [successmsg, setSuccessmsg] = useState();
  const [errormsg, setErrormsg] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);  

  const initialValues = { 
    userid:editUserData?.userid ?? "",
    id: editUserData?.id || "",
    branchId: editUserData?.branchId || "",
    departmentId: editUserData?.department ?? "",
    roleId: editUserData?.role ?? "",
    roleName : editUserData?.roleName ?? "",
    firstName: editUserData?.firstName || "",
    middleName: editUserData?.middleName || "",
    lastName: editUserData?.lastName || "",
    btguserName: editUserData?.userName || "",
    btgpassword: editUserData?.password || "",
    confirmPassword: editUserData?.password || "",
    mobileNo: editUserData?.mobileNo || "",
    emailId: editUserData?.emailID || "",
    allowAccessFrom: editUserData?.fromDate
      ? new Date(editUserData.fromDate)
      : null,
    allowAccessTo: editUserData?.toDate
      ? new Date(editUserData.toDate)
      : null,
    activestatus: editUserData?.isActive ? "1" : "0",
    remarks: editUserData?.remark || "",
    createdBy : editUserData?.createdBy || 1,
  };   

  const handleCancel = () => {
    debugger
    history.push("/manage-users");
  };

  useEffect(() => {
    fetchDepartName();
    fetchDepartRole();
  }, []);

  const fetchDepartRole = async () => {
    try {
      debugger
      const response = await GetDepartmentByCode();
      if (response) {
        const options = response.map((role) => ({
          label: role.RoleName,
          value: String(role.RoleId),
        }));
        setRoleOptions(options);
      }
    }
    catch (error) {
      console.log("fetchDepartRole :", error);
      setErrormsg("Failed to Fetch Department Roles");
    }
  };

  const fetchDepartName = async () => {
    try {
      debugger
      const response = await GetDepartmentByName();
      if (response?.data) {
        const options = response.data.map((dept) => ({
          label: dept.DepartmentName,
          value: String(dept.DepartmentId),
        }));
        setDepartmentOptions(options);
      }

    }
    catch (error) {
      console.log("fetchDepartName :", error);
      setErrormsg("Failed to Fetch Department Names");
    }
  };


  const fetchDepartId = async (id) => {
    try {
      debugger

    }
    catch (error) {
      console.log("fetchDepartId :", error);
      setErrormsg("Failed to Fetch Department Id Details");
    }
  };


  const validationSchema = Yup.object().shape({
    departmentId: Yup.string().required("Department is required"),
    roleId: Yup.string().required("Role is required"),
    firstName: Yup.string().trim()
      .required("First Name is required"),
    btguserName: Yup.string().trim()
      .required("User Name is required")
      .matches(/^[a-zA-Z0-9]+$/, "User Name can only contain letters and digits, with no spaces")
      .test("unique", "UserName should be Unique", function (value) {
        debugger
        if (!value) return true;
        const existCode = userListCheck.find(
          user => user.UserName &&
            user.UserName.toLowerCase() === value.toLowerCase() &&
            user.Id !== (this.parent.id || 0)
        );
        return !existCode;
      }),

    btgpassword: Yup.string().trim()
      .required('Password is required')
      .matches(/[A-Z]/, "Must contain at least one uppercase letter (A-Z)")
      .matches(/[a-z]/, "Must contain at least one lowercase letter (a-z)")
      .matches(/[0-9]/, "Must contain atleast one digit (0-9)")
      .matches(/[^a-zA-Z0-9]/, "Must contain at least one special character")
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: Yup.string().trim()
      .required('Please confirm your password')
      .oneOf([Yup.ref('btgpassword')], 'Passwords must match'),
    mobileNo: Yup.string().trim()
      .required("Mobile number is required")
      .test("unique", "Mobile Number should be Unique", function (value) {
        debugger
        if (!value) return true;
        const existCode = userListCheck.find(
          user => user.PhoneNumber &&
            user.PhoneNumber.toLowerCase() === value.toLowerCase() &&
            user.Id !== (this.parent.id || 0)
        );
        return !existCode;
      }),
    emailId: Yup.string().trim()
      .email("Invalid email format")
      .required("Email is required")
      .test("unique", "EmailId should be Unique", function (value) {
        debugger
        if (!value) return true;
        const existCode = userListCheck.find(
          user => user.Email &&
            user.Email.toLowerCase() === value.toLowerCase() &&
            user.Id !== (this.parent.id || 0)
        );
        return !existCode;
      }),
    activestatus: Yup.string().required("Active status is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    debugger;
    console.log("submit values :", values);
    const fromDateOnly = new Date(values.allowAccessFrom)
      .toISOString()
      .split("T")[0];
    const toDateOnly = new Date(values.allowAccessTo)
      .toISOString()
      .split("T")[0];
    console.log("edituserdata values :", editUserData);
    const createUser = {
      userid: values?.userid,
      Id: values.id ? parseInt(values.id) : 0,
      userName: values.btguserName,
      emailID: values.emailId,
      mobileNo: values.mobileNo,
      phoneNumber: values.mobileNo,
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      password: values.btgpassword,
      role: values.roleId,
      roleName : values.roleName,
      department: String(values.departmentId),
      fromDate: fromDateOnly,
      toDate: toDateOnly,
      remark: values.remarks,
      branchId: 1,
      ...(editUserData?.userID && { id: editUserData.userID }),
    };

    try {
      const response = await CreateMasterUser(createUser);
      debugger;
      if (response.statusCode === 200 || response.statusCode === 201) {
        setSuccessmsg(response.message);
        setTimeout(() => {
           history.push("/manage-users");   
        }, 3000);
      } else if (response.statusCode === 400) {
        setErrormsg(response.message);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrormsg(
        "An unexpected error occurred. Please check your input or try again later."
      );
    } finally {
      setSubmitting(false);        
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Masters"
          breadcrumbItem={editUserData ? "Edit User" : "Add User"}
        />

        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({
                    errors,
                    touched,
                    setFieldValue,
                    setFieldTouched,
                    values,
                    isSubmitting,
                  }) => (
                    <Form>
                      <Row>
                        {errormsg && (
                          <UncontrolledAlert color="danger">
                            {errormsg}
                          </UncontrolledAlert>
                        )}
                        {successmsg && (
                          <UncontrolledAlert color="success">

                            {successmsg}
                          </UncontrolledAlert>
                        )}
                        <Col md="12" className="text-end mt-3">
                          <div className="row align-items-center g-3 justify-content-end">
                            <div className="col-md-12 text-end button-items">
                              <button type="submit" className="btn btn-info">
                                <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>
                                {isSubmitting
                                  ? "Please wait..."
                                  : editUserData
                                    ? "Update"
                                    : "Save"}
                              </button>
                              <button type="button" className="btn btn-danger" onClick={handleCancel}>
                                <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel
                              </button>
                            </div>
                          </div>

                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label className="required-label">First Name</Label>
                            <Field
                              name="firstName"
                              className={`form-control ${errors.firstName && touched.firstName
                                ? "is-invalid"
                                : ""
                                }`}
                            />
                            <ErrorMessage
                              name="btguserName"
                              component="div"
                              className="invalid-feedback"
                            />
                          </FormGroup>
                        </Col>

                        <Col md="4">
                          <FormGroup>
                            <Label>Middle Name</Label>
                            <Field name="middleName" className="form-control" />
                          </FormGroup>
                        </Col>

                        <Col md="4">
                          <FormGroup>
                            <Label>Last Name</Label>
                            <Field name="lastName" className="form-control" />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label className="required-label">User Name</Label>
                            <Field
                              name="btguserName"
                              className={`form-control ${errors.btguserName && touched.btguserName
                                ? "is-invalid"
                                : ""
                                }`}
                            />
                            <ErrorMessage
                              name="btguserName"
                              component="div"
                              className="invalid-feedback"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label className="required-label">Password</Label>
                            <Field
                              type="password"
                              name="btgpassword"
                              // disabled={editUserData}
                              className={`form-control ${errors.btgpassword && touched.btgpassword
                                ? "is-invalid"
                                : ""
                                }`}
                            />
                            <ErrorMessage
                              name="btgpassword"
                              component="div"
                              className="invalid-feedback"
                            />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label className="required-label">Confirm Password</Label>
                            <Field
                              type="password"
                              name="confirmPassword"
                              // disabled={editUserData}
                              className={`form-control ${errors.confirmPassword && touched.confirmPassword
                                ? "is-invalid"
                                : ""
                                }`}
                            />
                            <ErrorMessage
                              name="confirmPassword"
                              component="div"
                              className="invalid-feedback"
                            />
                          </FormGroup>
                        </Col>


                        <Col md="4">
                          <FormGroup>
                            <Label className="required-label">Role</Label>
                            <Select
                              name="roleId"
                              options={roleOptions}
                              value={roleOptions.find( 
                                opt => String(opt.value) === String(values.roleId)
                              )}
                              onChange={opt => {
                                console.log("Selected option:", opt);
                                setFieldValue("roleId", opt?.value);
                                setFieldValue("roleName", opt?.label);
                              }}
                              onBlur={() => setFieldTouched("roleId", true)}
                              className={
                                errors.roleId && touched.roleId
                                  ? "is-invalid"
                                  : ""
                              }
                              placeholder="Select"
                              styles={{
                                menuList: (base) => ({
                                  ...base,
                                  maxHeight: "150px",
                                }),
                              }}
                            />
                            <ErrorMessage
                              name="roleId"
                              component="div"
                              className="invalid-feedback"
                            />
                          </FormGroup>
                        </Col>

                        <Col md="4">
                          <FormGroup>
                            <Label className="required-label">Department</Label>
                            <Select
                              name="departmentId"
                              options={departmentOptions}
                              value={departmentOptions.find(
                                opt => opt.value === values.departmentId
                              )}
                              onChange={(opt) =>
                                setFieldValue("departmentId", opt?.value)
                              }
                              onBlur={() =>
                                setFieldTouched("departmentId", true)
                              }
                              className={
                                errors.departmentId && touched.departmentId
                                  ? "is-invalid"
                                  : ""
                              }
                              placeholder="Select"
                              styles={{
                                menuList: (base) => ({
                                  ...base,
                                  maxHeight: "150px",
                                }),
                              }}
                            />
                            <ErrorMessage
                              name="departmentId"
                              component="div"
                              className="invalid-feedback"
                            />
                          </FormGroup>
                        </Col>

                        <Col md="4">
                          <FormGroup>
                            <Label className="required-label">Mobile No</Label>
                            <Field
                              name="mobileNo"
                              maxlength="15"
                              className={`form-control ${errors.mobileNo && touched.mobileNo
                                ? "is-invalid"
                                : ""
                                }`}
                            />
                            <ErrorMessage
                              name="mobileNo"
                              component="div"
                              className="invalid-feedback"
                            />
                          </FormGroup>
                        </Col>

                        <Col md="4">
                          <FormGroup>
                            <Label className="required-label">Email ID</Label>
                            <Field
                              type="email"
                              name="emailId"
                              className={`form-control ${errors.emailId && touched.emailId
                                ? "is-invalid"
                                : ""
                                }`}
                            />
                            <ErrorMessage
                              name="emailId"
                              component="div"
                              className="invalid-feedback"
                            />
                          </FormGroup>
                        </Col>

                        <Col md="4">
                          <FormGroup>
                            <Label>Remarks</Label>
                            <Field
                              name="remarks"
                              as="textarea"
                              className="form-control"
                              rows="2"
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
    </div>
  );
};
export default AddUser;
