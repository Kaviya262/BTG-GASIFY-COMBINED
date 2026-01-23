using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using Core.Finance_new;
using MediatR;

namespace Application.Financenew.AR.GetById
{
    public class GetByIdARCommandHandler : IRequestHandler<GetByIdARCommand, object>
    {
        private readonly IAccountsReceivableRepository _repository;

        public GetByIdARCommandHandler (IAccountsReceivableRepository repository)
        {
            _repository = repository;

        }
        public async Task<object> Handle(GetByIdARCommand query, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByCustomerAsync(query.orgId, query.branchId,query.customerid);
            return Result;

        }
    }
}
