using Core.Abstractions;
using Core.FinanceModule.Report;
using Dapper;
using System.Data;

public class CashBookRepository : ICashBookRepository
{
    private readonly IDbConnection _connection;

    public CashBookRepository(IUnitOfWorkDB3 finacedb)
    {
        _connection = finacedb.Connection;
    }

    public async Task<IEnumerable<object>> GetListCashBookAsync(DateTime? fromDate, DateTime? toDate, int branchId, int orgId)
    {
        var param = new DynamicParameters();
        param.Add("@p_fromDate", fromDate);
        param.Add("@p_toDate", toDate);
        param.Add("@p_branchId", branchId);
        param.Add("@p_orgId", orgId);
        param.Add("@p_openingBalance", 50000); //for Test

        var sql = "proc_finance_CashBook";

        var result = await _connection.QueryAsync<object>(
            sql,
            param,
            commandType: CommandType.StoredProcedure
        );

        return result;
    }

}