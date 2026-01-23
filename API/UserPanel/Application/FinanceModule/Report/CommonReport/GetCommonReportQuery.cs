using MediatR;

namespace Application.FinanceModule.Report.CommonReport
{
    public class CommonReportQuery : IRequest<object>
    {
     public Int32 orgid { get; set; }

        public Int32 opt { get; set; }
        public Int32 currencyid { get; set; }
        public int customerid { get; set; }
        public string? Fromdate { get; set; }
        public string? Todate { get; set; }
        public int gasid { get; set; }

    }
}
