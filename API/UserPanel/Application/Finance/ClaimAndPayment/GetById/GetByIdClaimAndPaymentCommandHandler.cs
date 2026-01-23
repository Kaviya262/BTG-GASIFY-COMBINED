using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using Core.Finance.Master;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using Core.Procurement.PurchaseMemo;
using MediatR;

namespace Application.Finance.ClaimAndPayment.GetById
{
    public class GetByIdClaimAndPaymentCommandHandler : IRequestHandler<GetByIdClaimAndPaymentCommand, object>
    {
        private readonly IClaimAndPaymentRepository _repository;

        public GetByIdClaimAndPaymentCommandHandler (IClaimAndPaymentRepository repository)
        {
            _repository = repository;

        }
        public async Task<object> Handle(GetByIdClaimAndPaymentCommand query, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByIdAsync(query.Id, query.orgid);
            return Result;

        }
    }
}
