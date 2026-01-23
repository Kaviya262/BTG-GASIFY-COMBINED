namespace Core.FinanceModule.Revenue
{
    public interface IRevenueRepository
    {
        Task<object> AddAsync(RevenueModel obj);
        Task<object> UpdateAsync(RevenueModel obj);
        Task<object> GetByIdRevenueAsync(int Cashid, int branchid, int orgid);
        Task<object> GetListRevenueAsync(int Cashid, string revtype, string voucherno, int branchid, int orgid);
        Task<object> GetRevenueTypeListAsync(int branchId, int orgId);
        Task<object> GetSequencesNo(int branchId, int orgid, int userid);
    }
}
