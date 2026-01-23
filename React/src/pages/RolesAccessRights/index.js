import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Card, CardBody, Col, Container, Row, Button, Accordion, AccordionItem, AccordionHeader, AccordionBody } from 'reactstrap';
import { FormGroup, Label, Input, Table } from "reactstrap";
import Breadcrumbs from "components/Common/Breadcrumb";
import { useLocation } from 'react-router-dom';
import { GetRolesDropdown, GetDepartmentsDropdown, GetModuleScreens, GetAllAccessRights, SaveAccessRights, UpdateAccessRights } from "common/data/mastersapi";

function RolesAccessRights() {
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [moduleGroups, setModuleGroups] = useState({});
    const [accessData, setAccessData] = useState([]);
    const [originalAccessData, setOriginalAccessData] = useState([]);
    const [headerId, setHeaderId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedHOD, setSelectedHOD] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState([]);
    const [mode, setMode] = useState('create'); // 'create' or 'edit'

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const initializeData = async () => {
            await fetchRoles();
            await fetchDepartments();
            const modulesGroupsData = await fetchModuleScreens();

            const state = location.state || {};
            setMode(state.mode || 'create');
            setHeaderId(state.headerId || null);
            
            // If editing, load data from passed accessRights
            if (state.mode === 'edit' && state.accessRights) {
                const data = state.accessRights;
                setSelectedRole(data.role || '');
                setSelectedDept(data.department || '');
                setSelectedHOD(data.isHOD || false);
                setIsActive(data.isActive !== undefined ? data.isActive : true);
                setHeaderId(data.headerId || null);
                
                // Automatically load and display the access rights data
                await loadAccessRightsFromData(data, modulesGroupsData);
            } else {
                // Create mode - clear all selections
                setSelectedRole('');
                setSelectedDept('');
                setSelectedHOD(false);
                setIsActive(true);
                setHeaderId(null);
                
                // Auto-load empty data for new entry
                if (Object.keys(modulesGroupsData).length > 0) {
                    const defaultModules = Object.keys(modulesGroupsData).map(mod => ({
                        moduleName: mod,
                        screens: modulesGroupsData[mod].map(screen => ({
                            screenName: screen.Screen,
                            permissions: {
                                view: false,
                                edit: false,
                                delete: false,
                                post: false,
                                save: false,
                                print: false,
                                viewRate: false,
                                sendMail: false,
                                viewDetails: false,
                                recordsPerPage: 10
                            }
                        }))
                    }));
                    setAccessData(defaultModules);
                    setOriginalAccessData(JSON.parse(JSON.stringify(defaultModules)));
                }
            }
        };
        
        initializeData();
    }, []);

    useEffect(() => {
        // Only auto-load if in create mode AND role/dept are selected
        if (selectedRole && selectedDept && mode === 'create') {
            if (Object.keys(moduleGroups).length > 0) {
                loadAccessRights();
            }
        }
    }, [selectedRole, selectedDept, mode, moduleGroups]);

    const fetchRoles = async () => {
        try {
            const response = await GetRolesDropdown();
            if (response?.status) {
                setRoles(response.data || []);
            } else {
                Swal.fire({ title: 'Error', text: response.message || 'Failed to fetch roles', icon: 'error' });
            }
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Error fetching roles', icon: 'error' });
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await GetDepartmentsDropdown();
            if (response?.status) {
                setDepartments(response.data || []);
            } else {
                Swal.fire({ title: 'Error', text: response.message || 'Failed to fetch departments', icon: 'error' });
            }
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Error fetching departments', icon: 'error' });
        }
    };

    const fetchModuleScreens = async () => {
        try {
            const response = await GetModuleScreens();
            if (response?.status && Array.isArray(response.data)) {
                const grouped = response.data.reduce((acc, item) => {
                    if (!acc[item.ModuleName]) acc[item.ModuleName] = [];
                    acc[item.ModuleName].push(item);
                    return acc;
                }, {});
                setModuleGroups(grouped);
                return grouped;
            } else {
                setModuleGroups({});
                Swal.fire({ title: 'Error', text: response.message || 'No module screens found', icon: 'error' });
                return {};
            }
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Error fetching module screens', icon: 'error' });
            setModuleGroups({});
            return {};
        }
    };

    const mergeWithAllScreens = (savedModules) => {
        return Object.keys(moduleGroups).map(mod => {
            const savedModule = savedModules.find(sm => sm.moduleName === mod);
            const screens = moduleGroups[mod].map(screen => {
                const savedScreen = savedModule?.screens.find(s => s.screenName === screen.Screen);
                return {
                    screenName: screen.Screen,
                    permissions: savedScreen ? savedScreen.permissions : {
                        view: false,
                        edit: false,
                        delete: false,
                        post: false,
                        save: false,
                        print: false,
                        viewRate: false,
                        sendMail: false,
                        viewDetails: false,
                        recordsPerPage: 10
                    }
                };
            });
            return { moduleName: mod, screens };
        });
    };

    const loadAccessRights = async () => {
        setLoading(true);
        try {
            const response = await GetAllAccessRights();
            if (response?.status) {
                const matching = response.data.find(h => 
                    h.role === selectedRole && 
                    h.department === selectedDept && 
                    h.isHOD === selectedHOD
                );
                if (matching) {
                    setHeaderId(matching.headerId);
                    setAccessData(mergeWithAllScreens(matching.modules || []));
                    setOriginalAccessData(JSON.parse(JSON.stringify(matching.modules || [])));
                } else {
                    setHeaderId(null);
                    if (Object.keys(moduleGroups).length > 0) {
                        const defaultModules = Object.keys(moduleGroups).map(mod => ({
                            moduleName: mod,
                            screens: moduleGroups[mod].map(screen => ({
                                screenName: screen.Screen,
                                permissions: {
                                    view: false,
                                    edit: false,
                                    delete: false,
                                    post: false,
                                    save: false,
                                    print: false,
                                    viewRate: false,
                                    sendMail: false,
                                    viewDetails: false,
                                    recordsPerPage: 10
                                }
                            }))
                        }));
                        setAccessData(defaultModules);
                        setOriginalAccessData(JSON.parse(JSON.stringify(defaultModules)));
                    } else {
                        setAccessData([]);
                        setOriginalAccessData([]);
                    }
                }
            } else {
                Swal.fire({ title: 'Error', text: response.message || 'Failed to load access rights', icon: 'error' });
            }
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Error loading access rights', icon: 'error' });
            setAccessData([]);
            setOriginalAccessData([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAccessRightsFromData = async (data, modulesGroupsData) => {
        setLoading(true);
        try {
            const groupsToUse = modulesGroupsData || moduleGroups;
            if (data.modules && data.modules.length > 0) {
                if (Object.keys(groupsToUse).length > 0) {
                    setModuleGroups(groupsToUse);
                    const mergedData = Object.keys(groupsToUse).map(mod => {
                        const savedModule = data.modules.find(sm => sm.moduleName === mod);
                        const screens = groupsToUse[mod].map(screen => {
                            const savedScreen = savedModule?.screens.find(s => s.screenName === screen.Screen);
                            return {
                                screenName: screen.Screen,
                                permissions: savedScreen ? savedScreen.permissions : {
                                    view: false,
                                    edit: false,
                                    delete: false,
                                    post: false,
                                    save: false,
                                    print: false,
                                    viewRate: false,
                                    sendMail: false,
                                    viewDetails: false,
                                    recordsPerPage: 10
                                }
                            };
                        });
                        return { moduleName: mod, screens };
                    });
                    setAccessData(mergedData);
                    setOriginalAccessData(JSON.parse(JSON.stringify(data.modules)));
                }
            } else {
                if (Object.keys(groupsToUse).length > 0) {
                    setModuleGroups(groupsToUse);
                    const defaultModules = Object.keys(groupsToUse).map(mod => ({
                        moduleName: mod,
                        screens: groupsToUse[mod].map(screen => ({
                            screenName: screen.Screen,
                            permissions: {
                                view: false,
                                edit: false,
                                delete: false,
                                post: false,
                                save: false,
                                print: false,
                                viewRate: false,
                                sendMail: false,
                                viewDetails: false,
                                recordsPerPage: 10
                            }
                        }))
                    }));
                    setAccessData(defaultModules);
                    setOriginalAccessData(JSON.parse(JSON.stringify(defaultModules)));
                }
            }
        } catch (error) {
            console.error('Error loading access rights from data', error);
            Swal.fire({ title: 'Error', text: 'Error loading access rights', icon: 'error' });
            setAccessData([]);
            setOriginalAccessData([]);
        } finally {
            setLoading(false);
        }
    };

    const updatePermission = (moduleName, screenName, field, value) => {
        setAccessData(prev => prev.map(mod => {
            if (mod.moduleName === moduleName) {
                return {
                    ...mod,
                    screens: mod.screens.map(scr => {
                        if (scr.screenName === screenName) {
                            const newPerms = { ...scr.permissions, [field]: value };
                            const hasAnyOther = Object.keys(newPerms).some(k => 
                                k !== 'view' && k !== 'recordsPerPage' && newPerms[k]
                            );
                            if (hasAnyOther && !newPerms.view) {
                                newPerms.view = true;
                            }
                            return { ...scr, permissions: newPerms };
                        }
                        return scr;
                    })
                };
            }
            return mod;
        }));
    };

    const toggleModule = (moduleName, checked) => {
        setAccessData(prev => prev.map(mod => {
            if (mod.moduleName === moduleName) {
                return {
                    ...mod,
                    screens: mod.screens.map(scr => ({
                        ...scr,
                        permissions: {
                            ...scr.permissions,
                            view: checked,
                            edit: checked,
                            delete: checked,
                            post: checked,
                            save: checked,
                            print: checked,
                            viewRate: checked,
                            sendMail: checked,
                            viewDetails: checked,
                        }
                    }))
                };
            }
            return mod;
        }));
    };

   const getModifiedData = () => {
    const modified = [];

    accessData.forEach(module => {
        const originalModule = originalAccessData.find(m => m.moduleName === module.moduleName);
        const modifiedScreens = [];

        module.screens.forEach(screen => {
            const perms = screen.permissions || {};

            // Check empty permissions (all false)
            const allEmpty = Object.entries(perms).every(([key, val]) => {
                if (key === "recordsPerPage") return true;
                return val === false || val === "" || val === null || val === undefined;
            });

            const originalScreen = originalModule?.screens.find(
                s => s.screenName === screen.screenName
            );

            // CASE 1: New screen (not in DB)
            if (!originalScreen) {
                // If new screen has all permissions false → ignore (no need to save)
                if (!allEmpty) {
                    modifiedScreens.push(screen);  // INSERT
                }
                return;
            }

            // CASE 2: Existing screen (already in DB)
            if (allEmpty) {
                // User unchecked all permissions → DELETE
                modifiedScreens.push({
                    ...screen,
                    __delete: true       // flag to delete in backend
                });
                return;
            }

            // CASE 3: Check for differences (UPDATE)
            const isDifferent = Object.keys(perms).some(key => {
                return perms[key] !== originalScreen.permissions[key];
            });

            if (isDifferent) {
                modifiedScreens.push(screen);
            }
        });

        if (modifiedScreens.length > 0) {
            modified.push({
                moduleName: module.moduleName,
                screens: modifiedScreens
            });
        }
    });

    return modified;
};



    const handleSave = async () => {
        if (!selectedRole || !selectedDept) {
            Swal.fire({ title: 'Please select Role and Department', icon: 'warning' });
            return;
        }

        const modifiedData = getModifiedData();
        if (modifiedData.length === 0) {
            Swal.fire({ title: 'No changes detected', icon: 'info' });
            return;
        }

        // Get user data from localStorage
        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');


        // Find selected department and role objects to get their IDs (supporting various response shapes)
        const selectedDeptObj = departments.find(d => d.departmentCode === selectedDept || d.value === selectedDept);
        // Try to match by roleCode, value, or name (for dropdowns with id/name)
        const selectedRoleObj = roles.find(r => r.roleCode === selectedRole || r.value === selectedRole || r.name === selectedRole);

        const headerData = {
            headerId: headerId || 0,
            role: selectedRole,
            department: selectedDept,
            DepartmentId: selectedDeptObj ? (selectedDeptObj.departmentId || selectedDeptObj.value || selectedDeptObj.id) : null,
            RoleId: selectedRoleObj ? (selectedRoleObj.roleId || selectedRoleObj.value || selectedRoleObj.id) : null,
            effectiveDate: new Date().toISOString(),
            isHOD: selectedHOD,
            userId: String(authUser.u_id || ''),
            // Only include modules with at least one non-empty, changed screen
            modules: (modifiedData || []).filter(module => Array.isArray(module.screens) && module.screens.length > 0)
        };

        if (mode === 'create') {
            headerData.isActive = isActive;
        }

        const postData = {
            header: headerData
        };

        try {
    let response;

    if (mode === 'edit' && headerId) {
        const updatedHeader = { ...postData.header };
        delete updatedHeader.isActive;
        response = await UpdateAccessRights(headerId, { Request: updatedHeader });
    } else if (mode === 'create') {
        response = await SaveAccessRights(postData);
    } else {
        Swal.fire({ title: 'Error', text: 'Invalid operation mode', icon: 'error' });
        return;
    }

    if (response?.status) {
        Swal.fire({ title: 'Success', text: 'Access rights saved successfully', icon: 'success' }).then(() => {
            history.push('/admin-roles');
        });
    } else {
        Swal.fire({ title: 'Error', text: response.message || 'Failed to save access rights', icon: 'error' });
    }
} catch (error) {
    Swal.fire({ title: 'Error', text: 'An error occurred while saving', icon: 'error' });
}
    };

    const toggle = (id) => {
        if (open.includes(id)) {
            setOpen(open.filter(s => s !== id));
        } else {
            setOpen([...open, id]);
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Access Rights" breadcrumbItem="Access Rights" />
                    <Row>
                        <Col md="4">
                            <FormGroup>
                                <Label for="role">Role</Label>
                                <Input type="select" id="role" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                                    <option value="">Select Role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <Label for="department">Department</Label>
                                <Input type="select" id="department" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.departmentId} value={dept.departmentCode}>{dept.departmentCode}</option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md="4">
                            <FormGroup>
                                <Label for="hod">HOD</Label>
                                <Input type="select" id="hod" value={selectedHOD ? 'Yes' : 'No'} onChange={e => setSelectedHOD(e.target.value === 'Yes')}>
                                    <option>Yes</option>
                                    <option>No</option>
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col className="text-end">
                            <Button color="success" onClick={handleSave}>Save All Changes</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12">
                            <Card>
                                <CardBody>
                                    {loading ? (
                                        <p>Loading...</p>
                                    ) : (
                                        <Accordion open={open} toggle={toggle}>
                                            {accessData.map((module, index) => (
                                                <AccordionItem key={module.moduleName}>
                                                    <AccordionHeader targetId={index.toString()}>
                                                        <strong>{module.moduleName} Module</strong>
                                                        <Input
                                                            type="checkbox"
                                                            id={`select-all-${module.moduleName}`}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                toggleModule(module.moduleName, e.target.checked);
                                                            }}
                                                            onClick={e => e.stopPropagation()}
                                                            style={{ marginLeft: '10px' }}
                                                        />
                                                    </AccordionHeader>
                                                    <AccordionBody accordionId={index.toString()}>
                                                        <Table bordered>
                                                            <thead>
                                                                <tr>
                                                                    <th>Screen</th>
                                                                    <th>View</th>
                                                                    <th>Edit</th>
                                                                    <th>Delete</th>
                                                                    <th>Post</th>
                                                                    <th>Save</th>
                                                                    <th>Print</th>
                                                                    <th>View Rate</th>
                                                                    <th>Send Mail</th>
                                                                    <th>View Details</th>
                                                                    <th>Records/Page</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {module.screens.map(screen => (
                                                                    <tr key={screen.screenName}>
                                                                        <td>{screen.screenName}</td>
                                                                        {[
                                                                            'view', 'edit', 'delete', 'post', 'save', 'print', 'viewRate', 'sendMail', 'viewDetails'
                                                                        ].map(field => (
                                                                            <td key={field} style={{ textAlign: 'center' }}>
                                                                                <Input
                                                                                    type="checkbox"
                                                                                    checked={screen.permissions[field]}
                                                                                    onChange={e => updatePermission(module.moduleName, screen.screenName, field, e.target.checked)}
                                                                                />
                                                                            </td>
                                                                        ))}
                                                                        <td>
                                                                            <Input
                                                                                type="number"
                                                                                value={screen.permissions.recordsPerPage}
                                                                                onChange={e => updatePermission(module.moduleName, screen.screenName, 'recordsPerPage', parseInt(e.target.value) || 0)}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </AccordionBody>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
}

export default RolesAccessRights;
