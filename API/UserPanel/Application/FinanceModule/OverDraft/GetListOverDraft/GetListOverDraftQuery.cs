using MediatR;

namespace Application.FinanceModule.OverDraft.GetListOverDraft
{
    public class GetListOverDraftQuery : IRequest<object>
    {
        public int OverDraftId { get; set; }
        public string OverDraftType { get; set; }
        public string VoucherNo { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
        public int Opt { get; set; }
    }
}
