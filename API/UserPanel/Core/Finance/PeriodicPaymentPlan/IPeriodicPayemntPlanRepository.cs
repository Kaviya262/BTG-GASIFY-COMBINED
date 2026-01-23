using Core.Finance.PaymentPlan;

namespace Core.Finance.PeriodicPaymentPlan
{
    public interface IPeriodicPayemntPlanRepository
    {
        //  Task<object> ApproveAsync(ClaimApprovalHdr obj);
        // Task<object> GetHistoryAsync(int id, int userid, int branchId, Int32 orgid, string fromdate, string todate);
        // Task<object> GetAllAsync(int Id, int branchId, Int32 orgid, int userid);
        Task<object> GetAllPeriodicPaymentPlanAsync(int Id, int branchId, Int32 orgid, int userid);
        Task<object> SavePeriodicPaymentPlanAsync(PeriodicPaymentPlanHdr obj);
        Task<object> GetVoucher(int voucherid, int branchId, int orgid);
    }
}
