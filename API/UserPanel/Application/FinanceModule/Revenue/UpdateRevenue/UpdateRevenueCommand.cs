using Core.FinanceModule.Revenue;
using MediatR;

namespace Application.FinanceModule.Revenue.UpdateRevenue
{
    public class UpdateRevenueCommand : IRequest<object>
    {
        public string Command { get; set; }
        public RevenueHeader Header { get; set; }
    }
}
