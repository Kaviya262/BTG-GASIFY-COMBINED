using Core.FinanceModule.PettyCash;
using MediatR;

namespace Application.FinanceModule.PettyCash.CreatePettyCash
{
    public class CreatePettyCashCommand : IRequest<object>
    {
        public PettyCashHeader Header { get; set; }
    }
}
