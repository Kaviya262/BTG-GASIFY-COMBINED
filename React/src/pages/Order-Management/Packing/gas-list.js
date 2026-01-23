import React, { useEffect, useState } from "react";
import { Collapse, Input, Table, Tooltip, UncontrolledAlert } from "reactstrap";
import Select from "react-select";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  GetAllSqHistory, GetDriversList
} from "../../../common/data/mastersapi";
const GasList = ({
  sofromData,
  customerid,
  customername,
  setSaveFromData,
  setFromData,
  fromData,
  setErrorMsg,
}) => {
  console.log("fromData", fromData);

  const [accordionState, setAccordionState] = useState(
    Object.entries(sofromData["SOList"] || {}).reduce((acc, [key, item]) => {
      acc[key] = item.colstate || true;
      return acc;
    }, {})
  );

  const [driverNameList, setDriverNameList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [users, setUsers] = useState([]);
  const [errormsg, setErrormsg] = useState();
  const toggleModal = () => {
    setIsModalOpen(prev => !prev);
        
  };
  const[soqtypopup,setsoqtypopup]=useState(0);
  const openSOQtyHistory = async item2 => {
    debugger
    const filter = {
      soid: item2.soid,
      sqid: item2.SQID,
      GasCodeId: item2.gascodeid,
      BranchId: 1,
    };
    setsoqtypopup(item2.soqty);
    const response = await GetAllSqHistory(filter);

    const formatDate = (isoDateString) => {
      const date = new Date(isoDateString);
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };

    if (response?.status && Array.isArray(response.data)) {
      debugger
      const transformed = response.data.map(item => ({
        date: item.pdldate ? formatDate(item.pdldate) : '',
        soQty: item.soqty,
        pickQty: item.pickqty,
        remainingQty: item.bal_to_issue,
        modifiedBy: `User ${item.updatedby ?? "N/A"} / ${item.LastModifiedDate ? formatDate(item.LastModifiedDate) : ''}`,
        status: item.IsSubmitted === 1 ? "Posted" : "Save",
      }));

      setModalData(transformed);
    } else {
      const fallbackData = [
        {
          date: formatDate("2024-12-01"),
          soQty: item2.soqty,
          pickQty: item2.pickqty || 0,
          remainingQty: item2.balance_Qty ?? (item2.soqty - item2.pickqty),
          modifiedBy: `Admin / ${formatDate("2024-12-01")}`,
          status: "Active",
        },
      ];
      setModalData(fallbackData);
    }

    toggleModal();
  };





  const [tooltipOpen, setTooltipOpen] = useState({});
  const showAccord = colKey => {
    setAccordionState(prev => ({
      ...prev,
      [colKey]: !prev[colKey],
    }));
  };

  const toggleTooltip = id => {
    setTooltipOpen(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = dateStr => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

 const fetchDriversList = async () => {
      try { debugger
        const branchId =1;
        const data = await GetDriversList(branchId);
        const formatted = data.map(driver =>({
           value: driver.Id,
           label: driver.driverName,
        }));
        setDriverNameList(formatted);
      } catch (err) {
        console.error("Error fetching delivery orders:", err.message);
      }
    };

    useEffect(()=>{
        fetchDriversList();
    }, []);
    

  const driverNameOptions = [
    { value: "Mohammad", label: "Mohammad" },
    { value: "Sultan", label: "Sultan" },
    { value: "Shafiq", label: "Shafiq" },
    { value: "Rahim", label: "Rahim" },
    { value: "Rizwan", label: "Rizwan" },
    { value: "Aman", label: "Aman" },
  ];
  const truckNumberOptions = [
    { value: "BHP3344", label: "BHP3344" },
    { value: "BHP9875", label: "BHP9875" },
    { value: "BHP2234", label: "BHP2234" },
    { value: "BHP3245", label: "BHP3245" },
    { value: "BHP3212", label: "BHP3212" },
    { value: "BHP8734", label: "BHP8734" },
  ];

  const handleInputChange = (
    field,
    value,
    item2,
    colKey,
    colKey2,
    balance_Qty = 0
  ) => {
    setErrorMsg([]);

    if (field === "pickqty") {
      const enteredQty = parseInt(value);
      const currentPickQty = parseInt(item2.pickQty) || 0;
      const currentRemainingQty = parseInt(item2.balance_Qty) || 0;

      const totalAvailableQty = currentRemainingQty + currentPickQty;

      if (currentRemainingQty === 0) {
        setErrorMsg(["Current remaining quantity is 0. Cannot pick more items."]);
        return; 
      }

      if (enteredQty > totalAvailableQty) {
        setErrorMsg(["Pick quantity should not be greater than SO quantity."]);
        value = totalAvailableQty; 
      }
    }


    // Update the state
    setFromData(prevData => {
      if (
        !prevData[customerid] ||
        !prevData[customerid]["SOList"] ||
        !prevData[customerid]["SOList"][colKey]
      ) {
        return prevData;
      }

      return {
        ...prevData,
        [customerid]: {
          ...prevData[customerid],
          SOList: {
            ...prevData[customerid]["SOList"],
            [colKey]: {
              ...prevData[customerid]["SOList"][colKey],
              sodetails: {
                ...prevData[customerid]["SOList"][colKey]["sodetails"],
                [colKey2]: {
                  ...prevData[customerid]["SOList"][colKey]["sodetails"][colKey2],
                  [field]: value,
                },
              },
            },
          },
        },
      };
    });
  };

  // const handleInputChange = (
  //   field,
  //   value,
  //   item2,
  //   colKey,
  //   colKey2,
  //   balance_Qty = 0,
  //   status ="Posted"
  // ) => {
  //   setErrorMsg([]);
  // debugger
  //   const enteredQty = parseInt(value, 10);
  //   const issuedQty = parseInt(item2.so_Issued_Qty || 0, 10);
  //   const soQty = parseInt(item2.soqty || 0, 10);
  //   const remainingQty = parseInt(item2.balance_Qty || 0, 10);

  //   if (issuedQty >= soQty || remainingQty <= 0) {
  //     setErrorMsg(["All SO quantity has already been issued."]);
  //     // Optionally open a modal here if needed
  //     // toggleModal();
  //     return;
  //   }
  //   if (field === "pickqty") {
  //     if (status === "Posted") {

  //       const postedIssuedQty = 5;
  //       const postedRemainingQty = 10;
  //       const savedIssuedQty = 3;
  //       const savedRemainingQty = 7;

  //       if (postedIssuedQty = enteredQty){
  //         setErrorMsg(["All SO quantity has already been issued."]);
  //       }
  //       if (savedIssuedQty = enteredQty){
  //         setErrorMsg(["All SO quantity has already been issued."]);
  //       }
  //     //   if (enteredQty > remainingQty) {
  //     //     setErrorMsg(["Pick quantity should not be greater than balance quantity."]);
  //     //     value = remainingQty;
  //     //   }
  //     // } else if (status === "Saved") {
  //     //   if (enteredQty > soQty) {
  //     //     setErrorMsg(["Pick quantity should not be greater than SO quantity."]);
  //     //     value = soQty;
  //     //   }
  //     }
  //   }
  //   setFromData(prevData => {
  //     if (
  //       !prevData[customerid] ||
  //       !prevData[customerid]["SOList"] ||
  //       !prevData[customerid]["SOList"][colKey]
  //     ) {
  //       return prevData;
  //     }

  //     return {
  //       ...prevData,
  //       [customerid]: {
  //         ...prevData[customerid],
  //         SOList: {
  //           ...prevData[customerid]["SOList"],
  //           [colKey]: {
  //             ...prevData[customerid]["SOList"][colKey],
  //             sodetails: {
  //               ...prevData[customerid]["SOList"][colKey]["sodetails"],
  //               [colKey2]: {
  //                 ...prevData[customerid]["SOList"][colKey]["sodetails"][colKey2],
  //                 [field]: value,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     };
  //   });
  // };
  
  return (
    <>
      <div className="accordion accordion-flush" id="accordionFlushExample">
        {fromData[customerid] &&
          fromData[customerid]["SOList"] &&
          Object.entries(fromData[customerid]["SOList"]).length > 0 ? (
          Object.entries(fromData[customerid]["SOList"]).map(
            ([colKey, item], index) => {
              const SO_label = item.label || `SO00${index + 1}`;
              const sodetails = item.sodetails || [];
              const colstate = index === 0 ? true : accordionState[colKey];
              const isOpen = accordionState[colKey] ?? false;
              return (
                <div className="accordion-item" key={colKey}>
                  <h2
                    className="accordion-header"
                    id={`headingFlush${index}`}
                    style={{ backgroundColor: "#cee3f8" }}
                  >
                    <button
                      className={`accordion-button fw-medium ${!colstate ? "collapsed" : ""
                        }`}
                      type="button"
                      onClick={() => showAccord(colKey)}
                      style={{ cursor: "pointer" }}
                    >
                      Sale Order No.: {SO_label}
                    </button>
                  </h2>
                  {errormsg && (
                    <UncontrolledAlert color="danger">
                      {errormsg}
                    </UncontrolledAlert>
                  )}
                  <Collapse isOpen={isOpen} className="accordion-collapse">
                    <div className="accordion-body">
                      {sodetails && Object.entries(sodetails).length > 0 ? (
                        <div className="table-responsive mt-1">
                          <Table className="table mb-0">
                            <thead style={{ backgroundColor: "#3e90e2" }}>
                              <tr>
                                <th className="text-center" style={{ width: "20%" }}>Gas Name</th>
                                <th className="text-center" style={{ width: "15%" }}>SQ No.</th>
                                <th className="text-center" style={{ width: "8%" }}>SO Qty</th>
                                <th className="text-center  required-label" style={{ width: "11%" }}>Pick Qty</th>
                                <th className="text-center" style={{ width: "9%" }}>Delivery</th>
                                <th className="text-center  required-label">Driver Name</th>
                                <th className="text-center  required-label">Truck No.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(sodetails).map(
                                ([colKey2, item2], index2) => {
                                  const tooltipId = `gas-code-${index}-${index2}`;
                                  const tooltipId2 = `delivery-${index}-${index2}`;
                                  const tooltipId3 = `qty-${index}-${index2}`;

                                  return (
                                    <tr key={`${colKey}-${colKey2}`}>
                                      <td className="text-left">
                                        <span
                                          id={tooltipId}
                                          style={{
                                            cursor: "pointer",
                                            color: "blue",
                                            textAlign: "left",
                                          }}
                                          className="btn-rounded btn btn-link"
                                        >
                                          {item2.GasName}
                                        </span>
                                        <Tooltip
                                          isOpen={tooltipOpen[tooltipId] || false}
                                          target={tooltipId}
                                          toggle={() => toggleTooltip(tooltipId)}
                                          style={{ maxWidth: "300px", width: "300px" }}
                                        >
                                          <div style={{ textAlign: "left" }} className="font-size-13">
                                            <div className="d-flex align-items-center gap-2">
                                              <div className="col-4"><strong>Volume:</strong></div>
                                              <div className="col-8">{item2.volume}</div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                              <div className="col-4"><strong>Pressure:</strong></div>
                                              <div className="col-8">{item2.pressure}</div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                              <div className="col-4"><strong>UOM:</strong></div>
                                              <div className="col-8">{item2.UoM}</div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                              <div className="col-4"><strong>Description:</strong></div>
                                              <div className="col-8">{item2.gasDescription}</div>
                                            </div>
                                          </div>
                                        </Tooltip>
                                      </td>
                                      <td>
                                        <Input type="text" value={item2.SQ_Nbr} disabled />
                                      </td>
                                      <td className="text-end">
                                        <span
                                          id={tooltipId3}
                                          style={{ cursor: "pointer", color: "blue" }}
                                          className="btn-rounded btn btn-link"
                                          onClick={() => openSOQtyHistory(item2)}
                                        >
                                          {item2.soqty}
                                        </span>
                                        {/* <Tooltip
                                          isOpen={tooltipOpen[tooltipId3] || false}
                                          target={tooltipId3}
                                          toggle={() => toggleTooltip(tooltipId3)}
                                          style={{ maxWidth: "180px", width: "180px" }}
                                        >
                                          <div className="d-flex gap-2">
                                            <div className="col-9 text-end"><strong>SO Issued Qty:</strong></div>
                                            <div className="col-3">{item2.so_Issued_Qty}</div>
                                          </div>
                                          <div className="d-flex gap-2">
                                            <div className="col-9 text-end"><strong>Remaining Qty:</strong></div>
                                            <div className="col-3">{item2.balance_Qty}</div>
                                          </div>
                                        </Tooltip> */}
                                      </td>
                                      <td>
                                        <Input
                                          type="number"
                                          name="pickqty"
                                          id={`pickqty${colKey}-${colKey2}-${index2}`}
                                          className="text-end"
                                          onChange={e =>
                                            handleInputChange(
                                              "pickqty",
                                              e.target.value,
                                              item2,
                                              colKey,
                                              colKey2,
                                              item2.soqty
                                            )
                                          }
                                          value={item2.pickqty}
                                          min={1}
                                          max={item2.soqty}
                                        />
                                      </td>
                                      <td>
                                        <span
                                          id={tooltipId2}
                                          style={{ cursor: "pointer", color: "blue" }}
                                          className="btn-rounded btn btn-link"
                                        >
                                          Delivery
                                        </span>
                                        <Tooltip
                                          isOpen={tooltipOpen[tooltipId2] || false}
                                          target={tooltipId2}
                                          toggle={() => toggleTooltip(tooltipId2)}
                                          style={{ maxWidth: "450px", width: "450px" }}
                                        >
                                          <div style={{ textAlign: "left" }} className="font-size-13">
                                            <div className="d-flex gap-2">
                                              <div className="col-4"><strong>PO No:</strong></div>
                                              <div className="col-8">{item2.ponumber}</div>
                                            </div>
                                            <div className="d-flex gap-2">
                                              <div className="col-4"><strong>Request Del.Date:</strong></div>
                                              <div className="col-8">{formatDate(item2.requestdeliverydate)}</div>
                                            </div>
                                            <div className="d-flex gap-2">
                                              <div className="col-4"><strong>Del.Address:</strong></div>
                                              <div className="col-8">{item2.deliveryaddress}</div>
                                            </div>
                                            <div className="d-flex gap-2">
                                              <div className="col-4"><strong>Del.Instruction:</strong></div>
                                              <div className="col-8">{item2.deliveryinstruction}</div>
                                            </div>
                                          </div>
                                        </Tooltip>
                                      </td>
                                      <td>
                                        <Select
                                          name="drivername"
                                          className="basic-single position-absolute w-xl"
                                          classNamePrefix="select"
                                          options={driverNameList}
                                          placeholder="Select"
                                          value={driverNameList.find(opt => opt.label === item2.drivername)}
                                          onChange={opt =>
                                            handleInputChange(
                                              "drivername",
                                              opt ? opt.label : "",
                                              item2,
                                              colKey,
                                              colKey2
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="text-center">
                                        <Select
                                          name="trucknumber"
                                          className="basic-single position-absolute w-xl"
                                          options={truckNumberOptions}
                                          placeholder="Select"
                                          value={truckNumberOptions.find(opt => opt.value === item2.trucknumber)}
                                          onChange={opt =>
                                            handleInputChange(
                                              "trucknumber",
                                              opt ? opt.value : "",
                                              item2,
                                              colKey,
                                              colKey2
                                            )
                                          }
                                          styles={{
                                            option: provided => ({
                                              ...provided,
                                              textAlign: "left",
                                            }),
                                            singleValue: provided => ({
                                              ...provided,
                                              textAlign: "left",
                                            }),
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-center text-muted">
                          Please select customers and sales orders.
                        </p>
                      )}
                    </div>
                  </Collapse>
                </div>
              );
            }
          )
        ) : (
          <p>No records found!</p>
        )}
      </div>

      {/* Modal for SO Qty History */}
      <Modal
        isOpen={isModalOpen}
        role="dialog"
        autoFocus
        centered
        toggle={toggleModal}
        size="lg"
        className="exampleModal"
      >
        <div className="modal-content">
          <ModalHeader toggle={toggleModal}>SO Quantity History</ModalHeader>
          <ModalBody>

          <div style={{ textAlign: "left" }} className="font-size-13">
                                            <div className="d-flex align-items-center gap-2">
                                              <div className="col-2"><strong>SO Qty : </strong></div>
                                              <div className="col-2 text-left"> {soqtypopup}</div>
                                            </div>
                                            </div>
 
            <div className="table-responsive">
              <Table className="table align-middle table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    {/* <th>SO Qty</th> */}
                    <th>Delivered Qty</th>
                    <th>Remaining Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.length > 0 ? (
                    modalData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.date}</td>
                        {/* <td>{item.soQty}</td> */}
                        <td>{item.pickQty}</td>
                        <td>{item.remainingQty}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>
              Close
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
};

export default GasList;
