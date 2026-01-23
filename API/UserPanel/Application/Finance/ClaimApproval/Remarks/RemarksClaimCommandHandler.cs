using Application.Finance.ClaimApproval.Approval;
using Application.Finance.ClaimApproval.Reject;
using Application.Finance.ClaimApproval.Remarks;
using Core.Abstractions;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Remarks
{
    public class RemarksClaimCommandHandler : IRequestHandler<RemarksClaimCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;
    


        public RemarksClaimCommandHandler(IClaimApprovalRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
     

        }

        public async Task<object> Handle(RemarksClaimCommand command, CancellationToken cancellationToken)
        {
             
            var data = await _repository.GetRemarksList(command.claimid);
            return data;
        }
    }
}

