using Core.Abstractions;
using Core.FinanceModule.Report;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
   public class BankReconciliationRepository: IBankReconciliationRepository
    {
        private readonly IDbConnection _connection;

        public BankReconciliationRepository(IUnitOfWorkDB3 financedb)
        {
            _connection = financedb.Connection;
        }

        public async Task<IEnumerable<object>> GetBankReconciliation(DateTime? fromDate, DateTime? toDate, int branchId, int orgId)
        {
            var param = new DynamicParameters();
            param.Add("@p_from_date", fromDate);
            param.Add("@p_to_date", toDate);
            param.Add("@p_branchId", branchId);
            param.Add("@p_orgId", orgId); 

            var result = await _connection.QueryAsync<object>("sp_BankReconciliationReport", param,
                commandType: CommandType.StoredProcedure);

            return result;
        }
    }
}
