using MediatR;

namespace Application.FinanceModule.Revenue.GetSequenceNumber
{
    public class GetSequenceNumberRevenueCommand : IRequest<object>
    {
        public int BranchId { get; set; }
        public int orgid { get; set; }
        public int userid { get; set; }
    }
}
