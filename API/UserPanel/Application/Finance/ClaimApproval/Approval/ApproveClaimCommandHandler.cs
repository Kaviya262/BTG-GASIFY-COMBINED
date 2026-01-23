using Application.Finance.ClaimApproval.Approval;
using Core.Abstractions;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Create
{
    public class ApproveClaimCommandHandler : IRequestHandler<ApproveClaimCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;


        public ApproveClaimCommandHandler(IClaimApprovalRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
            financedb = _financedb;

        }

        public async Task<object> Handle(ApproveClaimCommand command, CancellationToken cancellationToken)
        {
            ClaimApprovalHdr obj = new ClaimApprovalHdr();
            obj = command.Approve;
             

            var data = await _repository.ApproveAsync(obj);
                financedb.Commit();
            return data;

        }
    }
}

