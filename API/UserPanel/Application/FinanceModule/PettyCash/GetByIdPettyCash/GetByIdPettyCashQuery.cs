using MediatR;

namespace Application.FinanceModule.PettyCash.GetByIdPettyCash
{
    public class GetByIdPettyCashQuery : IRequest<object>
    {
        public int PettyCashId { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
    }
}
