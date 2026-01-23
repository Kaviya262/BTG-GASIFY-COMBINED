import React, { useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';
import SQPrint from './SQPrint'; // ✅ adjust path
import { GetSQ }  from "../../../common/data/mastersapi";

const SQPrintColumn = ({ sqid }) => {
    const printRef = useRef();
    const [printData, setPrintData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePrint = async () => {
        setLoading(true);
        try {
            const resdata = await GetSQ(sqid); // ⬅️ fetch by SO_ID
            let obj = { Header: resdata[0][0], Detail: resdata[1], contact: resdata[2] };
            setPrintData(obj);

            // Wait for React to render the printable content
            setTimeout(() => {
                const content = printRef.current.innerHTML;
                const win = window.open('', '', 'height=700,width=900');
                win.document.write('<html><head><title>Print</title></head><body>');
                win.document.write(content);
                win.document.write('</body></html>');
                win.document.close();
                win.focus();

                // Wait for logo image to load before printing
                const logoImg = win.document.querySelector('img[alt="logo"]');
                if (logoImg) {
                    logoImg.onload = function () {
                        win.print();
                        win.close();
                        setLoading(false);
                    };
                    // If already loaded (cache), print immediately
                    if (logoImg.complete) {
                        win.print();
                        win.close();
                        setLoading(false);
                    }
                } else {
                    // Fallback: print after short delay if image not found
                    setTimeout(() => {
                        win.print();
                        win.close();
                        setLoading(false);
                    }, 500);
                }
            }, 100); // slight delay to ensure DOM updates
        } catch (err) {
            console.error("Print error", err);
            setLoading(false);
        }
    };

    return (
        <>
            <button className="btn btn-success" onClick={handlePrint} disabled={loading}>
            

                <i className="bx bx-printer "></i>
                {/* {loading ? "Loading..." :""} */}
            </button>

            {/* Hidden printable DOM node */}
            <div ref={printRef} style={{ display: "none" }}>
                {printData && <SQPrint data={printData} />}
            </div>
        </>
    );
};

SQPrintColumn.displayName = "SQPrintColumn";
export default SQPrintColumn;
