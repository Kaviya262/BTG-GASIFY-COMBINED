using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Core.Finance.ClaimAndPayment;

namespace Application.Finance.ClaimHistory
{
    public class GetAllClaimHistoryCommandHandler : IRequestHandler<GetAllClaimHistoryCommand, object>
    {
        private readonly IClaimAndPaymentRepository _repository;


        public GetAllClaimHistoryCommandHandler(IClaimAndPaymentRepository repository)
        {
            _repository = repository;

        }
        public async Task<object> Handle(GetAllClaimHistoryCommand command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetClaimHistory(command.fromdate, command.todate, command.branchid, command.orgid);
            return Result;

        }
    }
}
