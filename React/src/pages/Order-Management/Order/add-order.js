import React, { useState } from "react";
import { Card, CardBody, Col, Collapse, Container, Row, Button, Form, FormGroup, Label, Input, Table, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useHistory } from "react-router-dom";
import Select from "react-select"
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated()

const optionGroup = [
    { label: "QA001", value: "1" },
    { label: "QA002", value: "2" },
    { label: "QA003", value: "3" },
    { label: "QA004", value: "4" },
];

const quotationlist = [{
    sqType: "00001",
    salesPerson: "test",
    Customer: "test_customer",
    Email: "test@gmail.com",
    systemSeqno: "00002",
    salesContact: "john",
    mainAddress1: "test_address",
    customerAttention: "example",
    sqNo: "123456",
    salesEmail: "sales@test.com",
    mainAddress2: "sample_address",
    paymentTerm: "test_tern",
    sqDate: "13-01-2025",
    deliveryTerms: "test",
    phoneNo: "123456789",
    paymentMethod: "Cash",
    quoteSubject: "test",
    quoteValidity: "6_months",
    faxNo: "000000",
    remark: "testing",
    quotationItems: 
        [
            {
                gasCode:"CGARHE",
                description:"Comp Gas Argon 25% Helium SG ",
                volume:"1",
                pressure:"80",
                qty:"100",
                uom:"CYL",
                currency:"IDR",
                unitPrice:"100.00",
                totPrice:"10000.00",
            },
            {
                gasCode:"LQAR-KGS ",
                description:"Liquid Argon KGS 99.999% ",
                volume:"1",
                pressure:"75",
                qty:"5",
                uom:"KGS",
                currency:"INR",
                unitPrice:"25.00",
                totPrice:"125.00",
            },
            {
                gasCode:"LQCO2-KGS",
                description:"Liquid Carbondioxide KGS 99.999% ",
                volume:"1",
                pressure:"99",
                qty:"80",
                uom:"KGS",
                currency:"USD",
                unitPrice:"100.00",
                totPrice:"8000.00",
            },
            {
                gasCode:"LQO2-KGS ",
                description:"Liquid Oxygen KGS 99.999% ",
                volume:"1",
                pressure:"65",
                qty:"200",
                uom:"KGS",
                currency:"IDR",
                unitPrice:"100.00",
                totPrice:"20000.00",
            } 
        ],
    },
    {
        sqType: "00002",
        salesPerson: "test",
        Customer: "test_customer2",
        Email: "test222@gmail.com",
        systemSeqno: "000022",
        salesContact: "john",
        mainAddress1: "test_address2",
        customerAttention: "example2",
        sqNo: "12345622",
        salesEmail: "sales@test.com",
        mainAddress2: "sample_address",
        paymentTerm: "test_tern",
        sqDate: "13-01-2025",
        deliveryTerms: "test",
        phoneNo: "123456789",
        paymentMethod: "Cash",
        quoteSubject: "test",
        quoteValidity: "6_months",
        faxNo: "000000",
        remark: "testing",
        quotationItems: [
            {
                gasCode:"CGARHE",
                description:"Comp Gas Argon 25% Helium SG ",
                volume:"1",
                pressure:"80",
                qty:"100",
                uom:"CYL",
                currency:"IDR",
                unitPrice:"100.00",
                totPrice:"10000.00",
            },
            {
                gasCode:"LQAR-KGS ",
                description:"Liquid Argon KGS 99.999% ",
                volume:"1",
                pressure:"75",
                qty:"5",
                uom:"KGS",
                currency:"INR",
                unitPrice:"25.00",
                totPrice:"125.00",
            },
            {
                gasCode:"LQCO2-KGS",
                description:"Liquid Carbondioxide KGS 99.999% ",
                volume:"1",
                pressure:"99",
                qty:"80",
                uom:"KGS",
                currency:"USD",
                unitPrice:"100.00",
                totPrice:"8000.00",
            },
            {
                gasCode:"LQO2-KGS ",
                description:"Liquid Oxygen KGS 99.999% ",
                volume:"1",
                pressure:"65",
                qty:"200",
                uom:"KGS",
                currency:"IDR",
                unitPrice:"100.00",
                totPrice:"20000.00",
            } 
        ]
    }
];

