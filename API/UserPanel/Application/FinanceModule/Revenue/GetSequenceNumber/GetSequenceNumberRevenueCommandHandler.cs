using Core.FinanceModule.Revenue;
using MediatR;

namespace Application.FinanceModule.Revenue.GetSequenceNumber
{
    public class GetSequenceNumberRevenueCommandHandler : IRequestHandler<GetSequenceNumberRevenueCommand, object>
    {
        private readonly IRevenueRepository _repository;


        public GetSequenceNumberRevenueCommandHandler(IRevenueRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetSequenceNumberRevenueCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetSequencesNo(command.BranchId, command.orgid, command.userid);
            return Result;

        }
    }
}
