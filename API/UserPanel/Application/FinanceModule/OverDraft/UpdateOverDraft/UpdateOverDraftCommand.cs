using Core.FinanceModule.OverDraft;
using MediatR;

namespace Application.FinanceModule.OverDraft.UpdateOverDraft
{
    public class UpdateOverDraftCommand : IRequest<object>
    {
        public string Command { get; set; }
        public OverDraftHeader Header { get; set; }
    }
}
