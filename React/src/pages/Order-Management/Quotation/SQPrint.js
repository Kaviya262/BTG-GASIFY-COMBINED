import React, { forwardRef } from "react";
import logo from "../../../assets/images/logo.png";

const SQPrint = forwardRef(({ data }, ref) => {
    const { Header, Detail, contact } = data;

    const containerStyle = {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
    marginLeft: '-15px',   
    lineHeight: '1.6',
    color: '#000'
};

    const contactdata = contact.map(item => item.CustomerContact).join(", ");

    const sectionStyle = {
        marginBottom: '20px'
    };


    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '12px'
    };

    const thStyle = {
        backgroundColor: '#f0f0f0',
        padding: '8px',
        border: '1px solid #ccc',
        textAlign: 'left'
    };

    const tdStyle = {
        padding: '8px',
        border: '1px solid #ccc'
    };

    const titleStyle = {
        fontSize: '20px',
        marginBottom: '10px',
        fontWeight: '600'
    };

    const isValidValue = (val) =>
        val !== null && val !== undefined && String(val).trim() !== "";

    return (
        <div ref={ref} style={containerStyle}>

            <style>
                {`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 10mm 20mm 20mm 5mm;
                        }
                        body {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .print-container {
                            page-break-inside: avoid;
                        }
                        table {
                            page-break-inside: auto;
                        }
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        thead {
                            display: table-header-group;
                        }
                        tfoot {
                            display: table-footer-group;
                        }
                    }
                `}
            </style>

            {/* Header with logo and company address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px', justifyContent: 'flex-start' }}>
                <div style={{ minWidth: 90, marginRight: 18 }}>
                    <img src={logo} alt="logo" style={{ height: 70 }} />
                </div>
                <div style={{ textAlign: 'left', fontSize: '14px', lineHeight: '1.5' }}>
                    <div style={{ fontWeight: 700, fontSize: '17px', marginBottom: '2px' }}>PT. Batam Teknologi Gas</div>
                    <div>Jalan Brigjen Katamso KM.3, Tanjung Uncang, Batam – Indonesia</div>
                    <div>WebSite www.ptbtg.com E-mail ptbtg@ptpbtg.com</div>
                    <div>Telp (+62)778 462959 391918</div>
                </div>
            </div>

            <div style={titleStyle}>Sales Quotation - {Header.SQ_Nbr}</div>

            <div style={sectionStyle}>
                <strong>SQ Type:</strong> {Header.TypeName} <br />
                <strong>System Seq. No:</strong> {Header.SQ_Nbr} <br />
                <strong>Manual SQ No:</strong> {Header.manual} <br />
                <strong>SQ Date:</strong> {Header.SQ_Crete} <br />
                <strong>Quote Subject:</strong> {Header.Subject} <br />
            </div>

            <div style={sectionStyle}>
                <strong>Customer:</strong> {Header.CustomerName} <br />
                <strong>Main Address:</strong> {Header.MainAddress} <br />
                <strong>Delivery Address:</strong> {Header.DeliveryAddress} <br />
                <strong>Phone No:</strong> {Header.PhoneNumber} <br />
                <strong>Fax No:</strong> {Header.FaxNo} <br />
                <strong>Email:</strong> {Header.customerEmail} <br />
                <strong>Effective From Date:</strong> {Header.sq_EffectiveFromDate} <br />
            </div>

            <div style={sectionStyle}>
                <strong>Customer Contact:</strong> {Header.contactname} <br />
                <strong>Customer Operation Contact:</strong> {contactdata} <br />
                {(isValidValue(Header.Qtn_Month) || isValidValue(Header.Qtn_Day)) && (
                    <>
                        <strong>Quotation validity:</strong>{' '}
                        {isValidValue(Header.Qtn_Month) ? Header.Qtn_Month : ''}
                        {isValidValue(Header.Qtn_Month) && isValidValue(Header.Qtn_Day) ? '/' : ''}
                        {isValidValue(Header.Qtn_Day) ? Header.Qtn_Day : ''}
                        <br />
                    </>
                )}
                {isValidValue(Header.TBA) && (
                    <>
                        <strong>TBA:</strong> {Header.TBA}
                        <br />
                    </>
                )}


                <strong>Delivery Terms:</strong> {Header.DeliveryTerms} <br />
                <strong>Payment Terms:</strong> {Header.PaymentTerms} <br />
                <strong>Payment Method:</strong> {Header.PaymentMethod} <br />
                <strong>Sales Person:</strong> {Header.salesperson} <br />
                <strong>Sales Person Contact:</strong> {Header.SalesPersonContact} <br />
                <strong>Sales Person Email:</strong> {Header.SalesPersonEmail} <br />
            </div>

            <hr />

            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>S.No.</th>
                        <th style={thStyle}>Gas Code</th>
                        <th style={thStyle}>Qty</th>
                        <th style={thStyle}>UOM</th>
                        <th style={thStyle}>Currency</th>
                        <th style={thStyle}>Unit Price</th>
                        <th style={thStyle}>Total Price</th>
                        <th style={thStyle}>Price (IDR)</th>
                    </tr>
                </thead>
                <tbody>
                    {Detail.map((item, idx) => (
                        <tr key={idx}>
                            <td style={tdStyle}>{idx + 1}</td>
                            <td style={tdStyle}>{item.gascode}</td>
                            <td style={tdStyle}>{item.Qty}</td>
                            <td style={tdStyle}>{item.UOM}</td>
                            <td style={tdStyle}>{item.currencycode || item.currencyname || ''}</td>
                            <td style={tdStyle}>{item.UnitPrice}</td>
                            <td style={tdStyle}>{item.TotalPrice}</td>
                            <td style={tdStyle}>{item.ConvertedPrice}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ✅ Footer */}
            <div style={{ marginTop: "40px", textAlign: "center", fontStyle: "italic", fontSize: "14px", color: "#555" }}>
                This is a software generated Sales Quotation
            </div>
        </div>
    );
});

SQPrint.displayName = "SQPrint";

export default SQPrint;
