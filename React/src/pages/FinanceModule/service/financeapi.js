import { get, post, put } from "../../../helpers/api_helper";
import axios from "axios";
import { saveAs } from "file-saver";
import Swal from 'sweetalert2';

const transformData = (data, valueParam, labelParam) => {

    return data.map(item => ({
        ...item,
        value: item[valueParam],
        label: item[labelParam] || "-"
    }));
};
import { toast } from 'react-toastify';
 

//#region GetFilteredCylinders
export const getARByCustomer = async ({ customerId, orgId, branchId }) => {

    try {
        const response = await get(`/AR/get-by-id?customerid=${customerId}&orgId=${orgId}&branchId=${branchId}`
        );
        return response;
    } catch (error) {
        console.error("API error:", error);
        return { status: false, data: [] };
    }
};


export const getARBook = async ( customerId, orgId, branchId,fromdate,todate ) => {

    try {
        const response = await get(`/AR/getARBook?customer_id=${customerId}&orgid=${orgId}&branchid=${branchId}&from_date=${fromdate}&to_date=${todate}`
        );
        return response;
    } catch (error) {
        console.error("API error:", error);
        return { status: false, data: [] };
    }
};
 
export const createAR = async (payload) => {
    try {
        console.log("Sending payload:", payload);
        const response = await post("/AR/create", payload);;

        if (response?.statusCode === 0) {
            return response;
        } else if (response?.statusCode === 1) {
            toast.error(response.message || "An error occurred");
            return null;
        } else {
            throw new Error(response?.message || 'Failed to save createAR');
        }

    } catch (error) {
        console.error('createAR Error:', error);
        throw error;
    }
};
 
  export const GetCustomerFilter = async (branchId = 1, searchtext) => {
  
      try {
          const response = await get(`/ordermngmaster/GetCustomerFilter?branchid=${branchId}&searchtext=${searchtext}`);
          if (response?.status) {

            return transformData(response.data, "CustomerID", "CustomerName");


             
          } else {
              throw new Error(response?.message || "Failed");
          }
      } catch (error) {
          console.error("Error :", error);
          return [];
      }
  };

  export const getBankReconciliation = async ({ orgid, branchid, fromDate, toDate }) => { debugger
    const params = new URLSearchParams();   
    params.append("orgid", orgid);
    params.append("branchid", branchid); 
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);   

    const response = await get(`/BankReconciliation/list?${params.toString()}`);
    return response;
};

export const getsalesreport = async ( orgid, customerid, fromDate, toDate,gasid ) => { debugger
    const params = new URLSearchParams();   
    params.append("orgid", orgid);
    params.append("customerid", customerid); 
    params.append("gasid", gasid); 
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);   

    const response = await get(`/FinanceReport/SalesReport?${params.toString()}`);
    return response;
};

export const getProfitLoss = async ( orgid, currencyid, fromDate, toDate ) => { debugger
    const params = new URLSearchParams();   
    params.append("orgid", orgid);
    params.append("currencyid", currencyid); 
 
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);   

    const response = await get(`/FinanceReport/ProfitAndLossReport?${params.toString()}`);
    return response;
};
 
 
export const updateAR = async (payload) => {

    try {
        let response;

       
            response = await  put("/AR/update", payload);
        
        console.log("add-cyliner response", response);
        if (response?.statusCode === 0) {
            return response;
        } else if (response?.statusCode === 400) {
            return response;
        } else {
            throw new Error(response?.message || 'Failed to updateAR');
        }
    } catch (error) {
        console.error('updateAR Error:', error);
        throw error;
    }

};
 
 