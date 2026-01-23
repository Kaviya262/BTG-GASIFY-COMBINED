import {
  Col,

  Row,
  Label, Input, InputGroup
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb"
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Tag } from "primereact/tag";
import React, { useState, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { Container, Card } from "reactstrap";
import { Accordion, AccordionTab } from "primereact/accordion"; // Accordion tabs :contentReference[oaicite:4]{index=4}
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tooltip } from "primereact/tooltip";
import { Button } from "primereact/button";
import { FilterMatchMode } from "primereact/api";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Badge } from 'primereact/badge';
import { RadioButton } from 'primereact/radiobutton';
const PPPApproval = ({ selectedType, setSelectedType }) => {

  const types = [
    "Claim Approval",
    "Payment Plan",
    "PPP",
    "PPP Approval"
  ];
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyRange, setHistoryRange] = useState({ from: null, to: null });
  const [historyForType, setHistoryForType] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [claims, setclaims] = useState([
    { comment: "", type: "CLAIM", id: 1, claimno: "CLM0000025", date: "23‑Jun‑25", name: "Sandy", dept: "Sales & Marketing", amount: "100.00", curr: "SGD", transactions: "Txn A" },
    { comment: "", type: "CLAIM", id: 2, claimno: "CLM0000171", date: "26‑Jun‑25", name: "Lysa", dept: "Sales & Marketing", amount: "236.00", curr: "USD", transactions: "Txn B" },
    { comment: "", type: "CASH ADVANCE", id: 3, claimno: "CLM0000036", date: "26‑Jun‑25", name: "Mery", dept: "Finance", amount: "122.00", curr: "IDR", transactions: "Txn C" },
    { comment: "", type: "CASH ADVANCE", id: 4, claimno: "CLM0000057", date: "26‑Jun‑25", name: "Anwar", dept: "Operations", amount: "33.30", curr: "SGD", transactions: "Txn D" },
    { comment: "", type: "SUPPLIER PAYMENT", id: 5, claimno: "CLM0000122", date: "25‑Jun‑25", name: "Shafiq", dept: "HR", amount: "376.80", curr: "MYR", transactions: "Txn E" },
    { comment: "", type: "SUPPLIER PAYMENT", id: 6, claimno: "CLM0000132", date: "26‑Jun‑25", name: "Sandy", dept: "Sales & Marketing", amount: "433.00", curr: "IDR", transactions: "Txn F" },
    { isSelected: false, approvedone: 1, discussedone: 0, approvedtwo: 1, discussedtwo: 0, comment: "", type: "PPV", id: 5, claimno: "CLM0000122", date: "25‑Jun‑25", name: "Shafiq", dept: "HR", amount: "376.80", curr: "MYR", transactions: "Txn E" },
    { isSelected: false, approvedone: 1, discussedone: 0, approvedtwo: 1, discussedtwo: 0, comment: "", type: "PPV", id: 6, claimno: "CLM0000132", date: "26‑Jun‑25", name: "Sandy", dept: "Sales & Marketing", amount: "433.00", curr: "IDR", transactions: "Txn F" },
    { isSelected: false, approvedone: 1, discussedone: 0, approvedtwo: 1, discussedtwo: 0, comment: "", type: "PPV PV", id: 5, claimno: "CLM0000122", date: "25‑Jun‑25", name: "Shafiq", dept: "HR", amount: "376.80", curr: "MYR", transactions: "Txn E" },
    { isSelected: false, approvedone: 1, discussedone: 0, approvedtwo: 1, discussedtwo: 0, comment: "", type: "PPV PV", id: 6, claimno: "CLM0000132", date: "26‑Jun‑25", name: "Sandy", dept: "Sales & Marketing", amount: "433.00", curr: "IDR", transactions: "Txn F" }
  ]);
  const [historyArray, sethistoryArray] = useState([
    { transactiondate: "26-Jun-25", approvedone: 1, discussedone: 0, approvedtwo: 1, discussedtwo: 0, comment: "", type: "CLAIM", id: 1, claimno: "CLM0000025", date: "23‑Jun‑25", name: "Sandy", dept: "Sales & Marketing", amount: "100.00", curr: "SGD", transactions: "Txn A" },
    { transactiondate: "26-Jun-25", approvedone: 1, discussedone: 0, approvedtwo: 0, discussedtwo: 0, comment: "", type: "CLAIM", id: 2, claimno: "CLM0000171", date: "26‑Jun‑25", name: "Lysa", dept: "Sales & Marketing", amount: "236.00", curr: "USD", transactions: "Txn B" },
    { transactiondate: "26-Jun-25", approvedone: 1, discussedone: 0, approvedtwo: 0, discussedtwo: 0, comment: "", type: "CASH ADVANCE", id: 3, claimno: "CLM0000036", date: "26‑Jun‑25", name: "Mery", dept: "Finance", amount: "122.00", curr: "IDR", transactions: "Txn C" },
    { transactiondate: "26-Jun-25", approvedone: 0, discussedone: 1, approvedtwo: 0, discussedtwo: 0, comment: "", type: "CASH ADVANCE", id: 4, claimno: "CLM0000057", date: "26‑Jun‑25", name: "Anwar", dept: "Operations", amount: "33.30", curr: "SGD", transactions: "Txn D" },
    { transactiondate: "26-Jun-25", approvedone: 0, discussedone: 1, approvedtwo: 0, discussedtwo: 1, comment: "", type: "SUPPLIER PAYMENT", id: 5, claimno: "CLM0000122", date: "25‑Jun‑25", name: "Shafiq", dept: "HR", amount: "376.80", curr: "MYR", transactions: "Txn E" },
    { transactiondate: "26-Jun-25", approvedone: 0, discussedone: 1, approvedtwo: 1, discussedtwo: 0, comment: "", type: "SUPPLIER PAYMENT", id: 6, claimno: "CLM0000132", date: "26‑Jun‑25", name: "Sandy", dept: "Sales & Marketing", amount: "433.00", curr: "IDR", transactions: "Txn F" }
  ]);

  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const bankOptions = [
    { label: "DBS Bank", value: "DBS" },
    { label: "HSBC Bank", value: "HSBC" },
    { label: "Standard Chartered", value: "SC" },
    { label: "Maybank", value: "MAYBANK" }
  ];
  const [showModal, setShowModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [action1, setAction1] = useState({});
  const [action2, setAction2] = useState({});
  const handleDiscuss = (rowData) => {
    setSelectedClaim(rowData);
    setShowModal(true);
  };

  const handleCheckboxChange = (e, rowData) => {
    const updatedSelection = e.checked
      ? [...selectedRows, rowData.id]
      : selectedRows.filter(id => id !== rowData.id);
    setSelectedRows(updatedSelection);
  };

  const handleClick1 = (action, id) => {
    setAction1(prev => ({ ...prev, [id]: action }));
  };

  const handleClick2 = (action, id) => {
    setAction2(prev => ({ ...prev, [id]: action }));
  };

  const ApproverIndicator = ({ approved, discussed }) => {
    let severity = 'secondary'; // default gray
    if (approved === 1) severity = 'success';
    else if (discussed === 1) severity = 'warning';
    else severity = 'danger';

    const label = approved === 1
      ? 'Approved'
      : discussed === 1
        ? 'Discussed'
        : 'Pending';

    return <Badge style={{ width: "85px", fontSize: "13px", margin: "3px" }} value={label} severity={severity} />;
  };
  const handleSaveComment = () => {
    if (selectedClaim) {
      // Update the comment in the selected claim
      const updatedClaims = claims.map(claim =>
        claim.id === selectedClaim.id
          ? { ...claim, comment: selectedClaim.comment }
          : claim
      );

      // Update the state with the new claims array
      setclaims(updatedClaims);

      // Optionally, close the modal
      setShowModal(false);
    }
  };
  const headerTemplate = (type) => (
    <div className="d-flex justify-content-between align-items-center">
      <span>{type}</span>
      <Button

        icon="pi pi-history"
        className="p-button-text"
        onClick={(e) => {
          e.stopPropagation();
          setHistoryForType(type);
          setHistoryVisible(true);
        }}
        tooltip="History" tooltipOptions={{ position: 'bottom' }}
      />
    </div>
  );

  const handleShowDetails = (row) => {
    setSelectedDetail({
      ...row,
      items: [
        {
          type: 'Petty Cash',
          description: 'Entertain Customer',
          amount: '1000',
          expensedate: '30‑06‑2025',
          purpose: 'test'
        }
      ],
      costCenter: 'CC001',
      jobTitle: 'Admin',
      headOfDept: 'Juli',
      currencyName: 'Australian Currency'
    });
    setDetailVisible(true);
  };
  const grouped = claims.reduce((acc, item) => {
    (acc[item.type] = acc[item.type] || []).push(item);
    return acc;
  }, {});

  return (
    <React.Fragment>
      {/* <div className="page-content">
      <Container fluid> */}

      {/* <Breadcrumbs title="Finance" breadcrumbItem="PPP Approval" /> */}

      {/* 🔍 Search Filter */}
      <Card className="p-3 mb-3">
        <Row className="align-items-center g-2">


          <Col lg="6" md="6">
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>

              {types.map((type, index) => (
                <div key={index} className="p-field-radiobutton" style={{ display: 'flex', alignItems: 'center' }}>
                  <RadioButton
                    inputId={type}
                    name="type"
                    value={type}
                    onChange={(e) => setSelectedType(e.value)}
                    checked={selectedType === type}
                  />
                  <span htmlFor={type} style={{ marginLeft: '8px', fontWeight: "bold" }}>{type}</span>
                </div>
              ))}
            </div>


          </Col>
          <Col lg="6" md="6">


            <div className="text-end button-items">
              <button type="button" className="btn btn-success" onClick={() => setBankModalVisible(true)}>
                <i className="bx bx-check-circle label-icon font-size-16 align-middle me-2"></i> Choose Bank
              </button>
              <button type="button" className="btn btn-primary">
                <i className="bx bx-check-circle label-icon font-size-16 align-middle me-2"></i> Save
              </button>
              <button type="button" className="btn btn-danger">
                <i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i> Cancel
              </button>
              <button type="button" className="btn btn-secondary">
                <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i> Export
              </button>

              <button type="button" className="btn btn-primary">
                <i className="bx bx-printer label-icon font-size-16 align-middle me-2"></i> Print
              </button>
            </div>
          </Col>
        </Row>
      </Card>


      <Row>
        <Col lg="12">
          <Card>
            <Accordion multiple>
              {Object.entries(grouped).map(([type, rows]) => (
                <AccordionTab key={type} header={headerTemplate(type)}>
                  <ApprovalTable data={claims}
                    handleDiscuss={handleDiscuss}
                    handleClick1={handleClick1}
                    handleClick2={handleClick2}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    handleCheckboxChange={handleCheckboxChange}
                    action1={action1}
                    action2={action2} handleShowDetails={handleShowDetails} />
                </AccordionTab>
              ))}
            </Accordion>
          </Card>
        </Col>
      </Row>
      {/* </Container>
 </div> */}
      <Dialog

        visible={showModal}
        onHide={() => setShowModal(false)}
        style={{ width: '50vw', maxWidth: '600px' }}
        breakpoints={{ '960px': '75vw', '640px': '100vw' }}
        contentStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Input
          type="textarea"
          className="custom-textarea"
          value={selectedClaim?.comment || ''}
          onChange={(e) =>
            setSelectedClaim({ ...selectedClaim, comment: e.target.value })
          }
          placeholder="Enter your comment"
        />
        <div className="mt-3 text-end">
          <Button label="Save" icon="pi pi-check" onClick={handleSaveComment} />
        </div>
      </Dialog>

      <Modal isOpen={historyVisible} toggle={() => setHistoryVisible(false)} size="xl">
        <ModalHeader toggle={() => setHistoryVisible(false)}>
          {historyForType} History
        </ModalHeader>
        <ModalBody>
          <Row form className="align-items-end mb-3">
            <Col sm="4">
              <label>From</label>


              <InputGroup>
                <Flatpickr
                  name="FromDate"
                  id="FromDate"
                  className="form-control d-block"
                  placeholder="dd-mm-yyyy"
                  options={{
                    altInput: true,
                    altFormat: "d-M-Y",
                    dateFormat: "Y-m-d",
                  }}
                  value={historyRange.from}
                  onChange={(e) => setHistoryRange(r => ({ ...r, from: e.value }))}
                  style={{ cursor: "default" }}
                />

              </InputGroup>
            </Col>
            <Col sm="4">
              <label>To</label>
              <InputGroup>
                <Flatpickr
                  name="FromDate"
                  id="FromDate"
                  className="form-control d-block"
                  placeholder="dd-mm-yyyy"
                  options={{
                    altInput: true,
                    altFormat: "d-M-Y",
                    dateFormat: "Y-m-d",
                  }}
                  value={historyRange.to}
                  onChange={(e) => setHistoryRange(r => ({ ...r, to: e.value }))}
                  style={{ cursor: "default" }}
                />

              </InputGroup>
            </Col>
            <Col sm="4">

              <button type="button" className="btn btn-info" onClick={() => {
                const filtered = historyArray.filter(h =>
                  h.type === historyForType &&
                  (!historyRange.from || new Date(h.transactiondate) >= historyRange.from) &&
                  (!historyRange.to || new Date(h.transactiondate) <= historyRange.to)
                );
                setHistoryData(filtered);
              }}>
                <i className="bx bx-search-alt label-icon font-size-16 align-middle me-2"></i> Search</button>

            </Col>
          </Row>

          <DataTable value={historyArray} dataKey="id" responsiveLayout="scroll">
            <Column headerStyle={{ textAlign: 'center' }} style={{ textAlign: 'center' }} field="claimno" header="Claim#" />
            <Column headerStyle={{ textAlign: 'center' }} field="date" header="Claim Date" />
            <Column headerStyle={{ textAlign: 'center' }} field="name" header="Applicant Name" />
            <Column headerStyle={{ textAlign: 'center' }} field="dept" header="Applicant Department" />
            <Column headerStyle={{ textAlign: 'center' }} field="amount" header="Claim Amount in TC" style={{ textAlign: 'right' }} />
            <Column headerStyle={{ textAlign: 'center' }} field="curr" header="Currency" />
            <Column headerStyle={{ textAlign: 'center' }} field="transactiondate" header="Approved Date" />

            <Column
              header="GM" style={{ textAlign: 'center' }} headerStyle={{ textAlign: 'center' }}
              body={(r) => <ApproverIndicator approved={r.approvedone} discussed={r.discussedone} />}
            />
            <Column
              header="Director" style={{ textAlign: 'center' }} headerStyle={{ textAlign: 'center' }}
              body={(r) => <ApproverIndicator approved={r.approvedtwo} discussed={r.discussedtwo} />}
            />
            <Column header="Remarks" body={(rowData) => rowData.comment} />
          </DataTable>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-danger" onClick={() => setHistoryVisible(false)} ><i className="bx bx-window-close label-icon font-size-14 align-middle me-2"></i>Cancel</button>

        </ModalFooter>
      </Modal>


      <Modal isOpen={bankModalVisible} toggle={() => setBankModalVisible(false)}>
        <ModalHeader toggle={() => setBankModalVisible(false)}>Choose Bank</ModalHeader>
        <ModalBody>
          <Label>Select Bank</Label>

          <Input
            type="select"
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.value)}
          >
            <option value="">Select</option>
            {bankOptions.map((item, index) => (
              <option key={index} value={item.value}>
                {item.label}
              </option>
            ))}
          </Input>


        </ModalBody>
        <ModalFooter>
          <button className="btn btn-primary" onClick={() => {
            // You can save selectedBank here (e.g., API call or state update)
            console.log("Selected bank:", selectedBank);
            setBankModalVisible(false);
          }}>
            <i className="bx bx-check-circle label-icon font-size-16 align-middle me-2"></i> Save
          </button>
          <button className="btn btn-danger" onClick={() => setBankModalVisible(false)}>
            <i className="bx bx-window-close label-icon font-size-16 align-middle me-2"></i> Cancel
          </button>
        </ModalFooter>
      </Modal>


      <Modal isOpen={detailVisible} toggle={() => setDetailVisible(false)} size="xl">
        <ModalHeader toggle={() => setDetailVisible(false)}>Claim Details</ModalHeader>
        <ModalBody>
          {selectedDetail && (
            <>
              <Row form>
                {[
                  ["Category Type ", "Claim"],
                  ["Application Date", "30-06-2025"],
                  ["Application No", selectedDetail.claimno],
                  ["Department ", "Packing"],
                  ["Applicant ", `${selectedDetail.name}Halim`],
                  ["Job Title", selectedDetail.jobTitle],
                  ["HOD", selectedDetail.headOfDept],
                  ["Trans Currency ", selectedDetail.currencyName],
                  ["Attachment ", <a key="attachment" href="#">File.pdf</a>],
                  ["Cost Center", selectedDetail.costCenter],
                  ["Claim Amt in TC", selectedDetail.amount]
                ].map(([label, val], i) => (
                  <Col md="4" key={i} className="form-group row ">
                    <Label className="col-sm-4 col-form-label bold">{label}</Label>
                    <Col sm="8" className="mt-2">: {val}</Col>
                  </Col>
                ))}
              </Row>
              <hr />
              <DataTable value={selectedDetail.items}>
                <Column headerStyle={{ textAlign: 'center' }} header="#" body={(_, { rowIndex }) => rowIndex + 1} />
                <Column headerStyle={{ textAlign: 'center' }} field="type" header="Claim Type" />
                <Column headerStyle={{ textAlign: 'center' }} field="description" header="Claim & Payment Description" />
                <Column style={{ textAlign: "right" }} field="amount" header="Amount" />
                <Column headerStyle={{ textAlign: 'center' }} field="expensedate" header="Expense Date" />
                <Column headerStyle={{ textAlign: 'center' }} field="purpose" header="Purpose" />
              </DataTable>
              {/* <div className="text-end mt-2">
                <strong>Total: </strong>
                {selectedDetail.items?.reduce((sum, i) => sum + parseFloat(i.amount), 0)
                  .toFixed(2)}
              </div> */}
              <Row className="mt-3">
                <Col>
                  <Label>Remarks</Label>
                  <Input type="textarea" rows="2" disabled value="Some misinterpreted this claim…" />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col>
                  <Label style={{ float: "left", width: "100%" }}>Discussion Remarks</Label>
                  <Input type="textarea" rows="1" />
                </Col>
              </Row>
            </>
          )}
        </ModalBody>
        <ModalFooter>


          <button type="button" className="btn btn-success"  > <i className="pi pi-check label-icon font-size-16 align-middle me-2"></i> Approve</button>
          <button type="button" className="btn btn-warning" ><i className="pi pi-comment label-icon font-size-14 align-middle me-2"></i>Discuss</button>
          <button type="button" className="btn btn-danger" onClick={() => setDetailVisible(false)}> <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i> Cancel</button>

        </ModalFooter>
      </Modal>

    </React.Fragment>
  );
};

