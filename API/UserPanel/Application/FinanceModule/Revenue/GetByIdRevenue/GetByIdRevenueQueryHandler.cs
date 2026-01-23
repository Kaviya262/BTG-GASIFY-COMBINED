using Core.FinanceModule.Revenue;
using MediatR;

namespace Application.FinanceModule.Revenue.GetByIdRevenue
{
    public class GetByIdRevenueQueryHandler : IRequestHandler<GetByIdRevenueQuery, object>
    {
        private readonly IRevenueRepository _repository;

        public GetByIdRevenueQueryHandler(IRevenueRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetByIdRevenueQuery query, CancellationToken cancellationToken)
        {
            var result = await _repository.GetByIdRevenueAsync(
                query.RevenueId,
                query.BranchId,
                query.OrgId
            );

            return result;
        }
    }
}
