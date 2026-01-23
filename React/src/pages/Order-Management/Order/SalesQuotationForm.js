import React from "react";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";

const SalesQuotationForm = ({ soData, handleInputChange, errorClass }) => {
    return (
        <Row>
            <Col md="4">
                <FormGroup>
                    <Label htmlFor="QuotationRef">Quotation Reference</Label>
                    <Input
                        type="text"
                        name="QuotationRef"
                        id="QuotationRef"
                        value={soData.QuotationRef}
                        onChange={handleInputChange}
                        className={errorClass.QuotationRef}
                    />
                </FormGroup>
            </Col>
            <Col md="4">
                <FormGroup>
                    <Label htmlFor="QuotationDate">Quotation Date</Label>
                    <Input
                        type="date"
                        name="QuotationDate"
                        id="QuotationDate"
                        value={soData.QuotationDate}
                        onChange={handleInputChange}
                        className={errorClass.QuotationDate}
                    />
                </FormGroup>
            </Col>
        </Row>
    );
};

export default SalesQuotationForm;
