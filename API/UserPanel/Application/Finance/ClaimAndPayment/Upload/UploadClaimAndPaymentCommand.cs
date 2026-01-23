using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Update
{
    public class UploadClaimAndPaymentCommand : IRequest<object>
    {

        public Int32 Id { get; set; }
        public string Path { get; set; }
        public Int32 UserId { get; set; }
        public Int32 BranchId { get; set; }
public string filename { get; set; }
}

}
