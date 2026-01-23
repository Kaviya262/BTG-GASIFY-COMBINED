using Core.FinanceModule.PettyCash;
using MediatR;

namespace Application.FinanceModule.PettyCash.GetListPettyCash
{
    public class GetListPettyCashQueryHandler : IRequestHandler<GetListPettyCashQuery, object>
    {
        private readonly IPettyCashRepository _repository;

        public GetListPettyCashQueryHandler(IPettyCashRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetListPettyCashQuery query, CancellationToken cancellationToken)
        {
            if (query.Opt == 5)
            {
                // For Expense Descriptions
                return await _repository.GetExpenseListAsync(
                    query.BranchId,
                    query.OrgId
                );
            }
            else
            {
                // Default Petty Cash list
                return await _repository.GetListPettyCashAsync(
                    query.PettyCashId,
                    query.ExpType,
                    query.VoucherNo,
                    query.BranchId,
                    query.OrgId
                );
            }
        }
    }

}

