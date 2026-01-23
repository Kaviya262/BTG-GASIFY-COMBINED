using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.FinanceModule.Report
{
  public  interface IFinanceReportRepository
    {
        Task<object> LedgerReport(string p_FromDate, string p_ToDate, int branchid, int orgid, int SlCodeId);
        Task<object> LedgerDetails(int SlCodeId, int branchid, int orgid);
        Task<object> SalesReport(int orgid, string Fromdate, string Todate, int customerid, int gasid);
        Task<object> ProfitAndLossReport(int orgid, string Fromdate, string Todate, int currencyid);
    }

}
