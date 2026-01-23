using Core.FinanceModule.OverDraft;
using MediatR;

namespace Application.FinanceModule.OverDraft.GetListOverDraft
{
    public class GetListOverDraftQueryHandler : IRequestHandler<GetListOverDraftQuery, object>
    {
        private readonly IOverDraftRepository _repository;

        public GetListOverDraftQueryHandler(IOverDraftRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetListOverDraftQuery query, CancellationToken cancellationToken)
        {
            //if (query.Opt == 5)
            //{
            //    // For Expense Descriptions
            //    return await _repository.GetOverDraftTypeAsync(
            //        query.BranchId,
            //        query.OrgId
            //    );
            //}
            //else
            //{
            // Default Petty Cash list
            return await _repository.GetListOverDraftAsync(
                query.OverDraftId,
                query.OverDraftType,
                query.VoucherNo,
                query.BranchId,
                query.OrgId
            );
            //}
        }
    }

}
