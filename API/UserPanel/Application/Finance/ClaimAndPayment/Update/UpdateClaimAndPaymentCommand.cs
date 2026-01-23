using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Update
{
    public class UpdateClaimAndPaymentCommand : IRequest<object>
    {
        public ClaimAndPaymentHeader Header { get; set; }
        public List<Core.Finance.ClaimAndPayment.ClaimAndPaymentDetail> Details { get; set; }
    }

}
