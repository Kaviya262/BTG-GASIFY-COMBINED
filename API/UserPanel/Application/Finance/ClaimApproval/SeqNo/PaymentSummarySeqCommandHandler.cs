using Application.Finance.ClaimApproval.Approval;
using Application.Finance.ClaimApproval.Reject;
using Application.Finance.ClaimApproval.SeqNo;
using Core.Abstractions;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Reject
{
    public class PaymentSummarySeqCommandHandler : IRequestHandler<PaymentSummarySeqCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;


        public PaymentSummarySeqCommandHandler(IClaimApprovalRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
            financedb = _financedb;

        }

        public async Task<object> Handle(PaymentSummarySeqCommand command, CancellationToken cancellationToken)
        {
         
            var data = await _repository.GetPaymentSummarySeqNoAsync(command.userid, command.branchId,command.orgid);
            financedb.Commit();
            return data;
        }
    }
}

