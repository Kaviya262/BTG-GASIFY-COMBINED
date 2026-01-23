using MediatR;

namespace Application.FinanceModule.Report.GetListBankBook
{
    public class GetListBankBookQuery : IRequest<object>
    {
     public Int32 bankid { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Opt { get; set; }

    }
}
