using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
 
using Core.ReturnOrder;
using Core.OrderMng.SaleOrder;


using MediatR; 

namespace UserPanel.Application.ReturnOrder.GetReturnOrderItem;

public class GetReturnOrderItemByIdQueryHandler : IRequestHandler<GetReturnOrderItemByIdQuery, object>
{
    private readonly IReturnOrderRepository _repository;
    public GetReturnOrderItemByIdQueryHandler(IReturnOrderRepository repository)
    {
        _repository = repository;
    }
    public async Task<object> Handle(GetReturnOrderItemByIdQuery query, CancellationToken cancellationToken)
    {
        var Result = await _repository.GetByIdAsync(query.Id);
        return Result;
    }
}
