using Application.FinanceModule.Report.GetBankReconciliation;
using Application.FinanceModule.Report.GetListBankBook;
using Core.FinanceModule.Report;
using MediatR;

namespace Application.FinanceModule.GetBankReconciliation.GetListGetBankReconciliation
{
    public class GetListBankReconciliationHandler : IRequestHandler<GetListBankReconciliationQuery, object>
    {
        private readonly IBankReconciliationRepository _repository;

        public GetListBankReconciliationHandler(IBankReconciliationRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetListBankReconciliationQuery query, CancellationToken cancellationToken)
        {
            var from = query.FromDate ?? new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
            var to = query.ToDate ?? DateTime.Today;
            var list = await _repository.GetBankReconciliation(from, to, query.BranchId, query.OrgId);
            return list;
        }

    }
}
