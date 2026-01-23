using Application.Finance.PeriodicPaymentPlan.GetAll;
using Core.Finance.Approval;
using Core.Finance.PeriodicPaymentPlan;
using MediatR;

namespace Application.Finance.PaymentPlan.GetList
{
    public class GetAllPeriodicPaymentPlanCommandHandler : IRequestHandler<GetAllPeriodicPaymentPlanCommand, object>
    {
        private readonly IPeriodicPayemntPlanRepository _repository;


        public GetAllPeriodicPaymentPlanCommandHandler(IPeriodicPayemntPlanRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetAllPeriodicPaymentPlanCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetAllPeriodicPaymentPlanAsync(command.id, command.BranchId, command.OrgId, command.userid);
            return Result;

        }
    }
}

