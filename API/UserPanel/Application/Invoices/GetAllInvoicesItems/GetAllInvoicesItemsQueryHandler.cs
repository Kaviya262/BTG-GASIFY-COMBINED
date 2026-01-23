using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using MediatR;
using UserPanel.Application.Order.GetAllOrderItems;

namespace Application.Invoices.GetAllInvoicesItems
{
    public class GetAllInvoicesItemsQueryHandler : IRequestHandler<GetAlllnvoicesItemsQuery, object>
    {
        private readonly IInvoicesRepository _repository;


        public GetAllInvoicesItemsQueryHandler(IInvoicesRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetAlllnvoicesItemsQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetAllAsync(command.customerid, command.from_date, command.to_date, command.BranchId,command.typeid);
            return Result;

        }
    }
}

