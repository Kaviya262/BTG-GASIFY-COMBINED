using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Delete
{
    public class DeleteClaimAndPaymentCommand : IRequest<object>
    {
      public InActiveClaim delete { get; set; }
    }

}
