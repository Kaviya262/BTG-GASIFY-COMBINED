namespace Core.FinanceModule.PettyCash
{
    public interface IPettyCashRepository
    {
        Task<object> AddAsync(PettyCash obj);
        Task<object> UpdateAsync(PettyCash obj);
        Task<object> GetByIdPettyCashAsync(int Cashid, int branchid, int orgid);
        Task<object> GetListPettyCashAsync(int Cashid, string exptype, string voucherno, int branchid, int orgid);
        Task<object> GetExpenseListAsync(int branchId, int orgId);
        Task<object> GetSequencesNo(int branchId, int orgid, int userid);

    }
}
