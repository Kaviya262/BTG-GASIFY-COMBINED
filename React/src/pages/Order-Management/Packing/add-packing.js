import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Button,
  Container,
  Row,
  FormGroup,
  Label,
  Input,
  Table,
  Modal,
  ModalBody,
  UncontrolledAlert,
  InputGroup,
} from "reactstrap";
import { Tooltip } from "reactstrap";
import { useHistory, useParams } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { format } from "date-fns";
// Import Breadcrumb
import Breadcrumbs from "../../../components/Common/Breadcrumb";
import {
  GetPackerList,
  GetPackingCustomers,
  GetPackingSOList,
  GetPackingSODetail,
  GetPackingpackno,
  CreatePacking,
  GetPdlById,
  UpdatePacking,Getgascodeagainstcustomer
} from "../../../common/data/invoiceapi";
import GasList from "./gas-list";
const animatedComponents = makeAnimated();

const AddPacking = () => {
  const history = useHistory();
  const { id: pdl_id } = useParams();
  const isEditMode = !!pdl_id;
  const branchId = 1;
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [customerSelect, setCustomerSelect] = useState([]);
  const [soSelect, setSoSelect] = useState([]);
  const [tooltipOpen, setTooltipOpen] = useState({});
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const minDate = new Date(currentYear, 0, 1);
  const maxDate = new Date(currentYear, 11, 31);
  const [errorClass, setErrorClass] = useState({});
  const [errorMsg, setErrorMsg] = useState([]);
  const [successStatus, setSuccessStatus] = useState(false);
  const toggleTooltip = id => {
    setTooltipOpen(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitType, setSubmitType] = useState(null);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const [successMsg, setSuccessMsg] = useState("");
  const [SalesorderList, setSalesorderList] = useState([]);

  const [SalesorderListAll, setSalesorderListAll] = useState([]);

  const [CustomerList, setCustomerList] = useState([]);
  const [PackerList, setPackerList] = useState([]);
  const [saveFromData, setSaveFromData] = useState([]);
  const currentDate2 = new Date().toISOString().split("T")[0];
  const [headerData, setHeaderData] = useState({
    userId: 1,
    branchId: 1,
    orgId: 1,
    packingpersonid: "",
    pdldate: currentDate2,
    isSubmitted: 0,
    packNo: "",
    id: 0,
    doNo: 0,
    RackNo: "",
    RackId: 0,
    esttime:"",
    PackingType:1,

  });

  const [GasdataList, setGasdataList] = useState([]);
  
  const [gasDtl, setgasDtl] = useState([]);
  const [soDtl, setSoDtl] = useState([]);
  const [fromData, setFromData] = useState([]);
  const [heightadj, setheightadj] = useState("560");
  const [detailsfrmDb, setDetailsfrmDb] = useState([]);
  const [customerDbdet, setcustomerDbdet] = useState([]);
  const [sodetDbdet, setsodetDbdet] = useState([]);
  const [gasdetDbdet, setgasdetDbdet] = useState([]);
 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCustomerSelect([]);

    const getSoCustomers = async () => {
      try {
        const data = await GetPackingCustomers(branchId);
        setCustomerList(data);
      } catch (err) {
        console.error("Error fetching delivery orders:", err.message);
      }
    };
    getSoCustomers();
    const GetPackersList = async () => {
      try {
        const data = await GetPackerList(branchId);
        setPackerList(data);
      } catch (err) {
        console.error("Error fetching delivery orders:", err.message);
      }
    };
    GetPackersList();

    const GetPackingno = async () => {
      try {
        const data = await GetPackingpackno(branchId);
        setHeaderData(prev => ({
          ...prev,
          packNo: String(data?.PackNo || ""),
          RackNo: data.RackNo || "",
          RackId: data.RackId || 0,
        }));
      } catch (err) {
        console.error("Error fetching delivery orders:", err.message);
      }
    };
    GetPackingno();

    if (pdl_id) getInvoiceDetails(pdl_id);
  }, []);

  const rackNumberOptions = [
    { RackNo: "RBTG1234A", label: "RBTG1234A", RackId: 1 },
    { RackNo: "RBTG9874B", label: "RBTG9874B", RackId: 2 },
    { RackNo: "RBTG3456C", label: "RBTG3456C", RackId: 3 },
    { RackNo: "RBTG3245D", label: "RBTG3245D", RackId: 4 },
    { RackNo: "RBTG4355E", label: "RBTG4355E", RackId: 5 },
    { RackNo: "RBTG4445F", label: "RBTG4445F", RackId: 6 },
  ];
  const mappedRackOptions = rackNumberOptions.map(opt => ({
    value: opt.RackNo,
    label: opt.label,
    rackId: opt.RackId,
  }));

  const handleRackChange = selectedOption => {
    const RackNo = selectedOption?.RackNo || "";
    const RackId = selectedOption?.RackId || 0;

    setHeaderData(prev => ({
      ...prev,
      RackNo,
      RackId,
    }));
  };




  const getInvoiceDetails = async id => {
    try {
      const data = await GetPdlById(id);
      if (!data) {
        setErrorMsg(["No data received for this PDL ID:" + id]);
        return;
      }
      setHeaderData(data.Header || {});
    
      if(data.Header?.PackingType==1){
      setDetailsfrmDb(data.Details);
      }
      else{ 
          var filtereddata=data.Details.filter((value) =>
            data.GasDtl?.some(gasdata => gasdata.gascodeid === value.gascodeid)
          );

        setDetailsfrmDb(filtereddata);
      }
      setcustomerDbdet(data.Customers);
      setsodetDbdet(data.SODtl);
      setgasdetDbdet(data.GasDtl)
      let sogasdetails = data.Details || [];
      const customerSet = Array.from(
        new Map(
          sogasdetails.map(item => [
            item.CustomerID,
            {
              CustomerID: item.CustomerID,
              CustomerName: item.CustomerName,
              label: item.CustomerName,
              value: item.CustomerID,
            },
          ])
        ).values()
      );
      setCustomerSelect(customerSet);
    } catch (err) {
      console.error("Error fetching invoice details:", err.message);
    }
  };

  useEffect(() => {
    //console.log("saveFromData", saveFromData);
    //console.log("fromData", fromData);
     
    let c = customerDbdet.length > 0 ? customerDbdet.length : 1;
    setheightadj(parseInt(c) * 160 + 560);
  }, [headerData, customerSelect, soDtl, saveFromData, customerDbdet]);

  useEffect(() => {
    const saveFromData = Object.entries(fromData).reduce(
      (acc, [customerId, customerData]) => {
        const soList = customerData.SOList;

        acc[customerId] = Object.entries(soList).reduce(
          (soAcc, [soId, soData]) => {
            soAcc[soId] = Object.values(soData.sodetails); // Convert sodetails to an array
            return soAcc;
          },
          {}
        );

        return acc;
      },
      {}
    );
     
    setSaveFromData(saveFromData);
  }, [fromData, setFromData]);

  useEffect(() => {
    if(headerData.PackingType==1){
    const solist = detailsfrmDb.reduce((acc, item) => {
      const customerId = item.CustomerID;
      if (!acc[customerId]) {
        acc[customerId] = [];
      }
      const exists = acc[customerId].some(
        existingItem => existingItem.value === item.soid
      );
      if (!exists) {
        acc[customerId].push({
          SO_ID: item.soid,
          SO_Number: item.SO_Number,
          label: item.SO_Number,
          value: item.soid,
        });
      }
      handleFromData(
        { value: item.CustomerID, label: item.CustomerName },
        acc[customerId],[]
      );
      return acc;
    }, {});
    setSoDtl(solist);

  }
  else{

    const gaslist = detailsfrmDb.reduce((acc, item) => {
      const customerId = item.CustomerID;
      if (!acc[customerId]) {
        acc[customerId] = [];
      }
      const exists = acc[customerId].some(
        existingItem => existingItem.value === item.gascodeid
      );
      if (!exists) {
        acc[customerId].push({
          Id: item.gascodeid,
          gascode: item.GasCode,
          label: item.GasCode,
          value: item.gascodeid,
        });
      }
      
      return acc;
    }, {});
    setgasDtl(gaslist);
  

    const solist = detailsfrmDb.reduce((acc, item) => {
      const customerId = item.CustomerID;
      if (!acc[customerId]) {
        acc[customerId] = [];
      }
      const exists = acc[customerId].some(
        existingItem => existingItem.value === item.soid // && existingItem.Id === item.gascodeid
      );
      if (!exists) {
        acc[customerId].push({
          SO_ID: item.soid,
          SO_Number: item.SO_Number,
          label: item.SO_Number,
          value: item.soid,
        //  Id :item.gascodeid
        });
      }
      
      handleFromData(
        { value: item.CustomerID, label: item.CustomerName },
        acc[customerId],gaslist[customerId]
      );
      return acc;
    }, {});
    setSoDtl(solist);


  
  }
    }, [detailsfrmDb]);

  const GetPackingSoList = async (customerid, customerName, branchId) => {
    try {
      var PackingId = 0;
      if (pdl_id && pdl_id > 0) { PackingId = pdl_id; }
       
      const data = await GetPackingSOList(customerid, branchId, PackingId);
     
      // Create a key dynamically with customerid
      setSalesorderList(prevList => ({
        ...prevList,
        [customerid]: data,
        //[`cus_${customerid}`]: data,
      }));
    } catch (err) {
      console.error("Error fetching delivery orders:", err.message);
    }
  };

  const GetPackingSoDetail = async soid => {
    try {
      const data = await GetPackingSODetail(soid, branchId);
      setSoSelect(data);
    } catch (err) {
      console.error("Error fetching delivery orders:", err.message);
    }
  };
  useEffect(() => {
    if (customerSelect.length > 0) {
      customerSelect.map((item, index) => {
        GetPackingSoList(item.value, item.label, branchId);
        if(headerData.PackingType==2)
        {
        Getgascodeagainstcustomerlist(item.value,branchId);
        }

      });
    }
    const filteredData = Object.fromEntries(
      Object.entries(fromData).filter(([key, value]) =>
        customerSelect.some(customer => customer.value === value.value)
      )
    );
    setFromData(filteredData);
  }, [customerSelect]);



  const updateData = (data) => {

setSoDtl([]);
setgasDtl([]);

setSalesorderList([]);
setGasdataList([]);
 
if (customerSelect.length > 0) {
  customerSelect.map((item, index) => {

    handleFromData(item, [],[]); 
  });
}
 

    customerSelect.map((item, index) => {
      if(data==1){
        GetPackingSoList(item.value, item.label, branchId);
      }
      if(data==2)
      {
      Getgascodeagainstcustomerlist(item.value,branchId);
      }

    });

  

  }

  

  const handleFromData = async (customerDetail, SelectedSo,gasarray) => {
     
    try {
      setLoading(true);
      debugger;
      const customerKey = `${customerDetail.value}`;

      
      setSoDtl(prev => ({
        ...prev,
        [customerKey]: SelectedSo,
      }));

           if (SelectedSo.length === 0) {
        setFromData(prevData => {
          const updatedData = Object.entries(prevData).reduce(
            (acc, [key, value]) => {
              if (key !== customerKey) {
                acc[key] = value;
              }
              
              return acc;
            },
            {}
          );
          return updatedData;
        });
        setTimeout(() => {
          setLoading(false);
        }, 3000);
        return;
      }
      const soListObject = (
        await Promise.all(
          SelectedSo.map(async so => {
            try {
              var sodetails=[];
              
              const sodetailsarray = await GetPackingSODetail(so.value, 1);
              if (!sodetailsarray || sodetailsarray.length === 0) {
                return null;
              } else {

if(headerData.PackingType==1){
  sodetails=sodetailsarray;
}
else{


                var filtereddata=sodetailsarray.filter((value) =>
                  gasarray?.some(gasdata => gasdata.Id === value.gascodeid)
                );
                sodetails=filtereddata;
              }
                
                // const updatedSODetails = sodetails.map((gitem) => ({
                //     ...gitem,
                //     pickqty: 1,
                //     drivername: "",
                //     trucknumber: "",
                // }));

                const updatedSODetails = sodetails.map(gitem => {
                  let bdmatch = detailsfrmDb;
                  const matchingDetail = bdmatch.find(
                    dbItem =>
                      dbItem.SQID === gitem.SQID &&
                      dbItem.soid === gitem.soid &&
                      dbItem.gascodeid === gitem.gascodeid
                  );
                 
                  return {
                    ...gitem,
                    pickqty: matchingDetail ? matchingDetail.pickqty : 1,
                    drivername: matchingDetail ? matchingDetail.drivername : "",
                    trucknumber: matchingDetail
                      ? matchingDetail.trucknumber
                      : "",
                    id: matchingDetail ? matchingDetail.id : 0,
                    packingid: matchingDetail ? matchingDetail.packingid : 0,
                    packerheaderid: matchingDetail
                      ? matchingDetail.packerheaderid
                      : 0,
                    sodetailid: matchingDetail ? matchingDetail.sodetailid : 0,
                  };
                });

                return {
                  [`${so.value}`]: {
                    label: so.label || "",
                    value: so.value,
                    colstate: true,
                    sodetails: updatedSODetails,
                  },
                };
              }
            } catch (err) {
              console.error(`Error fetching SO details for ${so.value}:`, err);
              return null;
            }
          })
        )
      ).filter(item => item !== null && item !== undefined);

      // Merge SO list
      const mergedSoList = soListObject.reduce((acc, item) => {
        return { ...acc, ...item };
      }, {});

      // Update the state to remove unselected SOs
      setFromData(prevData => {
        const prevSOList = prevData[customerKey]?.SOList || {};
        const selectedSOKeys = SelectedSo.map(so => `${so.value}`);

        // Filter out unselected SOs
        const updatedSOList = Object.entries(prevSOList).reduce(
          (acc, [key, value]) => {
            if (selectedSOKeys.includes(key)) {
              acc[key] = value; // Keep selected SOs
            }
            return acc;
          },
          {}
        );

        // Add newly selected SOs
        Object.assign(updatedSOList, mergedSoList);

        // If no SOs left after removing unselected ones, remove the customerKey
        if (Object.keys(updatedSOList).length === 0) {
          const updatedData = Object.entries(prevData).reduce(
            (acc, [key, value]) => {
              if (key !== customerKey) {
                acc[key] = value;
              }
              return acc;
            },
            {}
          );
          return updatedData;
        }

        // Update fromData with modified SO list
        return {
          ...prevData,
          [customerKey]: {
            ...prevData[customerKey],
            label: customerDetail.label,
            value: customerDetail.value,
            SOList: updatedSOList,
          },
        };
      });
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    } catch (err) {
      console.error("Error building form data:", err);
    }
  };

  useEffect(() => {
    //console.log("HomefromDAta", fromData)
  }, [fromData, SalesorderList]);

  const openpopup = (e, submitype) => {
    if (customerSelect.length === 0) {
      setErrorMsg(["Please select any customer."]);
      return;
    }
     
    if (headerData.packingpersonid==undefined || headerData.packingpersonid==null || headerData.packingpersonid === "" || headerData.packingpersonid==0) {
      setErrorMsg(["Please select any packer."]);
      return;
    }
    if (headerData.esttime ==undefined || headerData.esttime==null || headerData.esttime === "" ) {
      setErrorMsg(["Please select Est. Time."]);
      return;
    }

     

    const validationResult = validateSaveFromData(saveFromData);
    if (!validationResult.isValid) {
      //alert(`Please fix the following errors:\n\n${validationResult.errors.join("\n")}`);
      setErrorMsg(validationResult.errors);
    } else {
      setIsModalOpen(true);
      setSubmitType(submitype);
      setHeaderData(prev => ({
        ...prev,
        isSubmitted: submitype,
      }));
    }
  };


  const Getgascodeagainstcustomerlist = async (customerid, branchId) => {
    try {
      
      const data = await Getgascodeagainstcustomer(customerid, branchId);
 
        setGasdataList(prevList => ({
        ...prevList,
        [customerid]: data.gas,
        //[`cus_${customerid}`]: data,
      }));

      setSalesorderListAll(prevList => ({
        ...prevList,
        [customerid]: data.so,
        //[`cus_${customerid}`]: data,
      }));
    
       

      // setSalesorderList(prevList => ({
      //   ...prevList,
      //   [customerid]: data.so,
      //   //[`cus_${customerid}`]: data,
      // }));
      console.log("SO List :",data.so);
    } catch (err) {
      console.error("Error fetching delivery orders:", err.message);
    }
  };

  const validateSaveFromData = savefromData => {
    const errors = [];

    if (!savefromData || Object.keys(savefromData).length === 0) {
      errors.push("Please select any sales order from the list.");
      return { isValid: false, errors };
    }
    Object.keys(savefromData).forEach(customerId => {
      const customerData = savefromData[customerId];
      Object.keys(customerData).forEach(soId => {
        const dataList = customerData[soId];
        if (!dataList || !Array.isArray(dataList) || dataList.length === 0) {
          errors.push(`No data found for Customer ${customerId}, SO ${soId}`);
          return;
        }

        dataList.forEach((item, index) => {
          if (!item.pickqty || parseInt(item.pickqty) <= 0) {
            errors.push(`Pick Qty should be greater than 0`);
          }
          if (!item.drivername || item.drivername.trim() === "") {
            errors.push(`Driver Name is required`);
          }
          if (!item.trucknumber || item.trucknumber.trim() === "") {
            errors.push(`Truck No. is required`);
          }
        });
      });
    });

    if (errors.length > 0) {
      return { isValid: false, errors };
    }
    return { isValid: true, errors: [] };
  };

  const validationfn = (tempErrors, customerSelect, saveFromData) => {
    let errors = { ...tempErrors };
    if (customerSelect.length === 0) {
      errors["customerSelect"] = "Customer selection cannot be empty.";
    } else {
      delete errors["customerSelect"];
    }
    if (saveFromData.length === 0) {
      errors["saveFromData"] = "Please add all required details.";
    } else {
      delete errors["saveFromData"];
    }
    return errors;
  };

  const handleSubmit = async isSubmitted => {
    let tempErrors = {};

    validationfn(tempErrors, customerSelect, saveFromData);
    if (Object.keys(tempErrors).length > 0) {
      setErrorMsg(Object.values(tempErrors));
      return;
    }
    setIsSubmitting(true);
    try {
      const result = buildCustomerAndSoidList(saveFromData, customerDbdet);
      const result_details = buildMergedList(saveFromData);
      debugger;
      if (pdl_id && pdl_id > 0) {
        const response = await UpdatePacking({
          header: headerData,
          soDtl: result.soids,
          customers: result.customers,
          details: result_details,
          GasDtl : result.gasids
        });

        if (response?.status) {
          setErrorMsg([]);
          setSuccessStatus(true);
          setSuccessMsg(response?.message || "Order saved successfully.");
          setTimeout(() => {
            history.push("/manage-packing");
          }, 1000);
        } else {
          setErrorMsg([
            response?.Message || "Something went wrong. Please try again.",
          ]);
        }
      } else {

        const response = await CreatePacking({
          header: headerData,
          soDtl: result.soids,
          customers: result.customers,
          details: result_details,
          GasDtl : result.gasids
          //gasdetails: fromData
        });

        if (response?.status) {
          setErrorMsg([]);
          setSuccessStatus(true);
          setSuccessMsg(response?.message || "Order saved successfully.");
          setTimeout(() => {
            history.push("/manage-packing");
          }, 1000);
        } else {
          setErrorMsg([
            response?.Message || "Something went wrong. Please try again.",
          ]);
        }
      }
    } catch (error) {
      setErrorMsg([
        "Error: " +
        (error.message || "Something went wrong. Please try again."),
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildCustomerAndSoidList = (saveFromData, customerDbdet) => {
    const customers = [];
    const soids = [];
    let customerIdSet = new Set();
    let soidSet = new Set();
debugger;
    const gasids =[];
    let gasidSet = new Set();
    Object.keys(saveFromData).forEach(customerId => {
      Object.keys(saveFromData[customerId]).forEach(soId => {
        const dataList = saveFromData[customerId][soId];
        const existingCustomer = customerDbdet.find(
          c => c.customerId === parseInt(customerId)
        );

        if (dataList.length > 0 && !customerIdSet.has(customerId)) {
          customers.push({
            id: existingCustomer ? existingCustomer.id : 0,
            packingId: pdl_id ? pdl_id : 0,
            customerId: parseInt(customerId),
          });
          customerIdSet.add(customerId);
        }

        dataList.forEach(item => {
          if (!soidSet.has(item.soid)) {
            const existingSOs = sodetDbdet.find(
              c => c.soid === parseInt(item.soid)
            );
            soids.push({
              id: existingSOs ? existingSOs.id : 0,
              packingId: pdl_id ? pdl_id : 0,
              customerId: parseInt(customerId),
              soid: item.soid,
              customerDtlId: existingCustomer ? existingCustomer.id : 0,
            });
            soidSet.add(item.soid);
          }
        });
 
        dataList.forEach(item => {
          if (!gasidSet.has(item.gascodeid)) {
            const existingSOs = gasdetDbdet.find(
              c => c.gascodeid === parseInt(item.gascodeid)
            );
            gasids.push({
              id: existingSOs ? existingSOs.id : 0,
              packingId: pdl_id ? pdl_id : 0,
              customerId: parseInt(customerId),
              gascodeid: item.gascodeid,
              customerDtlId: existingCustomer ? existingCustomer.id : 0,
            });
            gasidSet.add(item.gascodeid);
          }
        });

      });
    });

    return {
      customers,
      soids,
      gasids
    };
  };

  // const buildCustomerAndSoidList = (saveFromData) => {
  //     const customers = [];
  //     const soids = [];
  //     let customerIdSet = new Set(); // To track unique customerId
  //     let soidSet = new Set(); // To track unique soid

  //     Object.keys(saveFromData).forEach((customerId) => {
  //         Object.keys(saveFromData[customerId]).forEach((soId) => {
  //             const dataList = saveFromData[customerId][soId];
  //             if (dataList.length > 0 && !customerIdSet.has(customerId)) {
  //                 customers.push({
  //                     id: 0,
  //                     packingId: pdl_id ? pdl_id:0,
  //                     customerId: parseInt(customerId),
  //                 });
  //                 customerIdSet.add(customerId);
  //             }

  //             dataList.forEach((item) => {
  //                 if (!soidSet.has(item.soid)) {
  //                     soids.push({
  //                         id: 0,
  //                         packingId: pdl_id ? pdl_id:0,
  //                         customerId: parseInt(customerId),
  //                         soid: item.soid,
  //                         customerDtlId: 0,
  //                     });
  //                     soidSet.add(item.soid);
  //                 }
  //             });
  //         });
  //     });

  //     return {
  //         customers,
  //         soids,
  //     };
  // };

  const buildMergedList2 = saveFromData => {
    const soids = [];
    Object.keys(saveFromData).forEach(customerId => {
      Object.keys(saveFromData[customerId]).forEach(soId => {
        const dataList = saveFromData[customerId][soId];
        soids.push(...dataList);
      });
    });

    return soids;
  };

  const buildMergedList = saveFromData => {
    const soidList = [];
    Object.keys(saveFromData).forEach(customerId => {
      Object.keys(saveFromData[customerId]).forEach(soId => {
        const dataList = saveFromData[customerId][soId];

        dataList.forEach(item => {
          soidList.push({
            soid: item.soid || 0,
            id: item.id || 0,
            packerheaderid: item.packerheaderid || 0,
            sodetailid: item.sodetailid || 0,
            gascodeid: item.gascodeid || 0,
            soqty: item.soqty || 0,
            pickqty: parseInt(item.pickqty) || 0,
            drivername: item.drivername || "",
            trucknumber: item.trucknumber || "",
            ponumber: item.ponumber || "",
            requestdeliverydate: item.requestdeliverydate
              ? item.requestdeliverydate.split("T")[0]
              : "",
            deliveryaddress: item.deliveryaddress || "",
            deliveryinstruction: item.deliveryinstruction || "",
            volume: item.volume || 0,
            pressure: item.pressure || 0,
            sQ_Qty: item.sQ_Qty || 0,
            currencyId: item.currencyId || 0,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
            convertedPrice: item.convertedPrice || 0,
            convertedCurrencyId: item.convertedCurrencyId || 0,
            exchangeRate: item.exchangeRate || 0,
            so_Issued_Qty: item.so_Issued_Qty || 0,
            balance_Qty: item.balance_Qty || 0,
            uomid: item.uomid || 0,
            SQID: item.SQID,
          });
        });
      });
    });

    return soidList;
  };

  const handleTimeChange = (selectedDates) => {
    if (selectedDates.length > 0) {
      const date = selectedDates[0];

      // Format to "hh:mm AM/PM"
      const formattedTime = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setHeaderData(prev => ({
        ...prev,
        esttime: formattedTime,
      }))
       
    }
  }


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Sales" breadcrumbItem="Packing" />
          <Card>
            <Row>
              <Col xl={12}>
                <div
                  className="content clearfix mt-1"
                  style={{ minHeight: `${heightadj}px` }}
                >
                  <div className="row mb-2 mt-2">
                    <div className="col-12 col-lg-8 ">
                      {errorMsg.length > 0 && (
                        <div className="alert alert-danger alert-new">
                          {errorMsg[0]}
                        </div>
                      )}
                      {successStatus && (
                        <UncontrolledAlert color="success" role="alert">
                          {successMsg}
                        </UncontrolledAlert>
                      )}
                    </div>
                    <div className="col-12 col-lg-4 justify-content-end text-end">
                      <div
                        className="button-items"
                        style={{ marginRight: "2px" }}
                      >
                        <button
                          type="button"
                          className="btn btn-info"
                          onClick={e => openpopup(e, 0)}
                          disabled={isSubmitting}
                        >
                          <i className="bx bx-comment-check me-2"></i>{" "}
                          {headerData.id ? "Update" : "Save"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={e => openpopup(e, 1)}
                          disabled={isSubmitting}
                        >
                          <i className="bx bxs-save me-2"></i>Post
                        </button>
                        {/* <button type="button" className="btn btn-warning">Print</button>
                                                <button type="button" className="btn btn-secondary">Sync</button> */}
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => history.push("/manage-packing")}
                          disabled={isSubmitting}
                        >
                          <i className="bx bx-window-close me-2"></i>Cancel
                        </button>
                      </div>
                    </div>
                  </div>

                  <hr className="mt-1" />
                  <Row>
                    <Col md="2">
                      <FormGroup>
                        <Label for="SalesInvoiceNum">Packing Seq No.</Label>
                        <Input
                          type="text"
                          id="SalesInvoiceNum"
                          value={headerData.packNo}
                          name="SalesInvoiceNum"
                          disabled
                        />
                      </FormGroup>
                    </Col>

                    <Col md="3">
                      <FormGroup>
                        <Label className="required-label">PDL Date</Label>
                        <InputGroup>
                          <Flatpickr
                            className="form-control d-block"
                            placeholder="dd-mm-yyyy"
                            options={{
                              altInput: true,
                              altFormat: "d-M-Y",
                              dateFormat: "Y-m-d",
                              defaultDate: headerData.pdldate,
                            }}
                            name="SalesInvoiceDate"
                            onChange={date => {
                              const formattedDate = format(
                                date[0],
                                "yyyy-MM-dd"
                              );
                              setHeaderData(prev => ({
                                ...prev,
                                pdldate: formattedDate,
                              }));
                            }}
                          />
                        </InputGroup>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label className="required-label">Customers</Label>
                        <Select
                          className="basic-single"
                          classNamePrefix="select"
                          isDisabled={isDisabled}
                          isLoading={isLoading}
                          isClearable={isClearable}
                          isRtl={isRtl}
                          isSearchable={isSearchable}
                          options={CustomerList}
                          isMulti
                          value={customerSelect}
                          onChange={selectedOptions =>
                            setCustomerSelect(selectedOptions)
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label className="required-label">Packer Name</Label>
                        <Select
                          className="basic-single"
                          classNamePrefix="select"
                          styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                            menu: (base) => ({ ...base, zIndex: 9999, width: 'max-content', minWidth: '100%' }),
                            option: (base) => ({
                              ...base,
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              lineHeight: '1.2',
                              paddingTop: 8,
                              paddingBottom: 8,
                            }),
                            singleValue: (base) => ({
                              ...base,
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                            }),
                            valueContainer: (base) => ({
                              ...base,
                              whiteSpace: 'normal',
                              alignItems: 'start',
                            }),
                            control: (base) => ({
                              ...base,
                              minHeight: 38,
                            }),
                            menuList: (base) => ({
                              ...base,
                              maxHeight: 260,
                            }),
                            container: (base) => ({
                              ...base,
                              minWidth: 260,
                            }),
                          }}
                          isDisabled={isDisabled}
                          isLoading={isLoading}
                          isClearable={isClearable}
                          isRtl={isRtl}
                          isSearchable={isSearchable}
                          options={PackerList}
                          value={PackerList.find(
                            option =>
                              option.value === headerData.packingpersonid
                          )}
                          onChange={selectedOption =>
                            setHeaderData(prev => ({
                              ...prev,
                              packingpersonid: selectedOption==undefined || selectedOption==null ?0 :selectedOption.value,
                            }))
                          }
                        />
                      </FormGroup>
                    </Col>
                    {/* <Col md="4">
                      <FormGroup>
                        <Label className="required-label" htmlFor="rackNumber">Rack No.</Label>
                        <Select
                          value={
                            rackNumberOptions.find(option => option.RackNo === headerData.RackNo) || null
                          }
                          className="basic-single"
                          isSearchable={isSearchable}
                          options={rackNumberOptions}
                          getOptionValue={option => option.RackNo}
                          getOptionLabel={option => option.label}
                          onChange={handleRackChange}
                          placeholder="Select"
                        />
                      </FormGroup>

                    </Col> */}
                    <Col md="3">
                      <FormGroup>
                        <Label className="required-label">Est. Time</Label>
                        <InputGroup>
                        <Flatpickr
      className="form-control d-block"
      placeholder="hh:mm AM/PM"
      value={headerData.esttime}
      onChange={handleTimeChange}
      options={{
        enableTime: true,
        noCalendar: true,
        dateFormat: "h:i K",
        altInput: true,
        altFormat: "h:i K",
        time_24hr: false,
      }}
      name="SalesInvoiceDate"
    />
                        </InputGroup>
                      </FormGroup>
                    </Col>

                    <Col md="4">
                            <FormGroup>
                              <Label htmlFor="addresstype" className="required-label">Packing Based On:</Label>
                              <div className="row">
                                {[
                                  
                                  { value: "1", label: "Sales Order" },
                                  { value: "2", label: "Gas" },
                                ].map(({ value, label }) => (
                                  <div
                                    key={value}
                                    className={`col-12 ${
                                      value === "2"
                                        ? "col-lg-3 col-md-3 col-sm-3"
                                        : "col-lg-5 col-md-6 col-sm-6"
                                    } form-check frm-chk-addresstype`}
                                  >
                                    <Input
                                      type="radio"
                                      name="Categories"
                                      id={`Categories-${value}`}
                                      value={value}
                                      disabled={loading}
                                       
                                      className="form-check-input"
                                      checked={parseInt(headerData.PackingType) === parseInt(value)}

                                      onChange={e =>{
                                       
                                        setHeaderData(prev => ({
                                          ...prev,
                                          PackingType: parseInt(e.target.value),
                                        }))
                                        updateData(e.target.value);
                                      }}
                                    />
                                    <label className="form-check-label">{label}</label>
                                  </div>
                                ))}
                              </div>
                            </FormGroup>
                          </Col>

{/* 
                    <Col md="4">
                      <FormGroup>
                        <Label className="required-label" htmlFor="rackNumber">Rack No.</Label>
                        <Select
                          value={
                            rackNumberOptions.find(option => option.RackNo === headerData.RackNo) || null
                          }
                          className="basic-single"
                          isSearchable={isSearchable}
                          options={rackNumberOptions}
                          getOptionValue={option => option.RackNo}
                          getOptionLabel={option => option.label}
                          onChange={handleRackChange}
                          placeholder="Select"
                        />
                      </FormGroup>

                    </Col> */}
                  </Row>
                  <hr className="mt-1" />
                  {customerSelect.length > 0 ? (
                    customerSelect.map((item, index) => (
                      <Card key={index}>
                        <Row>
                          <Col md="4">
                            <FormGroup>
                              <Label>Customer</Label>
                              <Input type="text" value={item.label} disabled />
                            </FormGroup>
                          </Col>
                          {headerData.PackingType === 2 ? (
                          <Col md="4">
  <FormGroup>
                    
    <Label className="required-label">Gas List</Label>
    <Select
      className="basic-single"
      classNamePrefix="select"
      isDisabled={isDisabled}
      isLoading={isLoading}
      isClearable={isClearable}
      isRtl={isRtl}
      isSearchable={isSearchable}
      options={GasdataList[item.value]}
      isMulti
      value={gasDtl[item.value]}
      onChange={selectedOptions =>{
        setgasDtl(prevList => ({
          ...prevList,
          [item.value]: selectedOptions,
          //[`cus_${customerid}`]: data,
        }));

        
        let sodata = [];

        let filteredSo = SalesorderListAll[item.value].filter(item => {
          // Check if the item's Id is NOT in the first array (assuming firstArray is defined)
          return selectedOptions?.some(fItem => fItem.Id === item.Id);
        });
        
        filteredSo.forEach(item => {
          const exists = sodata?.some(s => s.SO_ID === item.SO_ID);
  if (!exists) {
    sodata.push({
      SO_ID: item.SO_ID,
      SO_Number: item.SO_Number,
      label: item.SO_Number,
      value: item.SO_ID,
    });
  }
        });

      setSalesorderList(prevList => ({
        ...prevList,
        [item.value]: sodata,
      
      }));

      console.log("sasdsdsd 1 ",soDtl[item.value]);
        const filteredSecondArray = soDtl[item.value]?.filter(
          item => sodata.some(firstItem => firstItem.SO_ID === item.SO_ID)
        );

        setSoDtl(prevList => ({
          ...prevList,
          [item.value]: filteredSecondArray,
          //[`cus_${customerid}`]: data,
        }));
        handleFromData(item, filteredSecondArray,selectedOptions); 
         
        //setgasDtl(selectedOptions);
       
      }
      }
      menuPlacement="auto"
    />
  </FormGroup>
</Col>
                          ):(
                            ""
                          )}
                         
                         {headerData.PackingType === 2 ? (
                         <Col md="4">
                            <FormGroup>
                           {/* {gasDtl[item.value]?.length} */}
                              <Label className="required-label">SO List</Label>
                              <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isDisabled={isDisabled}
                                isLoading={isLoading}
                                isClearable={isClearable}
                                isRtl={isRtl}
                                isSearchable={isSearchable}
                                  options={SalesorderList[item.value]}
                                isMulti
                                value={soDtl[item.value]}
                                onChange={selectedOptions =>
                                  handleFromData(item, selectedOptions,gasDtl[item.value])
                                }
                                menuPlacement="auto"
                              />
                            </FormGroup>
                          </Col>
                         ):("")}
                           {headerData.PackingType === 1 ? (
                          <Col md="8">
                            <FormGroup>
                              <Label className="required-label">SO List</Label>
                              <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isDisabled={isDisabled}
                                isLoading={isLoading}
                                isClearable={isClearable}
                                isRtl={isRtl}
                                isSearchable={isSearchable}
                                options={SalesorderList[item.value]}
                                isMulti
                                value={soDtl[item.value]}
                                onChange={selectedOptions =>
                                  handleFromData(item, selectedOptions,[])
                                }
                                menuPlacement="auto"
                              />
                            </FormGroup>
                          </Col>
                           ):("")}
                        </Row>

                        {fromData[item.value] && (
                          <GasList
                            sofromData={fromData[item.value]}
                            customerid={item.value}
                            customername={item.label}
                            setSaveFromData={setSaveFromData}
                            setFromData={setFromData}
                            fromData={fromData}
                            setErrorMsg={setErrorMsg}
                          />
                        )}
                        <hr></hr>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted">
                      Please select a customer
                    </p>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </Container>
      </div>
      <Modal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        centered
        tabIndex="1"
      >
        <ModalBody className="py-3 px-5">
          <Row>
            <Col lg={12}>
              <div className="text-center">
                <i
                  className="mdi mdi-alert-circle-outline"
                  style={{ fontSize: "9em", color: "orange" }}
                />
                <h4>
                  Do you want to{" "}
                  {isEditMode
                    ? submitType === 0
                      ? "Update"
                      : "Post"
                    : submitType === 0
                      ? "Save"
                      : "Post"}
                  ?
                </h4>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="text-center mt-3 button-items">
                <Button
                  className="btn btn-info"
                  color="success"
                  size="lg"
                  onClick={() => {
                    handleSubmit(submitType);
                    setIsModalOpen(false);
                  }}
                >
                  Yes
                </Button>
                <Button
                  color="danger"
                  size="lg"
                  className="btn btn-danger"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default AddPacking;
