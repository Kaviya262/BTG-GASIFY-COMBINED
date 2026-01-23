    import React, { useState, useEffect } from "react";
    import { Card, CardBody, Col, Container, Row, Modal, ModalHeader, ModalBody, Label, FormGroup, Input, InputGroup } from "reactstrap";
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
    import { GetAllItems, GetAllSuppliers, GetItemCategoryAutoComplete, GetItemCodeAutoComplete, GetItemGroupAutoComplete, GetItemNameAutoComplete, UpdateIsActive, GetSupplierBankAutoComplete, GetSupplierCategoryAutoComplete, GetSupplierCityAutoComplete, GetSupplierMasterAutoComplete, GetSupplierStateAutoComplete } from "common/data/mastersapi";
    // Move the initFilters function definition above
    const initFilters = () => ({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        itemcode: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        itemname: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        groupname: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        categoryname: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    });

    const ManageItems = () => {
        const history = useHistory();
        const FilterTypes = [
            { name: "Item Code", value: 1 },
            { name: "Item Name", value: 2 },
            { name: "Item Group", value: 3 },
            { name: "Item Category", value: 4 },
        ];

        const [items, setItems] = useState([]);
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
        const [itemCodeOptions, setItemCodeOptions] = useState([]);
const [itemNameOptions, setItemNameOptions] = useState([]);
        const getDynamicLabel = () => {
            if (selectedFilterType?.value === 1) return "Item Code";
            if (selectedFilterType?.value === 2) return "Item Name";
            if (selectedFilterType?.value === 3) return "Item Group";
            if (selectedFilterType?.value === 4) return "Item Category";
            return "";
        };

        useEffect(() => {
            const fetchItems = async () => {
                setLoading(true);
                try {
                    const response = await GetAllItems(orgId, branchId, 0, 0, 0, 0, 0);
                    setItems(response?.data || []);

                    const initialSwitchStates = {};
                    response?.data.forEach(item => {
                        initialSwitchStates[item.itemcode] = item.IsActive === 1;
                    });

                    debugger;
                      // Set item code and name filter options
            const uniqueItemCodes = Array.from(new Set(response?.data.map(item => item.itemcode)))
            .map(code => ({ label: code, value: code }));

        const uniqueItemNames = Array.from(new Set(response?.data.map(item => item.itemname)))
            .map(name => ({ label: name, value: name }));

            setItemCodeOptions(uniqueItemCodes);
            setItemNameOptions(uniqueItemNames);
                    setSwitchStates(initialSwitchStates);
                } catch (error) {
                    console.error("Error fetching items:", error);
                } finally {
                    setLoading(false);
                }
            };

            if (orgId && branchId) {
                fetchItems();
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
                        // Item Code
                        // result = await GetItemCodeAutoComplete(orgId, branchId, "%");
                        // setAutoOptions(
                        //     (result?.data || []).map(item => ({
                        //         label: item.ItemCode,
                        //         value: item.ItemId,
                        //     }))
                        // );
                        var dynamicOptions = itemCodeOptions;
                        setAutoOptions(dynamicOptions);
                        break;
                    }

                    case 2: {
                        // Item Name
                        // result = await GetItemNameAutoComplete(orgId, branchId, "%");
                        // setAutoOptions(
                        //     (result?.data || []).map(item => ({
                        //         label: item.ItemName,
                        //         value: item.ItemId,
                        //     }))
                        // );
                        var dynamicOptions = itemNameOptions;
                        setAutoOptions(dynamicOptions);
                        break;
                    }

                    case 3: {
                        // Item Group
                        result = await GetItemGroupAutoComplete(orgId, branchId, "%");
                        setAutoOptions(
                            (result?.data || []).map(item => ({
                                label: item.groupname,
                                value: item.groupid,
                            }))
                        );
                        break;
                    }

                    case 4: {
                        // Item Category
                        result = await GetItemCategoryAutoComplete(orgId, branchId, "%");
                        setAutoOptions(
                            (result?.data || []).map(item => ({
                                label: item.categoryname,
                                value: item.categoryid,
                            }))
                        );
                        break;
                    }

                    default:
                        setAutoOptions([]);
                }
            };

            loadOptions();
        }, [selectedFilterType, orgId, branchId])

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
                    // Search by Item Code
                    result = await GetAllItems(orgId, branchId, filterValue, 0, 0, 0, 0);
                } else if (filterType === 2) {
                    // Search by Item Name
                    result = await GetAllItems(orgId, branchId, 0, filterValue, 0, 0, 0);
                } else if (filterType === 3) {
                    // Search by Item Group
                    result = await GetAllItems(orgId, branchId, 0, 0, filterValue, 0, 0);
                } else if (filterType === 4) {
                    // Search by Item Category
                    result = await GetAllItems(orgId, branchId, 0, 0, 0, filterValue, 0);
                } else {
                    // Default – load all items
                    result = await GetAllItems(orgId, branchId, 0, 0, 0, 0, 0);
                }
        
                var resultItems = Array.isArray(result?.data) ? result.data : [];
              
                setItems([]);
                // Update item list
                setItems(resultItems);
        
                // Rebuild switch states to reflect new result set
                // const updatedSwitchStates = {};
                // resultItems.forEach(item => {
                //     updatedSwitchStates[item.itemcode] = item.IsActive === 1;
                // });
                // setSwitchStates(updatedSwitchStates);
        
                // // Reset DataTable filters (to avoid double-filtering client-side)
                // setFilters(initFilters());
        
                // // Clear global keyword search
                // setGlobalFilterValue('');
            } catch (error) {
                console.error("Error while fetching items:", error);
            }
        };
        

        const cancelFilter = async () => {
            setSelectedFilterType(null);
            setSelectedAutoItem(null);
            setFilters(initFilters());
            setGlobalFilterValue("");
        
            const res = await GetAllItems(orgId, branchId);
            if (res.status) {
                const resultItems = Array.isArray(res.data) ? res.data : [];
                setItems(resultItems);
        
                const resetSwitchStates = {};
                resultItems.forEach(item => {
                    resetSwitchStates[item.itemcode] = item.IsActive === 1;
                });
                setSwitchStates(resetSwitchStates);
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
            history.push("/add-item");
        };

        const editRow = (rowData) => {
            history.push(`/edit-item/${rowData.itemid}`);
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

            const newStatus = !switchStates[selectedRow.itemcode];

            try {
                const response = await UpdateIsActive(selectedRow.itemid, newStatus ? 1 : 0);

                if (response?.status) {
                    setSwitchStates(prevStates => ({
                        ...prevStates,
                        [selectedRow.itemcode]: newStatus,
                    }));

                    setItems(prevItems =>
                        prevItems.map(item =>
                            item.itemcode === selectedRow.itemcode
                                ? { ...item, IsActive: newStatus ? 1 : 0 }
                                : item
                        )
                    );

                    console.log(`Item ${selectedRow.itemcode} Active Status updated:`, newStatus ? 1 : 0);
                } else {
                    console.error("Failed to update IsActive:", response?.message || "Unknown error");
                }
            } catch (err) {
                console.error("Error updating IsActive:", err);
            } finally {
                setIsModalOpen(false);
            }
        };

        const openModal = (rowData) => {
            console.log('rowData.IsActive > ', rowData.IsActive)
            const value = rowData.IsActive == 1 ? "deactive" : "active";
            setTxtStatus(value);
            setSelectedRow(rowData);
            setIsModalOpen(true);
        };
        const actionBodyTemplate2 = (rowData) => {
            return (
                <div className="square-switch">
                    <Input
                        type="checkbox"
                        id={`square-switch-${rowData.itemcode}`}
                        switch="bool"
                        onChange={() => openModal(rowData)}
                        checked={switchStates[rowData.itemcode] || false}
                    />
                    <label htmlFor={`square-switch-${rowData.itemcode}`} data-on-label="Yes" data-off-label="No" style={{ margin: 0 }} />
                </div>
            );
        };

        console.log('selectedAutoItem > ', selectedAutoItem)

        return (
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>
                        <Breadcrumbs title="Master" breadcrumbItem="Items" />
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
  value={items}
  paginator
  showGridlines
  rows={10}
  loading={loading}
  dataKey="itemid"
  filters={filters}                     // ← use filters
  onFilter={(e) => setFilters(e.filters)}// optional, keeps state in sync
  globalFilterFields={["itemcode","itemname","groupname","categoryname"]}
  header={header}
  emptyMessage="No items found."
>
                                        {/* <Column field="itemcode" header="Item Code"   style={{ width: '10%' }} className="text-center" />
                                        <Column field="itemname" header="Item Name"    />
                                        <Column field="groupname" header="Item Group"  />
                                        <Column field="categoryname" header="Item Category"   />
                                        <Column field="IsActive" header="Active"   body={actionBodyTemplate2} className="text-center" headerClassName="text-center" style={{ width: '8%' }} />
                                        <Column field="actions" header="Action"  body={actionBodyTemplate} className="text-center" headerClassName="text-center" style={{ width: '8%' }} /> */}

<Column 
        field="itemcode" 
        header="Item Code" 
        style={{ width: '10%' }} 
        className="text-center" 
        filter  // Enable filtering
        filterPlaceholder="Search by Item Code" 
        filterMatchMode="contains" // Match mode: contains
    />
    
    {/* Item Name Column with Filter */}
    <Column 
        field="itemname" 
        header="Item Name" 
        filter  // Enable filtering
        filterPlaceholder="Search by Item Name" 
        filterMatchMode="startsWith" // Match mode: startsWith
    />
    
    {/* Item Group Column with Filter */}
    <Column 
        field="groupname" 
        header="Item Group" 
        filter  // Enable filtering
        filterPlaceholder="Search by Group Name" 
        filterMatchMode="startsWith" // Match mode: startsWith
    />
    
    {/* Item Category Column with Filter */}
    <Column 
        field="categoryname" 
        header="Item Category" 
        filter  // Enable filtering
        filterPlaceholder="Search by Category Name" 
        filterMatchMode="startsWith" // Match mode: startsWith
    />
    
    {/* Active Column with Custom Body */}
    <Column 
        field="IsActive" 
        header="Active" 
        body={actionBodyTemplate2} 
        className="text-center" 
        headerClassName="text-center" 
        style={{ width: '8%' }} 
    />
    
    {/* Actions Column with Custom Body */}
    <Column 
        field="actions" 
        header="Action"  
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

    export default ManageItems;
