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
import { values } from "lodash";

const animatedComponents = makeAnimated();
const QuotationSalesFormEdit = ({
  soData,
  handleInputChange,
  errorClass,
  setErrorMsg,
  setGasCodeSaveList,
  selectedGasCodes,
  setSelectedGasCodes,
  groupby,
  setGroupby,
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
  const [activeAccord, setActiveAccord] = useState([]);
  const [gascoderows, setGascoderows] = useState([]);
  const [UOMList, setUOMList] = useState([]);
  const [addressrowids, setAddressrowids] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");

  useEffect(() => {
    const fetchGasCodes = async () => {
      if (!selectedGasCodes || Object.keys(selectedGasCodes).length === 0) {
        setActiveAccord({});
        return;
      }
      const updatedCols = {};
      for (const [index, colKey] of Object.keys(selectedGasCodes).entries()) {
        console.log("selectedGasCodes", selectedGasCodes);
        const gasCodeList = selectedGasCodes[colKey];
        try {
          updatedCols[colKey] = {
            SQ_Nbr: gasCodeList.length > 0 ? gasCodeList[0].sq_nbr || `SQ-${index + 1}` : `SQ-${index + 1}`,
            gasCodeList: gasCodeList.map(item => ({
              ...item,
              ReqDeliveryDate: new Date().toISOString(),
              Deliveryaddress: item.Deliveryaddress || "",
              DeliveryInstruction: item.DeliveryInstruction || "",
              id: item.id ?? 0,
              Sqdtlid: item.Sqdtlid ?? 0,
              Sqid: item.SQ_ID ?? 0,
              SO_ID: item.SO_ID ?? 0,
              PoNumber: item.PoNumber ?? "",
              GasID: item.GasCodeId ?? 0,
              Alr_Issued_Qty: item.Alr_Issued_Qty ?? 0,
              SQ_Qty: item.SQ_Qty ?? 0,
              SO_Qty: item.SO_Qty ?? 0,
              Balance_Qty: item.Balance_Qty ?? 0,
              chkStatus: item.chkStatus ?? 0,
            })),
            isOpen: true,
          };
        } catch (error) {
          console.error(`❌ Error processing Gas Code for ${colKey}:`, error);
          updatedCols[colKey] = {
            SQ_Nbr: gasCodeList.length > 0 ? gasCodeList[0].sq_nbr || `SQ-${index + 1}` : `SQ-${index + 1}`,
            gasCodeList: [],
            isOpen: false,
          };
        }
      }
      setActiveAccord(prev => ({ ...prev, ...updatedCols }));
    };

    fetchGasCodes();
  }, [selectedGasCodes]);

  useEffect(() => {
    // Reset all relevant states when CustomerId is cleared
    if (!soData?.CustomerId) {
      setSqList([]);
      setGasCodeList([]); // Clear gasCodeList
      setGascoderows([]); // Clear gascoderows
      setSelectedGasCodes({}); // Clear selectedGasCodes
      setGroupby([]); // Clear groupby
      setActiveAccord({}); // Clear activeAccord
      // setErrorMsg(["Please select a customer"]);
      return;
    }

    const loadCustomerSQ = async () => {
      if (soData.Categories == 1 && soData?.CustomerId) {
        try {
          const data = await GetCustomerSQ(soData.CustomerId, soData.SO_ID);
          setSqList(data);
          setGasCodeList([]); // Reset gasCodeList when fetching SQ
        } catch (error) {
          setSqList([]);
          setGasCodeList([]); // Reset gasCodeList on error
        }
      } else if (soData.CustomerId) {
        try {
          const data = await GetCustomerGasCodeDetail(soData.CustomerId, soData.SO_ID);
          setGasCodeList(data);
          setSqList([]); // Reset sqList when fetching Gas Codes
        } catch (error) {
          console.error("Error fetching customer data:", error);
          setGasCodeList([]);
          setSqList([]);
        }
      }
    };

    const loadUOMList = async () => {
      const data = await GetUoM(1, -1);
      setUOMList(data);
    };

    loadCustomerSQ();
    loadUOMList();
  }, [soData.Categories, soData?.CustomerId, setErrorMsg, setSelectedGasCodes]);

  useEffect(() => {
    if (groupby?.length > 0) {
      handleSQListChange(groupby);
    }
  }, []);

  const rackNumberOptions = [
    { value: "RBTG1234A", label: "RBTG1234A" },
    { value: "RBTG9874B", label: "RBTG9874B" },
    { value: "RBTG3456C", label: "RBTG3456C" },
    { value: "RBTG3245D", label: "RBTG3245D" },
    { value: "RBTG4355E", label: "RBTG4355E" },
    { value: "RBTG4445F", label: "RBTG4445F" },
  ];

  const handleSQListChange = async (selectedOptions = []) => {
    // Always convert to array
    const optionsArray = Array.isArray(selectedOptions)
      ? selectedOptions
      : selectedOptions
        ? [selectedOptions]
        : [];

    // Step 1: Handle clear (no selection)
    if (optionsArray.length === 0) {
      setGroupby([]);
      setActiveAccord({});
      setGascoderows({});
      setGasCodeList([]); // Clear gasCodeList
      setSelectedGasCodes({}); // Clear selectedGasCodes
      return;
    }

    // Step 2: Track selected IDs
    const selectedIds = optionsArray.map(opt => parseInt(opt.value));

    // Step 3: Keep only still-selected data
    setActiveAccord(prev => {
      const updated = {};
      Object.keys(prev).forEach(key => {
        const id = parseInt(key.replace("col", ""));
        if (selectedIds.includes(id)) {
          updated[key] = prev[key];
        }
      });
      return updated;
    });

    setGascoderows(prev => {
      const updated = {};
      Object.keys(prev).forEach(key => {
        const id = parseInt(key.replace("col", ""));
        if (selectedIds.includes(id)) {
          updated[key] = prev[key];
        }
      });
      return updated;
    });

    // Step 4: Update groupby immediately
    setGroupby(optionsArray.map(opt => ({ value: opt.value, label: opt.label })));

    // Step 5: Fetch data for new selections only
    const prevIds = Object.keys(activeAccord).map(key =>
      parseInt(key.replace("col", ""))
    );
    const newSelections = optionsArray.filter(opt => !prevIds.includes(parseInt(opt.value)));

    const updatedCols = {};

    if (newSelections.length > 0) {
      await Promise.all(
        newSelections.map(async option => {
          try {
            const data = await GetSQGasCode(option.value);
            updatedCols[`col${option.value}`] = {
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
                chkStatus: 0,
                Uomid: item.uomid,
              })),
            };
          } catch (error) {
            console.error(`Error fetching Gas Code for SQ ID ${option.value}`, error);
            updatedCols[`col${option.value}`] = {
              SQ_Nbr: option.label,
              gasCodeList: [],
              isOpen: false,
            };
          }
        })
      );
    }

    // Step 6: Merge new data
    setActiveAccord(prev => ({ ...prev, ...updatedCols }));
  };

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

  useEffect(() => {
    Object.keys(selectedGasCodes).forEach(colKey => {
      selectedGasCodes[colKey].map(item => ({
        ...item,
        Address: item.Address || "",
        id: 0,
        Sqdtlid: 0,
        Sqid: item.SQ_ID,
        chkStatus: 1,
        label: item.GasCode,
        value: item.GasID,
      }));
    });
    setGascoderows(selectedGasCodes);
    //handleGascodeChange2(colKey, selectedGasCodes[colKey]);
  }, [selectedGasCodes]);

  useEffect(() => {
    const disabledRows = [];
    Object.keys(gascoderows).forEach(colKey => {
      gascoderows[colKey].forEach(item => {
        if (item.IsDisabled || item.IsDisabled === 1) {
          disabledRows.push(item);
        }
      });
    });
    setGasCodeSaveList(disabledRows);
  }, [activeAccord, gascoderows, setGasCodeSaveList]);

  const showAccord = colKey => {
    setActiveAccord(prev => ({
      ...prev,
      [colKey]: {
        ...prev[colKey],
        isOpen: !prev[colKey]?.isOpen,
      },
    }));
  };

  const handleGascodeChange = async (colKey, selectedOption) => {
    if (!selectedOption) {
      setGascoderows(prevState => ({
        ...prevState,
        [colKey]: [],
      }));
      setSelectedGasCodes(prevState => ({
        ...prevState,
        [colKey]: [],
      }));
    } else {
      setGascoderows(prevState => ({
        ...prevState,
        [colKey]: selectedOption,
      }));
      setSelectedGasCodes(prevState => ({
        ...prevState,
        [colKey]: selectedOption,
      }));
    }
  };

  const handleGascodeChange2 = async (colKey, selectedOption) => {
    if (!selectedOption || !Array.isArray(selectedOption)) {
      console.error("❌ Error: selectedOption is invalid", selectedOption);
      setGascoderows(prevState => ({
        ...prevState,
        [colKey]: [],
      }));
      setSelectedGasCodes(prevState => ({
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
            soData.SO_ID
          );

          return gasCodeData.map(item => {
            const matchedItem = selectedGasCodes[colKey]?.find(
              exist =>
                exist.SQ_ID === item.SQ_ID && exist.GasCodeId === item.GasCodeId
            );
            return {
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
              ...(matchedItem || {}), // Merge matchedItem if it exists
            };
          });
        })
      );
      const mergedGasCodes = updatedGasCodes.flat();
      setGascoderows(prevState => ({
        ...prevState,
        [colKey]: mergedGasCodes,
      }));
      setSelectedGasCodes(prevState => ({
        ...prevState,
        [colKey]: mergedGasCodes,
      }));
    } catch (error) {
      console.error("Error fetching customer data:", error);
      setGascoderows(prevState => ({
        ...prevState,
        [colKey]: [],
      }));
      setSelectedGasCodes(prevState => ({
        ...prevState,
        [colKey]: [],
      }));
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
          />
        </FormGroup>
      </Col>
      <Col md="4">
        <FormGroup>
          <Label htmlFor="ProjectName">Project Name</Label>
          <Input
            type="text"
            name="ProjectName"
            id="ProjectName"
            value={soData.ProjectName}
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
                ? rackNumberOptions.find(
                    option => option.value === soData.RackNumber
                  )
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
            <Label className="control-label required-label">Quotations</Label>
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
              isMulti
              value={sqList.filter(option =>
                groupby?.some(
                  selected =>
                    parseInt(selected.value) === parseInt(option.value)
                )
              )}
              // onChange={handleSQListChange}
              onChange={select => handleSQListChange(select || [])}
            />
          </FormGroup>
        </Col>
      )}
      {soData.Categories > 1 && (
        <Col md="8">
          <FormGroup>
            <Label for="salesContact" className="required-label">Gas Code</Label>
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
              isMulti
              value={gasCodeList.filter(option =>
                selectedGasCodes[colKey]?.some(
                  selected => selected.GasID === option.value
                )
              )}
              onChange={selectedOptions2 =>
                handleGascodeChange2(colKey, selectedOptions2 || [])
              }
            />
          </FormGroup>
        </Col>
      )}

      {soData.Categories < 2 && Object.keys(activeAccord).length > 0 && (
        <div className="accordion accordion-flush" id="accordionFlushExample">
          {Object.entries(activeAccord).map(([colKey, item]) => {
            const gascodelist = item.gasCodeList.map(gas => ({
              ...gas,
              label: gas.GasCode,
              value: gas.GasID,
            }));
            //console.log("SQ DB list:"+colKey, gascodelist)
            return (
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
                          <Label className="required-label" for={`gascode-${colKey}`}>Gas Code</Label>
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
                            options={gascodelist}
                            isMulti
                            value={
                              Array.isArray(gascoderows[colKey])
                                ? gascodelist
                                  .filter(option =>
                                    gascoderows[colKey].some(
                                      selected =>
                                        selected.GasID === option.GasID
                                    )
                                  )
                                  .map(gas => ({
                                    ...gas, // Spread all properties
                                    label: gas.GasCode,
                                    value: gas.GasID,
                                  }))
                                : []
                            }
                            onChange={selectedOptions =>
                              handleGascodeChange(colKey, selectedOptions || [])
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
                        setErrorMsg={setErrorMsg}
                      />
                    </div>
                  </div>
                </Collapse>
              </div>
            );
          })}
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
            setErrorMsg={setErrorMsg}
          />
        </div>
      )}
    </Row>
  );
};

export default QuotationSalesFormEdit;