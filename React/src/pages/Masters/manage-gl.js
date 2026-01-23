import React, { useState, useEffect } from "react";
import {
    Card,
    Col,
    Container,
    Row,
    Modal,
    ModalBody,
    Button,
    Input,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Select from "react-select";
import { GetAllGlCodeMaster } from "common/data/mastersapi";
import { useHistory, useLocation } from 'react-router-dom';

const initFilters = () => ({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    glcode: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    glname: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    categoryname: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    accounttypename: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
});

const ManageGl = () => {
    const [items, setItems] = useState([]);
    const [filters, setFilters] = useState(initFilters());
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [switchStates, setSwitchStates] = useState({});
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);

    const [selectedFilterType, setSelectedFilterType] = useState(null);
    const [selectedFilterValue, setSelectedFilterValue] = useState(null);

    const FilterTypes = [
        { label: "Gl Code", value: "glcode" },
        { label: "Gl Name", value: "glname" },
        { label: "Category Name", value: "categoryname" },
        { label: "AccountType Name", value: "accounttypename" },
    ];
    const history = useHistory();

    // Fetch data from API
    useEffect(() => {
        fetchGlData();
    }, []);

    const fetchGlData = async () => {
        setLoading(true);
        try {
            const res = await GetAllGlCodeMaster();

            if (res && Array.isArray(res)) {
                const mappedData = res.map((item) => ({
                    id: item.id,
                    glcode: item.gLcode,
                    glname: item.categoryName,
                    categoryname: item.accountCategoryCategoryName,
                    accounttypename: item.accountTypeCategoryName,
                    IsActive: item.isActive ? 1 : 0,
                }));

                setItems(mappedData);

                // setup switches
                const initSwitch = mappedData.reduce((acc, item) => {
                    acc[item.glcode] = item.IsActive === 1;
                    return acc;
                }, {});
                setSwitchStates(initSwitch);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error("Error fetching GL Master", error);
            setItems([]);
        }
        setLoading(false);
    };

    // Global search
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters((prev) => ({
            ...prev,
            global: { ...prev.global, value },
        }));
        setGlobalFilterValue(value);
    };

    // Search button handler
    const searchData = () => {
        if (!selectedFilterType || !selectedFilterValue) {
            fetchGlData();
            return;
        }

        const filtered = items.filter((item) =>
            item[selectedFilterType.value]
                ?.toString()
                .toLowerCase()
                .includes(selectedFilterValue.toLowerCase())
        );
        setItems(filtered);
    };

    // Cancel button
    const cancelFilter = () => {
        setSelectedFilterType(null);
        setSelectedFilterValue(null);
        fetchGlData(); // reset
    };

    // Add new button
    const addNew = () => {

        history.push("/add-glmaster");

         
    };

    // Reset filters
    const clearFilter = () => {
        setSelectedFilterType(null);
        setSelectedFilterValue(null);
        setFilters(initFilters());
        setGlobalFilterValue("");
        fetchGlData(); // reset
    };

    const renderHeader = () => (
        <div className="row align-items-center g-3">
            <div className="col-12 col-lg-8">
                <Button className="btn btn-danger" onClick={clearFilter}>
                    <i className="mdi mdi-filter-off label-icon" /> Clear
                </Button>
            </div>
            <div className="col-12 col-lg-4">
                <input
                    className="form-control"
                    type="text"
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Keyword Search"
                />
            </div>
        </div>
    );

    // Edit action
    const actionBodyTemplate = (rowData) => (
        <div className="actions">
            <span
                onClick={() => {
                    history.push(`/edit-glmaster/${rowData.id}`);
                     
                }}

                title="Edit"
                style={{ cursor: "pointer" }}
            >
                <i
                    className="mdi mdi-square-edit-outline"
                    style={{ fontSize: "1.5rem" }}
                ></i>
            </span>
        </div>
    );


    // Active status toggle
    const openModal = (rowData) => {
        const value = rowData.IsActive === 1 ? "deactivate" : "activate";
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen(true);
    };

    const onSwitchChange = () => {
        if (!selectedRow) return;
        const newStatus = !switchStates[selectedRow.glcode];

        setSwitchStates((prev) => ({
            ...prev,
            [selectedRow.glcode]: newStatus,
        }));

        setItems((prev) =>
            prev.map((item) =>
                item.glcode === selectedRow.glcode
                    ? { ...item, IsActive: newStatus ? 1 : 0 }
                    : item
            )
        );

        setIsModalOpen(false);
    };

    const actionBodyTemplate2 = (rowData) => (
        <div className="square-switch">
            <Input
                type="checkbox"
                id={`switch-${rowData.glcode}`}
                switch="bool"
                onChange={() => openModal(rowData)}
                checked={switchStates[rowData.glcode] || false}
            />
            <label
                htmlFor={`switch-${rowData.glcode}`}
                data-on-label="Yes"
                data-off-label="No"
                style={{ margin: 0 }}
            />
        </div>
    );

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Master" breadcrumbItem="GL Master" />

                    {/* Search / Filter */}
                    <Row>
                        <Card className="search-top p-3">
                            <div className="row align-items-end g-3">
                                {/* Filter Type */}
                                <div className="col-12 col-lg-3">
                                    <label className="form-label">Search By</label>
                                    <Select
                                        options={FilterTypes}
                                        placeholder="Select Filter Type"
                                        isClearable
                                        value={selectedFilterType}
                                        onChange={(selected) => {
                                            setSelectedFilterType(selected);
                                            setSelectedFilterValue(null);
                                        }}
                                    />
                                </div>

                                {/* Filter Value */}
                                {selectedFilterType && (
                                    <div className="col-12 col-lg-4">
                                        <label className="form-label">{selectedFilterType.label}</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={`Search ${selectedFilterType.label}`}
                                            value={selectedFilterValue || ""}
                                            onChange={(e) => setSelectedFilterValue(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Buttons */}
                                <div
                                    className={`col-12 ${selectedFilterType ? "col-lg-5" : "col-lg-9"
                                        } d-flex justify-content-end flex-wrap gap-2`}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-info"
                                        onClick={searchData}
                                    >
                                        <i className="bx bx-search-alt me-2"></i> Search
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={cancelFilter}
                                    >
                                        <i className="bx bx-window-close me-2"></i> Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={addNew}
                                    >
                                        <i className="bx bx-plus me-2"></i> New
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </Row>

                    {/* Table */}
                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable
                                    value={items}
                                    paginator
                                    loading={loading}
                                    showGridlines
                                    rows={10}
                                    dataKey="glcode"
                                    filters={filters}
                                    globalFilterFields={["glcode", "glname", "categoryname", "accounttypename"]}
                                    header={renderHeader()}
                                    emptyMessage="No GL found."
                                    onFilter={(e) => setFilters(e.filters)}
                                >
                                    <Column field="glcode" header="Gl Code" style={{ width: "12%" }} className="text-center" />
                                    <Column field="glname" header="Gl Name" />
                                    <Column field="categoryname" header="Category Name" />
                                    <Column field="accounttypename" header="AccountType Name" />
                                    <Column field="IsActive" header="Active" body={actionBodyTemplate2} className="text-center" style={{ width: "10%" }} />
                                    <Column field="actions" header="Action" body={actionBodyTemplate} className="text-center" style={{ width: "10%" }} />
                                </DataTable>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Confirmation Modal */}
            <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
                <ModalBody className="py-3 px-5">
                    <Row>
                        <Col lg={12}>
                            <div className="text-center">
                                <i
                                    className="mdi mdi-alert-circle-outline"
                                    style={{ fontSize: "9em", color: "orange" }}
                                />
                                <h2>Are you sure?</h2>
                                <h4>Do you want to {txtStatus} this GL?</h4>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="text-center mt-3 button-items">
                                <Button className="btn btn-success" onClick={onSwitchChange}>
                                    Yes
                                </Button>
                                <Button
                                    className="btn btn-danger"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default ManageGl;
