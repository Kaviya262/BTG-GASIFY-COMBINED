using Application.Finance.ClaimApproval.Approval;
using Application.Finance.ClaimApproval.Reject;
using Core.Abstractions;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Reject
{
    public class RejectClaimCommandHandler : IRequestHandler<RejectClaimCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;


        public RejectClaimCommandHandler(IClaimApprovalRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
            financedb = _financedb;

        }

        public async Task<object> Handle(RejectClaimCommand command, CancellationToken cancellationToken)
        {
            RejectDetails obj = new RejectDetails();
            obj = command.Rej;
            var data = await _repository.RejectClaims(obj);
            financedb.Commit();
            return data;
        }
    }
}

