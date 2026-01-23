using Core.FinanceModule.PettyCash;
using MediatR;

namespace Application.FinanceModule.PettyCash.GetByIdPettyCash
{
    public class GetByIdPettyCashQueryHandler : IRequestHandler<GetByIdPettyCashQuery, object>
    {
        private readonly IPettyCashRepository _repository;

        public GetByIdPettyCashQueryHandler(IPettyCashRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetByIdPettyCashQuery query, CancellationToken cancellationToken)
        {
            var result = await _repository.GetByIdPettyCashAsync(
                query.PettyCashId,
                query.BranchId,
                query.OrgId
            );

            return result;
        }
    }
}
