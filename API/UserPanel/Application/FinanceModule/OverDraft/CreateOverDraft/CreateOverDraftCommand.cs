using Core.FinanceModule.OverDraft;
using MediatR;

namespace Application.FinanceModule.OverDraft.CreateOverDraft
{
    public class CreateOverDraftCommand : IRequest<object>
    {
        public OverDraftHeader Header { get; set; }
    }
}
