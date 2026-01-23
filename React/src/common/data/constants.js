
export const RoleList = [
  {
    "_id": {
      "$oid": "65ad544999bb5db1b46234c2"
    },
    "role_code": "U003",
    "role_name": "Admin",
    "created_date": {
      "$date": "2024-01-21T17:28:41.753Z"
    },
    "created_by": "AM001",
    "__v": 0,
    "updated_by": "AM001",
    "updated_date": {
      "$date": "2024-01-21T17:30:18.393Z"
    }
  },{
  "_id": {
    "$oid": "6582b2abc34acba9c0631ec9"
  },
  "role_code": "U001",
  "role_name": "Super Admin",
  "created_date": {
    "$date": "2023-12-20T09:23:55.299Z"
  },
  "created_by": "AM1081",
  "__v": 0
},{
  "_id": {
    "$oid": "6582b2b7c34acba9c0631ece"
  },
  "role_code": "U002",
  "role_name": "Staff",
  "created_date": {
    "$date": "2023-12-20T09:24:07.086Z"
  },
  "created_by": "AM1081",
  "__v": 0
},
];

export const Module_Menu = [
  {
    title: "Recruitment",
    icon: "mdi mdi-account-search-outline",
    route: "/#",
    children: [
      {
        title: "Job Setup",
        icon: "mdi mdi-wrench-outline",
        route: "/#",
        children: []
      },
      {
        title: "Resource",
        icon: "mdi mdi-account-group-outline",
        route: "/#",
        children: []
      },
      {
        title: "Onboarding",
        icon: "mdi mdi-account-multiple-plus-outline",
        route: "/#",
        children: []
      }
    ]
  },
  {
    title: "Setup",
    icon: "mdi mdi-cog-outline",
    route: "/#",
    children: []
  },
  {
    title: "Configuration",
    icon: "mdi mdi-cog-outline",
    route: "/#",
    children: []
  },
  {
    title: "Employee",
    icon: "mdi mdi-cog-outline",
    route: "/#",
    children: []
  }
];

export const Modules = [ 
  { id: 1, module_code: "M001", module_name: "Access Rights", main_menu: "Employee" },
  //{ id: 2, module_code: "M002", module_name: "Bill of Material", main_menu: "Employee" },
  //{ id: 3, module_code: "M003", module_name: "Company", main_menu: "Employee" },
  { id: 4, module_code: "M004", module_name: "Country", main_menu: "Employee" },
  { id: 5, module_code: "M005", module_name: "Currency", main_menu: "Employee" },
  { id: 6, module_code: "M006", module_name: "Customer", main_menu: "Employee" },
  { id: 7, module_code: "M007", module_name: "Cylinder Master", main_menu: "Employee" },
  { id: 8, module_code: "M008", module_name: "Department", main_menu: "Employee" },
  { id: 9, module_code: "M009", module_name: "Gas Master", main_menu: "Employee" },
  //{ id: 10, module_code: "M010", module_name: "Location", main_menu: "Employee" },
  { id: 11, module_code: "M011", module_name: "Pallet Master", main_menu: "Employee" },
  { id: 12, module_code: "M012", module_name: "Payment Method", main_menu: "Employee" }, 
  { id: 13, module_code: "M013", module_name: "Payment Term", main_menu: "Employee" },
  //{ id: 14, module_code: "M014", module_name: "Purchase/Sales Person", main_menu: "Employee" },
  { id: 15, module_code: "M015", module_name: "Supplier", main_menu: "Employee" },
  { id: 16, module_code: "M016", module_name: "Unit of Measure", main_menu: "Employee" },
  { id: 17, module_code: "M017", module_name: "User", main_menu: "Employee" }
];

 

export const ModulesSales = [ 
  {  
    id: 1, 
    module_code: "M018", 
    module_name: "Sales Quotation",  
    main_menu: "Sales" 
  },
  {     
    id: 2, 
    module_code: "M019", 
    module_name: "Sales Order",  
    main_menu: "Sales" 
  },
  {  
    id: 3, 
    module_code: "M020", 
    module_name: "Packing & Delivery",  
    main_menu: "Sales" 
  },
  {     
    id: 4, 
    module_code: "M021", 
    module_name: "Sales Invoice",  
    main_menu: "Sales" 
  }, 
  {
    id: 5, 
    module_code: "M022", 
    module_name: "Return Order",  
    main_menu: "Sales" 
  }, 
  {
    id: 6, 
    module_code: "M023", 
    module_name: "Production Order",  
    main_menu: "Sales" 
  }, 
]

