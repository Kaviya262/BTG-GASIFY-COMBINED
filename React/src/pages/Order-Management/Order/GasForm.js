import React, { useState, useEffect } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Input, Table } from "reactstrap";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import {
    GetShippingAddress
} from "../../../common/data/mastersapi";

const GasForm = ({ soData, gascoderows, setGascoderows, colKey, UOMList, addressrowids, setAddressrowids, setErrorMsg }) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const minDate = new Date(currentYear, 0, 1);
    const maxDate = new Date(currentYear, 11, 31);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [popColKey, setPopupid] = useState(0);
    const [popupindex, setPopupindex] = useState(0);
    const [DelAddress, SetDelAddress] = useState([]);
    const [deliDate, SetDeliDate] = useState();
    const [deladdid, SetDeladdid] = useState();
    const [delinstruction, SetDelinstruction] = useState();
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };
    useEffect(() => {
        console.log("Updated gascoderows:", gascoderows);
    }, [gascoderows]);

    const handleinstructionChange = (val, index, colKey) => {
        if (!Array.isArray(gascoderows[colKey])) return;

        // Update using a callback to ensure state consistency
        setGascoderows((prev) => {
            const updatedRows = { ...prev };
            updatedRows[colKey] = updatedRows[colKey].map((item, i) =>
                i === index ? { ...item, DeliveryInstruction: val } : item
            );
            SetDelinstruction(val);
            return updatedRows;
        });
    };

    const handleallchkChange = (index, val, colKey) => {
        if (!Array.isArray(gascoderows[colKey])) return;

        setGascoderows(prev => {
            const updatedRows = { ...prev };
            updatedRows[colKey] = updatedRows[colKey].map((item, i) => {
                if (i === index) {
                    return {
                        ...item,
                        chkStatus: val ? true : false,
                        IsDisabled: val ? 1 : 0,
                    };
                }
                return item;
            });
            return updatedRows;
        });
    };

    const handlePoNumberChange = (index, val, colKey) => {
        if (!Array.isArray(gascoderows[colKey])) return;

        setGascoderows((prev) => {
            const updatedRows = { ...prev };
            updatedRows[colKey] = updatedRows[colKey].map((item, i) =>
                i === index ? { ...item, PoNumber: val } : item
            );
            return updatedRows;
        });
    };
    const handleSOQtyChange = (index, val, colKey) => {

        if (!Array.isArray(gascoderows[colKey])) return;

        setGascoderows((prev) => {
            const updatedRows = { ...prev };
            updatedRows[colKey] = updatedRows[colKey].map((item, i) =>
                i === index ? { ...item, SO_Qty: val } : item
            );
            return updatedRows;
        });
    };

    const handleUomChange = (index, val, colKey) => {
        debugger
        if (!Array.isArray(gascoderows[colKey])) return;
        const selectedUOM = UOMList.find((uom) => uom.UoMId == val);
        setGascoderows((prev) => {
            const updatedRows = { ...prev };
            updatedRows[colKey] = updatedRows[colKey].map((item, i) =>
                i === index ? { ...item, Uomid: parseInt(val), UOM: selectedUOM ? selectedUOM.UoM : "" } : item
            );
            return updatedRows;
        });

    };
    const handleDateChange = (val, index, colKey) => {
        if (!Array.isArray(gascoderows[colKey])) return;
        setGascoderows((prev) => {
            const updatedRows = { ...prev };
            updatedRows[colKey] = updatedRows[colKey].map((item, i) =>
                i === index
                    ? {
                        ...item,
                        ReqDeliveryDate: formatDateToISO(val),
                    }
                    : item
            );
            SetDeliDate(new Date(val).toISOString());
            return updatedRows;
        });
    };
    const formatDateToISO = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}T00:00:00.000Z`; // Keep consistent ISO format
    };

    const handleAddressChange = (val, index, colKey) => {
        if (!Array.isArray(gascoderows[colKey])) return;
        setGascoderows((prev) => {
            const updatedRows = { ...prev };
            updatedRows[colKey] = updatedRows[colKey].map((item, i) =>
                i === index ? { ...item, DeliveryAddressId: val } : item
            );
            SetDeladdid(val);
            return updatedRows;
        });
    };

    const openaddresspopup = async (colKey, index, rowItem) => {
        toggleModal();
        //console.log('rowItem', rowItem)
        try {
            const data = await GetShippingAddress(rowItem.ContactId, -1);
            SetDelAddress(data);
            setPopupid(colKey);
            setPopupindex(index);
            debugger
            const gasrows = gascoderows[colKey][index];
            SetDeliDate(gasrows.ReqDeliveryDate);
            SetDeladdid(gasrows.DeliveryAddressId);

            setGascoderows((prev) => {
                const updatedRows = { ...prev };
                updatedRows[colKey] = updatedRows[colKey].map((item, i) =>
                    i === index ? { ...item, chkStatus: true } : item
                );
                return updatedRows;
            });

        } catch (error) {
            console.error("Error fetching customer data:", error);
        }
    }

    const saveAddressdet = () => {
        setGascoderows((prev) => {
            const updatedRows = { ...prev };
            Object.keys(updatedRows).forEach((colKey) => {
                updatedRows[colKey] = updatedRows[colKey].map((item) => {
                    if ((item.chkStatus === true || item.chkStatus === 1) && item.IsDisabled === 0) {
                        return {
                            ...item,
                            ReqDeliveryDate: deliDate,
                            DeliveryAddressId: deladdid,
                            DeliveryInstruction: delinstruction,
                            IsDisabled: 1
                        };
                    }
                    return item;
                });
            });
            toggleModal();
            return updatedRows;
        });
    };

    return (
        <Table className="table mb-0">
            <thead style={{ backgroundColor: "#3e90e2" }}>
                <tr>
                    <th className="text-center">#</th>
                    {soData.Categories > 1 && (
                        <th className="text-center" style={{ width: "12%" }}>SQ No.</th>
                    )}
                    <th className="text-center " style={{ width: "10%" }}>PO No.</th>
                    <th className="text-center">Gas Code</th>
                    <th className="text-center">Gas Description</th>
                    <th className="text-center" style={{ width: "8%" }}>Volume</th>
                    <th className="text-center" style={{ width: "5%" }}>Pressure</th>
                    <th className="text-center required-label" style={{ width: "8%" }}>SO Qty</th>
                    <th className="text-center" style={{ width: "16%" }}>UOM</th>
                    <th className="text-center" style={{ width: "8%" }}>Delivery Details</th>
                </tr>
            </thead>
            <tbody>
                {(() => {
                    const gasrows = gascoderows[colKey];
                    //console.log(colKey, gasrows)
                    return Array.isArray(gasrows) && gasrows.length > 0 ? (
                        gasrows.map((item, index) => {
                            console.log(`PoNumber for row ${index}:`, item.PoNumber);
                            return (
                                <tr key={index}>
                                    <td className="text-center align-middle">
                                        <Input type="checkbox" name={`addresschk${index}`} id={`${colKey}${index}`} className="tdfrmsizechg" onChange={(e) => handleallchkChange(index, e.target.checked, colKey)} checked={item?.chkStatus || item.IsDisabled} />
                                    </td>
                                    {soData.Categories > 1 && (
                                        <td><Input type="text" name={`SQ_Nbr${index}`} value={item.SQ_Nbr} disabled /></td>
                                    )}

                                    <td>
                                        <Input
                                            type="text"
                                            name="PoNumber"
                                            id={`PoNumber${colKey}${index}`}
                                            value={item.PoNumber || ""}
                                            onChange={(e) => handlePoNumberChange(index, e.target.value, colKey)}
                                            className={`form-control ${item.PoRequired === 1 && !item.PoNumber?.trim() ? "is-invalid" : ""}`}
                                            maxLength={20}
                                        />
                                    </td>
                                    <td><Input type="text" value={item.GasCode} disabled name="gascode" id={`gascode${colKey}${index}`} /> </td>
                                    <td><Input type="text" value={item.GasDescription} disabled name="gascodedescription" id={`gascodedescription${colKey}${index}`} /> </td>
                                    <td>
                                        <Input type="number" value={item.Volume} className="text-end" disabled name="Volume" id={`Volume${colKey}${index}`} />
                                    </td>
                                    <td>
                                        <Input type="text" value={item.Pressure} disabled className="text-end" name="Pressure" id={`Pressure${colKey}${index}`} />
                                    </td>
                                    <td>
                                        <Input
                                            type="text"
                                            // value={item.SO_Qty} 
                                            value={Number(item.SO_Qty).toLocaleString()}
                                            name="SO_Qty"
                                            className="text-end"
                                            id={`SO_Qty${colKey}${index}`}
                                            maxLength={13}
                                            // onChange={(e) => handleSOQtyChange(index, e.target.value, colKey)} 
                                            onChange={(e) => {
                                                // Remove commas from input
                                                let raw = e.target.value.replace(/,/g, '');
                                                // Allow only numbers
                                                if (!/^\d*$/.test(raw)) return;
                                                handleSOQtyChange(index, raw, colKey);
                                            }}
                                            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }}
                                        />
                                    </td>
                                    <td>
                                        <Input key={`${colKey}-${index}`} type="select" disabled name="Uomid" id={`Uomid${colKey}${index}`} maxLength={4} onChange={(e) => handleUomChange(index, e.target.value, colKey)} value={item.Uomid}>
                                            {UOMList.map((uom) => (
                                                <option key={uom.UoMId} value={uom.UoMId}>
                                                    {uom.UoM}
                                                </option>
                                            ))}
                                        </Input>
                                    </td>
                                    <td className="text-center">
                                        <div className="avatar-xs" onClick={() => openaddresspopup(colKey, index, item)} style={{ margin: "auto" }}>
                                            <span className="avatar-title rounded-circle bg-soft bg-info text-info font-size-14">
                                                <i className="bx bx-plus-medical"></i>
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="11" className="text-center text-muted">Please select any gas code</td>
                        </tr>
                    );
                })()}
                <Modal isOpen={isModalOpen} role="dialog" autoFocus={true} centered={true} className="exampleModal" tabIndex="-1" toggle={toggleModal} size="xl" >
                    <div className="modal-content">
                        <ModalHeader toggle={toggleModal}>Add Delivery Address</ModalHeader>
                        <ModalBody>
                            <div className="table-responsive">
                                <Table className="table align-middle bg">
                                    <thead>
                                        <tr className="table-light">
                                            <th className="text-center" scope="col" style={{ width: "20%" }}>
                                                Req. Delivery Date
                                            </th>
                                            <th className="text-center required-label" scope="col" style={{ width: "45%" }}>Delivery Address</th>
                                            <th className="text-center " scope="col">Delivery Instruction</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const gasrows2 = gascoderows?.[popColKey];
                                            if (!Array.isArray(gasrows2) || gasrows2.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan="3" className="text-center text-danger">
                                                            No delivery data available.
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            if (popupindex >= 0 && popupindex < gasrows2.length) {
                                                const item = gasrows2[popupindex];
                                                return (
                                                    <tr key={popupindex}>
                                                        <td className="text-center" scope="col">
                                                            <Flatpickr
                                                                className="form-control d-block"
                                                                placeholder="dd-mm-yyyy"
                                                                options={{
                                                                    altInput: true,
                                                                    altFormat: "d-M-Y",
                                                                    dateFormat: "Y-m-d",
                                                                    defaultDate: item?.ReqDeliveryDate || new Date(),
                                                                }}
                                                                onChange={(date) => handleDateChange(date, popupindex, popColKey)}
                                                            />
                                                        </td>
                                                        <td className="text-center" scope="col">
                                                            <Input
                                                                name="DeliveryAddressId"
                                                                type="select"
                                                                value={item?.DeliveryAddressId || ""}
                                                                onChange={(e) => handleAddressChange(e.target.value, popupindex, popColKey)}
                                                            >
                                                                <option value="">Select</option>
                                                                {DelAddress.map((addr) => (
                                                                    <option key={addr.DeliveryAddressId} value={addr.DeliveryAddressId}>
                                                                        {addr.DeliveryAddress}
                                                                    </option>
                                                                ))}
                                                            </Input>
                                                        </td>
                                                        <td className="text-center" scope="col">
                                                            <Input
                                                                type="text"
                                                                name="DeliveryInstruction"
                                                                id="DeliveryInstruction"
                                                                value={item?.DeliveryInstruction || ""}
                                                                onChange={(e) => handleinstructionChange(e.target.value, popupindex, popColKey)}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            } else {
                                                return (
                                                    <tr>
                                                        <td colSpan="3" className="text-center text-danger">
                                                            Invalid delivery data.
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        })()}
                                    </tbody>

                                </Table>

                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button type="button" className="btn btn-info" onClick={saveAddressdet}>
                                <i className="bx bxs-save label-icon font-size-16 align-middle me-2"></i>Save
                            </Button>
                            <Button type="button" color="secondary" onClick={toggleModal}>
                                Close
                            </Button>
                        </ModalFooter>
                    </div>
                </Modal>
            </tbody>
        </Table>

    );
};

export default GasForm;
