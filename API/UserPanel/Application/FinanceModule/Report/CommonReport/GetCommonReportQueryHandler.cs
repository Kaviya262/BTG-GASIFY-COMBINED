using Application.FinanceModule.Report.CommonReport;
using Core.FinanceModule.Report;
using MediatR;

namespace Application.FinanceModule.BankBook.CommonReport
{
    public class CommonReportQueryHandler : IRequestHandler<CommonReportQuery, object>
    {
        private readonly IFinanceReportRepository _repository;

        public CommonReportQueryHandler(IFinanceReportRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(CommonReportQuery query, CancellationToken cancellationToken)
        {
            var from = query.Fromdate ;
            var to = query.Todate;
            if (query.opt == 1)
            {
                var list = await _repository.SalesReport(query.orgid, from, to, query.customerid, query.gasid);
                return list;
            }
            else if (query.opt == 2)
            {
                var list = await _repository.ProfitAndLossReport(query.orgid, from, to, query.currencyid);
                return list;
            }
            return new object();
        }

    }
}