export const ModulesSettings = [ 
  {  
    module_code: "M022", 
    module_name: "User Email SetUp",  
    main_menu: "Employee" 
  },
  {     
    module_code: "M023", 
    module_name: "SMTP Server SetUp",  
    main_menu: "Employee" 
  },
   
]
export const AccessRights = [
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf"
    },
    "role_code": "U001",
    module_code: "M001",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf02"
    },
    "role_code": "U001",
    module_code: "M002",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf03"
    },
    "role_code": "U001",
    module_code: "M003",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf04"
    },
    "role_code": "U001",
    module_code: "M004",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf05"
    },
    "role_code": "U001",
    module_code: "M005",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf06"
    },
    "role_code": "U001",
    module_code: "M006",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf07"
    },
    "role_code": "U001",
    module_code: "M007",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf08"
    },
    "role_code": "U001",
    module_code: "M008",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf09"
    },
    "role_code": "U001",
    module_code: "M009",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf10"
    },
    "role_code": "U001",
    module_code: "M010",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf11"
    },
    "role_code": "U001",
    module_code: "M011",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf12"
    },
    "role_code": "U001",
    module_code: "M012",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf13"
    },
    "role_code": "U001",
    module_code: "M013",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf14"
    },
    "role_code": "U001",
    module_code: "M014",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf15"
    },
    "role_code": "U001",
    module_code: "M015",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf16"
    },
    "role_code": "U001",
    module_code: "M016",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf17"
    },
    "role_code": "U001",
    module_code: "M017",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf18"
    },
    "role_code": "U001",
    module_code: "M018",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf19"
    },
    "role_code": "U001",
    module_code: "M019",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceaf220"
    },
    "role_code": "U001",
    module_code: "M020",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM038",
    "updated_by": "AM038",
    "created_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "updated_date": {
      "$date": "2024-10-14T11:54:07.581Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ce210"
    },
    "role_code": "U001",
    module_code: "M021",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 0,
    "created_by": "AM039",
    "updated_by": "AM039",
    "created_date": {
      "$date": "2024-10-15T10:00:10.123Z"
    },
    "updated_date": {
      "$date": "2024-10-15T10:00:10.123Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ce212"
    },
    "role_code": "U001",
    module_code: "M022",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 0,
    "created_by": "AM039",
    "updated_by": "AM039",
    "created_date": {
      "$date": "2024-10-15T10:00:10.123Z"
    },
    "updated_date": {
      "$date": "2024-10-15T10:00:10.123Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ce212"
    },
    "role_code": "U001",
    module_code: "M023",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 0,
    "created_by": "AM039",
    "updated_by": "AM039",
    "created_date": {
      "$date": "2024-10-15T10:00:10.123Z"
    },
    "updated_date": {
      "$date": "2024-10-15T10:00:10.123Z"
    },
    "is_active": "1"
  },
  ,
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ce212"
    },
    "role_code": "U001",
    module_code: "M024",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 0,
    "created_by": "AM039",
    "updated_by": "AM039",
    "created_date": {
      "$date": "2024-10-15T10:00:10.123Z"
    },
    "updated_date": {
      "$date": "2024-10-15T10:00:10.123Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5ceab"
    },
    "role_code": "U003",
    module_code: "M004",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 0,
    "delete_access": 0,
    "created_by": "AM040",
    "updated_by": "AM040",
    "created_date": {
      "$date": "2024-10-16T12:25:20.783Z"
    },
    "updated_date": {
      "$date": "2024-10-16T12:25:20.783Z"
    },
    "is_active": "1"
  },
  {
    "_id": {
      "$oid": "6582c8b526b6e8aa74f5cea9"
    },
    "role_code": "U003",
    module_code: "M005",
    "read_access": 1,
    "edit_access": 1,
    "create_access": 1,
    "delete_access": 1,
    "created_by": "AM041",
    "updated_by": "AM041",
    "created_date": {
      "$date": "2024-10-17T13:15:35.402Z"
    },
    "updated_date": {
      "$date": "2024-10-17T13:15:35.402Z"
    },
    "is_active": "1"
  }
];
export const States = [
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Dadra and Nagar Haveli and Daman and Diu", label: "Dadra and Nagar Haveli and Daman and Diu" },
  { value: "Lakshadweep", label: "Lakshadweep" },
  { value: "Delhi", label: "Delhi" },
  { value: "Puducherry", label: "Puducherry" },
];

export const Countries = [
  { value: "India", label: "India" },
  { value: "USA", label: "USA" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "UK", label: "United Kingdom" },
  { value: "France", label: "France" },
  { value: "Japan", label: "Japan" },
  { value: "China", label: "China" },
  { value: "Brazil", label: "Brazil" }
];