import React, { useState } from "react";
import {
    Button,
    Col,
    Card,
    CardBody,
    Container,
    Label,
    Row,
    Table,
    Input
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";

const Manageduebills = () => {
    const [paymentType, setPaymentType] = useState("claim");
    const renderTableTitle = (title) => (
        <h5 className="mt-4 mb-2" style={{ borderBottom: "2px solid #3e90e2", paddingBottom: "5px" }}>
            {title}
        </h5>
    );

    const sampleData = {
        supplierAdvance: [
            { po: "PO001", supplier: "ABC Ltd", currency: "USD", payable: 1000, paid: 200, paymentType: "" }
        ],
        supplierInvoice: [
            { invoice: "INV001", supplier: "XYZ Pvt", currency: "EUR", payable: 1500, paid: 500 }
        ],
        cashAdvance: [
            { applicant: "Sandy", claim: 800, advance: 300, paymentType: "" }
        ],
        claim: [
            { applicant: "John", claim: 1200, currency: "SGD", paymentType: "" }
        ]
    };
    const searchData = () => {
        console.log("Searching...");
    };

    const cancelFilter = () => {
        setPaymentType("");
        console.log("Filter cancelled");
    };

    const calldownload = () => {
        console.log("Exporting data...");
    };

    const handlePrint = () => {
        window.print();
    };

    const dAddOrder = () => {
        console.log("Add new order...");
    };

    const renderPaymentSection = () => {
        switch (paymentType) {
            case "cashAdvance":
                return renderCashAdvance();
            case "claim":
                return renderClaim();
            case "supplierAdvance":
                return renderSupplierAdvance();
            case "supplierInvoice":
                return renderSupplierInvoice();
            default:
                return null;
        }
    };

    const renderSupplierAdvance = () => (
        <>
            {renderTableTitle("Supplier Advance")}
            <Table bordered responsive>
                <thead className="table-light text-center">
                    <tr>
                        <th>
                            <Input type="checkbox" />
                        </th>
                        <th>PO #</th>
                        <th>Supplier Name</th>
                        <th>Currency</th>
                        <th>Payable Amount</th>
                        <th>Already Paid Amount</th>
                        <th>Payment Type</th>
                    </tr>
                </thead>
                <tbody>
                    {sampleData.supplierAdvance.map((item, index) => (
                        <tr key={index} className=" text-center">
                            <td>
                                <Input type="checkbox" />
                            </td>
                            <td>{item.po}</td>
                            <td>{item.supplier}</td>
                            <td>{item.currency}</td>
                            <td>{item.payable}</td>
                            <td>{item.paid}</td>
                            <td>
                                <Input type="select" className="form-control">
                                    <option value="">Select</option>
                                 <option value="cash">Cash</option>
                                    <option value="bank">Bank Transfer</option>
                                </Input>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );

    const renderSupplierInvoice = () => (
        <>
            {renderTableTitle("Supplier Invoice")}
            <Table bordered responsive>
                <thead className="table-light text-center">
                    <tr >
                        <th>
                            <Input type="checkbox" />
                        </th>
                        <th>Invoice #</th>
                        <th>Supplier Name</th>
                        <th>Currency</th>
                        <th>Payable Amount</th>
                        <th>Already Paid Amount</th>
                        <th>Payment Type</th>
                    </tr>
                </thead>
                <tbody>
                    {sampleData.supplierInvoice.map((item, index) => (
                        <tr key={index} className=" text-center">
                            <td>
                                <Input type="checkbox" />
                            </td>
                            <td>{item.invoice}</td>
                            <td>{item.supplier}</td>
                            <td>{item.currency}</td>
                            <td>{item.payable}</td>
                            <td>{item.paid}</td>
                            <td>
                                <Input type="select" className="form-control">
                                    <option value="">Select</option>
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank Transfer</option>
                                </Input>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );

    const renderCashAdvance = () => (
        <>
            {renderTableTitle("Cash Advance")}
            <Table bordered responsive>
                <thead className="table-light text-center">
                    <tr>
                        <th>
                            <Input type="checkbox" />
                        </th>
                        <th>Applicant Name</th>
                        <th>Claim Amount</th>
                        <th>Advance Amount</th>
                        <th>Payment Type</th>
                    </tr>
                </thead>
                <tbody>
                    {sampleData.cashAdvance.map((item, index) => (
                        <tr key={index} className=" text-center">
                            <td>
                                <Input type="checkbox" />
                            </td>
                            <td>{item.applicant}</td>
                            <td>{item.claim}</td>
                            <td>{item.advance}</td>
                            <td>
                                <Input type="select" className="form-control">
                                    <option value="">Select</option>
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank Transfer</option>
                                </Input>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );

    const renderClaim = () => (
        <>
            {renderTableTitle("Claim")}
            <Table bordered responsive>
                <thead className="table-light text-center">
                    <tr>
                        <th>
                            <Input type="checkbox" />
                        </th>
                        <th>Applicant Name</th>
                        <th>Claim Amount</th>
                        <th>Transaction Currency</th>
                        <th>Payment Type</th>
                    </tr>
                </thead>
                <tbody>
                    {sampleData.claim.map((item, index) => (
                        <tr key={index} className=" text-center">
                            <td>
                                <Input type="checkbox" />
                            </td>
                            <td>{item.applicant}</td>
                            <td>{item.claim}</td>
                            <td>{item.currency}</td>
                            <td>
                                <Input type="select" className="form-control">
                                    <option value="">Select</option>
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank Transfer</option>
                                </Input>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Finance" breadcrumbItem="Due Bills" />
                <Row>
                    <Col lg={12}>
                        <CardBody>
                            <Row className="mb-4">
                                <Col md={4}>
                                    <Label for="paymentType">Select Payment Category</Label>
                                    <Input
                                        type="select"
                                        name="paymentType"
                                        id="paymentType"
                                        value={paymentType}
                                        onChange={(e) => setPaymentType(e.target.value)}
                                        className="form-control"
                                    >
                                        <option value="">Select</option>
                                        <option value="cashAdvance">Cash Advance</option>
                                        <option value="claim">Claim</option>
                                        <option value="supplierAdvance">Supplier Advance</option>
                                        <option value="supplierInvoice">Supplier Invoice</option>
                                    </Input>
                                </Col>
                                <Col className="text-end col-12 col-lg-8 button-items mt-4">
                                    <button type="button" className="btn btn-info me-2" onClick={searchData}>
                                        <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i>
                                        Search
                                    </button>
                                    <button type="button" className="btn btn-danger me-2" onClick={cancelFilter}>
                                        <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-secondary me-2" onClick={calldownload}>
                                        <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i>
                                        Export
                                    </button>
                                    <button type="button" className="btn btn-primary me-2" onClick={handlePrint}>
                                        <i className="bx bx-printer label-icon font-size-16 align-middle me-2"></i>
                                        Print
                                    </button>
                                    <button type="button" className="btn btn-success" onClick={dAddOrder}>
                                        <i className="bx  label-icon font-size-16 align-middle me-2"></i>
                                        Generate Voucher
                                    </button>
                                </Col>
                            </Row>
                            {renderPaymentSection()}

                        </CardBody>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Manageduebills;
