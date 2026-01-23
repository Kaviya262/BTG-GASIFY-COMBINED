using MediatR;

namespace Application.FinanceModule.Revenue.GetByIdRevenue
{
    public class GetByIdRevenueQuery : IRequest<object>
    {
        public int RevenueId { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
    }
}
