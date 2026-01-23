import React, { useState, useEffect } from "react";
import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, Label,FormGroup, Input, InputGroup } from "reactstrap"; 
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { classNames } from 'primereact/utils';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Slider } from 'primereact/slider';
import { Tag } from 'primereact/tag';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import "primereact/resources/themes/lara-light-blue/theme.css"; 
import { useHistory } from "react-router-dom";
import Flatpickr from "react-flatpickr"
import Select from "react-select";
import Swal from 'sweetalert2';
import { ChangeDescriptionStatus, GetAllClaimPaymentDescriptions, GetClaimCategoryAutoComplete, GetClaimTypeAutoComplete } from "common/data/mastersapi";

const initFilters = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  claimcategory: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  claimtype: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  paymentdescription: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
  createddate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
  createdby: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  lastmodifieddate: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
  lastmodifiedby: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  isactive: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(/ /g, "-"); // e.g. "29-Aug-2025"
};

const ManageClaimPaymentDesc = () => {
    const history = useHistory();
    const FilterTypes = [
        { name: "Claim Category", value: 1 }, 
        { name: "Claim Type", value: 2 },
    ];

    const [items, setItems] = useState([]); 
    const [claims, setClaims] = useState();
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(initFilters());

    const [loading, setLoading] = useState(false);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [selectedFilterType, setSelectedFilterType] = useState(null);
    const [selectedAutoItem, setSelectedAutoItem] = useState(null);
    const [autoOptions, setAutoOptions] = useState([]);
    const [branchId, setBranchId] = useState(1);
    const [orgId, setOrgId] = useState(1);
    const getDynamicLabel = () => {
        if (selectedFilterType?.value === 1) return "Claim Category";
        if (selectedFilterType?.value === 2) return "Claim Type";
        return "";
    };

    useEffect(() => {
        const fetchClaimPayments = async () => {
            setLoading(true);
            try {
            const response = await GetAllClaimPaymentDescriptions(
                orgId,
                branchId,
                0,
                0
            );

            if (response?.status) {
                setClaims(response?.data || []);

                const initialSwitchStates = {};
                    response?.data.forEach(item => {
                    initialSwitchStates[item.paymentid] = item.isactive === 1;
                });
                setSwitchStates(initialSwitchStates);
            }
            } catch (error) {
            console.error("Error fetching claim payment descriptions:", error);
            } finally {
            setLoading(false);
            }
        };

        if (orgId && branchId) {
            fetchClaimPayments();
        }
    }, [orgId, branchId]);

    useEffect(() => {
        const loadOptions = async () => {
            if (!selectedFilterType) {
            setAutoOptions([]);
            return;
            }

            let result = [];
            switch (selectedFilterType.value) {
            case 1: {
                // Category Type
                result = await GetClaimCategoryAutoComplete(orgId, branchId, "%");
                setAutoOptions(
                (result?.data || []).map(item => ({
                    label: item.claimcategory,
                    value: item.Id,
                }))
                );
                break;
            }

            case 2: {
                // Claim Type
                result = await GetClaimTypeAutoComplete(orgId, branchId, 0, "%");
                setAutoOptions(
                (result?.data || []).map(item => ({
                    label: item.claimtype,
                    value: item.claimtypeid,
                }))
                );
                break;
            }

            default:
                setAutoOptions([]);
            }
        };

        loadOptions();
        }, [selectedFilterType, orgId, branchId]);

    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const toggleModal2 = () => {
        setIsModalOpen2(!isModalOpen2);
    }; 

    const searchData = async () => {
        try {
            const filterType = selectedFilterType?.value || 0;
            const filterValue = selectedAutoItem?.value || 0;

            let result;

            if (filterType === 1) {
            // Search by Claim Category
                result = await GetAllClaimPaymentDescriptions(orgId, branchId, filterValue, 0);
            } else if (filterType === 2) {
            // Search by Claim Type
                result = await GetAllClaimPaymentDescriptions(orgId, branchId, 0, filterValue);
            } else {
            // Default – load all claim payment descriptions
                result = await GetAllClaimPaymentDescriptions(orgId, branchId, 0, 0);
            }

            setClaims(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Error while fetching claim payment descriptions:", error);
        }
    };

    const cancelFilter = async () => {
        setSelectedFilterType(null);
        setSelectedAutoItem(null);
        const res = await GetAllClaimPaymentDescriptions(orgId, branchId, 0, 0);
        if (res.status) {
            setClaims(Array.isArray(res.data) ? res.data : []);
        }
    };

    // Clear filters
    const clearFilter = () => {
        setSelectedFilterType(null);
        setSelectedAutoItem(null);
        setFilters(initFilters());
        setGlobalFilterValue('');
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters((prevFilters) => ({
            ...prevFilters,
            global: { ...prevFilters.global, value },
        }));
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return ( 
            <div className="row align-items-center g-3 clear-spa"> 
                <div className="col-12 col-lg-3">
                    <Button className="btn btn-danger btn-label" onClick={clearFilter} outlined >
                        <i className="mdi mdi-filter-off label-icon" />
                        Clear
                    </Button>
                </div>
                <div className="col-12 col-lg-3">
                    <input className="form-control" type="text" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </div> 
            </div>
        );
    };

    const header = renderHeader();

    const filterClearTemplate = (options) => {
        return <Button type="button" icon="pi pi-times" onClick={options.filterClearCallback} severity="secondary"></Button>;
    };

    const filterApplyTemplate = (options) => {
        return <Button type="button" icon="pi pi-check" onClick={options.filterApplyCallback} severity="success"></Button>;
    };

    const filterFooterTemplate = () => {
        return <div className="px-3 pt-0 pb-3 text-center">Filter by Country</div>;
    };

    const linkAddsupplier = () => {
        history.push("/add-claim-payment-desc");
    };

    const editRow = (rowData) => { 
        history.push(`/edit-claim-payment-desc/${rowData.paymentid}`);
    };
    
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions"> 
                <span onClick={() => editRow(rowData)} title="Edit"> 
                    <i className="mdi mdi-square-edit-outline" style={{ fontSize: '1.5rem' }}></i>
                </span>
            </div>
        )
    }; 

    const onSwitchChange = async () => {
        if (!selectedRow) return;

        try {
            const res = await ChangeDescriptionStatus(selectedRow.paymentid);

            if (res?.status) {
                // Toggle locally
                const newStatus = !switchStates[selectedRow.paymentid];
                setSwitchStates(prevStates => ({
                    ...prevStates,
                    [selectedRow.paymentid]: newStatus,
                }));

                setClaims(prevCustomers =>
                    prevCustomers.map(customer =>
                        customer.paymentid === selectedRow.paymentid
                            ? { ...customer, isactive: newStatus ? 1 : 0 }
                            : customer
                    )
                );
                setIsModalOpen(false);
            } else {
                Swal.fire("Error", res?.message || "Status update failed", "error");
            }
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const openModal = (rowData) => {
        const value = rowData.isactive==1 ? "deactive": "active";
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen(true);
    };
    const actionBodyTemplate2 = (rowData) => {
        return ( 
            <div className="square-switch">
                <Input
                    type="checkbox"
                    id={`square-switch-${rowData.paymentid}`} 
                    switch="bool"
                    onChange={() => openModal(rowData)} 
                    checked={switchStates[rowData.paymentid] || false} 
                />
                <label htmlFor={`square-switch-${rowData.paymentid}`} data-on-label="Yes" data-off-label="No"  style={{margin:0}} />
            </div> 
        );
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Master" breadcrumbItem="Claim & Payment Description" /> 
                    <Row>  
                        <Card className="search-top">                             
                            <div className="row align-items-end g-3 quotation-mid p-3">
                                {/* User Name */}
                                <div className="col-12 col-lg-3 mt-1">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                                            <label htmlFor="Search_Type" className="form-label mb-0">Search By</label></div>
                                        <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                                            <Select
                                                name="filtertype"
                                                options={FilterTypes.map(f => ({ label: f.name, value: f.value }))}
                                                placeholder="Select Filter Type"
                                                classNamePrefix="select"
                                                isClearable
                                                value={selectedFilterType}
                                                onChange={(selected) => {
                                                    setSelectedFilterType(selected);
                                                    setSelectedAutoItem(null);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {selectedFilterType && (
                                    <div className="col-12 col-lg-4 mt-1">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                                                <label className="form-label mb-0">{getDynamicLabel()}</label>
                                            </div>
                                            <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                                                <Select
                                                    name="dynamicSelect"
                                                    options={autoOptions}
                                                    placeholder={`Search ${selectedFilterType.label}`}
                                                    classNamePrefix="select"
                                                    isClearable
                                                    isSearchable
                                                    value={selectedAutoItem}
                                                    onChange={(selected) => setSelectedAutoItem(selected)}
                                                />

                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={`col-12 ${selectedFilterType ? 'col-lg-5' : 'col-lg-9'} d-flex justify-content-end flex-wrap gap-2`} >
                                    <button type="button" className="btn btn-info" onClick={searchData}> <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>
                                    <button type="button" className="btn btn-danger" onClick={cancelFilter}><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>
                                    <button type="button" className="btn btn-success" onClick={linkAddsupplier}><i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>New</button>
                                </div>
                            </div>
                        </Card>
                    </Row>
                    <Row>
                        <Col lg="12">
                            <Card>
                                <DataTable 
                                    value={claims} 
                                    paginator 
                                    showGridlines 
                                    rows={10} 
                                    loading={loading} 
                                    dataKey="claimId" 
                                    filters={filters} 
                                    globalFilterFields={["claimcategory", "claimtype", "paymentdescription","createddate","lastmodifieddate", "createdby", "lastmodifiedby","isactive"]} 
                                    header={header} 
                                    emptyMessage="No claims found." 
                                    onFilter={(e) => setFilters(e.filters)}
                                >
                                    <Column 
                                        field="claimcategory" 
                                        header="Claim Category" 
                                        filter 
                                        filterPlaceholder="Search by category" 
                                    />
                                    <Column 
                                        field="claimtype" 
                                        header="Claim Type" 
                                        filter 
                                        filterPlaceholder="Search by type" 
                                    />
                                    <Column 
                                        field="paymentdescription" 
                                        header="Payment Description" 
                                        filter 
                                        filterPlaceholder="Search by payment description" 
                                        style={{ width: '20%' }} 
                                    />
                                    <Column 
                                        field="createddate" 
                                        filter
                                        header="Created Date" 
                                        style={{ width: '10%' }}
                                        // body={(rowData) => formatDate(rowData.createddate)}
                                    />

                                    <Column 
                                        field="createdby" 
                                        header="Created By" 
                                        filter 
                                        filterPlaceholder="Search by creator" 
                                    />

                                    <Column 
                                        field="lastmodifieddate" 
                                        filter
                                        header="Modified Date" 
                                        style={{ width: '10%' }}
                                        // body={(rowData) => formatDate(rowData.lastmodifieddate)}
                                    />
                                    <Column 
                                        field="lastmodifiedby" 
                                        header="Modified By" 
                                        filter 
                                        filterPlaceholder="Search by modifier" 
                                    />
                                    <Column 
                                        field="isactive" 
                                        header="Active" 
                                        // filter
                                        showFilterMatchModes={false} 
                                        body={actionBodyTemplate2} 
                                        className="text-center" 
                                        headerClassName="text-center" 
                                        style={{ width: '8%' }} 
                                    />
                                    <Column 
                                        field="actions" 
                                        header="Action" 
                                        showFilterMatchModes={false} 
                                        body={actionBodyTemplate} 
                                        className="text-center" 
                                        headerClassName="text-center" 
                                        style={{ width: '8%' }} 
                                    />
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
                                <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "9em", color: "orange" }} />
                                <h2>Are you sure?</h2>
                                <h4>Do you want to {txtStatus} this account?</h4>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className="text-center mt-3 button-items">
                                <Button className="btn btn-info" color="success" size="lg" onClick={onSwitchChange}>
                                Yes
                                </Button>
                                <Button color="danger" size="lg" className="btn btn-danger" onClick={() => setIsModalOpen(false)}>
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

export default ManageClaimPaymentDesc;
