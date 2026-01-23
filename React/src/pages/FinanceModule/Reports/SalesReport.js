import React, { useState, useEffect, useRef } from "react";
import { Card, CardBody, Container, Row, Col, Button } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { GetCustomerFilter,getsalesreport} from "../service/financeapi";
import { fetchGasList } from "../../../common/data/mastersapi";

// Breadcrumbs Component
const Breadcrumbs = ({ title, breadcrumbItem }) => (
  <div className="page-title-box pt-3 pb-3 d-sm-flex align-items-center justify-content-between">
    <h4 className="mb-sm-0 font-size-18">{breadcrumbItem}</h4>
    <div className="page-title-right">
      <ol className="breadcrumb m-0">
        <li className="breadcrumb-item"><a href="#">{title}</a></li>
        <li className="breadcrumb-item active">{breadcrumbItem}</li>
      </ol>
    </div>
  </div>
);

const SalesReport = () => {
  const [filterType, setFilterType] = useState("Customer");
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const dt = useRef(null);
  const [resetTriggered, setResetTriggered] = useState(false);

  useEffect(() => {
    // Dummy fetch simulation

    const loadGasList = async () => {
         const data = await fetchGasList(1, -1);
         setItems(data);
       };
       const loadCustomerList = async () => {
        const customers = await GetCustomerFilter(1,"%");
        setCustomers(customers);
         };

       loadGasList();
       loadCustomerList();
       fetchReport();
   
 
  }, []);

  useEffect(() => {
    if (resetTriggered) {
      fetchReport();
      setResetTriggered(false);
    }
  }, [resetTriggered]);

  const fetchReport = async () => {
    setLoading(true);
   
    const orgid = 1;
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    
    const from = dateRange?.[0] ? formatDate(dateRange[0]) : null;
    const to   = dateRange?.[1] ? formatDate(dateRange[1]) : null;
    const customerid = selectedCustomer ? selectedCustomer.value : 0;
    const gasid = selectedItem ? selectedItem.value : 0;
    
    try {
       
      const json = await getsalesreport(orgid,customerid,from,to,gasid);

       if(json.status){
      let arr = Array.isArray(json.data)
        ? json.data
        : [json.data];

      // Fix date format (remove T00:00:00)
      arr = arr.map((x, index) => ({
        ...x,
        Date: x.Date?.split("T")[0],
        SNo: index + 1
      }));

      setReportData(json.data);
    }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // DataTable header with global filter
  const dtHeader = (
    <div className="d-flex justify-content-end align-items-center">
      
      
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Global Search"
          className="form-control"
          style={{ width: "200px" }}
        />
      
    </div>
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Report" breadcrumbItem="Sales Report" />

        <Card>
          <CardBody>
            {/* Filters & Buttons */}
            <Row className="align-items-center mb-3 g-2">
              <Col md={3}>
                <Select
                  options={[
                    { value: "Customer", label: "Customer" },
                    { value: "Item", label: "Item" },
                    { value: "Date", label: "Date Range" },
                  ]}
                  value={{ value: filterType, label: filterType }}
                  onChange={(option) => setFilterType(option.value)}
                  placeholder="Select Filter Type"
                />
              </Col>

              {filterType === "Customer" && (
                <Col md={3}>
                  <Select
                    options={customers}
                    value={selectedCustomer}
                    onChange={setSelectedCustomer}
                    placeholder="Select Customer"
                    isClearable
                  />
                </Col>
              )}

              {filterType === "Item" && (
                <Col md={3}>
                  <Select
                    options={items}
                    value={selectedItem}
                    onChange={setSelectedItem}
                    placeholder="Select Item"
                    isClearable
                  />
                </Col>
              )}

              {filterType === "Date" && (
                <Col md={3}>
                  <Flatpickr
                    value={dateRange}
                    onChange={setDateRange}
                    options={{ mode: "range", dateFormat: "Y-m-d" }}
                    placeholder="Select Date Range"
                    className="form-control"
                  />
                </Col>
              )}

              {/* Buttons */}
              <Col md="6" className="d-flex gap-2 flex-wrap justify-content-end">
              <Button color="primary" onClick={fetchReport}>
    <i className="mdi mdi-magnify"></i> Search
  </Button>
  <Button
    color="danger"
    onClick={() => {
      setSelectedCustomer(0);
      setSelectedItem(0);
      setDateRange(null);

      setReportData([]);
      setGlobalFilter("");
      setResetTriggered(true); // trigger fetch after state updates

    }}
  >
    Cancel
  </Button>
  <Button color="success" onClick={() => dt.current.exportCSV()}>
    Export
  </Button>
  {/* <Button color="info" onClick={() => window.print()}>
    Print
  </Button> */}
</Col>

            </Row>

            {/* DataTable */}
            <DataTable
              ref={dt}
              value={reportData}
              paginator
              rows={20}
              loading={loading}
              globalFilter={globalFilter}
              emptyMessage="No records found"
              responsiveLayout="scroll"
              header={dtHeader}
            >
              {/* <Column field="SNo" header="S.No." /> */}
              <Column  hheaderClassName="center-header" field="Date" header="Date" />
              <Column  hheaderClassName="center-header" field="CustomerName" header="Customer Name" />
              <Column  hheaderClassName="center-header" field="Currency" header="Currency" />
              <Column  hheaderClassName="center-header" className="text-end" field="Qty" header="Qty"    body={(rowData) =>
                      rowData.Qty?.toLocaleString('en-US', {
                          style: 'decimal',
                          minimumFractionDigits: 2
                      })
                  }/>
              <Column  hheaderClassName="center-header"    className="text-end" field="Total" header="Total Invoice"    body={(rowData) =>
                      rowData.Total?.toLocaleString('en-US', {
                          style: 'decimal',
                          minimumFractionDigits: 2
                      })
                  }/>
              <Column   hheaderClassName="center-header" className="text-end" field="PaymentReceived" header="Payment Received"    body={(rowData) =>
                      rowData.PaymentReceived?.toLocaleString('en-US', {
                          style: 'decimal',
                          minimumFractionDigits: 2
                      })
                  }/>
              <Column  hheaderClassName="center-header" className="text-end" field="PendingAmount" header="Pending Amount"    body={(rowData) =>
                      rowData.PendingAmount?.toLocaleString('en-US', {
                          style: 'decimal',
                          minimumFractionDigits: 2
                      })
                  }/>
            </DataTable>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default SalesReport;
