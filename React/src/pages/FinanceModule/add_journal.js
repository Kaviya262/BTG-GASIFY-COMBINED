import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
    Container,
    Card,
    CardBody,
    Row,
    Col,
    Table,
    Input,
    Button
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import Select from "react-select";
import axios from "axios";
import { PYTHON_API_URL } from "../../common/pyapiconfig";
import { toast } from "react-toastify";

const AddJournal = () => {
    const history = useHistory();

    // Fetched Options
    const [glCodeOptions, setGlCodeOptions] = useState([]);
    const [partyOptions, setPartyOptions] = useState([]);

    const typeOptions = [
        { value: 'Debit', label: 'Debit' },
        { value: 'Credit', label: 'Credit' }
    ];

    // Party State
    const [partyType, setPartyType] = useState("customer"); // Default to Customer

    useEffect(() => {
        const fetchGLCodes = async () => {
            try {
                const response = await axios.get(`${PYTHON_API_URL}/journal/get-gl-codes`);
                if (response.data?.status) {
                    setGlCodeOptions(response.data.data.map(gl => ({
                        value: gl.id,
                        label: `${gl.GLcode || ''} - ${gl.description || ''}`
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch GL Codes:", error);
                toast.error("Failed to fetch GL Codes");
            }
        };

        fetchGLCodes();
    }, []);

    useEffect(() => {
        const fetchPartyList = async () => {
            try {
                const response = await axios.get(`${PYTHON_API_URL}/journal/get-party-list/${partyType}`);
                if (response.data?.status) {
                    setPartyOptions(response.data.data.map(party => ({
                        value: party.id,
                        label: party.name
                    })));
                } else {
                    setPartyOptions([]);
                }
            } catch (error) {
                console.error(`Failed to fetch party list for ${partyType}:`, error);
                toast.error("Failed to fetch party list");
                setPartyOptions([]);
            }
        };

        fetchPartyList();
    }, [partyType]);

    const [journalRows, setJournalRows] = useState([
        { partyName: null, type: { value: 'Debit', label: 'Debit' }, glCode: null, description: "", amount: "", referenceNo: "" },
    ]);

    const handleRowChange = (index, field, value) => {
        const newRows = [...journalRows];
        newRows[index][field] = value;
        setJournalRows(newRows);
    };

    const addRow = () => {
        setJournalRows([...journalRows, { partyName: null, type: { value: 'Debit', label: 'Debit' }, glCode: null, description: "", amount: "", referenceNo: "" }]);
    };

    const removeRow = (index) => {
        if (journalRows.length > 1) {
            const newRows = journalRows.filter((_, i) => i !== index);
            setJournalRows(newRows);
        }
    };

    const handlePartyTypeChange = (e) => {
        setPartyType(e.target.value);
    };

    const customSelectStyles = {
        control: (base) => ({ ...base, minHeight: '32px', fontSize: '12px', borderColor: '#ced4da' }),
        menu: (base) => ({ ...base, fontSize: '12px', zIndex: 9999 }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 })
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Finance" breadcrumbItem="Add Journal" />

                <Card>
                    <CardBody>
                        <Row className="mb-4">
                            <Col lg="12">
                                {/* Party Selection Section */}
                                <div className="mb-4">
                                    <h5 className="font-size-14 mb-3">Party Selection</h5>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="form-check">
                                            <Input
                                                type="radio"
                                                name="partyType"
                                                value="customer"
                                                className="form-check-input"
                                                checked={partyType === "customer"}
                                                onChange={handlePartyTypeChange}
                                                id="partyCustomer"
                                            />
                                            <label className="form-check-label" htmlFor="partyCustomer">
                                                Customer
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <Input
                                                type="radio"
                                                name="partyType"
                                                value="supplier"
                                                className="form-check-input"
                                                checked={partyType === "supplier"}
                                                onChange={handlePartyTypeChange}
                                                id="partySupplier"
                                            />
                                            <label className="form-check-label" htmlFor="partySupplier">
                                                Supplier
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <Input
                                                type="radio"
                                                name="partyType"
                                                value="bank"
                                                className="form-check-input"
                                                checked={partyType === "bank"}
                                                onChange={handlePartyTypeChange}
                                                id="partyBank"
                                            />
                                            <label className="form-check-label" htmlFor="partyBank">
                                                Bank
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Journal Entry Table */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="card-title">Journal Entries</h4>
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button color="primary">Save</Button>
                                        <Button color="success">Post</Button>
                                        <Button color="danger" onClick={() => history.push("/journal-ct")}>Cancel</Button>
                                        {/* <Button color="primary" style={{ color: "white" }} onClick={addRow}><i className="bx bx-plus"></i> Add</Button> */}
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <Table className="table-bordered mb-0">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '200px' }}>Party Name</th>
                                                <th style={{ width: '150px' }}>Type</th>
                                                <th style={{ width: '250px' }}>GL Code</th>
                                                <th>Description</th>
                                                <th>Amount</th>
                                                <th>Reference No</th>
                                                <th style={{ width: '40px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {journalRows.map((row, index) => (
                                                <tr key={index}>
                                                    <td className="p-1">
                                                        <Select
                                                            value={row.partyName}
                                                            onChange={(selectedOption) => handleRowChange(index, "partyName", selectedOption)}
                                                            options={partyOptions}
                                                            className="basic-single"
                                                            classNamePrefix="select2-selection"
                                                            placeholder="Select Party"
                                                            menuPortalTarget={document.body}
                                                            styles={customSelectStyles}
                                                        />
                                                    </td>
                                                    <td className="p-1">
                                                        <Select
                                                            value={row.type}
                                                            onChange={(selectedOption) => handleRowChange(index, "type", selectedOption)}
                                                            options={typeOptions}
                                                            className="basic-single"
                                                            classNamePrefix="select2-selection"
                                                            placeholder="Select Type"
                                                            menuPortalTarget={document.body}
                                                            styles={customSelectStyles}
                                                        />
                                                    </td>
                                                    <td className="p-1">
                                                        <Select
                                                            value={row.glCode}
                                                            onChange={(selectedOption) => handleRowChange(index, "glCode", selectedOption)}
                                                            options={glCodeOptions}
                                                            className="basic-single"
                                                            classNamePrefix="select2-selection"
                                                            placeholder="Select GL Code"
                                                            menuPortalTarget={document.body}
                                                            styles={customSelectStyles}
                                                        />
                                                    </td>
                                                    <td className="p-1">
                                                        <Input
                                                            type="text"
                                                            bsSize="sm"
                                                            value={row.description}
                                                            onChange={(e) => handleRowChange(index, "description", e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-1">
                                                        <Input
                                                            type="number"
                                                            bsSize="sm"
                                                            value={row.amount}
                                                            onChange={(e) => handleRowChange(index, "amount", e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-1">
                                                        <Input
                                                            type="text"
                                                            bsSize="sm"
                                                            value={row.referenceNo}
                                                            onChange={(e) => handleRowChange(index, "referenceNo", e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="text-center p-1 align-middle">
                                                        {journalRows.length > 1 && (
                                                            <i className="bx bx-trash text-danger" style={{ cursor: 'pointer' }} onClick={() => removeRow(index)}></i>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Container>
        </div>
    );
};

export default AddJournal;
