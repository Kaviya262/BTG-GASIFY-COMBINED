import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Col, Container, Row, Button, FormGroup, Label, Input, Table, Tooltip,} from "reactstrap";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import {
    fetchSalesInvoiceCustomerList,
    fetchSalesInvoiceDOList,
    getPackingDetails,
} from "../../../common/data/mastersapi";
import {
    GetInvoiceDetails,
    CreatenewInvoice,
    UpdateInvoice,
} from "../../../common/data/invoiceapi";

const animatedComponents = makeAnimated();

const AddInvoices = () => {
    const history = useHistory();
    const { id } = useParams();
    const currentDate = new Date();
    const [branchId] = useState(1);
    const [customerList, setCustomerList] = useState([]);
    const [deliveryOrdersList, setDeliveryOrdersList] = useState([]);
    const [packingDetails, setPackingDetails] = useState([]);
    const [doDetail, setDoDetail] = useState([]);
    const [tooltipOpen, setTooltipOpen] = useState({});
    const [invoiceHeader, setInvoiceHeader] = useState({
        doid: "",
        id: 0,
        salesInvoiceNbr: 0,
        customerId: "",
        salesInvoiceDate: currentDate,
        totalAmount: 1,
        totalQty: 1,
        isSubmitted: 0,
        orgId: 1,
        branchId: 1,
        userId: 1,
    });

    // Fetch customer list on initial load
    useEffect(() => {
        const getCustomerList = async () => {
            try {
                const data = await fetchSalesInvoiceCustomerList(branchId);
                setCustomerList(data || []);
            } catch (err) {
                console.error("Error fetching customer list:", err.message);
                setCustomerList([]);
            }
        };

        getCustomerList();
        if (id) getInvoiceDetails(id);
    }, [branchId, id]);

    // Fetch delivery orders based on customer selection
    useEffect(() => {
        if (!invoiceHeader?.customerId) return;
        const getDeliveryOrders = async () => {
            try {
                const data = await fetchSalesInvoiceDOList(branchId, invoiceHeader.customerId);
                setDeliveryOrdersList(data || []);
            } catch (err) {
                console.error("Error fetching delivery orders:", err.message);
            }
        };

        getDeliveryOrders();
    }, [invoiceHeader?.customerId, branchId]);

    useEffect(() => {
        console.log(deliveryOrdersList);
    }, [deliveryOrdersList]);

    // Fetch packing details
    const fetchPackingDetails = useCallback(async (options) => {
        debugger;
        const promises = options.map((item) =>
            getPackingDetails(item.packingId, branchId).catch(() => [])
        );
        const results = await Promise.all(promises);
        const flattenedData = results.flat();
        setPackingDetails(flattenedData);
    }, [branchId]);

    // Handle delivery order selection
    const handleDOSelectChange = (options) => {
        if (!options || options.length === 0) {
            setPackingDetails([]);
            setDoDetail([]);
            return;
        }

        const updatedOptions = options.map((item) => ({
            ...item,
            id: 0,
            salesInvoicesId: 0,
            packingId: item.value,
        }));

        setDoDetail(updatedOptions);
        fetchPackingDetails(updatedOptions);
    };

    // Toggle Tooltip
    const toggleTooltip = (tid) => {
        setTooltipOpen((prev) => ({
            ...prev,
            [tid]: !prev[tid],
        }));
    };

    //Validation Schema
    const validationSchema = Yup.object().shape({
        salesInvoiceDate: Yup.string().required("Invoice date is required"),
        customerId: Yup.string().required("Customer is required"),
        doid: Yup.string().required("Delivery Order Ids are required"),
    });

    // Handle form submission
    const handleSubmit = async (values) => {
        const finalPayload = {
            invoiceHeader,
            packingDetails,
            doDetail,
        };

        try {
            let response;
            if (id > 0) {
                response = await UpdateInvoice(finalPayload);
            } else {
                response = await CreatenewInvoice(finalPayload);
            }
            console.log("Invoice successfully processed", response);
            history.push("/invoices");
        } catch (err) {
            console.error("Error creating/updating invoice:", err.message);
        }
    };

    // Fetch invoice details when editing
    const getInvoiceDetails = async (id) => {
        try {
            const data = await GetInvoiceDetails(id);
            setInvoiceHeader((prev) => ({
                ...prev,
                ...data.Header,
            }));
            setPackingDetails(data.Details || []);
        } catch (err) {
            console.error("Error fetching invoice details:", err.message);
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Sales" breadcrumbItem="Sales Invoice" />
                <Row>
                    <Col lg="12">
                        <Card>
                            <CardBody>
                                <Formik
                                    key={JSON.stringify(invoiceHeader)}
                                    initialValues={invoiceHeader}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({ errors, touched, setFieldValue }) => (
                                        <Form>
                                            <InvoiceFormFields
                                                errors={errors}
                                                touched={touched}
                                                setFieldValue={setFieldValue}
                                                customerList={customerList}
                                                deliveryOrdersList={deliveryOrdersList}
                                                invoiceHeader={invoiceHeader}
                                                setInvoiceHeader={setInvoiceHeader}
                                                handleDOSelectChange={handleDOSelectChange}
                                            />
                                            <PackingDetailsTable
                                                packingDetails={packingDetails}
                                                tooltipOpen={tooltipOpen}
                                                toggleTooltip={toggleTooltip}
                                            />
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

// 📦 Invoice Form Fields Component
const InvoiceFormFields = ({
    errors,
    touched,
    setFieldValue,
    customerList,
    deliveryOrdersList,
    invoiceHeader,
    setInvoiceHeader,
    handleDOSelectChange,
}) => (
    <Row>
         <Col md="6">
            <FormGroup>
                <Label>Sales Invoice Num.</Label>
                <Flatpickr
                    className="form-control"
                    options={{
                        defaultDate: data.salesinvoicenbr,
                    }}
                    onChange={(date) => setFieldValue("salesInvoiceDate", date[0])}
                />
                <ErrorMessage name="salesInvoiceDate" component="div" className="text-danger" />
            </FormGroup>
        </Col>
        <Col md="6">
            <FormGroup>
                <Label>Date</Label>
                <Flatpickr
                    className="form-control"
                    options={{
                        altInput: true,
                        altFormat: "d-M-Y",
                        dateFormat: "Y-m-d",
                        defaultDate: invoiceHeader.salesInvoiceDate,
                    }}
                    onChange={(date) => setFieldValue("salesInvoiceDate", date[0])}
                />
                <ErrorMessage name="salesInvoiceDate" component="div" className="text-danger" />
            </FormGroup>
        </Col>
        <Col md="6">
            <FormGroup>
                <Label>Customer</Label>
                <Select
                    name="customerId"
                    classNamePrefix="select"
                    isClearable
                    isSearchable
                    options={customerList.map((cus) => ({
                        value: cus.customerid,
                        label: cus.CustomerName,
                    }))}
                    onChange={(selected) =>
                        setInvoiceHeader((prev) => ({
                            ...prev,
                            customerId: selected ? selected.value : "",
                        }))
                    }
                    value={customerList.find((option) => option.value === invoiceHeader.customerId) || null}
                />
                <ErrorMessage name="customerId" component="div" className="text-danger" />
            </FormGroup>
        </Col>
        <Col md="12">
            <FormGroup>
                <Label>Delivery Orders</Label>
                <Select
                    name="doid"
                    classNamePrefix="select"
                    isMulti
                    isClearable
                    isSearchable
                    options={deliveryOrdersList.map((del) => ({
                        value: del.id,
                        label: del.id,
                    }))}
                    onChange={(selected) => handleDOSelectChange(selected)}
                />
                <ErrorMessage name="doid" component="div" className="text-danger" />
            </FormGroup>
        </Col>
    </Row>
);

// 📚 Packing Details Table
const PackingDetailsTable = ({ packingDetails, tooltipOpen, toggleTooltip }) => (
    <Table className="table mb-0">
        <thead className="bg-primary text-white">
            <tr>
                {["PO No.", "DO No.", "Gas Code", "Picked Qty", "UoM", "Currency", "Unit Price", "Total Price", "Price (IDR)", "Delivery Details"].map(
                    (header, index) => (
                        <th key={index} className="text-center">
                            {header}
                        </th>
                    )
                )}
            </tr>
        </thead>
        <tbody>
            {packingDetails.map((item, index) => (
                <PackingRow
                    key={index}
                    item={item}
                    index={index}
                    tooltipOpen={tooltipOpen}
                    toggleTooltip={toggleTooltip}
                />
            ))}
        </tbody>
    </Table>
);

// 🔥 Packing Row with Tooltip
const PackingRow = ({ item, index, tooltipOpen, toggleTooltip }) => {
    const formatPrice = (price) =>
        new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price || 0);

    const tooltipId = `gas-code-${index}`;
    const deliveryTooltipId = `delivery-${index}`;

    return (
        <tr>
            <td className="text-center">{item.poNumber}</td>
            <td className="text-center">{item.deliveryNumber}</td>
            <td className="text-center">
                <span
                    id={tooltipId}
                    className="btn-link"
                    style={{ cursor: "pointer", color: "blue" }}
                >
                    {item.GasName || ""}
                </span>
                <TooltipComponent
                    isOpen={tooltipOpen[tooltipId] || false}
                    target={tooltipId}
                    toggle={() => toggleTooltip(tooltipId)}
                    content={<GasTooltipContent item={item} />}
                />
            </td>
            <td className="text-center">{item.pickedQty || ""}</td>
            <td className="text-center">{item.UOM || ""}</td>
            <td className="text-center">{item.CurrencyName || ""}</td>
            <td className="text-end">{formatPrice(item.unitPrice)}</td>
            <td className="text-end">{formatPrice(item.price)}</td>
            <td className="text-end">{formatPrice(item.totalPrice)}</td>
            <td className="text-center">
                <span
                    id={deliveryTooltipId}
                    className="btn-link"
                    style={{ cursor: "pointer", color: "blue" }}
                >
                    Delivery Details
                </span>
                <TooltipComponent
                    isOpen={tooltipOpen[deliveryTooltipId] || false}
                    target={deliveryTooltipId}
                    toggle={() => toggleTooltip(deliveryTooltipId)}
                    content={<DeliveryTooltipContent item={item} />}
                />
            </td>
        </tr>
    );
};

// 🧰 Tooltip Wrapper
const TooltipComponent = ({ isOpen, target, toggle, content }) => (
    <Tooltip isOpen={isOpen} target={target} toggle={toggle} style={{ maxWidth: "300px", width:"300px" }}>
        {content}
    </Tooltip>
);

// 💡 Gas Tooltip Content
const GasTooltipContent = ({ item }) => (
    <div className="font-size-13">
        <div>
            <strong>Volume:</strong> {item.Volume || ""}
        </div>
        <div>
            <strong>Pressure:</strong> {item.Pressure || ""}
        </div>
        <div>
            <strong>Description:</strong> {item.GasDescription || ""}
        </div>
    </div>
);

// 🚚 Delivery Tooltip Content
const DeliveryTooltipContent = ({ item }) => (
    <div className="font-size-13">
        <div>
            <strong>Delivery Address:</strong> {item.deliveryAddress || ""}
        </div>
        <div>
            <strong>Driver Name:</strong> {item.driverName || ""}
        </div>
        <div>
            <strong>Truck Name:</strong> {item.truckName || ""}
        </div>
        <div>
            <strong>Delivery Instruction:</strong> {item.deliveryInstruction || ""}
        </div>
    </div>
);

export default AddInvoices;
