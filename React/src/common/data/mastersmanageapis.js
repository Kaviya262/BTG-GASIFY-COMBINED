import { get, post, put } from "../../helpers/api_helper"; 
import axios from "axios";
import { saveAs } from "file-saver";

const transformData = (data, valueParam, labelParam) => {
    
    return data.map(item => ({
        ...item,
        value: item[valueParam],
        label: item[labelParam]
    }));
};

export const GetALLInvoices = async (customerid, FromDate, ToDate, branchId) => {
    try {
        const response = await get(`/MasterCustomer/GetListALL?customerid=${customerid}&FromDate=${FromDate}&ToDate=${ToDate}&BranchId=${branchId}`);
        if (response?.status) {
            return response; 
        } else {
            throw new Error(response?.message || "Failed");
        }
    } catch (error) {
        console.error("Error :", error);
        return [];
    }
};