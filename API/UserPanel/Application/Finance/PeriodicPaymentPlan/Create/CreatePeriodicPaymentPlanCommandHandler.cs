using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Finance.PaymentPlan.Create;
using Core.Abstractions;
using Core.Finance.Approval;
using Core.Finance.PaymentPlan;
using Core.Finance.PeriodicPaymentPlan;
using MediatR;

namespace Application.Finance.PeriodicPaymentPlan.Create
{
    public class CreatePeriodicPaymentPlanCommandHandler : IRequestHandler<CreatePeriodicPaymentPlanCommand, object>
    {
        private readonly IPeriodicPayemntPlanRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;


        public CreatePeriodicPaymentPlanCommandHandler(IPeriodicPayemntPlanRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
            financedb = _financedb;

        }

        public async Task<object> Handle(CreatePeriodicPaymentPlanCommand command, CancellationToken cancellationToken)
        {
            PeriodicPaymentPlanHdr obj = new PeriodicPaymentPlanHdr();
            obj = command.Approve;
            var data = await _repository.SavePeriodicPaymentPlanAsync(obj);
            financedb.Commit();
            return data;

        }
    }
}
