using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using MediatR;

namespace Application.Invoices.GetInvoicesItem
{
    public class GetInvoicesItemByIdQueryHandler : IRequestHandler<GetInvoicesItemByIdQuery, object>
    {
        private readonly IInvoicesRepository _repository;


        public GetInvoicesItemByIdQueryHandler(IInvoicesRepository repository)
        {


            _repository = repository;

        }
        public async Task<object> Handle(GetInvoicesItemByIdQuery query, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByIdAsync(query.Id);
            return Result;

        }
    }
}
