import React, { useState, useEffect } from "react";
import { Col, FormGroup, Input, Label, Row, Collapse, Table } from "reactstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  GetCustomerSQ,
  GetCustomerGasCodeDetail,
  GetSQGasCode,
  GetUoM,
  GetCustomerGasCode,
} from "../../../common/data/mastersapi";
import GasForm from "./GasForm";

const animatedComponents = makeAnimated();
const QuotationSalesForm = ({
  soData,
  handleInputChange,
  errorClass,
  setErrorMsg,
  setGasCodeSaveList,
}) => {
  const currentDate = new Date();
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [colKey, setcolKey] = useState("col1");
  const [sqList, setSqList] = useState([]);
  const [gasCodeList, setGasCodeList] = useState([]);
  const [activeAccord, setActiveAccord] = useState({});
  const [gascoderows, setGascoderows] = useState({});
  const [selectedSQList, setSelectedSQList] = useState([]);
  const [UOMList, setUOMList] = useState([]);
  const [addressrowids, setAddressrowids] = useState([]);
  const [availColkeys, setavailColkeys] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  useEffect(() => {
    setGasCodeList([]);
  setGascoderows({});
  setActiveAccord({});
  setSelectedSQList([]);
   const loadCustomerSQ = async () => {
  if (soData.Categories == 1 && soData?.CustomerId) {
    try {
      const data = await GetCustomerSQ(soData.CustomerId, soData.SO_ID);

      const formattedList = (data || [])
        .map(item => ({
          label: item.SQ_Nbr,
          value: item.id,
        }))
        .sort((a, b) => a.value - b.value);

      setSqList(formattedList);
    } catch (error) {
      console.error("Error loading SQ list:", error);
      setSqList([]);
    }
  } else if (soData.CustomerId) {
    try {
      const data = await GetCustomerGasCodeDetail(soData.CustomerId, 0);
      setGasCodeList(data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
      setGasCodeList([]);
    }
  } else {
    setSqList([]);
  }
  };
  loadCustomerSQ();

    const loadUOMList = async () => {
      const data = await GetUoM(1, -1);
      setUOMList(data);
    };
    loadUOMList();
  }, [soData.Categories, soData?.CustomerId]);
  const rackNumberOptions = [
    { value: "RBTG1234A", label: "RBTG1234A" },
    { value: "RBTG9874B", label: "RBTG9874B" },
    { value: "RBTG3456C", label: "RBTG3456C" },
    { value: "RBTG3245D", label: "RBTG3245D" },
    { value: "RBTG4355E", label: "RBTG4355E" },
    { value: "RBTG4445F", label: "RBTG4445F" },
  ];
  const handleRackChange = selectedOption => {
    const value = selectedOption?.value || "";
    const event = {
      target: {
        name: "RackNumber",
        value: value,
      },
    };

    handleInputChange(event);
  };

  const handleSQListChange = async selectedOptions => {
    setSelectedSQList(selectedOptions || []);
    if (!selectedOptions || selectedOptions.length < 1) {
      setActiveAccord({});
    } else {
      const updatedCols = {};
      setGascoderows(prev => ({ ...prev }));
      const promises = selectedOptions.map(async (option, index) => {
        try {
          const data = await GetSQGasCode(option.value);
          updatedCols[`col${index + 1}`] = {
            SQ_Nbr: option.label,
            isOpen: true,
            gasCodeList: data.map(item => ({
              ...item,
              ReqDeliveryDate: currentDate,
              Deliveryaddress: item.Address || "",
              DeliveryInstruction: "",
              id: 0,
              Sqdtlid: 0,
              Sqid: item.SQ_ID,
              SO_ID: 0,
              PoNumber: "",
              GasID: item.GasCodeId,
              Alr_Issued_Qty: 0,
              SQ_Qty: item.sqqty,
              SO_Qty: 0,
              Balance_Qty: 0,
              addressadded: 0,
              chkStatus: 0,
              Uomid: item.uomid,
            })),
            isOpen: true,
          };
        } catch (error) {
          console.error(
            `Error fetching Gas Code for SQ ID ${option.sqid}`,
            error
          );
          updatedCols[`col${index + 1}`] = {
            sqid: option.sqid,
            GasCodeList: [],
            isOpen: false,
          };
        }
      });

      await Promise.all(promises);
      setActiveAccord(updatedCols);
    }
  };

  useEffect(() => {
    console.log(activeAccord);
    console.log("gascoderows", gascoderows);

    const disabledRows = [];
    Object.keys(gascoderows).forEach(colKey => {
      gascoderows[colKey].forEach(item => {
        if (item.IsDisabled === 1) {
          disabledRows.push(item);
        }
      });
    });
    setGasCodeSaveList(disabledRows);
  }, [activeAccord, gascoderows]);

  const showAccord = colKey => {
    setActiveAccord(prev => ({
      ...prev,
      [colKey]: {
        ...prev[colKey],
        isOpen: !prev[colKey]?.isOpen,
      },
    }));
  };
  const handleGascodeChange = (colKey, selectedOptions) => {
  if (!selectedOptions || selectedOptions.length === 0) {
    setGascoderows(prevState => ({
      ...prevState,
      [colKey]: [],
    }));
  } else {
    setGascoderows(prevState => {
      const existingRows = prevState[colKey] || [];

      // derive id from option or existing row using common possible keys
      const getId = obj => obj && (obj.GasID || obj.GasCodeId || obj.value);

      const selectedIds = selectedOptions.map(opt => getId(opt));

      // Keep only those existing rows which are still selected
      const keptRows = existingRows.filter(row => selectedIds.includes(getId(row)));

      // Add any newly selected options that aren't already present
      const newRows = selectedOptions
        .filter(option => !keptRows.some(row => getId(row) === getId(option)))
        .map(option => ({
          ...option,
          ReqDeliveryDate: currentDate,
          Deliveryaddress: option.Address || "",
          DeliveryInstruction: "",
          id: 0,
          Sqdtlid: 0,
          Sqid: option.SQ_ID,
          SO_ID: 0,
          PoNumber: "",
          Alr_Issued_Qty: 0,
          SQ_Qty: option.sqqty,
          SO_Qty: 0,
          Balance_Qty: 0,
          chkStatus: 0,
          Uomid: option.uomid,
        }));

      return {
        ...prevState,
        [colKey]: [...keptRows, ...newRows],
      };
    });
  }
};


  const handleGascodeChange2 = async (colKey, selectedOption) => {
  if (!soData.CustomerId) {
    setErrorMsg(["Please select any customer"]);
    return;
  }
  // If user cleared the selection (cancel), selectedOption can be null/empty.
  // In that case remove any gas rows for this column so the UI reflects the cleared state.
  if (!selectedOption || (Array.isArray(selectedOption) && selectedOption.length === 0)) {
    setGascoderows(prevState => ({
      ...prevState,
      [colKey]: [],
    }));
    return;
  }

  try {
    const updatedGasCodes = await Promise.all(
      selectedOption.map(async val => {
        const gasCodeData = await GetCustomerGasCode(
          soData.CustomerId,
          val.GasCodeId,
          1,
          0
        );
        return gasCodeData.map(item => ({
          ...item,
          ReqDeliveryDate: currentDate,
          Deliveryaddress: item.Address || "",
          DeliveryInstruction: "",
          id: 0,
          Sqdtlid: 0,
          Sqid: item.SQ_ID,
          SO_ID: 0,
          PoNumber: "",
          GasID: item.GasCodeId,
          Alr_Issued_Qty: 0,
          SQ_Qty: item.sqqty,
          SO_Qty: 0,
          Balance_Qty: 0,
          chkStatus: 0,
          Uomid: item.uomid,
        }));
      })
    );

    const mergedGasCodes = updatedGasCodes.flat();

    // Derive selected ids from the select options
    const selectedIds = selectedOption.map(o => o.GasCodeId || o.GasID || o.value);

    setGascoderows(prevState => {
      const existing = prevState[colKey] || [];

      // Keep only those existing rows which are still selected
      const kept = existing.filter(r => selectedIds.includes(r.GasCodeId || r.GasID || r.GasID));

      // Add any mergedGasCodes that aren't already present in kept (by GasID/GasCodeId)
      const keptIds = kept.map(r => r.GasCodeId || r.GasID || r.GasID);
      const toAdd = mergedGasCodes.filter(n => !keptIds.includes(n.GasCodeId || n.GasID || n.GasID));

      return {
        ...prevState,
        [colKey]: [...kept, ...toAdd],
      };
    });
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }
};


  return (
    <Row>
      <Col md="4">
        <FormGroup>
          <Label htmlFor="horizontal-firstname-Input">Order By</Label>
          <Input
            type="text"
            name="OrderBy"
            id="OrderBy"
            value={soData.OrderBy}
            onChange={handleInputChange}
            className={errorClass.OrderBy}
            maxLength={20}
          />
        </FormGroup>
      </Col>
      <Col md="4">
        <FormGroup>
          <Label htmlFor="ProjectName">Project Name </Label>
          <Input
            type="text"
            name="ProjectName"
            id="ProjectName"
            value={soData.projectName}
            onChange={handleInputChange}
            className={errorClass.ProjectName}
            maxLength={100}
            placeholder="Max 100 characters"
          />
        </FormGroup>
      </Col>
      <Col md="4">
        <FormGroup></FormGroup>
      </Col>
      {/* <Col md="4">
        <FormGroup>
          <Label htmlFor="RackNumber">Rack No.</Label>
          <Select
  className="basic-single"
  isSearchable={isSearchable}
  name="RackNumber"
  id="RackNumber"
  options={rackNumberOptions}
  onChange={handleRackChange}
  value={
    soData.RackNumber
      ? rackNumberOptions.find(option => option.value === soData.RackNumber)
      : null
  }
/>


        </FormGroup>
      </Col> */}
      <Col md="4">
        <FormGroup>
          <Label htmlFor="addresstype" className="required-label">SO Based On:</Label>
          <div className="row">
            {[
              { value: "2", label: "Gas" },
              { value: "1", label: "Sales Quotation" },
            ].map(({ value, label }) => (
              <div
                key={value}
                className={`col-12 ${value === "2"
                  ? "col-lg-3 col-md-3 col-sm-3"
                  : "col-lg-5 col-md-6 col-sm-6"
                  } form-check frm-chk-addresstype`}
              >
                <Input
                  type="radio"
                  name="Categories"
                  id={`Categories-${value}`}
                  value={value}
                  className="form-check-input"
                  checked={parseInt(soData.Categories) === parseInt(value)}
                  onChange={handleInputChange}
                />
                <label className="form-check-label">{label}</label>
              </div>
            ))}
          </div>
        </FormGroup>
      </Col>
      {soData.Categories < 2 && (
        <Col md="8">
          <FormGroup>
            <Label className="control-label required-label">Quotations </Label>
            <Select
              components={animatedComponents}
              className="basic-single"
              classNamePrefix="select"
              isDisabled={isDisabled}
              isLoading={isLoading}
              isClearable={isClearable}
              isRtl={isRtl}
              isSearchable={isSearchable}
              name="SQList"
              id="SQList"
              options={sqList}
              value={selectedSQList}
              isMulti
              onChange={handleSQListChange}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: base => ({ ...base, zIndex: 9999 }),
              }}
/>
          </FormGroup>
        </Col>
      )}
      {soData.Categories > 1 && (
        <Col md="8">
          <FormGroup>
            <Label for="salesContact" className="required-label">Gas Code </Label>
            <Select
              components={animatedComponents}
              className="basic-single"
              classNamePrefix="select"
              isDisabled={isDisabled}
              isLoading={isLoading}
              isClearable={isClearable}
              isRtl={isRtl}
              isSearchable={isSearchable}
              name={`gascode-${colKey}`}
              id={`gascode-${colKey}`}
              options={gasCodeList}
              value={
                gasCodeList.filter(option => {
                  const optId = option.value || option.GasCodeId || option.GasID;
                  return (gascoderows[colKey] || []).some(row => {
                    const rowId = row.GasCodeId || row.GasID || row.GasID;
                    return rowId && optId && rowId === optId;
                  });
                })
              }
              isMulti
              onChange={selectedOptions2 =>
                handleGascodeChange2(colKey, selectedOptions2)
              }
            />
          </FormGroup>
        </Col>
      )}

      {soData.Categories < 2 && Object.keys(activeAccord).length > 0 && (
        <div className="accordion accordion-flush" id="accordionFlushExample">
          {Object.entries(activeAccord).map(([colKey, item], index) => (
            <div className="accordion-item" key={colKey}>
              <h2
                className="accordion-header"
                id={`heading-${colKey}`}
                style={{ backgroundColor: "#e0e4e7" }}
              >
                <button
                  className={`accordion-button fw-medium ${!activeAccord[colKey]?.isOpen ? "collapsed" : ""
                    }`}
                  type="button"
                  onClick={() => showAccord(colKey)}
                  style={{ cursor: "pointer" }}
                >
                  Sale Quotation No.: {item.SQ_Nbr}
                </button>
              </h2>
              <Collapse isOpen={item.isOpen} className="accordion-collapse">
                <div className="accordion-body">
                  <div className="row align-items-center g-3">
                    <div className="col-12 col-lg-8">
                      <FormGroup>
                        <Label for="salesContact" className="required-label">Gas Code </Label>
                        <Select
                          components={animatedComponents}
                          className="basic-single"
                          classNamePrefix="select"
                          isDisabled={isDisabled}
                          isLoading={isLoading}
                          isClearable={isClearable}
                          isRtl={isRtl}
                          isSearchable={isSearchable}
                          name={`gascode-${colKey}`}
                          options={item.gasCodeList}
                          value={item.gasCodeList.filter(option =>
                            gascoderows[colKey]?.some(
                              row => row.GasCodeId === option.value
                            )
                          )}
                          isMulti
                          onChange={selectedOptions =>
                            handleGascodeChange(colKey, selectedOptions)
                          }
                        />
                      </FormGroup>
                    </div>
                  </div>
                  <div className="table-responsive mt-1">
                    <GasForm
                      soData={soData}
                      gascoderows={gascoderows}
                      setGascoderows={setGascoderows}
                      colKey={colKey}
                      UOMList={UOMList}
                      addressrowids={addressrowids}
                      setAddressrowids={setAddressrowids}
                    />
                  </div>
                </div>
              </Collapse>
            </div>
          ))}
        </div>
      )}

      {soData.Categories > 1 && (
        <div className="table-responsive mt-1">
          <GasForm
            soData={soData}
            gascoderows={gascoderows}
            setGascoderows={setGascoderows}
            colKey={colKey}
            UOMList={UOMList}
            addressrowids={addressrowids}
            setAddressrowids={setAddressrowids}
          />
        </div>
      )}
    </Row>
  );
};

export default QuotationSalesForm;
