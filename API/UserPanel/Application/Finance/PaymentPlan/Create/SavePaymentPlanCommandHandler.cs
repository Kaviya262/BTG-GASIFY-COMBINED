using Application.Finance.ClaimApproval.Approval;
using Core.Abstractions;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using Core.Finance.PaymentPlan;
using MediatR;

namespace Application.Finance.PaymentPlan.Create
{
    public class SavePaymentPlanCommandHandler : IRequestHandler<SavePaymentPlanCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;


        public SavePaymentPlanCommandHandler(IClaimApprovalRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
            financedb = _financedb;

        }

        public async Task<object> Handle(SavePaymentPlanCommand command, CancellationToken cancellationToken)
        {
            PaymentPlanHdr obj = new PaymentPlanHdr();
            obj = command.Approve;
             

            var data = await _repository.SavePaymentPlanAsync(obj);
                financedb.Commit();
            return data;

        }
    }
}

