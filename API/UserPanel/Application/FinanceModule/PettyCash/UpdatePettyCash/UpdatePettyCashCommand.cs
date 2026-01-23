using Core.FinanceModule.PettyCash;
using MediatR;

namespace Application.FinanceModule.PettyCash.UpdatePettyCash
{
    public class UpdatePettyCashCommand : IRequest<object>
    {
        public string Command { get; set; }
        public PettyCashHeader Header { get; set; }
    }
}
