using Core.FinanceModule.Revenue;
using MediatR;

namespace Application.FinanceModule.Revenue.GetListRevenue
{
    public class GetListRevenueQueryHandler : IRequestHandler<GetListRevenueQuery, object>
    {
        private readonly IRevenueRepository _repository;

        public GetListRevenueQueryHandler(IRevenueRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetListRevenueQuery query, CancellationToken cancellationToken)
        {
            if (query.Opt == 5)
            {
                // For Expense Descriptions
                return await _repository.GetRevenueTypeListAsync(
                    query.BranchId,
                    query.OrgId
                );
            }
            else
            {
                // Default Petty Cash list
                return await _repository.GetListRevenueAsync(
                    query.RevenueId,
                    query.RevenueType,
                    query.VoucherNo,
                    query.BranchId,
                    query.OrgId
                );
            }
        }
    }

}