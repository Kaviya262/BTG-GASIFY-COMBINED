import React, { useRef, useState } from 'react';
import SalesOrderPrint from './salesorderprint'; // ✅ Adjust path
import { OrderGetbyid } from "../../../common/data/mastersapi";

const PrintColumn = ({ soId }) => {
    const printRef = useRef();
    const [printData, setPrintData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePrint = async () => {
        setLoading(true);
        try {
            const data = await OrderGetbyid(soId);

            // Sanitize fields with placeholder 'string'
            const cleanData = {
                ...data,
                Header: {
                    ...data.Header,
                    OrderBy: data.Header.OrderBy === 'string' ? '' : data.Header.OrderBy,
                    ProjectName: data.Header.ProjectName === 'string' ? '' : data.Header.ProjectName,
                    RackNumber: data.Header.RackNumber === 'string' ? '' : data.Header.RackNumber,
                }
            };

            setPrintData(cleanData);

            // Delay to let React render print content
            setTimeout(() => {
                if (!printRef.current) {
                    console.error("Print content not available.");
                    setLoading(false);
                    return;
                }

                const content = printRef.current.innerHTML;
                const win = window.open('', '', 'height=700,width=900');

                if (!win) {
                    alert('Popup blocked. Please allow popups for this site.');
                    setLoading(false);
                    return;
                }

                win.document.write('<html><head><title>Print</title></head><body>');
                win.document.write(content);
                win.document.write('</body></html>');
                win.document.close();
                win.focus();

                // Wait for logo image to load in the new window before printing
                const logoImg = win.document.querySelector('img[alt="logo"]');
                if (logoImg) {
                    logoImg.onload = function () {
                        win.print();
                        win.close();
                        setLoading(false);
                    };
                    if (logoImg.complete) {
                        win.print();
                        win.close();
                        setLoading(false);
                    }
                } else {
                    // fallback: print after short delay
                    setTimeout(() => {
                        win.print();
                        win.close();
                        setLoading(false);
                    }, 500);
                }
            }, 100); // enough time to render hidden content
        } catch (err) {
            console.error("Print error", err);
            setLoading(false);
        }
    };

    return (
        <>
            <button className="btn btn-success" onClick={handlePrint} disabled={loading}>
                <i className="bx bx-printer"></i> {loading ? "Loading..." : ""}
            </button>

            {/* Hidden printable DOM node */}
            <div ref={printRef} style={{ display: "none" }}>
                {printData && <SalesOrderPrint data={printData} />}
            </div>
        </>
    );
};

PrintColumn.displayName = "PrintColumn";
export default PrintColumn;
