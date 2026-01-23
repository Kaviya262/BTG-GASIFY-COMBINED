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

const ManagePaymentPlan = () => {
    const [paymentType, setPaymentType] = useState("");

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

    const renderTableTitle = (title) => (
        <h5 className="mt-4 mb-2" style={{ borderBottom: "2px solid #3e90e2", paddingBottom: "5px" }}>
            {title}
        </h5>
    );

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
                        <tr key={index} className="text-center">
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
                                    <option value="full">Cash</option>
                                    <option value="partial">Bank Transfer</option>
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
                        <tr key={index} className= "text-center">
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
                                   <option value="full">Cash</option>
                                    <option value="partial">Bank Transfer</option>
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
                       <tr key={index} className="text-center">
                             <td>
                                <Input type="checkbox" />
                            </td>
                            <td>{item.applicant}</td>
                            <td>{item.claim}</td>
                            <td>{item.advance}</td>
                            <td>
                                <Input type="select" className="form-control">
                                    <option value="">Select</option>
                                    <option value="full">Cash</option>
                                    <option value="partial">Bank Transfer</option>
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
                       <tr key={index} className="text-center">
                             <td>
                                <Input type="checkbox" />
                            </td>
                            <td>{item.applicant}</td>
                            <td>{item.claim}</td>
                            <td>{item.currency}</td>
                            <td>
                                <Input type="select" className="form-control">
                                    <option value="">Select</option>
                                    <option value="full">Cash</option>
                                    <option value="partial">Bank Transfer</option>
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
                <Breadcrumbs title="Finance" breadcrumbItem="Payment Plan" />
                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardBody>
                                {/* Payment Type Selection */}
                                <Row className="mb-4">
                                    <Col md={4}>
                                        <Label for="paymentType">Select Payment Category</Label>
                                        <Input
                                            type="select"
                                            name="paymentType"
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
                                </Row>
                                {paymentType === "supplierAdvance" && renderSupplierAdvance()}
                                {paymentType === "supplierInvoice" && renderSupplierInvoice()}
                                {paymentType === "cashAdvance" && renderCashAdvance()}
                                {paymentType === "claim" && renderClaim()}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ManagePaymentPlan;
