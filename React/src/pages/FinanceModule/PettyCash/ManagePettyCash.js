// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   CardBody,
//   Col,
//   Container,
//   Row,
//   Button,
//   Modal,
//   ModalBody,
//   ModalHeader,
// } from "reactstrap";
// import Select from "react-select";
// import { Formik, Form } from "formik";
// import * as Yup from "yup";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import { InputText } from "primereact/inputtext";
// import { FilterMatchMode } from "primereact/api";
// import { Tag } from "primereact/tag";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { useHistory } from "react-router-dom";
// import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
// import "primereact/resources/primereact.min.css";
// import { getPettyCashList } from "../../../src/common/data/mastersapi";
// import { toast } from 'react-toastify';

// const Breadcrumbs = ({ title, breadcrumbItem }) => (
//   <div className="page-title-box d-sm-flex align-items-center justify-content-between">
//     <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
//     <div className="page-title-right">
//       <ol className="breadcrumb m-0">
//         <li className="breadcrumb-item"><a href="/#">{title}</a></li>
//         <li className="breadcrumb-item active"><a href="/#">{breadcrumbItem}</a></li>
//       </ol>
//     </div>
//   </div>
// );

// const ManagePettyCash = () => {
//   const history = useHistory();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitType, setSubmitType] = useState(1);
//   const [isModalOpen, setIsModalOpen] = useState(false);


//   // --- Sample data ---
//   const [expenses, setExpenses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pettyCashIdOptions, setPettyCashIdOptions] = useState([]);
//   const [expTypeOptions, setExpTypeOptions] = useState([]);
//   //const { pettyCashId } = useParams();
//   //const [pettyCashData, setPettyCashData] = useState(location.state?.pettyCashData || null);
//   const [selectedPettyCashId, setSelectedPettyCashId] = useState(null);
//   const [selectedExpDescription, setSelectedExpDescription] = useState(null);
//   const [selectedVoucherNo, setSelectedVoucherNo] = useState(null);

//   const [filters, setFilters] = useState({
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//   });

//   // --- Column Filter States ---
//   const [selectedColumn, setSelectedColumn] = useState(null);
//   const [selectedValue, setSelectedValue] = useState(null);
//   const [valueOptions, setValueOptions] = useState([]);

//   const columnOptions = [
//     { value: "expenseType", label: "Expense Type" },
//     { value: "status", label: "Status" },
//   ];

//   useEffect(() => {
//     debugger
//     fetchExpenses();

//   }, []);

//   useEffect(() => { debugger
//     if (selectedColumn) {
//       const uniqueValues = [...new Set(expenses.map(r => r[selectedColumn.value]))];
//       setValueOptions(uniqueValues.map(v => ({ value: v, label: v })));
//       setSelectedValue(null);
//     } else {
//       setValueOptions([]);
//     }
//   }, [selectedColumn, expenses]);

//   useEffect(() => {
//   if (!selectedExpDescription) {
//     setPettyCashIdOptions([]);
//     setSelectedPettyCashId(null);
//     return;
//   }

//   const filtered = expenses.filter(x => x.expenseDescription === selectedExpDescription.value);

//   const voucherOptions = [
//     ...new Set(filtered.map(x => x.voucherNo))
//   ].map(v => ({ value: v, label: v }));

//   setPettyCashIdOptions(voucherOptions);
//   setSelectedPettyCashId(null); // reset second dropdown
// }, [expenses]);


//   const applyColumnFilter = (column, value) => {
//     if (column && value) {
//       setFilters({
//         ...filters,
//         [column.value]: { value: value.value, matchMode: FilterMatchMode.EQUALS },
//       });
//     }
//   };

//   const fetchExpenses = async () => {
//     try { debugger
//       setLoading(true);
//       const branchId = 1;
//       const orgId = 1;
//       const pettyIdValue = selectedPettyCashId?.value ?? 0;
//       const expTypeValue = selectedExpDescription?.value ?? null;
//       const voucherNoValue = selectedVoucherNo?.value ?? null;
//       const data = await getPettyCashList(orgId, branchId, pettyIdValue, expTypeValue, voucherNoValue);
//       console.log("fetchExpenses got data:", data);


//       const transformed = data.map(item => ({
//         voucherNo: item.VoucherNo,
//         expDate: new Date(item.ExpDate),
//         expenseType: item.ExpenseType,
//         expenseDescription: item.ExpenseDescription || "-", // if exists
//         expenseDescriptionId: item.ExpenseDescriptionId,
//         billNumber: item.BillNumber,
//         amountIDR: item.AmountIDR,
//         attachment: item.ExpenseFileName ? { name: item.ExpenseFileName } : null,
//         status: item.IsSubmitted ? "Posted" : "Saved",
//         pettyCashId: item.PettyCashId,
//       }));
//       let filteredData = transformed;

//       setPettyCashIdOptions([
//         ...new Set(data.map(x => x.voucherNo))
//       ].map(id => ({ value: id, label: `PC-${id}` })));

//       setExpTypeOptions([
//         ...new Set(data.map(x => x.ExpenseDescription))
//       ].map(type => ({ value: type, label: type })));

//       setExpenses(transformed);
//       setLoading(false);
//     } catch (error) {
//       toast.error("Failed to fetch expenses");
//       console.error("Expense load error:", error);
//     }
//   };

//   const clearColumnFilter = () => {
//     setFilters({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
//     setSelectedColumn(null);
//     setSelectedValue(null);
//   };

//   const statusBodyTemplate = (rowData) => (
//     <Tag value={rowData.status} severity={rowData.status === "Posted" ? "success" : "info"} />
//   );

