import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Label,
    Input,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Table,
} from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import classnames from "classnames";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// --- API IMPORTS ---
import {
    GetAllGRNList,
    GetAllIRNList,
    GetAllSuppliers,
    GetAllCurrencies,
    GenerateSPC
} from "../../common/data/mastersapi";

const AP = () => {
    // --- Auth Context (From LocalStorage) ---
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    const orgId = authUser?.orgId || 1;
    const branchId = authUser?.branchId || 1;
    const userId = authUser?.u_id || 1;

    // --- States ---
    const [activeTab, setActiveTab] = useState("1"); // 1 = Accrued, 2 = Payable
    const [filter, setFilter] = useState({
        supplier: null,
        currency: null,
        fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of current month
        toDate: new Date(),
    });

    // Dropdown Data
    const [supplierList, setSupplierList] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);

    // Grid Data
    const [accruedData, setAccruedData] = useState([]);
    const [payableData, setPayableData] = useState([]);
    const [selectedPayables, setSelectedPayables] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- 1. Load Dropdowns on Mount ---
    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                // Fetch Suppliers
                const supRes = await GetAllSuppliers(orgId, branchId);
                if (supRes?.data) {
                    const sups = supRes.data.map(s => ({ value: s.SupplierId, label: s.SupplierName }));
                    setSupplierList(sups);
                }

                // Fetch Currencies
                const curRes = await GetAllCurrencies({});
                if (curRes?.data) {
                    const curs = curRes.data.map(c => ({ value: c.CurrencyId, label: c.CurrencyCode }));
                    setCurrencyList(curs);
                }
            } catch (error) {
                console.error("Error loading dropdowns", error);
            }
        };
        loadDropdowns();
    }, [orgId, branchId]);

    // --- Helper: Format Date ---
    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    // --- 2. Fetch Data Function (Wrapped in useCallback) ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const fromDateStr = formatDate(filter.fromDate);
            const toDateStr = formatDate(filter.toDate);
            const supplierId = filter.supplier ? filter.supplier.value : 0;
            // const currencyId = filter.currency ? filter.currency.value : 0; 

            if (activeTab === "1") {
                // --- FETCH ACCRUED PURCHASES (GRN) ---
                const response = await GetAllGRNList(supplierId, 0, orgId, branchId, userId);

                if (response?.data) {
                    setAccruedData(response.data);
                } else {
                    setAccruedData([]);
                }

            } else {
                // --- FETCH ACCOUNTS PAYABLE (IRN) ---
                const response = await GetAllIRNList(
                    branchId,
                    orgId,
                    supplierId,
                    0, // irnId
                    fromDateStr,
                    toDateStr,
                    userId
                );

                if (response?.data) {
                    setPayableData(response.data);
                } else {
                    setPayableData([]);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [activeTab, filter.fromDate, filter.toDate, filter.supplier, orgId, branchId, userId]);

    // --- 3. Load Grid Data based on dependencies ---
    useEffect(() => {
        fetchData();
    }, [fetchData]); // Dependency is now the memoized function

    // --- Handlers ---
    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            setSelectedPayables([]); // Clear selections when switching tabs
        }
    };

    const handleFilterChange = (key, value) => {
        setFilter((prev) => ({ ...prev, [key]: value }));
    };

    const handleCheckboxChange = (id) => {
        setSelectedPayables((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPayables(payableData.map((item) => item.IRNId || item.Id));
        } else {
            setSelectedPayables([]);
        }
    };

    // --- ACTION: CREATE SUPPLIER PAYMENT CLAIM ---
    const handleCreatePaymentClaim = async () => {
        if (selectedPayables.length === 0) {
            toast.warning("Please select at least one Invoice (IRN) to create a claim.");
            return;
        }

        try {
            const payload = {
                Ids: selectedPayables,
                OrgId: orgId,
                BranchId: branchId,
                UserId: userId,
                CreatedDate: new Date().toISOString()
            };

            const response = await GenerateSPC(payload);

            if (response && response.status) {
                toast.success("Supplier Payment Claims generated and approved successfully!");
                fetchData(); // Refresh grid
                setSelectedPayables([]);
            } else {
                toast.error(response?.message || "Failed to generate claims.");
            }
        } catch (error) {
            console.error("Error generating SPC:", error);
            toast.error("An error occurred while creating claims.");
        }
    };

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Finance" breadcrumbItem="Accounts Payable (AP)" />

                {/* --- FILTERS --- */}
                <Card>
                    <CardBody>
                        <Row>
                            <Col md={3}>
                                <div className="mb-3">
                                    <Label>Supplier</Label>
                                    <Select
                                        options={supplierList}
                                        value={filter.supplier}
                                        onChange={(opt) => handleFilterChange("supplier", opt)}
                                        isClearable
                                        placeholder="Select Supplier"
                                    />
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="mb-3">
                                    <Label>Currency</Label>
                                    <Select
                                        options={currencyList}
                                        value={filter.currency}
                                        onChange={(opt) => handleFilterChange("currency", opt)}
                                        isClearable
                                        placeholder="Select Currency"
                                    />
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="mb-3">
                                    <Label>From Date</Label>
                                    <Flatpickr
                                        className="form-control"
                                        value={filter.fromDate}
                                        onChange={(date) => handleFilterChange("fromDate", date[0])}
                                        options={{ dateFormat: "Y-m-d" }}
                                    />
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="mb-3">
                                    <Label>To Date</Label>
                                    <Flatpickr
                                        className="form-control"
                                        value={filter.toDate}
                                        onChange={(date) => handleFilterChange("toDate", date[0])}
                                        options={{ dateFormat: "Y-m-d" }}
                                    />
                                </div>
                            </Col>
                            <Col md={12} className="d-flex justify-content-end">
                                <Button color="primary" onClick={fetchData} disabled={loading}>
                                    {loading ? <i className="bx bx-loader bx-spin me-1"></i> : <i className="bx bx-search-alt-2 me-1"></i>}
                                    Search
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                {/* --- TABS --- */}
                <Card>
                    <CardBody>
                        <Nav tabs className="nav-tabs-custom">
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "1" })}
                                    onClick={() => toggleTab("1")}
                                    style={{ cursor: "pointer" }}
                                >
                                    <span className="d-block d-sm-none"><i className="fas fa-home"></i></span>
                                    <span className="d-none d-sm-block">Accrued Purchases (GRN)</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === "2" })}
                                    onClick={() => toggleTab("2")}
                                    style={{ cursor: "pointer" }}
                                >
                                    <span className="d-block d-sm-none"><i className="far fa-user"></i></span>
                                    <span className="d-none d-sm-block">Accounts Payable (IRN)</span>
                                </NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab={activeTab} className="p-3 text-muted">

                            {/* TAB 1: ACCRUED PURCHASES */}
                            <TabPane tabId="1">
                                <Row>
                                    <Col sm="12">
                                        <div className="table-responsive">
                                            <Table className="table table-bordered mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Reference (GRN)</th>
                                                        <th>PO Number</th>
                                                        <th>Supplier</th>
                                                        <th className="text-end">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr><td colSpan="5" className="text-center">Loading...</td></tr>
                                                    ) : accruedData.length > 0 ? (
                                                        accruedData.map((item, key) => (
                                                            <tr key={key}>
                                                                {/* Adjust keys below based on actual API response properties */}
                                                                <td>{item.GrnDate ? formatDate(item.GrnDate) : "-"}</td>
                                                                <td>{item.GrnNumber || item.GRNNO}</td>
                                                                <td>
                                                                    {item.PONumber ? (
                                                                        <Link to={`/procurementspurchase-order/${item.POId}`} className="text-primary font-weight-bold">
                                                                            {item.PONumber}
                                                                        </Link>
                                                                    ) : "-"}
                                                                </td>
                                                                <td>{item.SupplierName}</td>
                                                                <td className="text-end">
                                                                    {new Intl.NumberFormat().format(item.TotalAmount || 0)}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center">No Accrued Purchases Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Col>
                                </Row>
                            </TabPane>

                            {/* TAB 2: ACCOUNTS PAYABLE */}
                            <TabPane tabId="2">
                                <Row>
                                    <Col sm="12">
                                        <div className="d-flex justify-content-end mb-2">
                                            <Button
                                                color="success"
                                                disabled={selectedPayables.length === 0}
                                                onClick={handleCreatePaymentClaim}
                                            >
                                                <i className="bx bx-check-double me-1"></i> Create Payment Claim
                                            </Button>
                                        </div>
                                        <div className="table-responsive">
                                            <Table className="table table-bordered mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: "3%" }}>
                                                            <Input
                                                                type="checkbox"
                                                                onChange={handleSelectAll}
                                                                checked={
                                                                    payableData.length > 0 &&
                                                                    selectedPayables.length === payableData.length
                                                                }
                                                            />
                                                        </th>
                                                        <th>Date</th>
                                                        <th>Reference (IRN)</th>
                                                        <th>PO Number</th>
                                                        <th>Due Date</th>
                                                        <th>Supplier</th>
                                                        <th className="text-end">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                                                    ) : payableData.length > 0 ? (
                                                        payableData.map((item, key) => {
                                                            const itemId = item.IRNId || item.Id; // Ensure we get a unique ID
                                                            return (
                                                                <tr key={key}>
                                                                    <td>
                                                                        <Input
                                                                            type="checkbox"
                                                                            checked={selectedPayables.includes(itemId)}
                                                                            onChange={() => handleCheckboxChange(itemId)}
                                                                        />
                                                                    </td>
                                                                    {/* Adjust keys based on actual GetAllIRNList response */}
                                                                    <td>{item.IRNDate ? formatDate(item.IRNDate) : "-"}</td>
                                                                    <td>{item.IRNNumber || item.ReferenceNo}</td>
                                                                    <td>
                                                                        <Link to={`/procurementspurchase-order`} className="text-primary font-weight-bold">
                                                                            {item.PONumber || "-"}
                                                                        </Link>
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge badge-soft-warning font-size-12">
                                                                            {item.DueDate ? formatDate(item.DueDate) : "N/A"}
                                                                        </span>
                                                                    </td>
                                                                    <td>{item.SupplierName}</td>
                                                                    <td className="text-end">
                                                                        {new Intl.NumberFormat().format(item.TotalAmount || item.Amount || 0)}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="text-center">No Payable Items Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Col>
                                </Row>
                            </TabPane>

                        </TabContent>
                    </CardBody>
                </Card>
            </Container>
        </div>
    );
};

export default AP;