const ApprovalTable = ({ data, handleDiscuss, handleClick1, handleClick2, selectedRows, setSelectedRows, handleCheckboxChange, action1, action2, handleShowDetails }) => {
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    dept: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const onGlobalFilterChange = (e) => {
    const val = e.target.value;
    setFilters({ ...filters, global: { value: val, matchMode: FilterMatchMode.CONTAINS } });
    setGlobalFilterValue(val);
  };

  const deptOptions = [...new Set(data.map(d => d.dept))].map(d => ({ label: d, value: d }));

  const detailTemplate = (rowData) => (
    <div className="p-3">
      <strong>Transactions:</strong> {rowData.transactions}
    </div>
  );

  const renderHeader = () => {
    return (
      <div className="row align-items-center g-3 clear-spa">
        <div className="col-12 col-lg-6">
          <Button className="btn btn-danger btn-label"   >
            <i className="mdi mdi-filter-off label-icon" /> Clear
          </Button>
        </div>
        <div className="col-12 col-lg-3 text-end">
          <span className="me-4">
            <Button
              icon="pi pi-check"
              className={`btn-circle p-button-rounded p-button-success`}

            /> Approved</span>
          <span className="me-4"><Button
            icon="pi pi-comment"
            className={`btn-circle p-button-rounded  p-button-warning`}
          /> Discussed</span>
          {/* <span className="me-1"><Tag value="P" severity={getSeverity("Posted")} /> Posted</span> */}
        </div>
        <div className="col-12 col-lg-3">
          <input className="form-control" type="text" placeholder="Keyword Search" />
        </div>
      </div>
    );
  };
  const header = renderHeader();

  return (

    <DataTable selectionMode="multiple" onSelectionChange={(e) => setSelectedRows(e.value)}
      selection={selectedRows} value={data} paginator rows={5} header={header}
      filters={filters} globalFilterFields={['claimno', 'name', 'dept', 'curr']}
      dataKey="claimno" expandedRows={null} rowExpansionTemplate={detailTemplate}
      onRowToggle={(e) => { }} responsiveLayout="scroll">
      {/* <Column expander style={{ width: '3em' }} /> */}
      <Column
        header="S.No" style={{ textAlign: 'center' }}
        body={(rowData, { rowIndex }) => rowIndex + 1}
      />
      <Column field="claimno" header="Claim#" filter />
      <Column field="date" header="Claim Date" filter />
      <Column field="name" header="Applicant Name" filter />
      <Column field="dept" header="Applicant Department" filter filterElement={(opts) => (
        <Dropdown value={opts.value} options={deptOptions} onChange={(e) => opts.filterCallback(e.value, opts.index)} placeholder="All Depts" className="p-column-filter" />
      )} />
      <Column field="amount" header="Claim Amount in TC" filter style={{ textAlign: 'right' }} />
      <Column field="curr" header="Currency" filter />
      <Column header="Details" body={(rowData) => (
        <span id={`tt-${rowData.claimno}`} style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => {
          handleShowDetails(rowData);
        }}>
          Details

          <Tooltip target={`#tt-${rowData.claimno}`} content={"View Details"} mouseTrack />
        </span>
      )} />

      <Column
        style={{ textAlign: 'center' }}
        header="Director"
        body={(rowData) => (
          <div className="d-flex gap-2">


            <Button
              icon="pi pi-check"
              className={`btn-circle p-button-rounded ${action1[rowData.id] === 'approve'
                  ? 'p-button-success'
                  : 'p-button-outlined'
                }`}
              onClick={() => handleClick1('approve', rowData.id)}
              tooltip="Approve"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-comment"
              className={`btn-circle p-button-rounded ${action1[rowData.id] === 'discuss'
                  ? 'p-button-warning'
                  : 'p-button-outlined'
                }`}
              onClick={() => { handleClick1('discuss', rowData.id), handleDiscuss(rowData) }}
              tooltip="Discuss"
              tooltipOptions={{ position: 'top' }}
            />

          </div>
        )}
      />
      <Column style={{ textAlign: 'center' }}
        header="Commissioner"
        body={(rowData) => (
          <div className="d-flex gap-2">
            <Button
              icon="pi pi-check"
              className={`btn-circle p-button-rounded ${action2[rowData.id] === 'approve'
                  ? 'p-button-success'
                  : 'p-button-outlined'
                }`}
              onClick={() => handleClick2('approve', rowData.id)}
              tooltip="Approve"
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-comment"
              className={`btn-circle p-button-rounded ${action2[rowData.id] === 'discuss'
                  ? 'p-button-warning'
                  : 'p-button-outlined'
                }`}
              onClick={() => { handleClick2('discuss', rowData.id), handleDiscuss(rowData) }}
              tooltip="Discuss"
              tooltipOptions={{ position: 'top' }}
            />

          </div>
        )}
      />
      <Column
        header="Remarks"
        body={(rowData) => rowData.comment}
      />
      {/* <Column header="Convert to PPP" body={() => <input type="checkbox" />} /> */}
      <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
    </DataTable>

  );
};

export default PPPApproval;
