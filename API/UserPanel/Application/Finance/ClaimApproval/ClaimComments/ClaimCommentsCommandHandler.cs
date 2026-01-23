using Application.Finance.ClaimApproval.ClaimComments;
using Core.Abstractions;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using MediatR;
using System.Security.Claims;

namespace Application.Finance.ClaimAndPayment.ClaimComments
{
    public class ClaimCommentsCommandHandler : IRequestHandler<ClaimCommentsCommand, object>
    {
        private readonly IClaimAndPaymentRepository _repository;
    


        public ClaimCommentsCommandHandler(IClaimAndPaymentRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
     

        }

        public async Task<object> Handle(ClaimCommentsCommand command, CancellationToken cancellationToken)
        {
            var data = await _repository.ClaimComments(command.claimid, command.level);
            return data;
        }
    }
}

