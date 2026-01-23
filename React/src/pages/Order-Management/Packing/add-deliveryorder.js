import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Collapse, Container, Row, Button, Form, FormGroup, Label, Input, Table, Modal, ModalBody, ModalFooter, ModalHeader, InputGroup } from "reactstrap";
import { Tooltip } from "reactstrap";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated"; 
import "flatpickr/dist/themes/material_blue.css"; 
import Flatpickr from "react-flatpickr";
// Import Breadcrumb
import Breadcrumbs from "../../../components/Common/Breadcrumb";

const animatedComponents = makeAnimated();

const AddDeliveryorder = () => {
    const history = useHistory();
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const [customerSelect, setCustomerSelect] = useState([]); 
    const [soSelect, setSoSelect] = useState([]); 
    const [tooltipOpen, setTooltipOpen] = useState({});
    const toggleTooltip = (id) => {
        setTooltipOpen((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const salesorderList = [
        { label: "SO001", value: "1", code: "1", description: "AIR 47L" },
        { label: "SO002", value: "2", code: "2", description: "AMMONIA GAS" },
        { label: "SO003", value: "3", code: "3", description: "Pure Ar Grade 99.999%" },
        { label: "SO004", value: "4", code: "4", description: "Balloon Gas General" },
        { label: "SO005", value: "5", code: "5", description: "Comp Gas Argon 25% Helium SG " },
    ]; 

    const CustomerList = [
        { label: "Mitra Energi Batam", value: "1" } 
    ];
    const [activeAccord, setActiveAccord] = useState({
        col1: false,
        col2: false,
        col3: false,
    }); 

    const [CodeList] = useState([
        { label: "AIR47L", value:"1", code: "1", description: "AIR 47L test description" },
        { label: "AMMONIA", value:"2", code: "2", description: "AMMONIA GAS test description" },
        { label: "AR 99.999%", value:"3", code: "3", description: "Pure Ar Grade 99.999% test description" },
        { label: "BLNGAS", value:"4", code: "4", description: "Balloon Gas General test description" },
        { label: "CGARHE", value:"5", code: "5", description: "Comp Gas Argon 25% Helium SG test description" },
    ]);
    const [gasCodeList, setGasCodeList] = useState([]);

    const handleSQTypeChange = () =>{
        setGasCodeList(CodeList);
    };
    const showAccord = (activeItem) =>{
        setActiveAccord((prevState) => ({
            col1: activeItem === "col1" ? !prevState.col1 : false,
            col2: activeItem === "col2" ? !prevState.col2 : false,
            col3: activeItem === "col3" ? !prevState.col3 : false,
        }));
    };
    useEffect(() => {
        setCustomerSelect(CustomerList)
        handleSQTypeChange()
    }, []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Sales" breadcrumbItem="Delivery Order" />
                    <Card>
                        <Row>
                            <Col xl={12}> 
                                <div className="row mb-2">
                                    <div className="col-12 col-lg-6 "></div>
                                    <div className="col-12 col-lg-6 justify-content-end text-end">
                                        <div className="button-items" style={{ marginRight: "2px" }}>
                                            <button type="button" className="btn btn-info" onClick={() => history.push("/manage-order")}>Save</button>
                                            <button type="button" className="btn btn-success">Post</button>
                                            <button type="button" className="btn btn-warning">Print</button>
                                            <button type="button" className="btn btn-secondary">Sync</button>
                                            <button type="button" className="btn btn-danger" onClick={() => history.push("/manage-order")}>Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <hr className="mt-1" />
                            <Row>
                                <Col md="3">
                                    <FormGroup>
                                        <Label>Manual DO No.</Label>
                                        <Input type="text" name="donumber" />
                                    </FormGroup>
                                </Col>
                                <Col md="3">
                                    <FormGroup>
                                        <Label>Delivery Order Date</Label>
                                        <InputGroup>
                                            <Flatpickr className="form-control d-block" placeholder="dd-mm-yyyy" options={{ altInput: true, altFormat: "d-M-Y", dateFormat: "Y-m-d" }} />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                            </Row> 
                            <hr className="mt-1" />
                            {customerSelect.length > 0 ? (
                                customerSelect.map((item, index) => ( 
                                    <Card key={index} >
                                        <Row>
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label>Customer</Label>
                                                    <Input type="text" value={item.label} disabled />
                                                </FormGroup>
                                            </Col>
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label>Packer Name</Label>
                                                    <Input type="text" value="Kumar" />
                                                </FormGroup>
                                            </Col>
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label>Date of Delivery</Label>
                                                    <InputGroup>
                                                        <Flatpickr className="form-control d-block" placeholder="dd-mm-yyyy" options={{ altInput: true, altFormat: "d-M-Y", dateFormat: "Y-m-d" }} value="28-Feb-2025"/>
                                                    </InputGroup>
                                                </FormGroup>
                                            </Col>
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label>PDL No.</Label>
                                                    <Input type="text" value="PDL002" />
                                                </FormGroup>
                                            </Col>
                                            <Col md="4">
                                                <FormGroup>
                                                    <Label>PDL Date</Label>
                                                    <Input type="text" value="28-Feb-2025" />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <div className="accordion accordion-flush" id="accordionFlushExample"> 
                                            <div className="accordion-item">
                                                <h2 className="accordion-header" id="headingFlushOne" style={{backgroundColor:"#cee3f8"}}>
                                                    <button
                                                        className={`accordion-button fw-medium ${!activeAccord.col1 ? "collapsed" : ""}`}
                                                        type="button"
                                                        onClick={() =>showAccord("col1")}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        Sale Order No. : SO001
                                                    </button> 
                                                </h2>
                                                <Collapse isOpen={activeAccord.col1} className="accordion-collapse">
                                                    <div className="accordion-body"> 
                                                        <div className="table-responsive mt-1" >
                                                            <Table className="table mb-0">
                                                                <thead style={{backgroundColor:"#3e90e2"}}>
                                                                    <tr>  
                                                                        <th className="text-center">Gas Code</th>
                                                                        <th className="text-center" style={{width:"8%"}}>SO Qty</th>
                                                                        <th className="text-center required-label" style={{width:"8%"}}>Pick Qty</th>
                                                                        <th className="text-center">Delivery Details</th> 
                                                                        <th className="text-center required-label">Driver Name</th> 
                                                                        <th className="text-center required-label">Truck No.</th> 
                                                                    </tr>
                                                                </thead>
                                                                <tbody> 
                                                                    { gasCodeList.length > 0 ? (
                                                                        gasCodeList.map((item, index) => {
                                                                            const tooltipId = `gas-code-${index}`;
                                                                            const tooltipId2 = `delivery-${index}`;
                                                                            return ( 
                                                                            <tr key={index}> 
                                                                                <td>
                                                                                <span id={tooltipId} style={{ cursor: "pointer", color: "blue" }} className="btn-rounded btn btn-link">
                                                                                    {item.label}
                                                                                </span>
                                                                                    <Tooltip isOpen={tooltipOpen[tooltipId] || false} target={tooltipId} toggle={() => toggleTooltip(tooltipId)} style={{ maxWidth: "300px", width: "300px" }} > 
                                                                                        <div style={{textAlign:"left"}} className="font-size-13"> 
                                                                                            <div className="d-flex align-items-center gap-2">
                                                                                                <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>Volume:</strong></div>
                                                                                                <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left"> {item.value*25}</div> 
                                                                                            </div>
                                                                                            <div className="d-flex align-items-center gap-2">
                                                                                                <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>Pressure:</strong></div>
                                                                                                <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">{item.value*12}</div> 
                                                                                            </div>
                                                                                            <div className="d-flex align-items-center gap-2">
                                                                                                <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>UOM:</strong></div>
                                                                                                <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">CYL</div> 
                                                                                            </div>
                                                                                            <div className="d-flex align-items-center gap-2">
                                                                                                <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>Description:</strong></div> 
                                                                                                <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">{item.description}</div> 
                                                                                            </div> 
                                                                                        </div>
                                                                                    </Tooltip> 
                                                                                </td>
                                                                                <td> 
                                                                                    <span onClick={toggleModal} style={{ cursor: "pointer", color: "blue"}} className="btn-rounded btn btn-link" title="Click here">
                                                                                        {(index+1)*50}
                                                                                    </span>
                                                                                </td> 
                                                                                <td>
                                                                                    <Input type="number" onChange={(e) => handleVolumeChange(index, e.target.value)} /> 
                                                                                </td>
                                                                                <td> 
                                                                                    <span id={tooltipId2} style={{ cursor: "pointer", color: "blue" }} className="btn-rounded btn btn-link">
                                                                                    Delivery Details
                                                                                    </span>
                                                                                    <Tooltip isOpen={tooltipOpen[tooltipId2] || false} target={tooltipId2} toggle={() => toggleTooltip(tooltipId2)} style={{ maxWidth: "450px", width: "450px" }}>
                                                                                        <div style={{textAlign:"left"}} className="font-size-13"> 
                                                                                            <div className="d-flex align-items-center gap-2">
                                                                                                <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>PO No.:</strong></div>
                                                                                                <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">PO0005</div> 
                                                                                            </div>
                                                                                            <div className="d-flex align-items-center gap-2">
                                                                                                <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>Request Del.Date:</strong></div>
                                                                                                <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">25-Feb-2025</div> 
                                                                                            </div>
                                                                                            <div className="d-flex align-items-center gap-2">
                                                                                                <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>Del.Address:</strong></div>
                                                                                                <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">Jl Raya Bogor Km 24/24 RT 001/01, Jakarta</div> 
                                                                                            </div>
                                                                                            <div className="d-flex align-items-center gap-2">
                                                                                                <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-left"><strong>Del.Instruction:</strong></div> 
                                                                                                <div className="col-12 col-lg-8 col-md-8 col-sm-8 text-left">Need a quick delivery</div> 
                                                                                            </div> 
                                                                                        </div>
                                                                                    </Tooltip> 
                                                                                </td>  
                                                                                <td>
                                                                                    <Input type="text" onChange={(e) => handleQtyChange(index, e.target.value)} />
                                                                                </td>  
                                                                                <td className="text-center">
                                                                                    <Input type="text" onChange={(e) => handleQtyChange(index, e.target.value)} />
                                                                                </td>
                                                                            </tr>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="8" className="text-center text-muted">Please select customers and sales orders</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </Table> 
                                                        </div>  
                                                    </div>
                                                </Collapse>
                                            </div>
                                            <div className="accordion-item">
                                                <h2 className="accordion-header" id="headingFlushTwo" style={{backgroundColor:"#f6f6f9"}}>
                                                    <button
                                                        className={`accordion-button fw-medium ${!activeAccord.col2 ? "collapsed" : ""}`}
                                                        type="button"
                                                        onClick={() =>showAccord("col2")}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        Sale Order No. : SO002
                                                    </button>
                                                </h2>
                                                <Collapse isOpen={activeAccord.col2} className="accordion-collapse">
                                                    <div className="accordion-body">
                                                        <div className="table-responsive mt-1" >
                                                            <Table className="table mb-0">
                                                                <thead style={{backgroundColor:"#3e90e2"}}>
                                                                    <tr>
                                                                        <th className="text-center">S.No.</th> 
                                                                        
                                                                        <th className="text-center">Gas Code</th>
                                                                        <th className="text-center">SO Qty</th>
                                                                        <th className="text-center required-label">Pick Qty</th>
                                                                        <th className="text-center">Delivery Details</th> 
                                                                        <th className="text-center required-label">Driver Name</th> 
                                                                        <th className="text-center required-label">Truck No.</th> 
                                                                    </tr>
                                                                </thead>
                                                                <tbody> 
                                                                    { gasCodeList.length > 0 ? (
                                                                        gasCodeList.map((item, index) => (
                                                                            <tr key={index}>
                                                                                <td className="text-center align-middle"> {index+1}</td> 
                                                                                 
                                                                                <td><Input type="text" value={item.label} disabled /> </td>
                                                                                <td><Input type="text" value={item.description} disabled /> </td> 
                                                                                <td>
                                                                                    <Input type="number" value={item.Volume} onChange={(e) => handleVolumeChange(index, e.target.value)} disabled /> 
                                                                                </td>
                                                                                <td>
                                                                                    <Input type="text" value={item.Pressure} onChange={(e) => handlePressureChange(index, e.target.value)} disabled />
                                                                                </td>  
                                                                                <td>
                                                                                    <Input type="text" value={item.Qty} onChange={(e) => handleQtyChange(index, e.target.value)} />
                                                                                </td>  
                                                                                <td className="text-center">
                                                                                    <div className="avatar-xs" style={{margin:"auto"}}>
                                                                                        <span className="avatar-title rounded-circle bg-soft bg-info text-info font-size-14">
                                                                                            <i className="bx bx-plus-medical"></i></span>
                                                                                    </div> 
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                        ) : (
                                                                            <tr>
                                                                                <td colSpan="8" className="text-center text-muted">Please select customers and sales orders</td>
                                                                            </tr>
                                                                        )}
                                                                </tbody>
                                                            </Table> 
                                                        </div>  
                                                    </div>
                                                </Collapse>
                                            </div>
                                            <div className="accordion-item">
                                                <h2 className="accordion-header" id="headingFlushthree" style={{backgroundColor:"#cee3f8"}}>
                                                    <button
                                                        className={`accordion-button fw-medium ${!activeAccord.col3 ? "collapsed" : ""}`}
                                                        type="button"
                                                        onClick={() =>showAccord("col3")}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        Sale Order No. : SO010
                                                    </button> 
                                                </h2>
                                                <Collapse isOpen={activeAccord.col3} className="accordion-collapse">
                                                    <div className="accordion-body"> 
                                                        <div className="table-responsive mt-1" >
                                                            <Table className="table mb-0">
                                                                <thead style={{backgroundColor:"#3e90e2"}}>
                                                                    <tr>
                                                                        <th className="text-center">S.No.</th> 
                                                                        
                                                                        <th className="text-center">Gas Code</th>
                                                                        <th className="text-center">SO Qty</th>
                                                                        <th className="text-center required-label">Pick Qty</th>
                                                                        <th className="text-center">Delivery Details</th> 
                                                                        <th className="text-center required-label">Driver Name</th> 
                                                                        <th className="text-center required-label">Truck No.</th> 
                                                                    </tr>
                                                                </thead>
                                                                <tbody> 
                                                                    { gasCodeList.length > 0 ? (
                                                                        gasCodeList.map((item, index) => (
                                                                            <tr key={index}>
                                                                                <td className="text-center align-middle"> {index+1}</td> 
                                                                                 
                                                                                <td><Input type="text" value={item.label} disabled /> </td>
                                                                                <td><Input type="text" value={item.description} disabled /> </td> 
                                                                                <td>
                                                                                    <Input type="number" value={item.Volume} onChange={(e) => handleVolumeChange(index, e.target.value)} disabled /> 
                                                                                </td>
                                                                                <td>
                                                                                    <Input type="text" value={item.Pressure} onChange={(e) => handlePressureChange(index, e.target.value)} disabled />
                                                                                </td>  
                                                                                <td>
                                                                                    <Input type="text" value={item.Qty} onChange={(e) => handleQtyChange(index, e.target.value)} />
                                                                                </td>  
                                                                                <td className="text-center">
                                                                                    <div className="avatar-xs" style={{margin:"auto"}}>
                                                                                        <span className="avatar-title rounded-circle bg-soft bg-info text-info font-size-14">
                                                                                            <i className="bx bx-plus-medical"></i></span>
                                                                                    </div> 
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                        ) : (
                                                                            <tr>
                                                                                <td colSpan="8" className="text-center text-muted">Please select customers and sales orders</td>
                                                                            </tr>
                                                                        )}
                                                                </tbody>
                                                            </Table> 
                                                        </div>  
                                                    </div>
                                                </Collapse>
                                            </div>
                                        </div>
                                        <hr></hr>
                                    </Card>  
                                ))
                            ) : (
                                <p className="text-center text-muted">Please select a customer</p>
                            )}
                        </Row>
                    </Card>
                </Container>
            </div>
            <Modal isOpen={isModalOpen} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="-1" toggle={toggleModal} size="lg" >
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal}>SO Quantities</ModalHeader>
                    <ModalBody> 
                        <div className="table-responsive">
                            <Table className="table align-middle bg">
                                <thead>
                                    <tr className="table-light">
                                        <th className="text-center" scope="col">Date</th>
                                        <th className="text-center" scope="col">SO Qty</th>
                                        <th className="text-center" scope="col">Picked Qty</th>
                                        <th className="text-center" scope="col">Remaining Qty</th> 
                                        <th className="text-center" scope="col">Modified By</th> 
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="table-info">
                                        <td className="text-center" scope="col">10-Jan-2024</td>
                                        <td className="text-center" scope="col">200</td>
                                        <td className="text-center" scope="col">50</td>
                                        <td className="text-center" scope="col">150</td> 
                                        <td className="text-center" scope="col">John</td>  
                                    </tr> 
                                    <tr className="table-info">
                                        <td className="text-center" scope="col">10-Jan-2024</td>
                                        <td className="text-center" scope="col">200</td>
                                        <td className="text-center" scope="col">100</td>
                                        <td className="text-center" scope="col">50</td> 
                                        <td className="text-center" scope="col">Charles</td>  
                                    </tr> 
                                </tbody>
                            </Table>
                        </div>
                    </ModalBody> 
                </div>
            </Modal>
        </React.Fragment>
    );
};

export default AddDeliveryorder;
