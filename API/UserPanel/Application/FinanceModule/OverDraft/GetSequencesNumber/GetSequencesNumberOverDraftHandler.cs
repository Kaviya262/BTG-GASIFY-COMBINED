using Core.FinanceModule.OverDraft;
using MediatR;

namespace Application.FinanceModule.OverDraft.GetSequencesNumber
{
    public class GetSequencesNumberOverDraftHandler : IRequestHandler<GetSequencesNumberOverDraft, object>
    {
        private readonly IOverDraftRepository _repository;


        public GetSequencesNumberOverDraftHandler(IOverDraftRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetSequencesNumberOverDraft command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetSequencesNo(command.BranchId, command.orgid, command.userid);
            return Result;

        }
    }
}

