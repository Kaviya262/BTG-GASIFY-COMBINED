import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Input,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import { GetAllAccessRights, UpdateAccessRights, GetAccessRightsById } from "common/data/mastersapi";


const initFilters = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  RoleName: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  department: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  HOD: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  EffectiveDate: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
});

const ManageRole = () => {
  const history = useHistory();
  const [roles, setRoles] = useState([]);
  const [allAccessRights, setAllAccessRights] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState(initFilters());
  const [loading, setLoading] = useState(false);
  const [switchStates, setSwitchStates] = useState({});
  const [selectedFilterType, setSelectedFilterType] = useState(null);
  const [selectedAutoItem, setSelectedAutoItem] = useState(null);
  const [autoOptions, setAutoOptions] = useState([]);

  const FilterTypes = [
    { name: "Role", value: 1 },
    { name: "Module", value: 2 },
    { name: "Status", value: 3 },
  ];

  const getDynamicLabel = () => {
    if (selectedFilterType?.value === 1) return "Role";
    if (selectedFilterType?.value === 2) return "Module";
    if (selectedFilterType?.value === 3) return "Status";
    return "";
  };

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await GetAllAccessRights();
        if (response?.status) {
          setAllAccessRights(response.data);
          const rolesData = response.data.map((item) => ({
            Id: item.headerId,
            RoleName: item.role,
            department: item.department,
            HOD: item.isHOD ? "Yes" : "No",
            EffectiveDate: new Date(item.effectiveDate).toLocaleDateString(),
            CreatedBy: "Admin",
            CreatedDate: new Date(item.effectiveDate).toLocaleDateString(),
            IsActive: !!item.isActive,
          }));
          setRoles(rolesData);

          const stateMap = {};
          rolesData.forEach((role) => {
            stateMap[role.Id] = role.IsActive;
          });
          setSwitchStates(stateMap);
        } else {
          console.error(response.message || "Failed to fetch access rights");
        }
      } catch (error) {
        console.error("Error fetching roles");
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Global filter debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        global: { ...prevFilters.global, value: globalFilterValue },
      }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [globalFilterValue]);

  const clearFilter = () => {
    setFilters(initFilters());
    setGlobalFilterValue("");
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => (
    <div className="row align-items-center g-3 clear-spa">
      <div className="col-12 col-lg-3">
        <Button className="btn btn-danger btn-label" onClick={clearFilter} outlined>
          <i className="mdi mdi-filter-off label-icon" />
          Clear
        </Button>
      </div>
      <div className="col-12 col-lg-3">
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

  const linkAccessRights = async (rowData) => {
    // Fetch the full access rights by id, then navigate to the Access Rights page
    setLoading(true);
    try {
      const response = await GetAccessRightsById(rowData.Id);
      if (response?.status) {
        // pass the full access rights data to the access-rights page via location state
        history.push("/access-Rights", { 
          accessRights: response.data,
          mode: "edit",
          headerId: rowData.Id
        });
      } else {
        console.error(response.message || "Failed to fetch access rights by id");
        // fallback: navigate without state
        history.push("/access-Rights");
      }
    } catch (error) {
      console.error("Error fetching access rights by id", error);
      history.push("/access-Rights");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSwitch = (rowData) => {
  (async () => {
    const userId = rowData.Id;
    const newIsActive = !switchStates[userId];

    // Optimistic UI update
    setSwitchStates((prev) => ({ ...prev, [userId]: newIsActive }));
    setRoles((prev) =>
      prev.map((user) =>
        user.Id === userId ? { ...user, IsActive: newIsActive } : user
      )
    );

    setLoading(true);
    try {
      // Fetch full access rights payload for this header
      const getResp = await GetAccessRightsById(userId);
      if (!getResp?.status) throw new Error(getResp?.message || "Failed to get access rights");

      const full = getResp.data;

      const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");

      const payload = {
        Request: {
          headerId: full.headerId || userId,
          role: full.role,
          department: full.department,
          effectiveDate: full.effectiveDate,
          isHOD: !!full.isHOD,
          isActive: !!newIsActive,
          userId: String(authUser.uid || full.userId || ""), 
          modules: full.modules || [],
        },
      };

      const updateResp = await UpdateAccessRights(userId, payload);
      if (!updateResp?.status) {
        throw new Error(updateResp?.message || "Failed to update access rights");
      }

      if (updateResp.data) {
        const updated = updateResp.data;
        setRoles((prev) =>
          prev.map((user) =>
            user.Id === userId
              ? {
                  ...user,
                  RoleName: updated.role || user.RoleName,
                  department: updated.department || user.department,
                  HOD: updated.isHOD ? "Yes" : "No",
                  EffectiveDate: updated.effectiveDate
                    ? new Date(updated.effectiveDate).toLocaleDateString()
                    : user.EffectiveDate,
                  IsActive: !!updated.isActive,
                }
              : user
          )
        );
        setSwitchStates((prev) => ({
          ...prev,
          [userId]: !!updateResp.data.isActive,
        }));
      }
    } catch (error) {
      console.error("Error updating active status", error);
      // rollback optimistic UI
      setSwitchStates((prev) => ({ ...prev, [rowData.Id]: !prev[rowData.Id] }));
      setRoles((prev) =>
        prev.map((user) =>
          user.Id === rowData.Id ? { ...user, IsActive: !user.IsActive } : user
        )
      );
    } finally {
      setLoading(false);
    }
  })();
};


  const actionBodyTemplate = (rowData) => (
      <div className="actions">
      <span
        style={{ marginRight: "0.5rem" }}
        title="Edit"
        onClick={() => linkAccessRights(rowData)}
      >
        <i
          className="mdi mdi-square-edit-outline"
          style={{ fontSize: "1.5rem", cursor: "pointer" }}
        ></i>
      </span>
    </div>
  );

  const actionBodyTemplate2 = (rowData) => (
    <div className="square-switch">
      <Input
        type="checkbox"
        id={`square-switch-${rowData.Id}`}
        switch="bool"
        onChange={() => handleToggleSwitch(rowData)}
        checked={switchStates[rowData.Id] || false}
      />
      <label
        htmlFor={`square-switch-${rowData.Id}`}
        data-on-label="Yes"
        data-off-label="No"
        style={{ margin: 0 }}
      />
    </div>
  );

  const searchData = async () => {
    if (!selectedFilterType || !selectedAutoItem) {
      alert("Please select a filter type and value");
      return;
    }
    setLoading(true);
    try {
      let filteredData = allAccessRights;

      if (selectedFilterType.value === 1) {
        filteredData = filteredData.filter((item) =>
          item.role.toLowerCase().includes(selectedAutoItem.label.toLowerCase())
        );
      } else if (selectedFilterType.value === 2) {
        filteredData = filteredData.filter((item) =>
          item.modules.some((m) =>
            m.moduleName.toLowerCase().includes(selectedAutoItem.label.toLowerCase())
          )
        );
      } else if (selectedFilterType.value === 3) {
        filteredData = filteredData.filter((item) =>
          item.isHOD === (selectedAutoItem.label.toLowerCase() === "yes")
        );
      }

      const rolesData = filteredData.map((item) => ({
        Id: item.headerId,
        RoleName: item.role,
        department: item.department,
        HOD: item.isHOD ? "Yes" : "No",
        EffectiveDate: new Date(item.effectiveDate).toLocaleDateString(),
        CreatedBy: "Admin",
        CreatedDate: new Date(item.effectiveDate).toLocaleDateString(),
        IsActive: !!item.isActive,
      }));
      setRoles(rolesData);

      const stateMap = {};
      rolesData.forEach((role) => {
        stateMap[role.Id] = role.IsActive;
      });
      setSwitchStates(stateMap);
    } catch (error) {
      console.error("Error searching roles");
    } finally {
      setLoading(false);
    }
  };

  const cancelFilter = () => {
    setSelectedFilterType(null);
    setSelectedAutoItem(null);
    setAutoOptions([]);

    // Reset DataTable filters and global search
    clearFilter();

    // Restore full roles list from cached allAccessRights
    if (allAccessRights && allAccessRights.length) {
      const rolesData = allAccessRights.map((item) => ({
        Id: item.headerId,
        RoleName: item.role,
        department: item.department,
        HOD: item.isHOD ? "Yes" : "No",
        EffectiveDate: item.effectiveDate
          ? new Date(item.effectiveDate).toLocaleDateString()
          : "",
        CreatedBy: "Admin",
        CreatedDate: item.effectiveDate
          ? new Date(item.effectiveDate).toLocaleDateString()
          : "",
        IsActive: !!item.isActive,
      }));
      setRoles(rolesData);

      const stateMap = {};
      rolesData.forEach((role) => {
        stateMap[role.Id] = role.IsActive;
      });
      setSwitchStates(stateMap);
    }
  };

  const linkAddAccessRights = () => {
    history.push("/access-Rights", { mode: "create" });
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Masters" breadcrumbItem="Access Rights" />
          <Row>
            <Card className="search-top">
              <div className="row align-items-end g-3 quotation-mid p-3">
                <div className="col-12 col-lg-3 mt-1">
                  <div className="d-flex align-items-center gap-2">
                    <div className="col-12 col-lg-4 col-md-4 col-sm-4 text-center">
                      <label htmlFor="Search_Type" className="form-label mb-0">
                        Search By
                      </label>
                    </div>
                    <div className="col-12 col-lg-8 col-md-8 col-sm-8">
                      <Select
                        name="filtertype"
                        options={FilterTypes.map((f) => ({
                          label: f.name,
                          value: f.value,
                        }))}
                        placeholder="Select Filter Type"
                        classNamePrefix="select"
                        isClearable
                        value={selectedFilterType}
                        onChange={(selected) => {
                          setSelectedFilterType(selected);
                          setSelectedAutoItem(null);

                          if (!selected) {
                            setAutoOptions([]);
                            return;
                          }

                          if (selected.value === 1) {
                            const roles = allAccessRights.map((item) => ({
                              label: item.role,
                              value: item.role,
                            }));
                            const uniqueRoles = [
                              ...new Map(
                                roles.map((item) => [item.value, item])
                              ).values(),
                            ];
                            setAutoOptions(uniqueRoles);
                          } else if (selected.value === 2) {
                            const modules = allAccessRights.flatMap((item) =>
                              item.modules.map((m) => m.moduleName)
                            );
                            const uniqueModules = [...new Set(modules)];
                            setAutoOptions(
                              uniqueModules.map((m) => ({ label: m, value: m }))
                            );
                          } else if (selected.value === 3) {
                            setAutoOptions([
                              { label: "Yes", value: "yes" },
                              { label: "No", value: "no" },
                            ]);
                          }
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
                <div
                  className={`col-12 ${
                    selectedFilterType ? "col-lg-5" : "col-lg-9"
                  } d-flex justify-content-end flex-wrap gap-2`}
                >
                  <button type="button" className="btn btn-info" onClick={searchData}>
                    <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i>{" "}
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={cancelFilter}
                  >
                    <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>{" "}
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={linkAddAccessRights}
                  >
                    <i className="bx bx-plus label-icon font-size-16 align-middle me-2"></i>{" "}
                    New
                  </button>
                </div>
              </div>
            </Card>
          </Row>
          <Row>
            <Col lg="12">
              <Card>
                <DataTable
                  value={roles}
                  paginator
                  showGridlines
                  rows={10}
                  loading={loading}
                  dataKey="Id"
                  filters={filters}
                  globalFilterFields={["RoleName", "department", "HOD", "EffectiveDate"]}
                  header={renderHeader()}
                  emptyMessage="No roles found."
                  onFilter={(e) => setFilters(e.filters)}
                >
                  <Column
                    field="RoleName"
                    header="Role Name"
                    filter
                    filterPlaceholder="Search by name"
                  />
                  <Column field="department" header="Department" />
                  <Column field="HOD" header="HOD" />
                  <Column field="EffectiveDate" header="Effective Date" />
                  <Column
                    field="CreatedBy"
                    header="Created By"
                    style={{ width: "13%" }}
                  />
                  <Column
                    field="CreatedDate"
                    header="Created Date"
                    style={{ width: "13%" }}
                  />
                  <Column
                    header="Active"
                    body={actionBodyTemplate2}
                    style={{ width: "8%" }}
                    className="text-center"
                  />
                  <Column
                    header="Action"
                    body={actionBodyTemplate}
                    style={{ width: "8%" }}
                    className="text-center"
                  />
                </DataTable>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ManageRole;