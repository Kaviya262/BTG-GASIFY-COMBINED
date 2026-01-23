import { get, post, put } from "../../helpers/api_helper";
import axios from "axios";
import { saveAs } from "file-saver";
const transformData = (data, valueParam, labelParam) => {

    return data.map(item => ({
        ...item,
        value: item[valueParam],
        label: item[labelParam] || "-"
    }));
};
import { toast } from 'react-toastify';
 
 
export const GetRequester = async (BranchId,SearchText) => {
    try {
        const response = await get(`/CommonProcurementData/GetUserDetails?BranchId=${BranchId}&SearchText=${SearchText}`);
        if (response?.status) {
            return transformData(response.data,"userid","username");
        } else {
            throw new Error(response?.message || "Failed to fetch users");
        }
    } catch (error) {
        console.error("Error fetching GetRequester:", error);
        return { status: false, data: [], error };
    }
};

export const GetDepartment = async (BranchId,SearchText) => {
    try {
        const response = await get(`/CommonProcurementData/GetDepartMentDetails?BranchId=${BranchId}&SearchText=${SearchText}`);
        if (response?.status) {
            return transformData(response.data,"departmentid","departmentname");
        } else {
            throw new Error(response?.message || "Failed to fetch users");
        }
    } catch (error) {
        console.error("Error fetching GetDepartment:", error);
        return { status: false, data: [], error };
    }
};


export const GetProcurementMemoTypes = async (BranchId,SearchText) => {
    try {
        const response = await get(`/CommonProcurementData/GetPurchaseTypeDetails?BranchId=${BranchId}&SearchText=${SearchText}`);
        if (response?.status) {
            return transformData(response.data,"typeid","typename");
        } else {
            throw new Error(response?.message || "Failed to fetch users");
        }
    } catch (error) {
        console.error("Error fetching GetProcurementMemoTypes:", error);
        return { status: false, data: [], error };
    }
};
 
export const GetUOM = async (BranchId,SearchText) => {
    try {
        const response = await get(`/CommonProcurementData/GetUomDetails?BranchId=${BranchId}&SearchText=${SearchText}`);
        if (response?.status) {
            return transformData(response.data,"uomid","UOMName");
        } else {
            throw new Error(response?.message || "Failed to fetch users");
        }
    } catch (error) {
        console.error("Error fetching UOM:", error);
        return { status: false, data: [], error };
    }
};

export const GetItem = async (BranchId,SearchText) => {
    try {
        const response = await get(`/CommonProcurementData/GetItemDetails?BranchId=${BranchId}&SearchText=${SearchText}`);
        if (response?.status) {
            return transformData(response.data,"itemid","itemname");
        } else {
            throw new Error(response?.message || "Failed to fetch users");
        }
    } catch (error) {
        console.error("Error fetching items:", error);
        return { status: false, data: [], error };
    }
};

export const GetAllPurchaseMemo = async (BranchId,requesterid) => {
    try {
        const response = await get(`/ProcurementMemo/GetALL?requesterid=${requesterid}&BranchId=${BranchId}`);
        if (response?.status) {
            return response;
        } else {
            throw new Error(response?.message || "Failed to fetch users");
        }
    } catch (error) {
        console.error("Error fetching all purchase memo:", error);
        return { status: false, data: [], error };
    }
};

export const GetByIdPurchaseMemo = async (BranchId,requesterid) => {
    try {
        const response = await get(`/ProcurementMemo/GetById?requesterid=${requesterid}&BranchId=${BranchId}`);
        if (response?.status) {
            return response;
        } else {
            throw new Error(response?.message || "Failed to fetch users");
        }
    } catch (error) {
        console.error("Error fetching purchase memo by id:", error);
        return { status: false, data: [], error };
    }
};

export const GetdPurchaseMemoSeqNo = async (BranchId) => {
    try {
        const response = await get(`/ProcurementMemo/GetInvoicesSiNo?BranchId=${BranchId}`);
        if (response?.status) {
            return response;
        } else {
            throw new Error(response?.message || "Failed to fetch users");
        }
    } catch (error) {
        console.error("Error fetching PurchaseMemo Seq:", error);
        return { status: false, data: [], error };
    }
};

export const SaveProcurementMemo = async (payload) => {
    debugger
    try {
        console.log("Sending payload:", payload);
        const response = await post("/ProcurementMemo/Create", payload);
        debugger
        if (response) {
            return response;
        } else {
            throw new Error(response?.message || 'Failed to save procurement memo');
        }
    } catch (error) {
        console.error('CreateProcurementMemo Error:', error);
        throw error;
    }

};

export const UpdateProcurementMemo = async (payload) => {
    debugger
    try {
        console.log("Sending payload:", payload);
        const response = await post("/ProcurementMemo/Update", payload);
        debugger
        if (response) {
            return response;
        } else {
            throw new Error(response?.message || 'Failed to save procurement memo');
        }
    } catch (error) {
        console.error('CreateProcurementMemo Error:', error);
        throw error;
    }

};
