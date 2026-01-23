using MediatR;

namespace Application.FinanceModule.PettyCash.GetListPettyCash
{
    public class GetListPettyCashQuery : IRequest<object>
    {
        public int PettyCashId { get; set; }
        public string ExpType { get; set; }
        public string VoucherNo { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
        public int Opt { get; set; }
    }
}
