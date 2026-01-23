using Core.FinanceModule.OverDraft;
using MediatR;

namespace Application.FinanceModule.OverDraft.GetByIdOverDraft
{
    public class GetByIdOverDraftQueryHandler : IRequestHandler<GetByIdOverDraftQuery, object>
    {
        private readonly IOverDraftRepository _repository;

        public GetByIdOverDraftQueryHandler(IOverDraftRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetByIdOverDraftQuery query, CancellationToken cancellationToken)
        {
            var result = await _repository.GetByIdOverDraftAsync(
                query.OverDraftId,
                query.BranchId,
                query.OrgId
            );

            return result;
        }
    }
}