// const actionBodyTemplate = (rowData) => (
//   <div className="d-flex gap-2 justify-content-center">
//     <Button
//       color="link"
//       size="sm"
//       onClick={() => handleEdit(rowData.pettyCashId)}
//     >
//       <i className="mdi mdi-pencil"></i>
//     </Button>
//     <Button color="link" size="sm">
//       <i className="mdi mdi-delete"></i>
//     </Button>
//   </div>
// );
// const handleEdit = async (pettyCashId) => {
//   try { debugger
//     const data = await getPettyCashList(1, 1, pettyCashId, null, null); // Fetch by ID
//     if (data && data.length > 0) {
//       const pettyCashData = data[0]; // Assuming only one record per ID
//       history.push(`/pettyCash/edit/${pettyCashId}`, { pettyCashData });
//     } else {
//       toast.error("No data found for selected Petty Cash ID");
//     }
//   } catch (error) {
//     console.error("Error loading petty cash data:", error);
//     toast.error("Failed to load data for editing");
//   }
// };

//   const exportToExcel = () => {
//     const exportData = expenses.map((ex) => ({
//       "Date": new Date(ex.expDate).toLocaleDateString(),
//       "Expense Type": ex.expenseType,
//       "Description": ex.expenseDescription,
//       "Bill Number": ex.billNumber,
//       "Amount(IDR)": ex.amountIDR,
//       "Attachment": ex.attachment ? ex.attachment.name : "",
//       "Status": ex.status,
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
//     saveAs(data, `Expenses-${new Date().toISOString().slice(0, 10)}.xlsx`);
//   };

//   const dAddOrder = () => { debugger
//     history.push("/AddPettyCash/add");
//   };

//   const handleCancelFilters = () => { debugger
//   setSelectedExpDescription(null);
//   setSelectedVoucherNo(null);
//   setSelectedPettyCashId(null);
//   //fetchExpenses();
// };
// useEffect(() => {
//   fetchExpenses();
// }, [selectedExpDescription, selectedVoucherNo, selectedPettyCashId]);



//   return (
//     <React.Fragment>
//       <div className="page-content">
//         <Container fluid>
//           <Breadcrumbs title="Finance" breadcrumbItem="PettyCash" />



//           {/* Column Filter */}
//           <Row className="pt-2 pb-3 align-items-end">
//             <Col md="3">             
//                 <Select
//                   placeholder="Select Expense Desc"
//                   value={selectedExpDescription}
//                   onChange={(val) => setSelectedExpDescription(val)}
//                   options={expTypeOptions}
//                   isClearable
//                 />                           
//             </Col>

//             <Col md="5" className="d-flex align-items-center">
//             <div className="flex-grow-1 me-2">
//                <Select
//                 placeholder="Select Voucher No"
//                 value={selectedVoucherNo}
//                 onChange={(val) => setSelectedVoucherNo(val)}
//                 options={pettyCashIdOptions}
//                 isClearable
//               />
//               </div>
//               <Button color="primary" className="me-2" onClick={fetchExpenses}>Search</Button>
//               <Button color="danger" onClick={handleCancelFilters}>Cancel</Button>
//             </Col>

//             <Col md="4" className="text-end">
//               <Button color="info" className="me-2" onClick={dAddOrder} disabled={isSubmitting}>New</Button>
//               <Button className="me-2" color="secondary" onClick={exportToExcel}>
//                 <i className="bx bx-export me-2"></i> Export
//               </Button>              
//             </Col>
//           </Row>


//           {/* DataTable */}
//           <Row>
//             <Col lg="12">
//               <Card>
//                 <CardBody>
//                   <DataTable
//                     value={expenses}
//                     loading={loading}
//                     paginator
//                     rows={10}
//                     dataKey="pettyCashId"
//                     filters={filters}
//                     globalFilterFields={["expenseType", "expenseDescription", "billNumber", "status", "VoucherNo"]}
//                     emptyMessage="No expenses found."
//                     showGridlines
//                   >
//                     <Column header="S.No." body={(_, { rowIndex }) => rowIndex + 1} />
//                     <Column field="voucherNo" header="Sys Seq No." sortable />
//                     <Column field="expDate" header="Date" body={(d) => new Date(d.expDate).toLocaleDateString()} sortable />
//                     <Column field="expenseType" header="Type" sortable />
//                     <Column field="expenseDescription" header="Description" sortable />
//                     <Column field="billNumber" header="Bill #" sortable />
//                     <Column field="amountIDR" header="Amount" body={(d) => Number(d.amountIDR).toLocaleString()} className="text-end" />
//                     <Column field="attachment" header="Attachment" body={(d) => d.attachment ? d.attachment.name : "-"} />
//                     <Column field="status" header="Status" body={statusBodyTemplate} sortable />
//                     <Column header="Action" body={actionBodyTemplate} />
//                   </DataTable>
//                 </CardBody>
//               </Card>
//             </Col>
//           </Row>

//           {/* Confirmation Modal */}
//           <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
//             <ModalHeader toggle={() => setIsModalOpen(false)}>Confirm Action</ModalHeader>
//             <ModalBody className="py-3 px-5 text-center">
//               <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "6em", color: "orange" }} />
//               <h4>Do you want to {submitType === 0 ? "Save" : "Post"}?</h4>
//               <div className="mt-3 d-flex justify-content-center gap-3">
//                 <Button color="success" size="lg" onClick={() => setIsModalOpen(false)}>Yes</Button>
//                 <Button color="danger" size="lg" onClick={() => setIsModalOpen(false)}>Cancel</Button>
//               </div>
//             </ModalBody>
//           </Modal>
//         </Container>
//       </div>
//     </React.Fragment>
//   );
// };

// export default ManagePettyCash;
