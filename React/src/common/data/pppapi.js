import { get, post } from "../../helpers/api_helper";

/**
 * PPP API - Uses .NET Backend
 */

// Get all PPP details
export const GetPaymentPalnAccordianDetails = async (id, orgId, branchId, userid) => {
    try {
        const res = await get(
            `/PeriodicPaymentPlan/GetAll?Id=${id}&orgid=${orgId}&BranchId=${branchId}&UserId=${userid}`
        );
        // Helper usually returns response.data directly, but verify usage in other files
        return res;
    } catch (error) {
        console.error("Failed to fetch PPP details", error);
        return { status: false, message: error.message };
    }
};

// Save/Create PPP Voucher
export const SaveVoucherAPI = async (payload) => {
    try {
        console.log("Sending payload:", payload);
        const response = await post(
            `/PeriodicPaymentPlan/Create`,
            payload
        );
        return response;
    } catch (error) {
        console.error('Save Voucher Error:', error);
        throw error;
    }
};

// Get Payment Voucher
export const GetPaymentVoucher = async (voucherid, orgId, branchId) => {
    try {
        const res = await get(
            `/PeriodicPaymentPlan/GetVoucher?VoucherId=${voucherid}&orgid=${orgId}&BranchId=${branchId}`
        );
        return res;
    } catch (error) {
        console.error("Failed to fetch payment voucher", error);
        return { status: false, message: error.message };
    }
};
