using MediatR;

namespace Application.FinanceModule.OverDraft.GetByIdOverDraft
{
    public class GetByIdOverDraftQuery : IRequest<object>
    {
        public int OverDraftId { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
    }
}
