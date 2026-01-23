// components/PasswordModal.jsx
import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
} from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { Passwordupdate } from "../../../common/data/mastersapi";

const validationSchema = Yup.object({
  oldPass: Yup.string()
    .trim()
    .required("Current password is required"),
  newPass: Yup.string()
    .trim()
    .required("New password is required")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter (A-Z)")
    .matches(/[a-z]/, "Must contain at least one lowercase letter (a-z)")
    .matches(/[0-9]/, "Must contain at least one digit (0-9)")
    .matches(/[^a-zA-Z0-9]/, "Must contain at least one special character")
    .min(8, "Password must be at least 8 characters")
    .notOneOf([Yup.ref("oldPass")], "New password must be different from current password"),
});

export default function PasswordModal({ isOpen, onClose }) {
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const user = JSON.parse(localStorage.getItem("authUser"));
      const res = await Passwordupdate({
        oldPassword: values.oldPass,
        Password: values.newPass,
        userid: user?.uid,
        Id: user?.u_id,
      });

      if (res.status) {
        Swal.fire({ icon: "success", title: "Success", text: res.message });
        onClose();
      } else {
        Swal.fire({ icon: "error", title: "Exception", text: res.message });
        setFieldError("oldPass", res.message || "Change failed");
      }
    } catch {
      setFieldError("oldPass", "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Change Password</ModalHeader>
      <Formik
        initialValues={{ oldPass: "", newPass: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <ModalBody>
              <FormGroup>
                <Label>Current Password</Label>
                <Field
                  name="oldPass"
                  type="password"
                  className="form-control"
                />
                <ErrorMessage
                  name="oldPass"
                  component="div"
                  className="text-danger mt-1"
                />
              </FormGroup>

              <FormGroup>
                <Label>New Password</Label>
                <Field
                  name="newPass"
                  type="password"
                  className="form-control"
                />
                <ErrorMessage
                  name="newPass"
                  component="div"
                  className="text-danger mt-1"
                />
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <Button color="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
