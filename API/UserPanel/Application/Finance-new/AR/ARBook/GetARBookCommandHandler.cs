using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using Core.Finance_new;
using MediatR;

namespace Application.Financenew.AR.ARBook
{
    public class GetARBookCommandHandler : IRequestHandler<GetARBookCommand, object>
    {
        private readonly IAccountsReceivableRepository _repository;

        public GetARBookCommandHandler(IAccountsReceivableRepository repository)
        {
            _repository = repository;

        }
        public async Task<object> Handle(GetARBookCommand query, CancellationToken cancellationToken)
        {
            var Result = await _repository.getARBook(query.orgid, query.branchid,query.customer_id,query.from_date,query.to_date);
            return Result;

        }
    }
}
