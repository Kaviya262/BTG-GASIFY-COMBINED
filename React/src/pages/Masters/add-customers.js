import React, { useState, useEffect, useRef } from "react";
import { useHistory, useNavigate } from "react-router-dom";
import { Button, Col, Container, FormGroup, Label, Row, TabContent, TabPane, NavItem, Table, NavLink, Input, UncontrolledAlert, ModalBody, Modal } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import classnames from "classnames";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import Select from 'react-select';
import { GetContactName, GetSalesPerson, SaveTab1, SaveTab2, SaveTab3, SaveTab1Doc, GetDepartment, SaveTab1GetById, SaveTab2GetById, SaveTab3GetById, fetchTab1CutomerList, fetchTab2ContactList, fetchTab3AddressList, toggleChangeContactStatus, toggleChangeAddressStatus } from "../../../src/common/data/mastersapi";

const Addcontacts = () => {

    const location = useLocation();
    const [contactName, setContactName] = useState([]);
    const contactData = location.state?.contactData;
    const existEmails = location.state?.emaillist || [];
    const [submitAction, setSubmitAction] = useState("save");
    const history = useHistory();
    const [activeTab, setActiveTab] = useState(1);
    const [successMsg, setSuccessMsg] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);
    const newCustomerIdRef = useRef(null);
    const API_URL = process.env.REACT_APP_API_URL;
    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };
    const [isAddressEditing, setIsAddressEditing] = useState(false);
    const [file, setFile] = React.useState();
    const [customerDetails, setCustomerDetails] = useState([]);
    const [contactDetails, setcontactDetails] = useState([]);
    const [contactaddressDetails, setaddressDetails] = useState([]);
    const [customerId, setCustomerId] = useState(null);
    const [switchStates, setSwitchStates] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tabType, setTabType] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [txtStatus, setTxtStatus] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [editingContact, setEditingContact] = useState(null);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressSubmitAction, setAddressSubmitAction] = useState("save");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalCallback, setModalCallback] = useState(() => () => { });
    const [mainAddressExists, setMainAddressExists] = useState(false);
    const [newCustomerId, setNewCustomerId] = useState(null);
    const [billingAddressExists, setBillingAddressExists] = useState(false);
    const [SalesPersonList, setSalesPersonList] = useState([]);
    const [initialValues3, setInitialValues3] = useState({
        addresscontact: "",
        addresstype: "",
        address: "",
        location: "",
        customerId: newCustomerId,
    });
    const [initialValues, setInitialValues] = useState({
        id: '',
        contactId: '',
        addressId: '',
        contactname: '',
        email: '',
        ccemail: '',
        phoneno: '',
        faxno: '',
        country: '',
        city: '',
        zone: '',
        businessForm: '',
        businessField: '',
        btgcontactname: '',
        remarks: '',
        poNumber: '',
        file: '',
        CreditLimitinIDR: ''

    });

    const loadContactNameList = async (newCustomerId) => {
        debugger;
        if (newCustomerId !== null && newCustomerId !== undefined && newCustomerId !== 0) {
            try {
                const data = await GetContactName(newCustomerId);
                if (data && data.length > 0) {
                    const formatted = data.map(item => ({
                        label: item.ContactName,
                        value: item.ContactId.toString(),
                    }));
                    setContactName(formatted);
                } else {
                    setContactName([]);
                    toast.warning("No contacts found for this customer. Please create a contact to proceed.");
                }
            } catch (err) {
                console.error("Failed to load contact names:", err);
            }
        }
    };
    useEffect(() => {
        debugger
        const loadSalesPersonList = async () => {
            try {
                debugger
                const res = await GetSalesPerson(1, 0);
                if (res && Array.isArray(res)) {
                    const formatted = res.map(sp => ({
                        value: sp.SalesPersonId,
                        label: sp.SalesPersonName
                    }));
                    setSalesPersonList(formatted);
                } else {
                    console.error('Expected an array but got:', res);
                }
            } catch (error) {
                console.error('Error loading sales person list:', error);
            }
        };

        loadSalesPersonList();
    }, []);

    useEffect(() => {
        debugger;
        const contactData = location.state?.contactData;
        if (contactData && contactData.Id) {
            loadCustomerDetail();
        }
    }, [location.state]);

    const loadCustomerDetail = async () => {
        if (!contactData?.Id) return;
        debugger
        try {
            const result = await fetchTab1CutomerList(contactData.Id);
            if (result) {
                debugger
                setCustomerDetails(result);
                debugger
                setInitialValues({
                    id: result.Id?.toString() || "",
                    contactId: result.ContactId?.toString() || "",
                    addressId: result.AddressId?.toString() || "",
                    contactname: result.CustomerName || "",
                    phoneno: result.PhoneNumber || "",
                    businessForm: result.BusinessFormId?.toString() || "",
                    businessField: result.BusinessFieldId?.toString() || "",
                    email: result.Email || "",
                    ccemail: result.CC_Email || "",
                    faxno: result.Fax || "",
                    btgcontactname: result.SalesPersonId || "",
                    remarks: result.Remarks || "",
                    country: result.CountryId?.toString() || "",
                    city: result.CityId?.toString() || "",
                    zone: result.ZoneId?.toString() || "",
                    poNumber: result.PoNumber,
                    file: result.LegalDocumentPath,
                    CreditLimitinIDR: result.CreditLimitinIDR,
                    file: result.LegalDocumentPath,
                });
                setFileupload(result.LegalDocumentPath);
                setCustomerId(contactData.Id);
            }
        } catch (err) {
            console.error("Failed to load customer details:", err);
            toast.error("Error loading customer details");
        }
    };



    const validationSchema = Yup.object({
        contactname: Yup.string()
            .required("Name is required")
            .min(3, "Name must be at least 3 characters")
            .max(50, "Name cannot exceed 50 characters"),

        country: Yup.string().required("Country is required"),

        phoneno: Yup.string().required("Phone No. is required"),

        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required")
            .test("unique-email", "Email should be unique", function (value) {
                debugger
                console.log("this.options.context", this.options.context);
                const { id, email } = this.options.context || {};

                console.log("existEmails", existEmails);
                console.log("email", email);
                console.log("contactData", contactData);

                const safeEmails = Array.isArray(existEmails) ? existEmails.map(e => e.toLowerCase()) : [];

                if (!value) return true;

                if (id && email?.toLowerCase() === value.toLowerCase()) {
                    return true;
                }

                return !safeEmails.includes(value.toLowerCase());
            }),

        ccemail: Yup.string().email("Invalid CC email address").notRequired(),

        faxno: Yup.string()
            .matches(/^[0-9]*$/, "Fax number must contain only digits")
            .max(15, "Fax number cannot exceed 15 digits")
            .notRequired(),

        CreditLimitinIDR: Yup.number()
            .nullable()
            .typeError("Credit Limit must be a number")
            .notRequired(),

        businessForm: Yup.string().required("Business Form is required"),

        businessField: Yup.string().required("Business Field is required"),

        city: Yup.string().required("City is required"),

        zone: Yup.string().required("Zone is required"),

        btgcontactname: Yup.string().required("BTG Sales Person is required"),

        remarks: Yup.string().max(500, "Remarks cannot exceed 500 characters").notRequired(),
    });

    const [initialValues2, setInitialValues2] = useState({

        contactId: 0,
        customerId: newCustomerId,
        contactname: '',
        email: '',
        department: '1',
        deskphone: '',
        hpphone: '',
    });

    const [isContactEditing, setContactIsEditing] = useState(false);
    const [isaddressEditing, setAddressIsEditing] = useState(false);

    const commonCustomerId = contactDetails[0]?.CustomerId || newCustomerId || 0;
    const validationSchema3 = (contactaddressDetails, editcustomerId) => Yup.object({
        addresstype: Yup.number()
            .oneOf([2, 3, 4], 'Please select a valid Address Type')
            .required('Address Type is required'),

        addresscontact: Yup.string()
            .required('Contact Name is required'),

        location: Yup.string()
            .required('Location is required')
            .min(2, 'Location must be at least 2 characters')
            .max(100, 'Location cannot exceed 100 characters')
            .test(
                'unique-combination',
                'This AddressType with same Location already Exists!',
                function (value) {
                    debugger
                    const { addresstype } = this.parent;

                    if (!addresstype || !value) return true;

                    const isDuplicate = contactaddressDetails.some(item =>
                        item.AddressTypeId === addresstype &&
                        item.Location &&
                        item.Location.toLowerCase() === value.toLowerCase() &&
                        item.AddressId !== editcustomerId
                    );

                    return !isDuplicate;
                }
            ),

        address: Yup.string()
            .required('Address is required')
            .min(5, 'Address must be at least 5 characters')
            .max(250, 'Address cannot exceed 250 characters'),

    });


    useEffect(() => {
        const commonCustomerId = contactDetails.length > 0
            ? contactDetails[0].CustomerId
            : newCustomerId;

        setInitialValues2((prev) => ({
            ...prev,
            customerId: commonCustomerId || 0,
        }));
    }, [contactDetails, newCustomerId]);

    useEffect(() => {
        const savedId = sessionStorage.getItem("newCustomerId");
        if (savedId) {
            setNewCustomerId(savedId);
            newCustomerIdRef.current = savedId;
        }
    }, []);

    const [fileupload, setFileupload] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            setFileupload(null);
            setPreviewUrl(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Please select a valid PDF, Excel (.xls, .xlsx), or CSV file.");
            setFileupload(null);
            setPreviewUrl(null);
            return;
        }

        setFileupload(file);

        if (file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    useEffect(() => {
        debugger
        console.log("ExistEmails", existEmails);
        console.log("contactData", contactData);
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleSubmitTab1 = async (values, { setSubmitting, resetForm }) => {
        // if (!fileupload) {
        //     toast.error("Please upload a file before submitting.");
        //     setSubmitting(false);
        //     return;
        // }
        debugger
        try {
            const payload = {
                customer: {
                    Id: values.id || 0,
                    CustomerName: values.contactname,
                    Email: values.email,
                    SalesPersonId: values.btgcontactname,
                    CountryId: values.country,
                    Cc_Email: values.ccemail,
                    Remarks: values.remarks,
                    PhoneNumber: values.phoneno,
                    Fax: values.faxno,
                    UserId: values.UserId,
                    UserIP: values.UserIP,
                    IsActive: true,
                    OrgId: 1,
                    BranchId: 1,
                    BusinessFormId: values.businessForm,
                    BusinessFieldId: values.businessField,
                    CityId: values.city,
                    ZoneId: values.zone,
                    PoNumber: !!values.poNumber,
                    CreditLimitinIDR: values.CreditLimitinIDR === "" ? null : Number(values.CreditLimitinIDR),
                },
                tabId: 1,
                customerAddresses: [],
                customerContacts: [],
            };

            const response = await SaveTab1(payload);

            if (response.statusCode === 0) {
                const newCustomerId = response.data?.customerId;
                if (newCustomerId) {
                    setNewCustomerId(newCustomerId);
                    debugger
                    if (fileupload instanceof File) {
                        const formData = new FormData();
                        formData.append("file", fileupload);
                        formData.append("customerId", newCustomerId);
                        formData.append("branchId", 1);
                        formData.append("userId", 1);

                        const uploadResponse = await SaveTab1Doc(newCustomerId, fileupload, 1, 1);
                        if (uploadResponse.status === 200) {
                            toast.success(values.Id && values.Id !== 0 ? "Customer updated successfully." : "Customer created successfully.");
                            toggleTab(2);
                            loadTab2list(newCustomerId);
                            await loadDepartments();
                            resetForm();
                            return;
                        } else {
                            toast.error(uploadResponse.message || "Document upload failed.");
                        }
                    } else {
                        toast.success(values.id && values.id !== 0 ? "Customer updated successfully." : "Customer created successfully.");
                        toggleTab(2);
                        loadTab2list(newCustomerId);
                        await loadDepartments();
                        resetForm();
                        return;
                    }
                }
            } else {
                toast.error(response.message || "Submission failed");
            }
        } catch (error) {
            console.error("Submission error:", error);
            const errorToastId = "unexpected-error";
            if (!toast.isActive(errorToastId)) {
                toast.error("An unexpected error occurred.", {
                    toastId: errorToastId
                });
            }
        } finally {
            setSubmitting(false);
        }
    };
    // useEffect(() => {
    //     if (newCustomerId) {
    //         loadTab2list(newCustomerId);
    //     } else if (contactData && contactData.ContactId) {
    //         loadTab2list(contactData.ContactId);
    //     }
    // }, [newCustomerId, contactData]);

    const loadTab2list = async (customerId, contactData, resetForm, contactId) => {
        debugger
        if (!customerId) return;

        const sendCustomerId = customerId || 0;
        const sendContactId = contactId || 0;
        try {
            const result = await fetchTab2ContactList(sendCustomerId || 0, sendContactId || 0);
            debugger
            if (result) {
                handleCancel();
                setContactIsEditing(false);
                setcontactDetails(result);
            } else {
                setcontactDetails([]);
            }
        } catch (error) {
            console.error("Failed to fetch contact list:", error);
            setcontactDetails([]);
        }

    };
    const resetAllFields = (resetFormFn, newCustomerId = 0) => {
        resetFormFn({
            values: {
                contactId: 0,
                customerId: newCustomerId,
                contactname: '',
                email: '',
                department: '',
                deskphone: '',
                hpphone: '',
            },
        });
    };
    const loadTab3list = async (newCustomerId, contactData, contactaddressDetails) => {
        debugger
        const sendCustomerId = newCustomerId || 0;
        const sendContactId = contactData?.Id || contactaddressDetails?.contactId || 0;
        const result = await fetchTab3AddressList(sendCustomerId, sendContactId);
        debugger
        if (result) {
            setaddressDetails(result);
            loadContactNameList(newCustomerId);
        } else {
            setaddressDetails([]);
        }
    };
    const loadCustomerDetails = async (contactData) => {
        debugger
        const result = await fetchTab1CutomerList(contactData.Id);
        if (result) {
            setCustomerDetails(result);
            debugger
            setInitialValues({
                id: result.Id?.toString() || "",
                contactId: result.ContactId?.toString() || "",
                addressId: result.AddressId?.toString() || "",
                contactname: result.CustomerName || "",
                phoneno: result.PhoneNumber || "",
                businessForm: result.BusinessFormId?.toString() || "",
                businessField: result.BusinessFieldId?.toString() || "",
                email: result.Email || "",
                ccemail: result.CC_Email || "",
                faxno: result.Fax || "",
                btgcontactname: result.SalesPersonId || "",
                remarks: result.Remarks || "",
                country: result.CountryId?.toString() || "",
                city: result.CityId?.toString() || "",
                zone: result.ZoneId?.toString() || "",
                poNumber: result.PoNumber,
                file: result.LegalDocumentPath,
                CreditLimitinIDR: result.CreditLimitinIDR,
                file: result.LegalDocumentPath,
            });
            setFileupload(result.LegalDocumentPath);
            setCustomerId(contactData.Id);
        }
    };
    const validationSchema2 = Yup.object({
        contactname: Yup.string()
            .required('Contact Name is required')
            .min(3, 'Contact Name must be at least 3 characters')
            .max(50, 'Contact Name cannot exceed 50 characters'),

        email: Yup.string()
            .required('Email is required')
            .email('Invalid email address'),

        department: Yup.string()
            .required('Department is required'),

        deskphone: Yup.string()
            .matches(/^[\d\+\-\s\(\)]{7,20}$/, 'Invalid desk phone number')
            .notRequired(),

        hpphone: Yup.string()
            .matches(/^[\d\+\-\s\(\)]{7,20}$/, 'Invalid hand phone number')
            .notRequired(),
    });
    const addressTypeLabels = {
        2: "Main Address",
        3: "Billing Address",
        4: "Delivery Address"
    };

    function getAddressTypeLabel(typeId) {
        return addressTypeLabels[typeId] || "Unknown";
    }

    const loadAddressDetails = async (contactData) => {
        debugger;
        const result = await fetchTab3AddressList(contactData);
        if (result) {
            setBillingAddressExists(result.some(item => item.AddressTypeId === 2));
            const mappedAddressDetails = result.map(item => ({
                id: item.AddressId,
                addresstype: getAddressTypeLabel(item.AddressTypeId),
                name: item.ContactName || "Unknown",
                address: item.Address,
                location: item.Location,
                active: item.IsActive === 1,
                code: item.AddressId,
            }));

            setaddressDetails(mappedAddressDetails);
        }
    };

    function mapCountryToId(countryName) {
        const map = {
            Indonesia: 1,
            Malaysia: 2,
            Singapore: 3,
            China: 4,
            Taiwan: 5,
            India: 6,
        };
        return map[countryName] || 0;
    }
    const contactList = [
        { id: 1, name: "Muthu" },
        { id: 2, name: "John" },
    ];

    function mapBusinessFormToId(businessForm) {
        const map = {
            PT: 1,
            CV: 2,
            UD: 3,
            "Pte Ltd": 4,
        };
        return map[businessForm] || 0;
    }

    function mapBusinessFieldToId(businessField) {
        const map = {
            Manufacturing: 1,
            Services: 2,
            Trading: 3,
        };
        return map[businessField] || 0;
    }

    function mapCityToId(city) {
        const map = {
            Batam: 1,
            Medan: 2,
            Jakarta: 3,
        };
        return map[city] || 0;
    }

    function mapZoneToId(zone) {
        const map = {
            "Tanjung Uncang": 1,
            Kabil: 2,
            "Batam Center": 3,
        };
        return map[zone] || 0;
    }
    const resetUpdatedAddressForm = (setFieldValue) => {
        setFieldValue('addresstype', '');
        setFieldValue('addresscontact', '');
        setFieldValue('location', '');
        setFieldValue('address', '');
        setFieldValue('contactId', '');
        setFieldValue('addressId', '');

        setIsAddressEditing(false);
        setAddressSubmitAction("save");
    };


    const onSwitchChange = async () => {
        debugger
        if (!selectedRow) return;
        debugger
        const newisActive = selectedRow.IsActive === 1 ? 0 : 1;
        const payload = {
            customerId: selectedRow.CustomerId,
            contactId: selectedRow.ContactId || 0,
            addressId: selectedRow.AddressId || 0,
            branchId: 1,
            userId: 1,
            isActive: newisActive === 1
        };

        try {
            let response; debugger
            if (tabType === 'contact') {
                response = await toggleChangeContactStatus(payload);

            } else if (tabType === 'address') {
                response = await toggleChangeAddressStatus(payload);
            }
            debugger
            if (response?.statusCode === 0) {
                toast.success(`Customer Contact ${payload.isActive === true ? 'Activated' : 'Deactivated'} Successfully!`);

                if (tabType === 'contact') {
                    setSwitchStates(prev => ({
                        ...prev,
                        [selectedRow.ContactId]: newisActive === 1
                    }));
                    loadTab2list(newCustomerId);
                }
                if (tabType === 'address') {
                    setSwitchStates(prev => ({
                        ...prev,
                        [selectedRow.AddressId]: newisActive === 1
                    })); debugger
                    const custId = selectedRow.CustomerId || newCustomerId || 0;
                    loadTab3list(custId, contactData);
                }
            } else {
                toast.error(response?.message || "Toggle failed.");
            }
        } catch (error) {
            toast.error("An error occurred during toggle.");
        } finally {
            setIsModalOpen(false);
        }
    };
    const handleAddressCancel = () => {
        debugger
        setIsAddressEditing(false);
        history.push("/manage-customer");
    };
    // const getAddressTypeLabel = (id) => {
    //     const types = {
    //         2: "Mailing Address",
    //         3: "Billing Address",
    //         4: "Delivery Address"
    //     };
    //     return types[id] || "-";
    // };
    const handleEditContact = (contact) => {
        debugger
        setInitialValues2({
            contactId: contact.ContactId,
            customerId: contact.CustomerId,
            contactname: contact.contactname,
            email: contact.Email,
            department: Number(contact.DepartmentId),
            deskphone: contact.DeskPhone,
            hpphone: contact.HandPhone,
        });
        setContactIsEditing(true);
    };
    const handleEditAddress = (item) => {
        debugger
        setInitialValues3({
            addressId: item.AddressId || 0,
            addresscontact: item.ContactId?.toString() || "",
            addresstype: item.AddressTypeId ? Number(item.AddressTypeId) : null, // Set as number, not array
            address: item.Address || "",
            location: item.Location || "",
            customerId: item.CustomerId || newCustomerId || 0,
        });

        setAddressIsEditing(true);
    };

    const handleCancelFile = () => {
        setFileupload(null);
        setPreviewUrl(null);
        const input = document.getElementById('legalDocument');
        if (input) input.value = '';
    };

    const handleEditAddressForm = (item) => {
        debugger
        const addressTypeMap = {
            "Main Address": "2",
            "Billing Address": "3",
            "Delivery Address": "4",
        };
        const contactList = [
            { id: 1, name: "Muthu" },
            { id: 2, name: "John" },
        ];
        const selectedContact = contactList.find(c => c.name === item.name);
        const selectedContactId = selectedContact ? selectedContact.id : "";
        const addressTypes = Array.isArray(item.addresstype)
            ? item.addresstype.map((type) => addressTypeMap[type] || type)
            : item.addresstype?.split(",").map((type) => addressTypeMap[type.trim()] || type.trim()) || [];
        setInitialValues3({
            addresscontact: selectedContactId || "",
            location: item.location || "",
            address: item.address || "",
            addresstype: addressTypes,
        });
        setAddressIsEditing(true);
    };
    // Get the address types already used
    const isMailingAddressUsed = contactaddressDetails.some(item => item.AddressTypeId === 2);
    const handleSubmitTab2 = async (values, { setSubmitting, resetForm }) => {
        debugger
        const customerIdToUse = newCustomerId || contactData?.Id || values.customerId || 0;
        const editContactId = contactData?.ContactId || 0;

        if (!customerIdToUse) {
            toast.error("Customer ID is missing. Please create or select a customer first.");
            setSubmitting(false);
            return;
        }
        if (submitAction === "update") {
            const isNewContact = !values.contactId;
            const customerIdToUse = values.customerId;

            if (!customerIdToUse) {
                toast.error("Please create general details first to proceed");
                setSubmitting(false);
                return;
            }

            if (!values.email) {
                toast.error("Email is required for update");
                setSubmitting(false);
                return;
            }
            if (!values.contactname) {
                toast.error("Contact name is required for update");
                setSubmitting(false);
                return;
            }
        }

        const contactPayload = {
            ContactId: values.contactId || editContactId || 0,
            CustomerId: customerIdToUse,
            Department: String(values.department),
            HandPhone: values.hpphone,
            Email: values.email,
            DeskPhone: values.deskphone,
            UserId: 1,
            BranchId: 1,
            IsActive: true,
            Contactname: values.contactname
        };
        const payload = {
            customer: null,
            customerContacts: [contactPayload],
            customerAddresses: [],
            TabId: 2
        };

        try {
            debugger
            const response = await SaveTab2(payload);
            debugger
            if (response.statusCode === 0) {
                toast.success(
                    payload.customerContacts[0].ContactId === 0
                        ? "Created successfully."
                        : "Updated successfully."
                );
                resetForm();
                loadTab2list(customerIdToUse);
            } else if (response.statusCode === 1) {
                toast.error(response.message || "Duplicate email found.");
            } else if (response.statusCode === 2) {
                toast.error(response.message || "Duplicate contact name found.");
            } else {
                toast.error(response.message || "Submission failed.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            const errorToastId = "unexpected-error";
            if (!toast.isActive(errorToastId)) {
                toast.error("An unexpected error occurred.", {
                    toastId: errorToastId
                });
            }
        } finally {
            setSubmitting(false);
            setSubmitAction("save");
        }
    };
    const handleSubmitTab3 = async (values, { setSubmitting, resetForm }) => {
        debugger

        const customerIdToUse = newCustomerId || contactData?.Id || values.customerId || 0;
        const customerAddress = {
            ContactId: parseInt(values.addresscontact, 10) || 0,
            CustomerId: customerIdToUse,
            Location: values.location,
            Address: values.address,
            UserId: 1,
            BranchId: 1,
            UserIP: "127.0.0.1",
            IsActive: true,
            AddressTypeId: values.addresstype,
            AddressId: values.addressId,
        };

        const payload = {
            customer: null,
            customerContacts: [],
            CustomerAddresses: [customerAddress],
            TabId: 3,
        };

        try {
            const response = await SaveTab3(payload);
            if (response.statusCode === 0) {
                toast.success("Address saved successfully.");
                resetForm();
                loadTab3list(customerIdToUse);
            } else {
                toast.error(response.message || "Submission failed.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            const errorToastId = "unexpected-error";
            if (!toast.isActive(errorToastId)) {
                toast.error("An unexpected error occurred.", {
                    toastId: errorToastId
                });
            }


        } finally {
            setSubmitting(false);
            setSubmitAction("save");
        }
    };
    const handleCancelCustomer = () => {
        history.push("/manage-customer");
    };

    const toggleTab1 = (tab, contactData) => {
        debugger
        //if (activeTab == tab) {
        //  setActiveTab(tab);
        if (tab === 1) {
            setActiveTab(tab);
            loadCustomerDetails(contactData);
        }
        // }

    };
    const toggleTab3 = (tab, contactData, newCustomerId) => {
        debugger
        if (tab == 3) {
            if (contactData?.Id) {
                setActiveTab(tab);
                loadTab3list(contactData.Id, contactData);
            }
            else if (newCustomerId) {
                setActiveTab(tab);
                loadTab3list(newCustomerId)
            }
            else {
                const toastId = "customer-warning";
                if (!toast.isActive(toastId)) {
                    toast.error("Please create or add a customer first..", {
                        toastId: toastId
                    });
                }
                return;
            }


        }

    };

    const handleRemoveItem = (index) => {
        const updatedDetails = contactDetails.filter((_, i) => i !== index);
        setcontactDetails(updatedDetails);
    };
    const resetUpdatedForm = (resetFormFn) => {
        debugger
        resetFormFn({
            values: {
                contactId: 0,
                customerId: newCustomerId,
                contactname: '',
                email: '',
                department: '',
                deskphone: '',
                hpphone: '',
            }
        });
        setContactIsEditing(false);
    };

    const openModal = (rowData, type) => {
        debugger
        const value = rowData.IsActive === 1 ? "deactive" : "active";
        setTxtStatus(value);
        setSelectedRow(rowData);
        setIsModalOpen(true);
        setTabType(type);

    };
    useEffect(() => {
        fetchContacts();
        fetchAddresses();
    }, []);

    const fetchContacts = async () => {
        //const res = await axios.get("/api/contacts");
        // setContacts(res.data);
    };

    const fetchAddresses = async () => {
        //  const res = await axios.get("/api/addresses");
        // setAddresses(res.data);
        //setMainAddressExists(res.data.some((a) => a.addresstype.includes("1")));
    };

    const confirmModal = (callback) => {
        setModalCallback(() => callback);
        setModalOpen(true);
    };
    const handleContactCancel = () => {
        debugger
        setInitialValues2({
            contactId: 0,
            customerId: newCustomerId || 0,
            contactname: "",
            email: "",
            department: "",
            deskphone: "",
            hpphone: ""
        });
        history.push("/manage-customer");
    };


    const handleCancel = () => {
        setInitialValues2({
            contactId: 0,
            customerId: newCustomerId,
            contactname: '',
            email: '',
            department: '',
            deskphone: '',
            hpphone: '',
        });
        setContactIsEditing(false);
    };
    const toggleTab2 = async (tab, contactData, newCustomerId) => {
        debugger
        if (tab === 2) {
            if (contactData?.Id) {
                setActiveTab(tab);
                await loadDepartments();
                loadTab2list(contactData.Id, contactData);
            } else if (newCustomerId) {
                setActiveTab(tab);
                await loadDepartments();
                loadTab2list(newCustomerId);
            } else {
                const toastId = "customer-warning";
                if (!toast.isActive(toastId)) {
                    toast.error("Please create or add a customer first..", {
                        toastId: toastId
                    });
                }
                return;
            }
        }
        setActiveTab(tab);
    };

    const [departmentlist, setDepartment] = useState([]);

    const loadDepartments = async () => {
        try {
            debugger;
            const res = await GetDepartment(null);
            if (res && Array.isArray(res.data)) {
                const formatted = res.data.map(dep => ({
                    value: dep.DepartmentId,
                    label: dep.DepartmentName
                }));
                setDepartment(formatted);
            } else {
                console.error('Expected an array but got:', res.data);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    };

    debugger;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Masters" breadcrumbItem="Customer" />
                    <Row>
                        <Col xl="12">
                            <div className="wizard clearfix">
                                <div className="steps clearfix">
                                    <ul>
                                        <NavItem className={classnames({ current: activeTab === 1 })}>
                                            <NavLink
                                                className={classnames({ active: activeTab === 1 })}
                                                onClick={() => toggleTab1(1, contactData)}
                                            >
                                                <span className="number">
                                                    <i className="bx bx-user-plus label-icon font-size-18 mt-1"></i>
                                                </span>
                                                <span className="font-size-15">General</span>
                                            </NavLink>
                                        </NavItem>


                                        <NavItem className={classnames({ current: activeTab === 2 })}>
                                            <NavLink
                                                className={classnames({ active: activeTab === 2 })}
                                                onClick={() => toggleTab2(2, contactData, newCustomerId)} // we setting some fefault valu nee dto cahneg in future
                                            >
                                                <span className="number">
                                                    <i className="bx bxs-contact label-icon font-size-18 mt-1"></i>
                                                </span>
                                                <span className="font-size-15">Contact</span>
                                            </NavLink>
                                        </NavItem>

                                        <NavItem className={classnames({ current: activeTab === 3 })}>
                                            <NavLink
                                                className={classnames({ active: activeTab === 3 })}
                                                onClick={() => toggleTab3(3, contactData, newCustomerId)}
                                            >
                                                <span className="number">
                                                    <i className="bx bxs-institution label-icon font-size-18 mt-1"></i>
                                                </span>
                                                <span className="font-size-15">Address</span>
                                            </NavLink>
                                        </NavItem>
                                    </ul>
                                </div>
                                <div className="content clearfix">
                                    <TabContent activeTab={activeTab} className="body pt-0">
                                        <TabPane tabId={1}>
                                            <Formik
                                                initialValues={initialValues}
                                                validationSchema={validationSchema}
                                                onSubmit={handleSubmitTab1}
                                                enableReinitialize={true}
                                                context={{ emails: existEmails, id: initialValues.id }}
                                            >
                                                {({ errors, touched, values, setFieldValue }) => (
                                                    <Form>
                                                        <Field type="hidden" name="id" />
                                                        <Field type="hidden" name="contactId" />
                                                        <Field type="hidden" name="addressId" />
                                                        <div className="row align-items-center g-3 justify-content-end">

                                                            <div className="col-12 col-lg-4 col-md-4 col-sm-4 button-items">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger fa-pull-right"
                                                                    onClick={handleCancelCustomer}
                                                                >
                                                                    <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                                                                    Cancel
                                                                </button>
                                                                <button type="submit" className="btn btn-info fa-pull-right">
                                                                    <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <Row>
                                                            <Col xl="4">
                                                                <FormGroup>
                                                                    <Label htmlFor="contactname" className="required-label">
                                                                        Name
                                                                    </Label>
                                                                    <Field
                                                                        name="contactname"
                                                                        placeholder="Name"
                                                                        type="text"
                                                                        className={`form-control ${errors.contactname && touched.contactname ? "is-invalid" : ""
                                                                            }`}
                                                                    />
                                                                    <ErrorMessage
                                                                        name="contactname"
                                                                        component="div"
                                                                        className="invalid-feedback"
                                                                    />
                                                                </FormGroup>

                                                                <FormGroup>
                                                                    <Label htmlFor="country" className="required-label">
                                                                        Country
                                                                    </Label>
                                                                    <Field
                                                                        as="select"
                                                                        name="country"
                                                                        className={`form-control ${errors.country && touched.country ? "is-invalid" : ""
                                                                            }`}
                                                                    >
                                                                        <option value="">Choose...</option>
                                                                        <option value="1">Indonesia</option>
                                                                        <option value="2">Singapore</option>
                                                                        <option value="3">Malaysia</option>
                                                                        <option value="4">China</option>
                                                                        <option value="5">Taiwan</option>
                                                                        <option value="6">India</option>
                                                                    </Field>
                                                                    <ErrorMessage name="country" component="div" className="error" />
                                                                </FormGroup>

                                                                <FormGroup>
                                                                    <Label htmlFor="phoneno" className="required-label">
                                                                        Phone No.
                                                                    </Label>
                                                                    <Field
                                                                        name="phoneno"
                                                                        placeholder="Phone No."
                                                                        type="text"
                                                                        className={`form-control ${errors.phoneno && touched.phoneno ? "is-invalid" : ""
                                                                            }`}
                                                                    />
                                                                    <ErrorMessage
                                                                        name="phoneno"
                                                                        component="div"
                                                                        className="invalid-feedback"
                                                                    />
                                                                </FormGroup>

                                                                <FormGroup>
                                                                    <Label htmlFor="email" className="required-label">
                                                                        Email
                                                                    </Label>
                                                                    <Field
                                                                        name="email"
                                                                        placeholder="Email"
                                                                        type="email"
                                                                        className={`form-control ${errors.email && touched.email ? "is-invalid" : ""
                                                                            }`}
                                                                    />
                                                                    <ErrorMessage name="email" component="div" className="invalid-feedback" />
                                                                </FormGroup>

                                                                <FormGroup>
                                                                    <Label htmlFor="ccemail">CC Email</Label>
                                                                    <Field
                                                                        name="ccemail"
                                                                        placeholder="CC Email"
                                                                        type="email"
                                                                        className={`form-control ${errors.ccemail && touched.ccemail ? "is-invalid" : ""
                                                                            }`}
                                                                    />
                                                                    <ErrorMessage name="ccemail" component="div" className="invalid-feedback" />
                                                                </FormGroup>

                                                                <FormGroup>
                                                                    <Label htmlFor="faxno">Fax No.</Label>
                                                                    <Field
                                                                        name="faxno"
                                                                        placeholder="Fax No."
                                                                        type="text"
                                                                        className={`form-control ${errors.faxno && touched.faxno ? "is-invalid" : ""
                                                                            }`}
                                                                    />
                                                                    <ErrorMessage name="faxno" component="div" className="invalid-feedback" />
                                                                </FormGroup>

                                                                <FormGroup>
                                                                    <Label htmlFor="CreditLimitinIDR">Credit Limit in IDR.</Label>
                                                                    <Field
                                                                        name="CreditLimitinIDR"
                                                                        placeholder="Enter Credit Limit in IDR."
                                                                        type="text"
                                                                        className={`form-control ${errors.CreditLimitinIDR && touched.CreditLimitinIDR
                                                                            ? "is-invalid"
                                                                            : ""
                                                                            }`}
                                                                    />
                                                                    <ErrorMessage
                                                                        name="CreditLimitinIDR"
                                                                        component="div"
                                                                        className="invalid-feedback"
                                                                    />
                                                                </FormGroup>
                                                            </Col>

                                                            <Col xl="4">
                                                                <FormGroup>
                                                                    <Label htmlFor="businessForm" className="required-label">
                                                                        Business Form
                                                                    </Label>
                                                                    <Field
                                                                        as="select"
                                                                        name="businessForm"
                                                                        className={`form-control ${errors.businessForm && touched.businessForm ? "is-invalid" : ""
                                                                            }`}
                                                                    >
                                                                        <option value="">Choose...</option>
                                                                        <option value="1">PT</option>
                                                                        <option value="2">CV</option>
                                                                        <option value="3">UD</option>
                                                                        <option value="4">Pte Ltd</option>
                                                                    </Field>
                                                                    <ErrorMessage
                                                                        name="businessForm"
                                                                        component="div"
                                                                        className="invalid-feedback"
                                                                    />
                                                                </FormGroup>

                                                                <FormGroup>
                                                                    <Label htmlFor="businessField" className="required-label">
                                                                        Business Field
                                                                    </Label>
                                                                    <Field
                                                                        as="select"
                                                                        name="businessField"
                                                                        className={`form-control ${errors.businessField && touched.businessField ? "is-invalid" : ""
                                                                            }`}
                                                                    >
                                                                        <option value="">Choose...</option>
                                                                        <option value="1">Shipyard</option>
                                                                        <option value="2">Fabrication</option>
                                                                        <option value="3">Engineering</option>
                                                                        <option value="3">Oil & Gas</option>
                                                                    </Field>
                                                                    <ErrorMessage
                                                                        name="businessField"
                                                                        component="div"
                                                                        className="invalid-feedback"
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label htmlFor="btgcontactname" className="required-label">
                                                                        BTG Sales Person
                                                                    </Label>
                                                                    <div className={errors.btgcontactname && touched.btgcontactname ? 'is-invalid' : ''}>
                                                                        <Select
                                                                            id="btgcontactname"
                                                                            name="btgcontactname"
                                                                            styles={{
                                                                                menuList: base => ({
                                                                                    ...base,
                                                                                    maxHeight: "150px",
                                                                                }),
                                                                            }}
                                                                            options={SalesPersonList}
                                                                            placeholder="Select Sales Person"
                                                                            onChange={option =>
                                                                                setFieldValue("btgcontactname", option ? option.value : "")
                                                                            }
                                                                            value={SalesPersonList.find(x => x.value === values.btgcontactname) || null}
                                                                            classNamePrefix={errors.btgcontactname && touched.btgcontactname ? 'react-select is-invalid' : 'react-select'}
                                                                        />
                                                                    </div>
                                                                    <ErrorMessage name="btgcontactname" component="div" className="invalid-feedback" />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label htmlFor="remarks">Remarks</Label>
                                                                    <Field
                                                                        as="textarea"
                                                                        id="remarks"
                                                                        name="remarks"
                                                                        rows="5"
                                                                        placeholder="Remarks"
                                                                        className={`form-control ${errors.remarks && touched.remarks ? "is-invalid" : ""
                                                                            }`}
                                                                    />
                                                                    <ErrorMessage
                                                                        name="remarks"
                                                                        component="div"
                                                                        className="invalid-feedback"
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label htmlFor="" className="form-label">
                                                                        Customer Order Review Form
                                                                    </Label>

                                                                    <input
                                                                        type="file"
                                                                        className="form-control"
                                                                        accept=".pdf,.xls,.xlsx,.csv"
                                                                    />

                                                                    <small className="form-text text-muted">
                                                                        Accepted formats: PDF
                                                                    </small>
                                                                    {/* {file && file.length > 0 && (
                                                                        <div style={{ color: "green" }}>
                                                                            Selected file: <strong>{file}</strong>
                                                                        </div>
                                                                    )}
                                                                    {fileupload && typeof fileupload === "object" && (
                                                                        <div className="mt-2 text-success">
                                                                            Selected file: <strong>{fileupload.name}</strong>
                                                                        </div>
                                                                    )}
                                                                    {typeof fileupload === "string" && (
                                                                        <div className="mt-2 text-info">
                                                                            Existing file: <strong>{fileupload.split(/[\\/]/).pop()}</strong>
                                                                        </div>
                                                                    )} */}

                                                                    {/* PDF Preview */}
                                                                    {/* {previewUrl && (
                                                                        <div className="mt-3">
                                                                            <Label>PDF Preview:</Label>
                                                                            <iframe
                                                                                src={previewUrl}
                                                                                width="100%"
                                                                                height="400px"
                                                                                title="PDF Preview"
                                                                            ></iframe>
                                                                        </div>
                                                                    )} */}
                                                                </FormGroup>
                                                            </Col>

                                                            <Col xl="4">
                                                                <FormGroup>
                                                                    <Label htmlFor="city" className="required-label">
                                                                        City
                                                                    </Label>
                                                                    <Field
                                                                        as="select"
                                                                        name="city"
                                                                        className={`form-control ${errors.city && touched.city ? "is-invalid" : ""
                                                                            }`}
                                                                    >
                                                                        <option value="">Choose...</option>
                                                                        <option value="1">Batam</option>
                                                                        <option value="2">Medan</option>
                                                                        <option value="3">Jakarta</option>
                                                                    </Field>
                                                                    <ErrorMessage name="city" component="div" className="invalid-feedback" />
                                                                </FormGroup>

                                                                <FormGroup>
                                                                    <Label htmlFor="zone" className="required-label">
                                                                        Zone
                                                                    </Label>
                                                                    <Field
                                                                        as="select"
                                                                        name="zone"
                                                                        className={`form-control ${errors.zone && touched.zone ? "is-invalid" : ""
                                                                            }`}
                                                                    >
                                                                        <option value="">Choose...</option>
                                                                        <option value="1">Tanjung Uncang</option>
                                                                        <option value="2">Kabil</option>
                                                                        <option value="3">Batam Center</option>
                                                                    </Field>
                                                                    <ErrorMessage name="zone" component="div" className="invalid-feedback" />
                                                                </FormGroup>

                                                                <FormGroup>
                                                                    <Label htmlFor="poNumber" className="">PO Number</Label>
                                                                    <div className="form-check">
                                                                        <Field
                                                                            type="checkbox"
                                                                            name="poNumber"
                                                                            id="poNumber"
                                                                            className="form-check-input"
                                                                        />
                                                                    </div>
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label htmlFor="legalDocument" className="form-label">
                                                                        Legal Document
                                                                    </Label>

                                                                    <input
                                                                        type="file"
                                                                        className="form-control"
                                                                        id="legalDocument"
                                                                        accept=".pdf,.xls,.xlsx,.csv"
                                                                        onChange={handleFileChange}
                                                                    />

                                                                    <small className="form-text text-muted">
                                                                        Accepted formats: PDF
                                                                    </small>
                                                                    {file && file.length > 0 && (
                                                                        <div style={{ color: "green" }}>
                                                                            Selected file: <strong>{file}</strong>
                                                                        </div>
                                                                    )}
                                                                    {fileupload && typeof fileupload === "object" && (
                                                                        <div className="mt-2 text-success">
                                                                            Selected file: <strong>{fileupload.name}</strong>
                                                                        </div>
                                                                    )}
                                                                    {typeof fileupload === "string" && (
                                                                        <div className="mt-2 text-info">
                                                                            Existing file: <strong>{fileupload.split(/[\\/]/).pop()}</strong>
                                                                        </div>
                                                                    )}
                                                                    {fileupload && typeof fileupload === "object" && (
                                                                        <div className="mt-2 text-success">
                                                                            {/* Selected file: <strong>{fileupload.name}</strong> */}
                                                                            <button
                                                                                type="button"
                                                                                className="btn  btn-outline-danger "
                                                                                onClick={handleCancelFile}
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    {/* PDF Preview */}
                                                                    {previewUrl && (
                                                                        <div className="mt-3">
                                                                            <Label>PDF Preview:</Label>
                                                                            <iframe
                                                                                src={previewUrl}
                                                                                width="100%"
                                                                                height="400px"
                                                                                title="PDF Preview"
                                                                            ></iframe>
                                                                        </div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>


                                                    </Form>
                                                )}
                                            </Formik>
                                        </TabPane>
                                        <TabPane tabId={2} newCustomerId={newCustomerId}>
                                            <Formik
                                                initialValues={initialValues2}
                                                validationSchema={validationSchema2}
                                                onSubmit={(values, actions) => {
                                                    console.log('Formik submit values:', values);
                                                    console.log('Formik submit errors:', actions);
                                                    handleSubmitTab2(values, actions);
                                                }}
                                                enableReinitialize={true}
                                                context={{ emails: existEmails, id: initialValues.id }}
                                            >
                                                {({ errors, touched, resetForm, values, setFieldValue }) => (

                                                    <Form>
                                                        <Field type="hidden" name="contactId" />
                                                        <Field type="hidden" name="customerId" />
                                                        <div className="row align-items-center g-3 justify-content-end">
                                                            <div className="row align-items-center g-3 justify-content-end">
                                                                <div className="col-12 col-lg-3 col-md-3 col-sm-3 button-items">
                                                                    <button
                                                                        type="submit"
                                                                        className="btn btn-info ms-2"
                                                                        onClick={() =>
                                                                            setSubmitAction(isContactEditing ? "update" : "save")
                                                                        }
                                                                    >
                                                                        <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>
                                                                        {isContactEditing ? "Update" : "Save"}
                                                                    </button>

                                                                    {isContactEditing && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary ms-2"
                                                                            onClick={() => resetUpdatedForm(resetForm)}>
                                                                            <i className="bx bx-eraser "></i>
                                                                            Clear
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-danger"
                                                                        onClick={() => handleContactCancel()}>
                                                                        <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>
                                                                        Cancel
                                                                    </button>


                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Row>
                                                            <Col xl={4}>
                                                                <FormGroup>
                                                                    <Label htmlFor="contactname" className="required-label">Contact Name</Label>
                                                                    <Field
                                                                        name="contactname"
                                                                        placeholder="Contact Name"
                                                                        type="text"
                                                                        className={`form-control ${errors.contactname && touched.contactname ? "is-invalid" : ""}`}
                                                                    />
                                                                    {errors.contactname && touched.contactname && (
                                                                        <div className="invalid-feedback">{errors.contactname}</div>
                                                                    )}
                                                                </FormGroup>

                                                                <FormGroup>
                                                                    <Label htmlFor="email" className="required-label">Email</Label>
                                                                    <Field
                                                                        name="email"
                                                                        placeholder="Email"
                                                                        type="email"
                                                                        className={`form-control ${errors.email && touched.email ? "is-invalid" : ""}`}
                                                                    />
                                                                    {errors.email && touched.email && (
                                                                        <div className="invalid-feedback">{errors.email}</div>
                                                                    )}
                                                                </FormGroup>
                                                            </Col>

                                                            <Col xl={4}>
                                                                <FormGroup>
                                                                    <Label htmlFor="department" className="required-label">Department</Label>
                                                                    <div className={errors.department && touched.department ? 'is-invalid' : ''}>
                                                                        <Select
                                                                            id="department"
                                                                            name="department"
                                                                            styles={{
                                                                                menuList: base => ({
                                                                                    ...base,
                                                                                    maxHeight: "150px",
                                                                                }),
                                                                            }}
                                                                            onChange={option =>
                                                                                setFieldValue("department", option ? option.value : "")
                                                                            }
                                                                            value={departmentlist.find(x => x.value === values.department) || null}
                                                                            options={departmentlist}
                                                                            placeholder="Select Department"
                                                                            classNamePrefix={errors.department && touched.department ? 'react-select is-invalid' : 'react-select'}
                                                                        />
                                                                    </div>
                                                                    <ErrorMessage name="department" component="div" className="invalid-feedback" />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label htmlFor="deskphone">Desk Phone</Label>
                                                                    <Field
                                                                        name="deskphone"
                                                                        placeholder="Phone"
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </FormGroup>
                                                            </Col>

                                                            <Col xl={4}>
                                                                <FormGroup>
                                                                    <Label htmlFor="hpphone">Hand Phone</Label>
                                                                    <Field
                                                                        name="hpphone"
                                                                        placeholder="Phone"
                                                                        type="text"
                                                                        className="form-control"
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </Form>
                                                )}
                                            </Formik>
                                            <Table className="table mb-0">
                                                <thead style={{ backgroundColor: "#3e90e2" }}>
                                                    <tr>
                                                        <th className="text-center" style={{ width: "5%" }}>#</th>
                                                        <th style={{ width: "15%" }}>Name</th>
                                                        <th style={{ width: "15%" }}>Email</th>
                                                        <th style={{ width: "10%" }}>Department</th>
                                                        <th style={{ width: "12%" }}>Phone</th>
                                                        <th className="text-center" style={{ width: "9%" }}>Active</th>
                                                        <th className="text-center" style={{ width: "8%" }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {contactDetails.length > 0 ? (
                                                        contactDetails.map((item, index) => (
                                                            <tr key={item.ContactId}>
                                                                <td className="text-center align-middle">{index + 1}</td>
                                                                <td className="align-middle">{item.contactname}</td>
                                                                <td className="align-middle">{item.Email}</td>
                                                                <td className="align-middle">{item.Department}</td>
                                                                <td className="align-middle">{item.HandPhone}</td>
                                                                <td className="align-middle text-center">
                                                                    <div className="square-switch">
                                                                        <Input
                                                                            type="checkbox"
                                                                            id={`square-switch-${item.ContactId}`}
                                                                            switch="bool"
                                                                            onChange={() => openModal(item, "contact")}
                                                                            checked={switchStates[item.ContactId] ?? item.IsActive}
                                                                        />
                                                                        <label
                                                                            htmlFor={`square-switch-${item.ContactId}`}
                                                                            data-on-label="Yes"
                                                                            data-off-label="No"
                                                                            style={{ margin: 0 }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="text-center align-middle">
                                                                    {item.IsActive !== 0 && (
                                                                        <span title="Edit" style={{ cursor: "pointer" }}>
                                                                            <i
                                                                                className="mdi mdi-square-edit-outline"
                                                                                style={{ fontSize: "1.5rem" }}
                                                                                onClick={() => handleEditContact(item)}
                                                                            ></i>
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td className="text-center" colSpan="7">
                                                                No Data Found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </TabPane>
                                        <TabPane tabId={3}>
                                            <Formik enableReinitialize
                                                initialValues={initialValues3}
                                                validationSchema={validationSchema3(contactaddressDetails, contactData?.id)}
                                                onSubmit={handleSubmitTab3}>
                                                {({ values, errors, setFieldValue, touched, setTouched }) => (
                                                    <Form>

                                                        <div className="row align-items-center g-3 justify-content-between mb-3">
                                                            {/* Buttons Section */}
                                                            <div className="col-12 col-md-4 text-md-end text-start" style={{ marginLeft: '66%' }}>
                                                                <div className="d-flex flex-wrap justify-content-md-end justify-content-start gap-2">
                                                                    <button
                                                                        type="submit"
                                                                        className="btn btn-info"
                                                                        onClick={() => setAddressSubmitAction(isaddressEditing ? "update" : "save")}
                                                                    >
                                                                        <i className="bx bx-comment-check label-icon font-size-16 align-middle me-2"></i>
                                                                        {isaddressEditing ? "Update" : "Save"}
                                                                    </button>

                                                                    {isaddressEditing && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary"
                                                                            onClick={() => resetUpdatedAddressForm(setFieldValue)}

                                                                        >
                                                                            <i className="bx bx-eraser"></i> Clear
                                                                        </button>

                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-danger"
                                                                        onClick={() => handleAddressCancel()}

                                                                    >
                                                                        <i className="bx bx-window-close"></i> Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Row>
                                                            <div className="col-xl-2">
                                                                <Col md="12">
                                                                    <FormGroup>
                                                                        <Label htmlFor="addresstype" className="required-label">Address Type</Label>
                                                                        <div className="row">
                                                                            {[
                                                                                { value: 2, label: "Mailing Address" },
                                                                                { value: 3, label: "Billing Address" },
                                                                                { value: 4, label: "Delivery Address" },
                                                                            ].map(({ value, label }) => {
                                                                                const isChecked = values.addresstype === value;

                                                                                // Disable only if it's Mailing Address and it's already used and not currently selected
                                                                                const isDisabled = value === 2 && isMailingAddressUsed && !isChecked;

                                                                                const handleCheckboxChange = () => {
                                                                                    if (isChecked) {
                                                                                        setFieldValue("addresstype", null);
                                                                                    } else {
                                                                                        setFieldValue("addresstype", value);
                                                                                    }
                                                                                };

                                                                                return (
                                                                                    <div key={value} className="col-12 col-lg-12 col-md-6 col-sm-6 form-check frm-chk-addresstype">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            name="addresstype"
                                                                                            value={value}
                                                                                            className="form-check-input"
                                                                                            checked={isChecked}
                                                                                            disabled={isDisabled}
                                                                                            onChange={handleCheckboxChange}
                                                                                        />
                                                                                        <label className="form-check-label">
                                                                                            {label}
                                                                                            {isDisabled && (
                                                                                                <small className="text-muted ms-1"></small>
                                                                                            )}
                                                                                        </label>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>

                                                                        {errors.addresstype && touched.addresstype && (
                                                                            <div className="text-danger mt-1">{errors.addresstype}</div>
                                                                        )}
                                                                    </FormGroup>
                                                                </Col>
                                                            </div>
                                                            {/* <div className="col-xl-2">
                                                                <Col md="12">
                                                                    <FormGroup>
                                                                        <Label htmlFor="addresstype" className="required-label">Address Type</Label>
                                                                        <div className="row">
                                                                            {[
                                                                                { value: 2, label: "Mailing Address" },
                                                                                { value: 3, label: "Billing Address" },
                                                                                { value: 4, label: "Delivery Address" },
                                                                            ].map(({ value, label, resetForm }) => {
                                                                                const isChecked = values.addresstype === value;

                                                                                const handleCheckboxChange = () => {
                                                                                    debugger
                                                                                    if (isChecked) {
                                                                                        setFieldValue("addresstype", null);
                                                                                    } else {
                                                                                        setFieldValue("addresstype", value);
                                                                                    }
                                                                                };

                                                                                return (
                                                                                    <div key={value} className="col-12 col-lg-12 col-md-6 col-sm-6 form-check frm-chk-addresstype">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            name="addresstype"
                                                                                            value={value}
                                                                                            className="form-check-input"
                                                                                            checked={isChecked}
                                                                                            onChange={handleCheckboxChange}
                                                                                        />
                                                                                        <label className="form-check-label">{label}</label>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>


                                                                        {errors.addresstype && touched.addresstype && (
                                                                            <div className="text-danger mt-1">{errors.addresstype}</div>
                                                                        )}
                                                                    </FormGroup>
                                                                </Col>
                                                            </div> */}
                                                            <div className="col-xl-3">
                                                                <Col md="12">
                                                                    <FormGroup>
                                                                        <Label htmlFor="addresscontact" className="required-label">Contact Name</Label>
                                                                        <div className={errors.addresscontact && touched.addresscontact ? 'is-invalid' : ''}>
                                                                            <Select
                                                                                name="addresscontact"
                                                                                options={contactName}
                                                                                placeholder="Select Contact"
                                                                                onChange={(option) => setFieldValue('addresscontact', option ? option.value : '')}
                                                                                value={contactName.find(option => option.value === String(values.addresscontact)) || null}
                                                                            />

                                                                            {errors.addresscontact && touched.addresscontact && (
                                                                                <div className="invalid-feedback d-block">{errors.addresscontact}</div>
                                                                            )}
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                            </div>
                                                            <div className="col-xl-3">
                                                                <Col md="12">
                                                                    <FormGroup>
                                                                        <Label htmlFor="location" className="required-label">Location</Label>
                                                                        <Field
                                                                            name="location"
                                                                            id="location"
                                                                            className={`form-control ${errors.location && touched.location ? "is-invalid" : ""}`}
                                                                        />
                                                                        {errors.location && touched.location && (
                                                                            <div className="invalid-feedback">{errors.location}</div>
                                                                        )}
                                                                    </FormGroup>
                                                                </Col>
                                                            </div>
                                                            <div className="col-xl-4">
                                                                <Col md="12">
                                                                    <FormGroup>
                                                                        <Label htmlFor="address" className="required-label">Address</Label>
                                                                        <Field
                                                                            as="textarea"
                                                                            name="address"
                                                                            id="address"
                                                                            className={`form-control ${errors.address && touched.address ? "is-invalid" : ""}`}
                                                                            style={{ height: "68px" }}
                                                                        />
                                                                        {errors.address && touched.address && (
                                                                            <div className="invalid-feedback">{errors.address}</div>
                                                                        )}
                                                                    </FormGroup>
                                                                </Col>
                                                            </div>
                                                        </Row>
                                                        <hr />
                                                        <Table className="table mb-0">
                                                            <thead style={{ backgroundColor: "#3e90e2" }}>
                                                                <tr>
                                                                    <th className="text-center" style={{ width: "5%" }}>#</th>
                                                                    <th>Contact Name</th>
                                                                    <th>Address Type</th>
                                                                    <th>Address</th>
                                                                    <th>Location</th>
                                                                    <th>Active</th>
                                                                    <th className="text-center" style={{ width: "8%" }}>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {contactaddressDetails.length > 0 ? (
                                                                    contactaddressDetails.map((item, index) => (
                                                                        <tr key={index} className="align-middle">
                                                                            <td className="text-center align-middle">{index + 1}</td>
                                                                            <td className="align-middle">{item.ContactName || "-"}</td>
                                                                            <td className="align-middle">{getAddressTypeLabel(item.AddressTypeId)}</td>
                                                                            <td className="align-middle">{item.Address}</td>
                                                                            <td className="align-middle">{item.Location}</td>
                                                                            <td className="align-middle">
                                                                                <div className="square-switch">
                                                                                    <Input
                                                                                        type="checkbox"
                                                                                        id={`square-switch-${item.AddressId}`}
                                                                                        switch="bool"
                                                                                        onChange={() => openModal(item, "address")}
                                                                                        checked={switchStates[item.AddressId] ?? !!item.IsActive}
                                                                                    />
                                                                                    <label
                                                                                        htmlFor={`square-switch-${item.AddressId}`}
                                                                                        data-on-label="Yes"
                                                                                        data-off-label="No"
                                                                                        style={{ margin: 0 }}
                                                                                    />
                                                                                </div>
                                                                            </td>
                                                                            <td className="text-center align-middle">
                                                                                {item.IsActive !== 0 && (
                                                                                    <span
                                                                                        title="Edit"
                                                                                        style={{ cursor: "pointer" }}
                                                                                        onClick={() => handleEditAddress(item)}
                                                                                    >
                                                                                        <i
                                                                                            className="mdi mdi-square-edit-outline"
                                                                                            title="Edit"
                                                                                            style={{ fontSize: "1.5rem" }}
                                                                                        ></i>
                                                                                    </span>
                                                                                )}

                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td className="text-center" colSpan="7">
                                                                            No Data Found
                                                                        </td>
                                                                    </tr>
                                                                )}

                                                            </tbody>

                                                        </Table>
                                                    </Form>
                                                )}
                                            </Formik>
                                        </TabPane>
                                    </TabContent>
                                </div>
                            </div>
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
                                <h4>Do you want to {txtStatus} this item?</h4>
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
        </React.Fragment >
    );
};

export default Addcontacts;
