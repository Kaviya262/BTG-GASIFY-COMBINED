using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.FinanceModule.Report
{
   public interface IBankReconciliationRepository
    {
        
                    Task<IEnumerable<object>> GetBankReconciliation(DateTime? fromDate, DateTime? toDate, int branchid, int orgid);

    }
}
