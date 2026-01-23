import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Button,
    FormGroup,
    Label,
    Input,
    Table,
    InputGroup,
    UncontrolledAlert,
} from "reactstrap";

import Breadcrumbs from "../../components/Common/Breadcrumb";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import "react-datepicker/dist/react-datepicker.css";

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
const initialValues = {
    prNo: "1523",
    poNo: "PO-7890",
    supplier: "1",
    paymentTerm: "1",
    poDate: new Date(),
    address: "Jl. Example No. 123, Jakarta",
    deliveryTerm: "1",
    contact: "+62 812-3456-7890",
    requestor: "1",
    deliveryAddress: "Warehouse A, Jakarta",
    department: "Purchase",
    email: "rina.kartikad@example.com",
    name: "Patrik",
    remarks:
        "Item 1 : Stock Valve for production pallet on cylinder - Request by Bu Himelda.\nItem 2-4 : Project Ethylene Oxide.",
};

const gasCodeOptions = [
    { value: "AIR47L", label: "AIR47L" },
    { value: "AMMONIA", label: "AMMONIA" },
    { value: "AR 99.999%", label: "AR 99.999%" },
    { value: "BLNGAS", label: "BLNGAS" },
    { value: "CGARHE", label: "CGARHE" },
    { value: "CO2 99.9%", label: "CO2 99.9%" },
    { value: "CO2 99.995%", label: "CO2 99.995%" },
    { value: "CO2-GAS-25KG", label: "CO2-GAS-25KG" },
    { value: "CO2GAS47L", label: "CO2GAS47L" },
    { value: "DEUTERIM (D2)99.999%", label: "DEUTERIM (D2)99.999%" },
    { value: "GASMIXTURE", label: "GASMIXTURE" },
    { value: "GBUK0001", label: "GBUK0001" },
    { value: "GBUK0002", label: "GBUK0002" },
    { value: "GBUK0003", label: "GBUK0003" },
    { value: "GBUK0004", label: "GBUK0004" },
    { value: "GBUK0005", label: "GBUK0005" },
    { value: "GBUK0006", label: "GBUK0006" },
    { value: "GBUK0007", label: "GBUK0007" },
    { value: "GBUK0008", label: "GBUK0008" },
    { value: "H2 99.999%", label: "H2 99.999%" },
    { value: "H2GAS47L", label: "H2GAS47L" },
    { value: "H2GAS50L", label: "H2GAS50L" },
    { value: "HE", label: "HE" },
    { value: "HE 99.999%", label: "HE 99.999%" },
    { value: "HE 99.9995%", label: "HE 99.9995%" },
    { value: "HEGAS50L", label: "HEGAS50L" },
    { value: "LIN APM: 1393333", label: "LIN APM: 1393333" },
    { value: "LQAR", label: "LQAR" },
    { value: "LQAR-KGS", label: "LQAR-KGS" },
    { value: "LQCO2-KGS", label: "LQCO2-KGS" },
    { value: "LQN2", label: "LQN2" },
    { value: "LQO2-KGS", label: "LQO2-KGS" },
    { value: "MEDO2", label: "MEDO2" },
    { value: "MIXCO40PPMN2BAL30L", label: "MIXCO40PPMN2BAL30L" },
    { value: "MIXGAS", label: "MIXGAS" },
    { value: "MIXGASCO2N2", label: "MIXGASCO2N2" },
    { value: "MIXGASCO2O2", label: "MIXGASCO2O2" },
    { value: "MIXGASHEO2", label: "MIXGASHEO2" },
    { value: "MIXGASO2N2", label: "MIXGASO2N2" },
    { value: "N2 99.999%", label: "N2 99.999%" },
    { value: "N2GAS40L", label: "N2GAS40L" },
    { value: "N2O995", label: "N2O995" },
    { value: "PAR 7.2M3", label: "PAR 7.2M3" },
    { value: "PH2 6.5M3", label: "PH2 6.5M3" },
    { value: "PH2 6.9M3", label: "PH2 6.9M3" },
    { value: "SF6", label: "SF6" }
];
const validationSchema = Yup.object({
    // example validations (optional)
    poNo: Yup.string().required("PO No. is required"),
    supplier: Yup.string().required("Supplier is required"),
    paymentTerm: Yup.string().required("Payment Term is required"),
    poDate: Yup.date().required("PO Date is required"),
    address: Yup.string().required("Address is required"),
    deliveryTerm: Yup.string().required("Delivery Term is required"),
    contact: Yup.string().required("Contact is required"),
    requestor: Yup.string().required("Requestor is required"),
    deliveryAddress: Yup.string().required("Delivery Address is required"),
    department: Yup.string(),
    email: Yup.string().email("Invalid email"),
});


