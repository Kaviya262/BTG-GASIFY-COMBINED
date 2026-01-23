import React, { useState, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const PurchaseOrderPrint = ({ poModalVisible, setPoModalVisible, poData }) => {
  const printRef = useRef();

  // Print Function
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const newWin = window.open("", "Print-Window");
      newWin.document.open();
      newWin.document.write(`
        <html>
          <head>
            <title>Purchase Order</title>
            <style>
              body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 6px; }
              th { background: #f2f2f2; }
              .no-border td { border: none !important; }
            </style>
          </head>
          <body onload="window.print(); setTimeout(() => window.close(), 100);">
            ${printContents}
          </body>
        </html>
      `);
      newWin.document.close();
    }
  };

  if (!poData) return null;

  // ✅ Calculate Totals dynamically
  const totals = poData.items.reduce(
    (acc, item) => {
      acc.subtotal += item.subtotal || 0;
      acc.discount += item.discountvalue || 0;
      acc.tax += item.taxvalue || 0;
      acc.vat += item.vatvalue || 0;
      acc.netto += item.nettotal || 0;
      acc.totalamount +=item.totalamount || 0;
      return acc;
    },
    { subtotal: 0, discount: 0, tax: 0, vat: 0, netto: 0 }
  );

  const currency = poData.items[0]?.currencycode || "IDR";

  return (
    <Modal isOpen={poModalVisible} toggle={() => setPoModalVisible(false)} size="xl">
      <ModalHeader toggle={() => setPoModalVisible(false)}>
        Purchase Order Print Preview
      </ModalHeader>
      <ModalBody>
        <div ref={printRef} style={{ padding: 20, fontFamily: "Arial, sans-serif", color: "#000" }}>
          {/* Header Top: Logo + Company */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <img src="/logo.png" alt="Logo" style={{ height: 60, marginRight: 15 }} />
            <div>
              <p style={{ fontWeight: "bold", marginBottom: 2 }}>{poData.header[0].CompanyName}</p>
              <p style={{ marginBottom: 1 }}>
                {poData.header[0].Address1}, {poData.header[0].Address2}, {poData.header[0].Address3}
              </p>
              <p style={{ marginBottom: 1 }}>
                {poData.header[0].WebSite} | {poData.header[0].Email}
              </p>
              <p style={{ marginBottom: 1 }}>Tel: {poData.header[0].TelePhone}</p>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", fontSize: 20, fontWeight: "bold", marginTop: 10, marginBottom: 10 }}>
            {poData.header[0].header || "PURCHASE ORDER"}
          </div>

          {/* Supplier Info + PO Info */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            {/* Supplier Info */}
            <div style={{ width: "60%" }}>
              <p><strong>To :</strong> {poData.supplier.suppliername}</p>
              <p>{poData.supplier.Address}</p>
              <p>Tel : {poData.supplier.PhoneNo}</p>
              {poData.supplier.Email && <p>Email : {poData.supplier.Email}</p>}
            </div>

            {/* PO Info */}
            <div style={{ width: "40%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><strong>Request No:</strong></span>
                <span>{poData.header[0].PR_Numbers || "-"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><strong>P.O. No:</strong></span>
                <span>{poData.header[0].pono}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><strong>Date:</strong></span>
                <span>{poData.header[0].podate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><strong>Delivery:</strong></span>
                <span>{poData.header[0].deliveryterm || "-"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><strong>Term:</strong></span>
                <span>{poData.header[0].paymentterm || "-"}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 10 }}>
            <thead>
              <tr>
                <th>No.</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {poData.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: "center" }}>{idx + 1}</td>
                  <td>{item.itemdescription}</td>
                  <td style={{ textAlign: "center" }}>{item.qty} {item.UOM}</td>
                  <td style={{ textAlign: "right" }}>
                    {item.unitprice?.toLocaleString("id-ID", { style: "currency", currency: item.currencycode })}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {item.totalvalue?.toLocaleString("id-ID", { style: "currency", currency: item.currencycode })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Note */}
          <p style={{ fontSize: 11, marginTop: 5 }}>
            <strong>Note :</strong> All activities carried out in the production area of PT. BTG must comply with occupational safety and health regulations.
            During loading and unloading materials, the supplier’s operator shall wear PPE. If any accident and injury caused by negligence on the
            part of supplier, will not be the responsibility of PT. BTG.
          </p>

          {/* Signatures + Totals */}
          <table className="no-border" style={{ width: "100%", marginTop: "20px" }}>
            <tbody>
              <tr>
                {/* Left side signatures */}
                <td style={{ width: "50%", verticalAlign: "top", padding: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <div>
                      <div>Best Regards,</div>
                      <div style={{ marginTop: "40px", fontWeight: "bold" }}>Mr. Edy Louis Hugo</div>
                    </div>
                    <div>
                      <div>Approval Authority,</div>
                      <div style={{ marginTop: "40px", fontWeight: "bold" }}>Ms. Leny Halim</div>
                    </div>
                  </div>
                </td>

                {/* Right side totals */}
                <td style={{ width: "50%", verticalAlign: "top", padding: "10px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: "left" }}>Subtotal {currency}</td>
                        <td style={{ textAlign: "right" }}>
                          {totals.totalamount.toLocaleString("id-ID", { style: "currency", currency })}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: "left" }}>Discount {currency}</td>
                        <td style={{ textAlign: "right" }}>
                          {totals.discount.toLocaleString("id-ID", { style: "currency", currency })}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: "left" }}>Tax {currency}</td>
                        <td style={{ textAlign: "right" }}>
                          {totals.tax.toLocaleString("id-ID", { style: "currency", currency })}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: "left" }}>VAT {currency}</td>
                        <td style={{ textAlign: "right" }}>
                          {totals.vat.toLocaleString("id-ID", { style: "currency", currency })}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: "left", fontWeight: "bold" }}>TOTAL-NETTO {currency}</td>
                        <td style={{ textAlign: "right", fontWeight: "bold" }}>
                          {totals.netto.toLocaleString("id-ID", { style: "currency", currency })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div style={{ marginTop: 30, fontSize: 11, display: "flex", justifyContent: "space-between" }}>
            <span>Printed on {poData.header[0].printdatetime || "-"} by {poData.header[0].printuser || "-"}</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-danger" onClick={() => setPoModalVisible(false)}>Close</button>
        <button className="btn btn-primary" onClick={handlePrint}>Print</button>
      </ModalFooter>
    </Modal>
  );
};

export default PurchaseOrderPrint;
