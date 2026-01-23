using MediatR;

namespace Application.FinanceModule.Revenue.GetListRevenue
{
    public class GetListRevenueQuery : IRequest<object>
    {
        public int RevenueId { get; set; }
        public string RevenueType { get; set; }
        public string VoucherNo { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
        public int Opt { get; set; }
    }
}
