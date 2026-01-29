import React, { useEffect, useState } from "react";
import { Row, Col, Label, Button, Input } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Flatpickr from "react-flatpickr";

import { GetPaymentHistory } from "../../../common/data/mastersapi";


const PaymentHistory = ({ irnId, poNo, supplierName }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (irnId) {
      fetchPaymentHistory(irnId);
    }
  }, [irnId, poNo]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchPaymentHistory = async (irnId) => {
    try {
      // Fetch all history for the supplier
      const res = await GetPaymentHistory(
        1,
        1,
        irnId,
        "2020-01-01", // Default start date
        formatDate(new Date()) // Today
      );

      if (res.status && Array.isArray(res.data)) {
        // Filter by PO Number if provided
        const filteredData = poNo
          ? res.data.filter((item) => item.pono === poNo)
          : res.data;
        setData(filteredData);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setData([]);
    }
  };

  return (
    <div className="container mt-0">
      {/* Info Box */}
      <div className="p-2 mb-1" style={{ backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #dee2e6" }}>
        <Row>
          <Col md="6">
            <strong>Supplier Name:</strong> <span className="ms-2" style={{ color: "firebrick", fontWeight: "bold" }}>{supplierName || "N/A"}</span>
          </Col>
          {(poNo && poNo !== "N/A") && (
            <Col md="6">
              <strong>PO Number:</strong> <span className="ms-2" style={{ color: "firebrick", fontWeight: "bold" }}>{poNo}</span>
            </Col>
          )}
        </Row>
      </div>

      <DataTable value={data} paginator rows={5} responsiveLayout="scroll" emptyMessage="No payment history found for this PO."
        showGridlines
        header={null}
      >
        <Column header="#" body={(_, { rowIndex }) => rowIndex + 1} style={{ width: '50px' }} />
        <Column field="receipt_no" header="CLAIM NUMBER" />
        <Column field="voucherno" header="PV NUMBER" />
        <Column field="paymentmethod" header="MODE OF PAYMENT" />
      </DataTable>
    </div>
  );
};

export default PaymentHistory;