// Import Breadcrumb
import Breadcrumbs from "../../../components/Common/Breadcrumb";

const AddOrder = () =>{
    
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const [currencySelect, setcurrencySelect] = useState("AUD");
    const [isModalOpen, setIsModalOpen] = useState(false); // Manage modal open/close state 
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const history = useHistory();
    const [activeAccord, setActiveAccord] = useState({
        col1: true,
        col2: false,
    });

    const [quotationDetails, setQuotationDetails] = useState([
        { Code: null, description: "Pure Ar Grade 99.999%",volume:"1",pressure:"99", sqqty: 200, qty: "", uom: "KGs",currency:"IDR", unitPrice:100.00, totPrice: 100.00 },
        { Code: null, description: "Pure Ar Grade 99.999%",volume:"1",pressure:"99", sqqty: 150, qty: "", uom: "KGs",currency:"IDR", unitPrice:100.00, totPrice: 100.00 },
    ]);

    const [CodeList] = useState([
        { name: "AIR47L", code: "1", description: "AIR 47L" },
        { name: "AMMONIA", code: "2", description: "AMMONIA GAS" },
        { name: "AR 99.999%", code: "3", description: "Pure Ar Grade 99.999%" },
        { name: "BLNGAS", code: "4", description: "Balloon Gas General" },
        { name: "CGARHE", code: "5", description: "Comp Gas Argon 25% Helium SG " },
    ]);

    const [CustomerList] = useState([
        { label: "Mitra Energi Batam", value: "1" },
        { label: "Sealico Gas Energy Pte Ltd", value: "2" },
    ]);

    const [salesPersonList] = useState([
        { name: "JULI", code: "1" },
        { name: "UMA", code: "2" },
        { name: "SANDY", code: "3" },
        { name: "PATRICK", code: "4" },
    ]);

    const [PaymentTermList] = useState([
        { name: "120DAYSTT", code: "1" },
        { name: "30DAYCHQ", code: "2" },
        { name: "30DAYSCRDT", code: "3" },
    ]);

    const [PaymentMethodList] = useState([
        { name: "1 1/2 M", code: "1" },
        { name: "1 MONTH", code: "2" },
        { name: "1 W AD", code: "3" },
    ]);

    const [CurrencyList] = useState([
        { name: "AUD", code: "AUD" },
        { name: "CNY", code: "CNY" },
        { name: "EUR", code: "EUR" },
        { name: "IDR", code: "IDR" },
        { name: "INR", code: "INR" },
    ]);

    const [UOMList] = useState([
        { name: "CYL", code: "1" },
        { name: "DAYS", code: "2" },
        { name: "KGS", code: "3" },
        { name: "M3", code: "4" },
        { name: "PCS", code: "5" },
        { name: "QTY", code: "6" },
    ]);

    const showAccord = (activeItem) =>{
        setActiveAccord((prevState) => ({
            col1: activeItem === "col1" ? !prevState.col1 : false,
            col2: activeItem === "col2" ? !prevState.col2 : false,
        }));
    };

    const handleCodeChange = (index, selectedCode) =>{
        const updatedDetails = [...quotationDetails];
        const code = CodeList.find((c) =>c.code === selectedCode);
        updatedDetails[index].Code = code;
        updatedDetails[index].description = code ? code.description : "";
        setQuotationDetails(updatedDetails);
    };

    const handleVolumeChange = (index, value) =>{
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].volume = value;
        setQuotationDetails(updatedDetails);
    };

    const handlePressureChange = (index, value) =>{
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].pressure = value;
        setQuotationDetails(updatedDetails);
    };

    const handleQtyChange = (index, qty) =>{
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].qty = qty;
        setQuotationDetails(updatedDetails);
    };

    const handleCurrencyChange = (index, value) => {
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].currency = CurrencyList.find((u) => u.code === value);
        console.log('sss', updatedDetails)
        setcurrencySelect(value);
        setQuotationDetails(updatedDetails);
    };

    const handleUOMChange = (index, uom) =>{
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].uom = UOMList.find((u) =>u.code === uom);
        setQuotationDetails(updatedDetails);
    };

    const handlePriceChange = (index, price) =>{
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].Price = price;
        setQuotationDetails(updatedDetails);
    };

    const handleUnitPriceChange = (index, uprice) =>{
        const updatedDetails = [...quotationDetails];
        updatedDetails[index].unitPrice = uprice;
        setQuotationDetails(updatedDetails);
    }; 

    const handleAddItem = () =>{
        setQuotationDetails([
        ...quotationDetails,
        { Code: null, description: "", qty: 1, uom: null, totPrice: 0 },
        ]);
    };

    const handleRemoveItem = (index) =>{
        const updatedDetails = quotationDetails.filter((_, i) =>i !== index);
        setQuotationDetails(updatedDetails);
    };

    const handleCancel = () =>{ 
        history.push("/manage-order");
    };

    const handleMulti=(value)=>{
        console.log("selected",value) 
    } 

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid> 
                    <Breadcrumbs title="Sales" breadcrumbItem="Sales Order" />
                    <Row>
                        <Card>
                            <Row>
                                <Col xl={12}>
                                    <div className="row mt-2">
                                        <div className="col-md-3">
                                            <div className="form-floating mb-3">
                                                <Col md="12">
                                                    <label className="control-label">Customer</label>
                                                    <Select
                                                        className="basic-single"
                                                        classNamePrefix="select"
                                                        isDisabled={isDisabled}
                                                        isLoading={isLoading}
                                                        isClearable={isClearable}
                                                        isRtl={isRtl}
                                                        isSearchable={isSearchable}
                                                        name="color"
                                                        options={CustomerList}
                                                    />
                                                </Col>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-floating mb-3">
                                                <Col md="12">
                                                    <label className="control-label">Quotations </label>
                                                    <Select
                                                        className="basic-single"
                                                        classNamePrefix="select"
                                                        isDisabled={isDisabled}
                                                        isLoading={isLoading}
                                                        isClearable={isClearable}
                                                        isRtl={isRtl}
                                                        isSearchable={isSearchable}
                                                        name="color"
                                                        options={optionGroup}
                                                        isMulti
                                                    />
                                                </Col>
                                            </div>
                                        </div>
                                        <div className="col-md-6 justify-content-end text-end" style={{marginTop:"28px"}}> 
                                            <div className="button-items" style={{marginRight:"22px"}}>
                                                <button type="button" className="btn btn-info" onClick={handleCancel}><i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>Save</button>
                                                <button type="button" className="btn btn-success" onClick={handleCancel}><i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>Post</button>
                                                <button type="button" className="btn btn-danger" onClick={handleCancel}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                            </div>  
                                        </div> 
                                    </div>
                                    <div className="mt-1">
                                        <div className="accordion accordion-flush" id="accordionFlushExample"> 
                                            <div className="accordion-item">
                                                <h2 className="accordion-header" id="headingFlushOne" style={{backgroundColor:"#f6f6f9"}}>
                                                    <button
                                                        className={`accordion-button fw-medium ${!activeAccord.col1 ? "collapsed" : ""}`}
                                                        type="button"
                                                        onClick={() =>showAccord("col1")}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        Sale Quotation No. : QA001
                                                    </button>
                                                </h2>
                                                <Collapse isOpen={activeAccord.col1} className="accordion-collapse">
                                                    <div className="accordion-body">
                                                        <div className="col-12">
                                                            <table className="table mb-0 table">
                                                            <tbody>
                                                                <tr className="table-light">
                                                                    <td>SQ Type </td><td className="text-left fw-bold">Type One</td>
                                                                    <td>Main Address  </td><td className="text-left fw-bold"> Test Address, IK Road</td>  
                                                                    <td>Customer Attention</td><td className="text-left fw-bold">Sample Test Message</td>
                                                                    <td>Sales Person</td><td className="text-left fw-bold">John</td>
                                                                </tr> 
                                                                <tr className="table-info">
                                                                    <td>System Seq. No.</td><td className="text-left fw-bold">1001</td>
                                                                    <td>Delivery Address</td><td className="text-left fw-bold">Test Address, IK Road</td>
                                                                    <td>Quote Validity </td><td className="text-left fw-bold">3 Months</td>
                                                                    <td>Sales Person Contact</td><td className="text-left fw-bold">97899998</td>
                                                                </tr> 
                                                                <tr className="table-light">
                                                                    <td>Manual SQ No.</td><td className="text-left fw-bold">SQ002</td> 
                                                                    <td>Phone No. </td><td className="text-left fw-bold">65875555</td> 
                                                                    <td>Delivery Terms</td><td className="text-left fw-bold">test delivery terms</td>
                                                                    <td>Sales Person Email</td><td className="text-left fw-bold">sales@test.com</td>
                                                                </tr>  
                                                                <tr className="table-info">
                                                                    <td>SQ Date </td><td className="text-left fw-bold">15-Jan-2024</td> 
                                                                    <td>Fax No. </td><td className="text-left fw-bold">00000</td> 
                                                                    <td>Payment Terms </td><td className="text-left fw-bold">Test Terms</td>
                                                                    <td>Created By / Date</td><td className="text-left fw-bold">Kumar <br /> 15-Jan-2024</td>
                                                                </tr>
                                                                <tr className="table-light">
                                                                    <td>Quote Subject </td><td className="text-left fw-bold">00002</td> 
                                                                    <td>Email</td><td className="text-left fw-bold">customer@testing.com</td>  
                                                                    <td>Payment Method</td><td className="text-left fw-bold">Cash</td>
                                                                    <td>Modified By / Date</td><td className="text-left fw-bold">Kumar <br /> 15-Jan-2024</td>
                                                                </tr> 
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className="table-responsive">
                                                            <Table className="table mb-0">
                                                                <thead style={{backgroundColor:"#3e90e2"}}>
                                                                    <tr>
                                                                        <th className="text-center"><span style={{cursor:"pointer",alignItems:"center"}}>
                                                                        Action
                                                                        </span></th>
                                                                        <th className="text-center" >Code</th>
                                                                        <th className="text-center">Description</th>
                                                                        <th className="text-center" style={{width:"8%"}}>Volume</th>
                                                                        <th className="text-center" style={{width:"8%"}}>Pressure</th>
                                                                        <th className="text-center">SQ Qty</th>
                                                                        <th className="text-center" style={{width:"8%"}}>Pick Qty</th>
                                                                        <th className="text-center" style={{width:"8%"}}>UOM</th>
                                                                        <th className="text-center" >Currency</th>
                                                                        <th className="text-center" style={{width:"8%"}}>Unit Price</th>
                                                                        <th className="text-center" style={{width:"9%"}}>Total Price</th>
                                                                        <th className="text-center" style={{width:"9%"}}>Price (IDR)</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody key="s">
                                                                    {quotationDetails.map((item, index) =>( 
                                                                    <tr key={index}>
                                                                        <td>
                                                                            <span color="danger" className="btn-sm" onClick={() => handleRemoveItem(index)} title="Delete">
                                                                                <i className="mdi mdi-trash-can-outline label-icon align-middle"  title="Delete" />
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <Input
                                                                            type="select"
                                                                            value={item.Code ? item.Code.code : ""}
                                                                            onChange={(e) =>handleCodeChange(index, e.target.value)}
                                                                            >
                                                                            {CodeList.map((code) =>(
                                                                                <option key={code.code} value={code.code}>
                                                                                {code.name}
                                                                                </option>
                                                                            ))}
                                                                            </Input>
                                                                        </td>
                                                                        <td>
                                                                            <Input type="text" value={item.description} disabled />
                                                                        </td>
                                                                        <td>
                                                                            <Input type="number" value={item.volume} onChange={(e) =>handleVolumeChange(index, e.target.value)} disabled/>
                                                                        </td>
                                                                        <td>
                                                                            <Input type="text" value={item.pressure} onChange={(e) =>handlePressureChange(index, e.target.value)} disabled />
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {/* <Input type="number" value={item.qty} onChange={(e) =>handleQtyChange(index, e.target.value)} /> */}
                                                                            <span onClick={toggleModal} style={{ cursor: "pointer", color: "blue"}} className="btn-rounded btn btn-link">{item.sqqty}</span>
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <Input type="number" onChange={(e) =>handleQtyChange(index, e.target.value)} /> 
                                                                        </td>
                                                                        <td>
                                                                            <Input type="select" disabled value={item.uom ? item.uom.code : ""} onChange={(e) =>handleUOMChange(index, e.target.value)} >
                                                                                {UOMList.map((uom) =>(
                                                                                    <option key={uom.code} value={uom.code}>
                                                                                    {uom.name}
                                                                                    </option>
                                                                                ))}
                                                                            </Input>
                                                                        </td>
                                                                        <td>
                                                                            <Input type="select" value={item.currency ? item.currency.code : ""} onChange={(e) =>handleCurrencyChange(index, e.target.value)} >
                                                                                {CurrencyList.map((currency) =>(
                                                                                    <option key={currency.code} value={currency.code}>
                                                                                    {currency.name}
                                                                                    </option>
                                                                                ))}                                                                
                                                                            </Input>
                                                                        </td>
                                                                        <td>
                                                                            <Input type="number" value={item.unitPrice} onChange={(e) =>handleUnitPriceChange(index, e.target.value)}  />
                                                                        </td>
                                                                        <td>
                                                                            <Input type="text" disabled />
                                                                        </td> 
                                                                        <td>
                                                                            <Input type="number" value={item.Price} onChange={(e) =>handlePriceChange(index, e.target.value)} disabled/>
                                                                        </td>
                                                                    </tr>
                                                                     
                                                                    ))}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </Collapse>
                                            </div>
                                            <div className="accordion-item">
                                                <h2 className="accordion-header" id="headingFlushTwo" style={{backgroundColor:"#cee3f8"}}>
                                                    <button
                                                        className={`accordion-button fw-medium ${!activeAccord.col2 ? "collapsed" : ""}`}
                                                        type="button"
                                                        onClick={() =>showAccord("col2")}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        Sale Quotation No. : QA002
                                                    </button>
                                                </h2>
                                                <Collapse isOpen={activeAccord.col2} className="accordion-collapse">
                                                    <div className="accordion-body">
                                                        <div className="col-12">
                                                            <table className="table mb-0 table">
                                                            <tbody>
                                                                <tr className="table-light">
                                                                    <td>SQ Type </td><td className="text-left fw-bold">Type One</td>
                                                                    <td>Main Address  </td><td className="text-left fw-bold"> Test Address, IK Road</td>  
                                                                    <td>Customer Attention</td><td className="text-left fw-bold">Sample Test Message</td>
                                                                    <td>Sales Person</td><td className="text-left fw-bold">John</td>
                                                                </tr> 
                                                                <tr className="table-info">
                                                                    <td>System Seq. No.</td><td className="text-left fw-bold">1001</td>
                                                                    <td>Delivery Address</td><td className="text-left fw-bold">Test Address, IK Road</td>
                                                                    <td>Quote Validity </td><td className="text-left fw-bold">3 Months</td>
                                                                    <td>Sales Person Contact</td><td className="text-left fw-bold">97899998</td>
                                                                </tr> 
                                                                <tr className="table-light">
                                                                    <td>Manual SQ No.</td><td className="text-left fw-bold">SQ002</td> 
                                                                    <td>Phone No. </td><td className="text-left fw-bold">65875555</td> 
                                                                    <td>Delivery Terms</td><td className="text-left fw-bold">test delivery terms</td>
                                                                    <td>Sales Person Email</td><td className="text-left fw-bold">sales@test.com</td>
                                                                </tr>  
                                                                <tr className="table-info">
                                                                    <td>SQ Date </td><td className="text-left fw-bold">15-Jan-2024</td> 
                                                                    <td>Fax No. </td><td className="text-left fw-bold">00000</td> 
                                                                    <td>Payment Terms </td><td className="text-left fw-bold">Test Terms</td>
                                                                    <td>Created By / Date</td><td className="text-left fw-bold">Kumar <br /> 15-Jan-2024</td>
                                                                </tr>
                                                                <tr className="table-light">
                                                                    <td>Quote Subject </td><td className="text-left fw-bold">00002</td> 
                                                                    <td>Email</td><td className="text-left fw-bold">customer@testing.com</td>  
                                                                    <td>Payment Method</td><td className="text-left fw-bold">Cash</td>
                                                                    <td>Modified By / Date</td><td className="text-left fw-bold">Charles <br /> 15-Jan-2024</td>
                                                                </tr> 
                                                                </tbody> 
                                                            </table>
                                                        </div>

                                                        <div className="table-responsive">
                                                            <Table className="table mb-0">
                                                                <thead style={{backgroundColor:"#3e90e2"}}>
                                                                    <tr>
                                                                        <th className="text-center"><span style={{cursor:"pointer",alignItems:"center"}}>
                                                                        Action
                                                                        </span></th>
                                                                        <th className="text-center" >Code</th>
                                                                        <th className="text-center">Description</th>
                                                                        <th className="text-center" style={{width:"8%"}}>Volume</th>
                                                                        <th className="text-center" style={{width:"8%"}}>Pressure</th>
                                                                        <th className="text-center">SQ Qty</th>
                                                                        <th className="text-center" style={{width:"8%"}}>Pick Qty</th>
                                                                        <th className="text-center" style={{width:"8%"}}>UOM</th>
                                                                        <th className="text-center" >Currency</th>
                                                                        <th className="text-center" style={{width:"8%"}}>Unit Price</th>
                                                                        <th className="text-center" style={{width:"9%"}}>Total Price</th>
                                                                        <th className="text-center" style={{width:"9%"}}>Price (IDR)</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody key="s">
                                                                    {quotationDetails.map((item, index) =>( 
                                                                    <tr key={index}>
                                                                        <td>
                                                                            <span color="danger" className="btn-sm" onClick={() => handleRemoveItem(index)} title="Delete">
                                                                                <i className="mdi mdi-trash-can-outline label-icon align-middle"  title="Delete" />
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <Input
                                                                            type="select"
                                                                            value={item.Code ? item.Code.code : ""}
                                                                            onChange={(e) =>handleCodeChange(index, e.target.value)}
                                                                            >
                                                                            {CodeList.map((code) =>(
                                                                                <option key={code.code} value={code.code}>
                                                                                {code.name}
                                                                                </option>
                                                                            ))}
                                                                            </Input>
                                                                        </td>
                                                                        <td>
                                                                            <Input type="text" value={item.description} disabled />
                                                                        </td>
                                                                        <td>
                                                                            <Input type="number" value={item.volume} onChange={(e) =>handleVolumeChange(index, e.target.value)} disabled/>
                                                                        </td>
                                                                        <td>
                                                                            <Input type="text" value={item.pressure} onChange={(e) =>handlePressureChange(index, e.target.value)} disabled />
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {/* <Input type="number" value={item.qty} onChange={(e) =>handleQtyChange(index, e.target.value)} /> */}
                                                                            <span onClick={toggleModal} style={{ cursor: "pointer", color: "blue"}} className="btn-rounded btn btn-link">{item.sqqty}</span>
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <Input type="number" onChange={(e) =>handleQtyChange(index, e.target.value)} /> 
                                                                        </td>
                                                                        <td>
                                                                            <Input type="select" disabled  value={item.uom ? item.uom.code : ""} onChange={(e) =>handleUOMChange(index, e.target.value)} >
                                                                                {UOMList.map((uom) =>(
                                                                                    <option key={uom.code} value={uom.code}>
                                                                                    {uom.name}
                                                                                    </option>
                                                                                ))}
                                                                            </Input>
                                                                        </td>
                                                                        <td>
                                                                            <Input type="select" value={item.currency ? item.currency.code : ""} onChange={(e) =>handleCurrencyChange(index, e.target.value)} >
                                                                                {CurrencyList.map((currency) =>(
                                                                                    <option key={currency.code} value={currency.code}>
                                                                                    {currency.name}
                                                                                    </option>
                                                                                ))}                                                                
                                                                            </Input>
                                                                        </td>
                                                                        <td>
                                                                            <Input type="number" value={item.unitPrice} onChange={(e) =>handleUnitPriceChange(index, e.target.value)}  />
                                                                        </td>
                                                                        <td>
                                                                            <Input type="text" disabled />
                                                                        </td> 
                                                                        <td>
                                                                            <Input type="text" value={item.Price} onChange={(e) =>handlePriceChange(index, e.target.value)} disabled/>
                                                                        </td>
                                                                    </tr>
                                                                     
                                                                    ))}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </Collapse>
                                            </div>
                                        </div> 
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Row>
                </Container>
            </div>
            <Modal isOpen={isModalOpen} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="-1" toggle={toggleModal} size="lg" >
                <div className="modal-content">
                    <ModalHeader toggle={toggleModal}>SQ Quantities</ModalHeader>
                    <ModalBody> 
                        <div className="table-responsive">
                            <Table className="table align-middle bg">
                                <thead>
                                    <tr className="table-light">
                                        <th className="text-center" scope="col">Date</th>
                                        <th className="text-center" scope="col">SQ Qty</th>
                                        <th className="text-center" scope="col">Picked Qty</th>
                                        <th className="text-center" scope="col">Remaining Qty</th>
                                        {/* <th className="text-center" scope="col">Modified Date</th>  */}
                                        <th className="text-center" scope="col">Modified By</th> 
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="table-info">
                                        <td className="text-center" scope="col">10-Jan-2024</td>
                                        <td className="text-center" scope="col">200</td>
                                        <td className="text-center" scope="col">50</td>
                                        <td className="text-center" scope="col">150</td>
                                        {/* <td className="text-center" scope="col">12-Jan-2024</td> */}
                                        <td className="text-center" scope="col">John</td>  
                                    </tr> 
                                    <tr className="table-info">
                                        <td className="text-center" scope="col">10-Jan-2024</td>
                                        <td className="text-center" scope="col">200</td>
                                        <td className="text-center" scope="col">100</td>
                                        <td className="text-center" scope="col">50</td>
                                        {/* <td className="text-center" scope="col">12-Jan-2024</td> */}
                                        <td className="text-center" scope="col">Charles</td>  
                                    </tr> 
                                </tbody>
                            </Table>
                        </div>
                    </ModalBody>
                    {/* <ModalFooter>
                        <Button type="button" color="secondary" onClick={toggleModal}>
                            Close
                        </Button>
                    </ModalFooter> */}
                </div>
            </Modal>
        </React.Fragment>
         
    );
};

export default AddOrder;
