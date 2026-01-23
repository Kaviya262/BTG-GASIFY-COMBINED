using Application.Finance.ClaimApproval.Approval;
using Application.Finance.ClaimApproval.AutoApproval;
using Core.Abstractions;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Create
{
    public class AutoApprovalClaimCommandHandler : IRequestHandler<AutoApprovalClaimCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;


        public AutoApprovalClaimCommandHandler(IClaimApprovalRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
            financedb = _financedb;

        }

        public async Task<object> Handle(AutoApprovalClaimCommand command, CancellationToken cancellationToken)
        {
            PPPApproval obj = new PPPApproval();
            obj = command.Approve;
             

            var data = await _repository.PPPApproveAsync(obj);
                financedb.Commit();
            return data;

        }
    }
}

