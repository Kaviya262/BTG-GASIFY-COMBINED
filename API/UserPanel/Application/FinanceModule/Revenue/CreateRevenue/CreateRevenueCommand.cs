using Core.FinanceModule.Revenue;
using MediatR;

namespace Application.FinanceModule.Revenue.CreateRevenue
{
    public class CreateRevenueCommand : IRequest<object>
    {
        public RevenueHeader Header { get; set; }
    }
}
