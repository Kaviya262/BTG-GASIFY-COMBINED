using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Discuss
{
    public class DiscussClaimAndPaymentCommand : IRequest<object>
    {
      public DiscussClaim discuss { get; set; }
    }

}
