using Application.Finance.PettyCash.GetSequencesNumber;
using Core.FinanceModule.PettyCash;
using MediatR;

namespace Application.Finance.PettyCash.GetList
{
    public class GetSequencesNumberPettyCashHandler : IRequestHandler<GetSequencesNumberPettyCash, object>
    {
        private readonly IPettyCashRepository _repository;


        public GetSequencesNumberPettyCashHandler(IPettyCashRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetSequencesNumberPettyCash command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetSequencesNo(command.BranchId, command.orgid, command.userid);
            return Result;

        }
    }
}

