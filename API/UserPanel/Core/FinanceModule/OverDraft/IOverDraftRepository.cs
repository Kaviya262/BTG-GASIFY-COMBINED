namespace Core.FinanceModule.OverDraft
{
    public interface IOverDraftRepository
    {
        Task<object> AddAsync(OverDraftModel obj);
        Task<object> UpdateAsync(OverDraftModel obj);
        Task<object> GetByIdOverDraftAsync(int Cashid, int branchid, int orgid);
        Task<object> GetListOverDraftAsync(int Cashid, string exptype, string voucherno, int branchid, int orgid);
        // Task<object> GetOverDraftTypeAsync(int branchId, int orgId);
        Task<object> GetSequencesNo(int branchId, int orgid, int userid);
    }
}