const AddPurchaseOrder = () => {
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const [cylinderTableData, setCylinderTableData] = useState([]);

    const [owershiplist] = useState([
        { label: "BTG (BTG Owned Property)", value: "1" },
        { label: "COP (Customer Owned Property)", value: "2" },
        { label: "SOP (Supplier Owned Property)", value: "3" },
    ]);
    const handleContainerTypeChange = (option) => {
        if (option) {
            const rows = Array.from({ length: 18 }, (_, index) => ({
                id: index + 1,
                cylinderName: "",
                ownership: "",
                barCode: "",
            }));
            setCylinderTableData(rows);
        } else {
            setCylinderTableData([]);
        }
    };

    const [successMsg, setSuccessMsg] = useState(false);
    const handleSubmit = (values, { setSubmitting, resetForm }) => {
        setSuccessMsg(true);
        setSubmitting(false);
        setTimeout(() => {
            setSuccessMsg(false);
            resetForm();
        }, 2000);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Purchase Order" />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={(values) => {
                                            console.log(values);
                                        }}
                                    >
                                        {({ errors, touched, setFieldValue, values }) => (
                                            <Form>
                                                {/* PR No on top, full width */}
                                                <Row className="mb-3">
                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="prNo" className="fw-bold">
                                                                PR No.
                                                            </Label>
                                                            <Field
                                                                name="prNo"
                                                                type="text"
                                                             
                                                                className="form-control"
                                                            />
                                                        </FormGroup>
                                                         <FormGroup>
                                                            <Label htmlFor="prtype" className="fw-bold">
                                                                PR Type.
                                                            </Label>
                                                            <Field
                                                                name="prNo"
                                                                type="text"
                                                                   disabled
                                                                className="form-control"
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                {/* Row 1 */}
                                                <Row className="mb-3">
                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="poNo" className="fw-bold">
                                                                PO No.
                                                            </Label>
                                                            <Field
                                                                name="poNo"
                                                                type="text"
                                                                disabled
                                                                className="form-control bg-light"
                                                            />
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="supplier" className="fw-bold">
                                                                Supplier
                                                            </Label>
                                                            <Field
                                                                as="select"
                                                                name="supplier"
                                                                disabled
                                                                className="form-select bg-light"
                                                            >
                                                                <option value="Local">Local</option>
                                                                <option value="Overseas">Overseas</option>
                                                            </Field>
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="paymentTerm" className="fw-bold">
                                                                Payment Term
                                                            </Label>
                                                            <Field
                                                                as="select"
                                                                name="paymentTerm"
                                                                disabled
                                                                className="form-select bg-light"
                                                            >
                                                                <option value="30 DAYS">30 DAYS</option>
                                                                <option value="60 DAYS">60 DAYS</option>
                                                                <option value="CASH">CASH</option>
                                                            </Field>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                {/* Row 2 */}
                                                <Row className="mb-3">
                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="poDate" className="fw-bold">
                                                                PO Date
                                                            </Label>
                                                            <Flatpickr
                                                                value={values.poDate}
                                                                options={{ dateFormat: "d-M-Y" }}
                                                                onChange={(date) => setFieldValue("poDate", date[0])}
                                                                disabled
                                                                className="form-control bg-light"
                                                            />
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="address" className="fw-bold">
                                                                Address
                                                            </Label>
                                                            <Field
                                                                name="address"
                                                                type="text"
                                                                disabled
                                                                className="form-control bg-light"
                                                            />
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="deliveryTerm" className="fw-bold">
                                                                Delivery Term
                                                            </Label>
                                                            <Field
                                                                as="select"
                                                                name="deliveryTerm"
                                                                disabled
                                                                className="form-select bg-light"
                                                            >
                                                                <option value="FOB">FOB</option>
                                                                <option value="CIF">CIF</option>
                                                                <option value="EXW">EXW</option>
                                                            </Field>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                {/* Row 3 */}
                                                <Row className="mb-3">
                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="requestor" className="fw-bold">
                                                                Requestor
                                                            </Label>
                                                            <Field
                                                                name="requestor"
                                                                type="text"
                                                                disabled
                                                                className="form-control bg-light"
                                                            />
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="name" className="fw-bold">
                                                                Name
                                                            </Label>
                                                            <Field
                                                                name="name"
                                                                type="text"
                                                                disabled
                                                                className="form-control bg-light"
                                                            />
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="deliveryAddress" className="fw-bold">
                                                                Delivery Address
                                                            </Label>
                                                            <Field
                                                                name="deliveryAddress"
                                                                type="text"
                                                                disabled
                                                                className="form-control bg-light"
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                {/* Row 4 */}
                                                <Row className="mb-3">
                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="department" className="fw-bold">
                                                                Department
                                                            </Label>
                                                            <Field
                                                                name="department"
                                                                type="text"
                                                                disabled
                                                                className="form-control bg-light"
                                                                value={initialValues.department}
                                                            // Since department is not in initialValues, pass value manually
                                                            />
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="contact" className="fw-bold">
                                                                Contact
                                                            </Label>
                                                            <Field
                                                                name="contact"
                                                                type="text"
                                                                disabled
                                                                className="form-control bg-light"
                                                            />
                                                        </FormGroup>
                                                    </Col>

                                                    <Col md={4}>
                                                        <FormGroup>
                                                            <Label htmlFor="email" className="fw-bold">
                                                                Email
                                                            </Label>
                                                            <Field
                                                                name="email"
                                                                type="email"
                                                                disabled
                                                                className="form-control bg-light"
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <div className="col-xl-12">
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Label htmlFor="remarks">Remarks</Label>
                                                                <textarea id="basicpill-address-input1"  disabled className="form-control" rows="3" placeholder="Remarks">
                                                                    Item 1 : Stock Valve for production pallet on cylinder - Request by Bu Himelda.
                                                                    Item 2-4 : Project Ethylene Oxide.
                                                                </textarea>
                                                               
                                                            </FormGroup>
                                                        </Col>
                                                    </div>
                                                </Row>
                                            </Form>
                                        )}
                                    </Formik>
                                    <Table className="table mb-0">
                                        <thead style={{ backgroundColor: "#3e90e2" }}>
                                            <tr>
                                                <th className="text-center" style={{ width: "4%" }}>S.No.</th>
                                                <th className="text-center" style={{ width: "6%" }}>Type</th>
                                                <th className="text-center" style={{ width: "20%" }}>Item Name</th>
                                                <th className="text-center" style={{ width: "10%" }}>Item Code</th>
                                                <th className="text-center" style={{ width: "10%" }}>Department</th>
                                                <th className="text-center" style={{ width: "6%" }}>UOM</th>
                                                <th className="text-center" style={{ width: "7%" }}>Qty</th>
                                                <th className="text-center" style={{ width: "7%" }}>Currency</th>
                                                <th className="text-center" style={{ width: "10%" }}>Previous PO Price</th>
                                                <th className="text-center" style={{ width: "10%" }}>Unit Price</th>
                                                <th className="text-center" style={{ width: "5%" }}>Discount</th>
                                                <th className="text-center" style={{ width: "5%" }}>Tax %</th>
                                                <th className="text-center" style={{ width: "10%" }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                {
                                                    sNo: 1,
                                                    itemType: "GS",
                                                    itemDescription: "Japan BBB Neriki HW w/o Safety Device, Inlet 25E Outlet BS#3 WP:200B, Model:G-1 IN-337-1",
                                                    itemCode: "CV-0001",
                                                    dept: "Str",
                                                    uom: "Pc",
                                                    qty: 150,
                                                    currency: "USD",
                                                    previousPrice: "0.00",
                                                    unitPrice: "21.50",
                                                    discount: "0",
                                                    tax: "0",
                                                    amount: "3225.00"
                                                },
                                                {
                                                    sNo: 2,
                                                    itemType: "PRJ",
                                                    itemDescription: "BBB HW Type CO2+EO (Fumigas) Valve c/w Safety Device, Inlet 25E Outlet DIN 477 No.1, WP:200B, Model:G-1 IN-407-3",
                                                    itemCode: "CV-0002",
                                                    dept: "Eng",
                                                    uom: "Pc",
                                                    qty: 1200,
                                                    currency: "USD",
                                                    previousPrice: "0.00",
                                                    unitPrice: "27.50",
                                                    discount: "0",
                                                    tax: "0",
                                                    amount: "33000.00"
                                                },
                                                {
                                                    sNo: 3,
                                                    itemType: "PRJ",
                                                    itemDescription: "Explosion Proof Weighing Scale - Size:500mmx500mmx150mm(H), Model ADPW200-B, Capacity: 150kg x 0.01 kg, Class: Ex Ia II",
                                                    itemCode: "MAC-0001",
                                                    dept: "Eng",
                                                    uom: "Unit",
                                                    qty: 4,
                                                    currency: "USD",
                                                    previousPrice: "0.00",
                                                    unitPrice: "8395.00",
                                                    discount: "0",
                                                    tax: "0",
                                                    amount: "33580.00"
                                                },
                                                {
                                                    sNo: 4,
                                                    itemType: "PRJ",
                                                    itemDescription: "BE-10 Water Softener, 1\" Inlet/Outlet F65/69 Multiport Controller",
                                                    itemCode: "BG-0001",
                                                    dept: "Eng",
                                                    uom: "Unit",
                                                    qty: 1,
                                                    currency: "USD",
                                                    previousPrice: "0.00",
                                                    unitPrice: "7252.50",
                                                    discount: "0",
                                                    tax: "0",
                                                    amount: "7252.50"
                                                }
                                            ].map((item) => (
                                                <tr key={item.sNo}>
                                                    <td className="text-center align-middle">{item.sNo}</td>
                                                    <td className="text-center align-middle">
                                                        <Input type="text" value={item.itemType} disabled />
                                                    </td>
                                                    <td className="text-start align-middle">
                                                        <Input
                                                            type="textarea"
                                                            value={item.itemDescription}
                                                            disabled
                                                            style={{ height: "auto", minHeight: "50px" }}
                                                        />
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <Input type="text" value={item.itemCode} disabled />
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <Input type="text" value={item.dept} disabled />
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <Input type="text" value={item.uom} disabled />
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <Input type="number" value={item.qty} disabled className="text-end" />
                                                    </td>
                                                    <td className="text-center align-middle">
                                                        <Input type="text" value={item.currency} disabled />
                                                    </td>
                                                    <td className="text-end align-middle">{item.previousPrice}</td>
                                                    <td className="text-end align-middle">{item.unitPrice}</td>
                                                    <td className="text-end align-middle">{item.discount}</td>
                                                    <td className="text-end align-middle">{item.tax}</td>
                                                    <td className="text-end align-middle">{item.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan={10}></td>
                                                <td className="align-middle text-end"><strong>Sub Total</strong></td>
                                                <td className="align-middle text-center">SGD</td>
                                                <td className="align-middle text-end">77057.00</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={10}></td>
                                                <td className="align-middle text-end"><strong>Discount</strong></td>
                                                <td className="align-middle text-center">SGD</td>
                                                <td className="align-middle text-end">0.00</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={10}></td>
                                                <td className="align-middle text-end"><strong>Tax%</strong></td>
                                               <td className="align-middle text-center">SGD</td>
                                                <td className="align-middle text-end">0.00</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={10}></td>
                                                <td className="align-middle text-end"><strong>Net Total</strong></td>
                                                <td className="align-middle text-center">SGD</td>
                                                <td className="align-middle text-end">77057.00</td>
                                            </tr>
                                        </tfoot>
                                    </Table>

                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default AddPurchaseOrder;