import React, { forwardRef } from "react";
import logo from '../../../assets/images/logo.png';

const SalesOrderPrint = forwardRef(({ data }, ref) => {
    const { Header, Detail } = data;

    const containerStyle = {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '40px',
        lineHeight: '1.6',
        color: '#000'
    };

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

    return (
        <div ref={ref} style={containerStyle}>

            {/* Header with logo and company address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ minWidth: 90, marginRight: 18 }}>
                    <img src={logo} alt="logo" style={{ height: 70 }} />
                </div>
                <div style={{ textAlign: 'left', fontSize: '12px', lineHeight: '1.4', maxWidth: 260, wordBreak: 'break-word' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>PT. Batam Teknologi Gas</div>
                    <div>Jalan Brigjen Katamso KM.3, Tanjung Uncang, Batam – Indonesia</div>
                    <div>WebSite www.ptbtg.com E-mail ptbtg@ptpbtg.com</div>
                    <div>Telp (+62)778 462959 391918</div>
                </div>
            </div>

<style>
                {`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 0mm 20mm 20mm 0mm;
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
            <div style={titleStyle}>Sales Order - {Header.SO_Number}</div>

            <div style={sectionStyle}>
                <strong>SO Type:</strong> {Header.salesordertype} <br />
                <strong>SO Date:</strong> {Header.OrderDatefor} <br />
                {/* <strong>SO No.:</strong> {Header.SO_Number} <br /> */}
            </div>

            <div style={sectionStyle}>
                <strong>Customer:</strong> {Header.CustomerName} <br />
                <strong>Phone No:</strong> {Header.CustomerPhone} <br />
                <strong>Email:</strong> {Header.customerEmail} <br />
                <strong>Order By:</strong> {Header.OrderBy} <br />
                <strong>Project:</strong> {Header.ProjectName} <br />
            </div>

            <hr />

            <table style={tableStyle}>
                <thead>
                    <tr>
                    <th style={thStyle}>S.No.</th>
                        <th style={thStyle}>SQ No.</th>
                        <th style={thStyle}>PO Number</th>
                        <th style={thStyle}>Gas Code</th>
                        <th style={thStyle}>Gas Description</th>
                        <th style={thStyle}>Volume</th>
                        <th style={thStyle}>Pressure</th>
                        <th style={thStyle}>SO Qty</th>
                        <th style={thStyle}>UOM</th>
                        {/* <th style={thStyle}>Req. Delivery Date</th>
                        <th style={thStyle}>Delivery Address</th>
                        <th style={thStyle}>Delivery Instruction</th> */}
                    </tr>
                </thead>
                <tbody>
                    {Detail.map((item, idx) => (
                        <tr key={idx}>
                                                        <td style={tdStyle}>{idx+1}</td>

                            <td style={tdStyle}>{item.sq_nbr}</td>
                            <td style={tdStyle}>{item.PoNumber}</td>
                            <td style={tdStyle}>{item.GasCode}</td>
                            <td style={tdStyle}>{item.GasDescription}</td>
                            <td style={tdStyle}>{item.Volume}</td>
                            <td style={tdStyle}>{item.Pressure}</td>
                            <td style={tdStyle}>{item.SO_Qty}</td>
                            <td style={tdStyle}>{item.UOM}</td>
                            {/* <td style={tdStyle}>{new Date(item.ReqDeliveryDate).toLocaleDateString()}</td>
                            <td style={tdStyle}>{item.Deliveryaddress}</td>
                            <td style={tdStyle}>{item.DeliveryInstruction}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

SalesOrderPrint.displayName = "SalesOrderPrint";

export default SalesOrderPrint;
