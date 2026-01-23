using Application.Finance.PeriodicPaymentPlan.GetAll;
using Application.Finance.PeriodicPaymentPlan.Voucher;
 
using Core.Finance.PeriodicPaymentPlan;
using MediatR;

namespace Application.Finance.PaymentPlan.Voucher
{
    public class GetVoucherCommandHandler : IRequestHandler<GetVoucherCommand, object>
    {
        private readonly IPeriodicPayemntPlanRepository _repository;


        public GetVoucherCommandHandler(IPeriodicPayemntPlanRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetVoucherCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetVoucher(command.voucherid, command.BranchId, command.OrgId);
            return Result;

        }
    }
}

