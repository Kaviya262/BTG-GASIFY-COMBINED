namespace Core.FinanceModule.Report
{
    public interface ICashBookRepository
    {
        Task<IEnumerable<object>> GetListCashBookAsync(DateTime? fromDate, DateTime? toDate, int branchid, int orgid);
    }
}
