import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  Alert,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Label
} from "reactstrap";

import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";

import { GoogleLogin } from "react-google-login";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import { facebook, google } from "../../config";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import { apiError, loginUser, socialLogin } from "../../store/actions";

import profile from "../../assets/images/profile-img.png";
import logo from "assets/images/logo.png";
import lightlogo from "../../assets/images/logo-light.svg";
import loginpagebackground from "../../assets/images/loginpagebackground.jpg";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.apiError("");
  }

  signIn = (res, type) => {
    const { socialLogin } = this.props;
    if (type === "google" && res) {
      const postData = {
        name: res.profileObj.name,
        email: res.profileObj.email,
        token: res.tokenObj.access_token,
        idToken: res.tokenId
      };
      socialLogin(postData, this.props.history, type);
    } else if (type === "facebook" && res) {
      const postData = {
        name: res.name,
        email: res.email,
        token: res.accessToken,
        idToken: res.tokenId
      };
      socialLogin(postData, this.props.history, type);
    }
  };

  googleResponse = response => {
    this.signIn(response, "google");
  };

  facebookResponse = response => {
    this.signIn(response, "facebook");
  };

  render() {
    return (
      <React.Fragment>
        <div
          className="account-pages my-5 pt-sm-5"
          style={{
            backgroundImage: `url(${loginpagebackground})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "80vh",
            overflow: "hidden"
          }}
        >
          <Container
            style={{
              maxWidth: "1350px",
            }}
          >
            <Row className="justify-content-md-end">
              <Col md={8} lg={6} xl={5} style={{ width: "30%" }}>
                <Card
                  className="overflow-hidden"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                    borderRadius: "10px",
                  }}
                >
                  <div className="bg-primary bg-soft">
                    <Row>
                      <Col className="col-7">
                        <div className="text-primary p-4">
                          <h5 className="text-primary">Welcome !</h5>
                          <p>Sign in to continue.</p>
                        </div>
                      </Col>
                      <Col className="col-5 align-self-end">
                        <img src={profile} alt="" className="img-fluid" />
                      </Col>
                    </Row>
                  </div>
                  <CardBody className="pt-0">
                    <div className="auth-logo">
                      <Link
                        to="/"
                        className="auth-logo-light"
                        onClick={(e) => e.preventDefault()}
                        style={{ cursor: 'default' }}
                      >
                        <div className="avatar-md profile-user-wid mb-4">
                          <span className="avatar-title rounded-circle bg-light">
                            <img
                              src={lightlogo}
                              alt=""
                              className="rounded-circle"
                              height="34"
                            />
                          </span>
                        </div>
                      </Link>

                      <Link
                        to="/"
                        className="auth-logo-dark"
                        onClick={(e) => e.preventDefault()}
                        style={{ cursor: 'default' }}
                      >
                        <div className="avatar-md profile-user-wid mb-4">
                          <span className="avatar-title rounded-circle bg-light">
                            <img
                              src={logo}
                              alt=""
                              className="rounded-circle"
                              height="34"
                            />
                          </span>
                        </div>
                      </Link>
                    </div>

                    <div className="p-2">
                      {this.props.error && <Alert color="danger">{typeof this.props.error === 'string' ? this.props.error : this.props.error.message || 'An error occurred'}</Alert>}
                      <Formik
                        enableReinitialize={true}
                        initialValues={{
                          email: "",
                          password: "",
                        }}
                        validationSchema={Yup.object().shape({
                          email: Yup.string().required("Please Enter Your Email"),
                          password: Yup.string().required("Please Enter Valid Password"),
                        })}
                        onSubmit={(values) => {
                          this.props.loginUser(values, this.props.history);
                        }}
                      >
                        {({ errors, touched }) => (
                          <Form className="form-horizontal">
                            <div className="mb-3">
                              <Label for="email" className="form-label">
                                Username
                              </Label>
                              <Field
                                name="email"
                                type="text"
                                className={
                                  "form-control" + (errors.email && touched.email ? " is-invalid" : "")
                                }
                              />
                              <ErrorMessage
                                name="email"
                                component="div"
                                className="invalid-feedback"
                              />
                            </div>
                            <div className="mb-3">
                              <Label for="password" className="form-label">
                                Password
                              </Label>
                              <div className="input-group auth-pass-inputgroup">
                                <Field
                                  name="password"
                                  type={this.state.showPassword ? "text" : "password"}
                                  autoComplete="current-password"
                                  className={
                                    "form-control" +
                                    (errors.password && touched.password ? " is-invalid" : "")
                                  }
                                />
                                <button
                                  className="btn btn-light"
                                  type="button"
                                  onClick={() => this.setState({ showPassword: !this.state.showPassword })}
                                >
                                  <i
                                    className={
                                      "mdi " +
                                      (this.state.showPassword
                                        ? "mdi-eye-off-outline"
                                        : "mdi-eye-outline")
                                    }
                                  ></i>
                                </button>
                                {/* <button className="btn btn-light" type="button" id="password-addon">
                                  <i className="mdi mdi-eye-outline"></i>
                                </button> */}
                              </div>
                              <ErrorMessage
                                name="password"
                                component="div"
                                className="invalid-feedback"
                              />
                            </div>

                            {/* <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="customControlInline"
                              />
                              <label className="form-check-label" htmlFor="customControlInline">
                                Remember me
                              </label>
                            </div> */}

                            <div className="mt-3 d-grid">
                              <button className="btn btn-primary btn-block" type="submit">
                                Log In
                              </button>
                            </div>
                            {/* 
                            <div className="mt-4 text-center">
                              <h5 className="font-size-14 mb-3">Sign in with</h5>
                              <ul className="list-inline">
                                <li className="list-inline-item">
                                  <FacebookLogin
                                    appId={facebook.APP_ID}
                                    autoLoad={false}
                                    callback={this.facebookResponse}
                                    render={(renderProps) => (
                                      <Link
                                        to={""}
                                        className="social-list-item bg-primary text-white border-primary"
                                      >
                                        <i className="mdi mdi-facebook" />
                                      </Link>
                                    )}
                                  />
                                </li>
                                <li className="list-inline-item">
                                  {google.CLIENT_ID !== "" && (
                                    <GoogleLogin
                                      clientId={google.CLIENT_ID}
                                      render={(renderProps) => (
                                        <Link
                                          to={""}
                                          className="social-list-item bg-danger text-white border-danger"
                                        >
                                          <i className="mdi mdi-google" />
                                        </Link>
                                      )}
                                      onSuccess={this.googleResponse}
                                      onFailure={() => { }}
                                    />
                                  )}
                                </li>
                              </ul>
                            </div> */}

                            {/* <div className="mt-4 text-center">
                              <Link to="/forgot-password" className="text-muted">
                                <i className="mdi mdi-lock me-1" /> Forgot your password?
                              </Link>
                            </div> */}
                          </Form>
                        )}
                      </Formik>
                    </div>
                  </CardBody>
                </Card>
                <div className="mt-5 text-center">
                  {/* <p>
                    Don&apos;t have an account?{" "}
                    <Link to="register" className="fw-medium text-primary">
                      Signup Now
                    </Link>
                  </p>
                  <p>
                    © {new Date().getFullYear()} Skote. Crafted with
                    <i className="mdi mdi-heart text-danger" /> by Themesbrand
                  </p> */}
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

Login.propTypes = {
  apiError: PropTypes.any,
  error: PropTypes.any,
  history: PropTypes.object,
  loginUser: PropTypes.func,
  socialLogin: PropTypes.func
};

const mapStateToProps = state => {
  const { error } = state.Login;
  return { error };
};

export default withRouter(
  connect(mapStateToProps, { loginUser, apiError, socialLogin })(Login)
);
