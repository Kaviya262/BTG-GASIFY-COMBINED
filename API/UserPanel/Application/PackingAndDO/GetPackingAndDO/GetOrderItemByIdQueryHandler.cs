using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.SaleOrder;


using MediatR;
using MySqlX.XDevAPI.Common;
using UserPanel.Application.Quotation.GetQuotationItem;

namespace Application.Order.GetOrderItem
{
    public class GetOrderItemByIdQueryHandler : IRequestHandler<GetOrderItemByIdQuery, object>
    {
        private readonly ISaleOrderRepository _repository;
        public GetOrderItemByIdQueryHandler(ISaleOrderRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetOrderItemByIdQuery query, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByIdAsync(query.Id);
            return Result;
        }
    }
}
