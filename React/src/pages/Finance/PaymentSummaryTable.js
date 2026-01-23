import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalFooter, ModalBody, Col, Row, Label, Input, InputGroup, Table } from "reactstrap";
import Swal from "sweetalert2";
import axios from "axios";


import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { Button } from "primereact/button";
import useAccess from "../../common/access/useAccess";
import {
  DownloadFileById,
  ClaimReject, getClaimDetailsById, ClaimAndPaymentGetById
} from "common/data/mastersapi";

const PaymentSummaryTable = ({ claims, onRefresh, approvedata }) => {

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState({});

  const { access, applyAccessUI } = useAccess("Claim", "Approval");

  useEffect(() => {
    if (!access.loading) {
      applyAccessUI();
    }
  }, [access, applyAccessUI]);

  const [popupRows, setPopupRows] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [convertFromDate, setConvertFromDate] = useState(null);
  const [convertToDate, setConvertToDate] = useState(null);
  const [selectedSumary, setselectedSumary] = useState(null);
  const [cashInHand, setCashInHand] = useState("");
  const [cashFromSales, setCashFromSales] = useState("");
  const [selectedsummaryRows, setselectedsummaryRows] = useState([]);

  const combinedClaims = claims.filter(
    c => (c.SupplierId && c.SupplierId !== 0) || (c.ApplicantId && c.ApplicantId !== 0)
  );
  const [Seqno, setSeqno] = useState("");
  const togglePopup = () => setShowPopup(!showPopup);


  // at top of component
  useEffect(() => {
    if (!approvedata) return;

    setCashInHand({
      CNY: approvedata.InHand_CNY || 0,
      USD: approvedata.InHand_USD || 0,
      SGD: approvedata.InHand_SGD || 0,
      IDR: approvedata.InHand_IDR || 0,
      MYR: approvedata.InHand_MYR || 0,
    });

    setCashFromSales({
      CNY: approvedata.Sales_CNY || 0,
      USD: approvedata.Sales_USD || 0,
      SGD: approvedata.Sales_SGD || 0,
      IDR: approvedata.Sales_IDR || 0,
      MYR: approvedata.Sales_MYR || 0,
    });
    console.log("loff", approvedata);
    setSeqno(approvedata.PaymentNo);
    setConvertFromDate(approvedata.FromDate ? approvedata.FromDate : null);
    setConvertToDate(approvedata.ToDate ? approvedata.ToDate : null);

  }, [approvedata]);

  useEffect(() => {
    setselectedsummaryRows(claims);
  }, [claims]);


  const getSeverity = (Status) => {
    switch (Status) {
      case 'Approved':
        return 'btn-success';
      case 'Discussed':
        return 'btn-warning';
      case 'Posted':
        return 'success';
      case 'Saved':
        return 'danger';
      case 'new':
        return 'info';
      case 'NoAction':
        return 'btn-secondary';
      case 'renewal':
        return null;
    }
  };

  const handleDownloadFile = async () => {
    const fileId = 0;
    const filePath = previewUrl;

    const fileUrl = await DownloadFileById(fileId, filePath);

    // if (fileUrl) {
    //     window.open(fileUrl, "_blank");
    //     setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    // } else {
    //     Swal.fire({
    //         icon: 'error',
    //         title: 'Download Failed',
    //         text: 'Unable to download the file. Please try again later.',
    //     });
    // }
  };

  const openPopup = async (summaryId, id, type, supplierId, applicantId, modeOfPaymentId, bankId) => {
    // If viewdetails is disabled, do not show popup
    if (!access?.canViewDetails) return;

    setSelectedSummaryId(summaryId);
    setSelectedId(id);
    setSelectedType(type);
    let isDirector = 0;
    if (approvedata.PPP_PV_Director_approve === 0 && approvedata.PPP_PV_Commissioner_approveone === 0) {
      isDirector = 0;
    } else if (approvedata.PPP_PV_Director_approve === 1 && approvedata.PPP_PV_Commissioner_approveone === 0) {
      isDirector = 1;
    }
    try {
      const res = await getClaimDetailsById(
        supplierId == null || supplierId == undefined ? 0 : supplierId,
        applicantId == undefined || applicantId == null ? 0 : applicantId,
        modeOfPaymentId == undefined || modeOfPaymentId == null ? 0 : modeOfPaymentId,
        bankId == undefined || bankId == null ? 0 : bankId,
        1,
        isDirector,
        summaryId
      );
      setPopupRows(res.data || []);
      setShowPopup(true);
    } catch (error) {
      console.error("Failed to fetch details:", error);
    }
  };

  const moveBack = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to move this back?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Move Back"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {


          const ids = selectedRows.map(r => ({ "Id": r.Claim_ID }));
          console.log("Removed Items : ", ids);
          try {
            const res = await ClaimReject({ Rej: { Reject: ids, UserId: 1, IsPPP: 0 } }); // replace with your API/service
            if (res.status) {
              Swal.fire("Removed!", "Selected items were removed.", "success");
              if (onRefresh) onRefresh();

              setShowPopup(false);
            } else {
              Swal.fire("Error", res.message || "Failed to remove.", "error");
            }
          } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to remove.", "error");
          }





        } catch (err) {
          Swal.fire("Error", "Move back failed", "error");
        }
      }
    });
  };

  const getCurrencies = (data) => {
    const set = new Set();
    data.forEach(row => {
      if (row.curr) set.add(row.curr);
    });
    return Array.from(set);
  };


  const formatWithCommas = (value) => {
    if (!value) return '';
    const parts = value.toString().split('.');
    const intPart = parts[0];
    const decPart = parts[1];
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  };

  const formatAmount = (value) =>
    value?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const groupKey = (row) => {
    const method = row.PaymentMethod || "-";
    const bank = row.BankName || "-";
    const summary = row.SummaryId || "-";
    return `${summary}||${method}||${bank}`;
  };

  const handlePrint = (seqno) => {
    const printContents = document.getElementById(`printable-summary-${seqno}`).innerHTML;
    const newWin = window.open("", "_blank", "width=1000,height=800");
    newWin.document.write(`
      <html>
        <head>
          <title>Payment Summary Report</title>
          <style>
                @media print {
        .screen-only { display: none !important; }
        .print-only { display: inline !important; }
      }
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center;color:black; }
            th { background: #f0f0f0; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>Payment Summary Report</h2>
         
          ${printContents}
          <div class="footer">
            Printed on: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `);
    newWin.document.close();


    newWin.focus();
    newWin.onafterprint = function () {
      newWin.close();
    };

    newWin.print();

  };

  const getStatusSymbol = (status) => {
    switch (status) {
      case "Approved":
        return "✔"; // Green Tick
      case "Discussed":
        return "✖"; // Red Cross
      default:
        return "⏳"; // Pending Clock
    }
  };

  const handleDetailsPrint = () => {
    const detail = selectedDetail;
    if (!detail) return;

    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const printWindow = window.open('', '', 'width=1000,height=700');

    const printStyles = `
      <style>

       @media print {
                       .print-footer {
         position: fixed;
top: 0;
left: 0;
right: 0;
font-size: 10px;
text-align: right;
border-bottom: 0.5px dashed #999;

height:10px;


      }
.footer {
position: running(pageFooter);  
font-size: 10px;
color: #444;
text-align: right;
}
        @page {
          size: A4 landscape;
       margin: 5mm; 
       @bottom-center {
content: element(pageFooter);
}
        }
  
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          padding: 10px;
          color: #000;
        }
  
        h2 {
          text-align: center;
          margin-bottom: 20px;
          font-size: 16px;
        }
  
        .section-title {
          font-weight: bold;
          margin: 12px 0 5px;
          padding-bottom: 2px;
        
          font-size: 12px;
        }
  
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
  
        .info-table td {
          padding: 4px 6px;
          vertical-align: top;
        }
  
        .info-table td.label {
          font-weight: bold;
          width: 20%;
          white-space: nowrap;
        }
  
        .claim-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
  
       .claim-table th,
.claim-table td {
border: 1px solid #ccc;
padding: 6px;
text-align: center;
word-wrap: break-word;
word-break: break-word;
white-space: normal;
vertical-align: top;
}

.claim-table td:nth-child(1) { width: 3%;text-align: center; }   /* # */
.claim-table td:nth-child(2) { width: 15%;text-align: left; }  /* Claim Type */
.claim-table td:nth-child(3) { width: 23%; text-align: left;}  /* Description */
.claim-table td:nth-child(4) { width: 17%;text-align: right; }  /* Amount */
.claim-table td:nth-child(5) { width: 13%; text-align: center;}  /* Expense Date */
.claim-table td:nth-child(6) { width: 24%;text-align: left; }  /* Purpose */
  
        .status-table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
          margin-top: 15px;
        }
  
        .status-table th,
        .status-table td {
          border: 1px solid #ccc;
          padding: 6px;
           word-wrap: break-word;
word-break: break-word;
white-space: normal;
vertical-align: top;
        }
  
        .status-header {
          background-color: #eee;
          font-weight: bold;
        }
  
        .btn-circle {
          display: inline-block;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          margin: auto;
        }
  
        .btn-success { background-color: #28a745; }
        .btn-warning { background-color: #ffc107; }
        .btn-secondary { background-color: #6c757d; }
  
        .legend {
          margin-top: 10px;
          font-size: 10px;
        }
  
        .legend span {
          margin-right: 15px;

        }
  
        .remarks-box {
          border: 1px solid #ccc;
          padding: 8px;
          min-height: 30px;
          margin-top: 5px;
            white-space: pre-wrap; /* Preserve line breaks */
word-wrap: break-word;
word-break: break-word;
        }
      </style>
    `;

    const headerInfo = `
    <div style="padding:20px; display: flex; justify-content: space-between; align-items: center;">
<h2 style="margin: 0 auto;padding-left:100px;">Claim Details</h2>
<div style="font-size: 10px; text-align: right;">Printed on: ${formattedDateTime}</div>
</div>
      <table class="info-table">
        <tr>
          <td class="label">Category Type</td><td>${detail.header?.claimcategory || ''}</td>
          <td class="label">Application Date</td><td>${detail.header?.ApplicationDatevw || ''}</td>
        </tr>
        <tr>
          <td class="label">Application No</td><td>${detail.header?.ApplicationNo || ''}</td>
          <td class="label">Applicant</td><td>${detail.header?.applicantname || ''}</td>
        </tr>
        <tr>
          <td class="label">Job Title</td><td>${detail.header?.JobTitle || ''}</td>
          <td class="label">Department</td><td>${detail.header?.departmentname || ''}</td>
        </tr>
        <tr>
          <td class="label">HOD</td><td>${detail.header?.HOD_Name || ''}</td>
          <td class="label">Currency</td><td>${detail.header?.transactioncurrency || ''}</td>
        </tr>
        <tr>
          <td class="label">Cost Center</td><td>${detail.header?.CostCenter || ''}</td>
          <td class="label">Supplier</td><td>${detail.header?.SupplierName || ''}</td>
        </tr>
        <tr>
          <td class="label">Claim Amt in TC</td><td>${detail.header?.ClaimAmountInTC?.toLocaleString('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2
    }) || ''}</td>
          <td class="label">Attachment</td><td>${detail.header?.AttachmentName || 'No Attachment'}</td>
        </tr>
      </table>
    `;

    const detailRows = detail.details.map((row, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${row.claimtype || ''}</td>
        <td>${row.PaymentDescription || ''}</td>
        <td>${row.TotalAmount?.toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2 }) || ''}</td>
        <td>${row.ExpenseDatevw || ''}</td>
        <td>${row.Purpose || ''}</td>
      </tr>
    `).join('');

    const claimTable = `
    <div style="border-bottom: 1px solid #ccc;padding-top:5px;"></div>
       <table class="claim-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Claim Type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Expense Date</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          ${detailRows}
        </tbody>
      </table>
    `;

    const remarksSection = `
      <div class="section-title">Remarks</div>
      <div class="remarks-box">
        ${detail.header?.Remarks || ''}
      </div>
    `;

    const statusIndicators = `
    
     <table class="status-table">
      <thead>
        <tr class="status-header">
          <th colspan="2">Claim</th>
          <th colspan="3">PPP</th>
          <th colspan="2">Vouchers</th>
        </tr>
        <tr>
          <th>GM</th><th>Director</th>
          <th>GM</th><th>Director</th><th>CEO</th>
          <th>Director</th><th>CEO</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          ${[
        detail.header?.ClmgmStatus,
        detail.header?.ClmDrStatus,
        detail.header?.PPPgmStatus,
        detail.header?.PPPDrStatus,
        detail.header?.PPPCEOStatus,
        detail.header?.VouCmrStatus,
        detail.header?.VouDrStatus
      ].map((status) => {
        const symbol = getStatusSymbol(status);
        return `<td style="font-size: 16px;">${symbol}</td>`;
      }).join('')}
        </tr>
      </tbody>
    </table>
   
     <div class="legend" style="margin-top: 10px; font-size: 10px;">
      <span>✔ Approved</span>
      <span>✖ Discussed</span>
      <span>⏳ Yet to Act</span>
    </div>

  `;


    printWindow.document.write(`
      <html>
        <head>
          <title>Claim Details</title>
          ${printStyles}
        </head>
        <body>
          ${headerInfo}
          ${claimTable}
          ${remarksSection}
          ${statusIndicators}
          
        </body>
      </html>
    `);


    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

  const handleShowDetails = async (row) => {

    const res = await ClaimAndPaymentGetById(row.Claim_ID, 1, 1);
    if (res.status) {

      setSelectedDetail(res.data);
      setDetailVisible(true);
      setPreviewUrl(res.data.header.AttachmentPath == undefined || res.data.header.AttachmentPath == null ? "" : res.data.header.AttachmentPath);
      setFileName(res.data.header.AttachmentName == undefined || res.data.header.AttachmentName == null ? "" : res.data.header.AttachmentName);

    }
    else {
      Swal.fire("Error", "Data is not available", "error");

    }
  };
  const buildTable = (title, data) => {
    if (!data || data.length === 0) return null;

    const currencies = ["IDR", "SGD", "USD", "MYR", "CNY"];

    // split data
    const cashWithdrawalData = data.filter(r => r.PaymentMethod === "Cash Withdrawal");
    const otherData = data.filter(r => r.PaymentMethod !== "Cash Withdrawal");

    // normal grouping (for non-cash-withdrawal)
    const grouped = {};
    otherData.forEach(row => {
      debugger;
      const nameKeyid = `supplier-${row.SupplierId ?? 'none'}_applicant-${row.ApplicantId ?? 'none'}`;

      const nameKey = row.SupplierId || row.ApplicantId;
      const groupId = row.SupplierName || row.ApplicantName;
      const summaryId = row.SummaryId || "-";
      const method = row.PaymentMethod || "-";
      const bank = row.BankName || "-";
      // const key = `${summaryId}||${method}||${bank}||${nameKey}`;
      const key = `${summaryId}||${method}||${bank}||${nameKey} || ${nameKeyid}`;


      if (!grouped[key]) grouped[key] = {
        rows: [],
        groupName: groupId,
        summaryId,
        method,
        bank,
        id: nameKey,
        supplierId: row.SupplierId,
        applicantId: row.ApplicantId,
        modeOfPaymentId: row.ModeOfPaymentId,
        bankId: row.BankId
      };
      grouped[key].rows.push(row);
    });

    // totals
    const overallTotals = currencies.reduce((acc, curr) => {
      acc[curr] = data
        .filter(r => r.curr === curr)
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
      return acc;
    }, {});

    // cash withdrawal grouped by bank
    const cashGrouped = Object.values(
      cashWithdrawalData.reduce((acc, row) => {
        const bankKey = row.BankName || "-";
        if (!acc[bankKey]) acc[bankKey] = {
          ...row,
          bank: bankKey,
          rows: []
        };
        acc[bankKey].rows.push(row);
        return acc;
      }, {})
    );

    return (
      <>


        <table className="paymentsummarypv table text-center mt-3">
          <thead className="table-light">
            <tr>
              <th>Mode Of Payment</th>
              <th>Bank Name</th>
              <th>Supplier / Applicant Name</th>
              {currencies.map(curr => (
                <th key={curr}>{curr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Normal rows */}
            {Object.values(grouped).map((group, index) => {
              const rowTotals = currencies.reduce((acc, curr) => {
                acc[curr] = group.rows
                  .filter(r => r.curr === curr)
                  .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
                return acc;
              }, {});
              return (
                <tr key={`row-${index}`}>
                  <td style={{ textAlign: "left" }}>{group.method}</td>
                  <td style={{ textAlign: "left" }}>{group.bank || "-"}</td>
                  <td className="linkcolor"
                    style={{ textAlign: "left", cursor: "pointer" }}
                    onClick={() =>
                      openPopup(group.summaryId, group.id, "Party",
                        group.supplierId, group.applicantId,
                        group.modeOfPaymentId, group.bankId)
                    }
                  >
                    {group.groupName}
                  </td>
                  {currencies.map(curr => (
                    <td style={{ textAlign: "right" }} key={curr}>
                      {rowTotals[curr]
                        ? rowTotals[curr].toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : "0.00"}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Cash Withdrawal rows */}
            {cashGrouped.map((cg, i) => {
              const rowTotals = currencies.reduce((acc, curr) => {
                acc[curr] = cg.rows
                  .filter(r => r.curr === curr)
                  .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
                return acc;
              }, {});
              return (
                <tr key={`cw-${i}`} style={{ backgroundColor: "#fff7e6" }}>
                  <td style={{ textAlign: "left" }}>Cash Withdrawal</td>
                  <td style={{ textAlign: "left" }}>{cg.bank}</td>
                  <td className="linkcolor"
                    style={{ textAlign: "left", cursor: "pointer" }}
                    onClick={() =>
                      openPopup(cg.SummaryId, cg.SupplierId || cg.ApplicantId, "Party", 0, 0, 0, cg.BankId)
                    }
                  >
                    N/A
                  </td>
                  {currencies.map(curr => (
                    <td style={{ textAlign: "right" }} key={curr}>
                      {rowTotals[curr]
                        ? rowTotals[curr].toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : "0.00"}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Cash in Hand */}
            <tr style={{ backgroundColor: "#e8f4ff", fontWeight: "bold" }}>
              <td colSpan={3} style={{ textAlign: "left" }}>Cash in Hand</td>
              {currencies.map(curr => (
                <td style={{ textAlign: "right" }} key={`cashinhand-${curr}`}>
                  -{((cashInHand[curr] || 0) + (cashFromSales[curr] || 0)).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
              ))}
            </tr>

            {/* Total */}
            <tr style={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>
              <td colSpan={3}>Total</td>
              {currencies.map(curr => {
                const netTotal = (overallTotals[curr] || 0) - ((cashInHand[curr] || 0) + (cashFromSales[curr] || 0));
                return (
                  <td style={{ textAlign: "right" }} key={`total-${curr}`}>
                    {netTotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>

      </>
    );
  };



  const supplierClaims = claims.filter(c => c.SupplierId && c.SupplierId !== 0);
  const applicantClaims = claims.filter(c => c.ApplicantId && c.ApplicantId !== 0);

  return (

    <>

      <br />
      {(() => {
        const currencies = ["IDR", "SGD", "USD", "MYR", "CNY"];


        const getAmountForCategoryCurrency = (category, currency, cashOnly = null) => {
          if (cashOnly == "Cash") {

            return selectedsummaryRows
              .filter(r =>
                r.curr === currency &&
                (r.PaymentMethod || "").toLowerCase() === "Cash Withdrawal"
              )
              .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
          }
          else {
            if (selectedsummaryRows.length > 0) {

            }
            return selectedsummaryRows
              .filter(r =>
                r.ClaimCategory === category &&
                r.curr === currency &&

                (r.PaymentMethod || "").toLowerCase() !== "Cash Withdrawal"

              )
              .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
          }
        };

        // const getAmountForCategoryCurrency = (category, currency ) => {


        //     if(selectedsummaryRows.length > 0){
        //       debugger;
        //     }
        //   return selectedsummaryRows
        //     .filter(r =>
        //       r.ClaimCategory === category &&
        //       r.curr === currency 

        //     )
        //     .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

        // };


        const getTotalA = () => {
          return currencies.reduce((acc, curr) => {
            const val = parseFloat(cashInHand[curr] || 0) + parseFloat(cashFromSales[curr] || 0);
            return { ...acc, [curr]: val };
          }, {});
        };

        const getTotalB = () => {
          return currencies.reduce((acc, curr) => {
            // sum non-cash categories
            const nonCash = ["Claim", "Cash Advance", "Supplier Payment"]
              .reduce((sum, cat) => sum + getAmountForCategoryCurrency(cat, curr, "NonCash"), 0);

            // sum cash withdrawals (once)
            const cash = getAmountForCategoryCurrency(null, curr, "Cash");

            return { ...acc, [curr]: nonCash + cash };
          }, {});
        };

        // const getTotalB = () => {
        //   return currencies.reduce((acc, curr) => {
        //     const val = ["Claim", "Cash Advance", "Supplier Payment"]
        //       .reduce((sum, cat) =>
        //         sum + getAmountForCategoryCurrency(cat, curr, "Cash")
        //       , 0);
        //     return { ...acc, [curr]: val };
        //   }, {});
        // };

        const getCashNeeded = () => {
          const A = getTotalA();
          const B = getTotalB();
          return currencies.reduce((acc, curr) => {
            return { ...acc, [curr]: (B[curr] || 0) - (A[curr] || 0) };
          }, {});
        };

        const getBankPayment = () => {
          return currencies.reduce((acc, curr) => {
            const val = getAmountForCategoryCurrency("Bank Payment", curr, "Bank Transfer");
            return { ...acc, [curr]: val };
          }, {});
        };

        const totalA = getTotalA();
        const totalB = getTotalB();
        const cashNeeded = getCashNeeded();
        const bankPayment = getBankPayment();



        return (
          <>

            <>
              <style>
                {`


      @media screen {
        .print-only { display: none !important; }
      }
    `}
              </style>

              {/* Your existing JSX goes here */}
            </>
            <div className="text-end mb-3 no-print">
              {access?.canPrint && (
                <Button
                  icon="pi pi-print"
                  label="Print"
                  className="p-button-sm p-button-secondary"
                  onClick={() => handlePrint(Seqno)}
                />)}
            </div>
            <div id={`printable-summary-${Seqno}`}>

              <h3 className="print-only" >
                Payment Plan Date: {new Date(convertFromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                - {new Date(convertToDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                / PPP No: {Seqno}
              </h3>


              <table className="table table-sm table-bordered align-middle mb-2">
                <thead>
                  <tr className="table-secondary">
                    <th>Category</th>
                    {currencies.map(curr => (
                      <th key={curr} className="text-center">{curr}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* First row: Cash Needed */}
                  <tr className="table-warning fw-bold">
                    <td style={{ textAlign: "left", fontWeight: "bold" }}>Cash Needed (B - A)</td>
                    {currencies.map(curr => (
                      <td key={`cashNeeded-${curr}`} className="text-end" style={{ textAlign: "right", fontWeight: "bold" }}>
                        {cashNeeded[curr]?.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Cash In Hand */}
                  <tr>
                    <td style={{ textAlign: "left" }}>Cash in Hand</td>
                    {currencies.map(curr => (
                      <td key={`cih-${curr}`} style={{ textAlign: "right" }}>

                        <span className="print-only"  >
                          {Number(cashInHand[curr] || 0).toLocaleString()}
                        </span>

                        <Input
                          type="text"
                          disabled={true}
                          className="text-end screen-only"
                          value={formatWithCommas(cashInHand[curr])}
                          onChange={e =>
                            setCashInHand({ ...cashInHand, [curr]: e.target.value })
                          }
                        />
                      </td>
                    ))}
                  </tr>

                  {/* Cash From Sales */}
                  <tr>
                    <td style={{ textAlign: "left" }}>Cash from Factory Sales</td>
                    {currencies.map(curr => (
                      <td key={`cfs-${curr}`} style={{ textAlign: "right" }}>


                        <span className="print-only" style={{ textAlign: "right" }}>
                          {Number(cashFromSales[curr] || 0).toLocaleString()}
                        </span>
                        <Input
                          type="text"
                          disabled={true}
                          className="text-end screen-only"
                          value={formatWithCommas(cashFromSales[curr])}
                          onChange={e =>
                            setCashFromSales({ ...cashFromSales, [curr]: e.target.value })
                          }
                        />
                      </td>
                    ))}
                  </tr>

                  {/* Total A */}
                  <tr className="table-light fw-bold">
                    <td style={{ fontWeight: "bold", textAlign: "left" }}>Total A</td>
                    {currencies.map(curr => (
                      <td key={`totalA-${curr}`} style={{ textAlign: "right", fontWeight: "bold" }} className="text-end">
                        {totalA[curr]?.toLocaleString()}
                      </td>
                    ))}
                  </tr>


                  {["Claim", "Cash Advance", "Supplier Payment"].map(category => (
                    <tr key={category}>
                      <td style={{ textAlign: "left" }}>{category}</td>
                      {currencies.map(curr => {
                        const method =
                          category === "Cash Withdrawal"
                            ? "Cash"     // only Cash for Cash Withdrawal row
                            : "NonCash"; // exclude Cash everywhere else
                        return (
                          <td key={`${category}-${curr}`} className="text-end" style={{ textAlign: "right" }}>
                            {getAmountForCategoryCurrency(category, curr, method).toLocaleString()}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Total B */}
                  <tr className="table-light fw-bold">
                    <td style={{ fontWeight: "bold", textAlign: "left" }}>Total B</td>
                    {currencies.map(curr => (
                      <td key={`totalB-${curr}`} style={{ fontWeight: "bold", textAlign: "right" }} className="text-end">
                        {totalB[curr]?.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <br />

              {buildTable("Party", combinedClaims)}
            </div>
          </>
        );
      })()}

      {/* {buildTable("Supplier", supplierClaims, true)}
      {buildTable("Applicant", applicantClaims, false)} */}



      <Modal isOpen={showPopup} toggle={togglePopup} size="xl">
        <ModalHeader toggle={togglePopup}>Claim Details</ModalHeader>
        <ModalBody>
          <DataTable
            value={popupRows}
            selection={selectedRows}
            onSelectionChange={e => setSelectedRows(e.value)}
            paginator
            rows={10}
            className="PPP_Datatable"
            dataKey="Claim_ID"
            responsiveLayout="scroll"
            selectionMode="checkbox"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3em' }}  ></Column>
            {/* <Column field="claimno" header="Claim No"></Column> */}

            <Column header="Claim#" body={(rowData) => (

              <span id={`tt-${rowData.claimno}`} style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => {
                handleShowDetails(rowData);
              }}>
                {rowData.claimno}

              </span>


            )} />
            <Column field="claimcategory" header="Claim Category"></Column>
            <Column field="totalamountinidr" header="Amount" body={(row) => formatAmount(row.totalamountinidr)}></Column>
            <Column field="transactioncurrency" header="Currency"></Column>

          </DataTable>

          <div className="text-end mt-3">
            <button className="btn btn-danger" onClick={moveBack}>Move Back</button>
          </div>
        </ModalBody>
      </Modal>


      <Modal isOpen={detailVisible} toggle={() => setDetailVisible(false)} size="xl">
        <ModalHeader toggle={() => setDetailVisible(false)}>Claim Details</ModalHeader>
        <ModalBody>
          {/* {selectedDetail!=undefined && selectedDetail !=null && selectedDetail.header !=undefined && selectedDetail.header !=null && ( */}
          {1 == 1 && (
            <>
              <Row form>
                {[
                  ["Category Type ", selectedDetail.header?.claimcategory],
                  ["Application Date", selectedDetail.header?.ApplicationDatevw],
                  ["Application No", selectedDetail.header?.ApplicationNo],
                  ["Department ", selectedDetail.header?.departmentname],
                  ["Applicant ", selectedDetail.header?.applicantname],
                  ["Job Title", selectedDetail.header?.JobTitle],
                  ["HOD", selectedDetail.header?.HOD_Name],
                  ["Trans Currency ", selectedDetail.header?.transactioncurrency],
                  ["Attachment ", selectedDetail.header?.AttachmentName ? (
                    <button
                      type="button"
                      className="btn d-flex align-items-center justify-content-between"
                      onClick={handleDownloadFile}
                      key="attachment"
                      style={{
                        height: "10px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          flexGrow: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "blue"
                        }}
                        title={fileName}
                      >
                        {fileName}
                      </span>
                      <i className="mdi mdi-cloud-download mdi-24px text-primary ms-2"></i>
                    </button>
                  ) : (
                    "No Attachment"
                  )
                  ],


                  ["Cost Center", selectedDetail.header?.CostCenter],
                  ["Claim Amt in TC", <span key="amtintc"> {selectedDetail.header?.ClaimAmountInTC?.toLocaleString('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 2
                  })}</span>],
                  ["Supplier", selectedDetail.header?.SupplierName],
                ].map(([label, val], i) => (
                  <Col md="4" key={i} className="form-group row ">
                    <Label className="col-sm-4 col-form-label bold">{label}</Label>
                    <Col sm="8" className="mt-2">: {val}</Col>
                  </Col>
                ))}
              </Row>
              <hr />
              <DataTable value={selectedDetail.details}>
                <Column headerStyle={{ textAlign: 'center' }} header="#" body={(_, { rowIndex }) => rowIndex + 1} />
                <Column headerStyle={{ textAlign: 'center' }} field="claimtype" header="Claim Type" />
                <Column headerStyle={{ textAlign: 'center' }} field="PaymentDescription" header="Claim & Payment Description" />
                <Column style={{ textAlign: "right" }} field="TotalAmount" header="Amount"
                  body={(rowData) =>
                    rowData.TotalAmount?.toLocaleString('en-US', {
                      style: 'decimal',
                      minimumFractionDigits: 2
                    })
                  } />
                <Column headerStyle={{ textAlign: 'center' }} field="ExpenseDatevw" header="Expense Date" />
                <Column headerStyle={{ textAlign: 'center' }} field="Purpose" header="Purpose" />
              </DataTable>

              <Row className="mt-3">
                <Col>
                  <Label>Remarks</Label>
                  <Input type="textarea" rows="2" disabled value={selectedDetail.header?.Remarks} />
                </Col>
              </Row>







              <Row className="mt-3">
                <Col>


                  <Table className="table mt-3" style={{ width: "76%" }}>
                    <thead style={{ backgroundColor: "#3e90e2" }}>
                      {/* <table className="table table-bordered text-center">
                                    <thead> */}
                      <tr>
                        <th style={{ padding: "0px", width: "18%", backgroundColor: "#B4DBE0" }} className="text-center" colSpan="2">Claim</th>
                        <th style={{ padding: "0px", width: "18%", backgroundColor: "#E6E4BC" }} className="text-center" colSpan="3">PPP</th>
                        <th style={{ padding: "0px", width: "10%", backgroundColor: "#FFE9F5" }} className="text-center" colSpan="2">Vouchers</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th style={{ padding: "0px", backgroundColor: "#B4DBE0" }} className="text-center">GM</th>
                        <th style={{ padding: "0px", backgroundColor: "#B4DBE0" }} className="text-center">Director</th>
                        <th style={{ padding: "0px", backgroundColor: "#E6E4BC" }} className="text-center">GM</th>
                        <th style={{ padding: "0px", backgroundColor: "#E6E4BC" }} className="text-center">Director</th>
                        <th style={{ padding: "0px", backgroundColor: "#E6E4BC" }} className="text-center">CEO</th>
                        <th style={{ padding: "0px", backgroundColor: "#FFE9F5" }} className="text-center">Director</th>
                        <th style={{ padding: "0px", backgroundColor: "#FFE9F5" }} className="text-center">CEO</th>

                      </tr>
                      <tr>
                        <td className="text-center p-1"><Button className={`btn-circle p-button-rounded btn ${getSeverity(selectedDetail.header?.ClmgmStatus)}`} /></td>
                        <td className="text-center p-1"><Button className={`btn-circle p-button-rounded btn ${getSeverity(selectedDetail.header?.ClmDrStatus)}`} /></td>
                        <td className="text-center p-1"><Button className={`btn-circle p-button-rounded btn ${getSeverity(selectedDetail.header?.PPPgmStatus)}`} /></td>
                        <td className="text-center p-1"><Button className={`btn-circle p-button-rounded btn ${getSeverity(selectedDetail.header?.PPPDrStatus)}`} /></td>
                        <td className="text-center p-1"><Button className={`btn-circle p-button-rounded btn ${getSeverity(selectedDetail.header?.PPPCEOStatus)}`} /></td>
                        <td className="text-center p-1"><Button className={`btn-circle p-button-rounded btn ${getSeverity(selectedDetail.header?.VouCmrStatus)}`} /> </td>
                        <td className="text-center p-1"><Button className={`btn-circle p-button-rounded btn ${getSeverity(selectedDetail.header?.VouDrStatus)}`} /> </td>
                      </tr>
                    </tbody>
                  </Table>

                  <br />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col>

                  <div className="col-12 col-lg-6 text-left" >
                    <span className="me-3">
                      <Button

                        className={`btn-circle p-button-rounded btn btn-success`}

                      /> Approved</span>
                    <span className="me-3"><Button

                      className={`btn-circle p-button-rounded  btn btn-warning`}
                    /> Discussed</span>

                    <span className="me-3"><Button className={`btn-circle p-button-rounded  btn btn-secondary`} /> Yet to Act </span>
                  </div>
                  <div className="col-12 col-lg-6 text-end"></div>
                </Col>
              </Row>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {access?.canPrint && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleDetailsPrint()}
            >
              <i className="mdi mdi-printer font-size-16 me-2"></i> Print
            </button>)}
          <button type="button" className="btn btn-danger" onClick={() => setDetailVisible(false)}> <i className="bx bx-export label-icon font-size-16 align-middle me-2"></i> Close</button>

        </ModalFooter>
      </Modal>
    </>
  );

  //   <Modal isOpen={showSupplierModal} toggle={toggleSupplierModal} size="xl">
  //   <ModalHeader toggle={toggleSupplierModal}>Voucher</ModalHeader>
  //   <ModalBody>

  //     {selectedVoucherId && (
  //       <PaymentVoucher VoucherId={selectedVoucherId} />
  //     )}
  //   </ModalBody>
  // </Modal>
};

export default PaymentSummaryTable;
