using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.ReturnOrder;
 

using MediatR;
using UserPanel.Application.ReturnOrder.GetAllReturnOrderItems;


//namespace UserPanel.Application.ReturnOrder.GetAllReturnOrderItems;

public class GetAllReturnOrderItemsQueryHandler : IRequestHandler<GetAllReturnOrderItemsQuery, object>
{
    private readonly IReturnOrderRepository _repository;

    public GetAllReturnOrderItemsQueryHandler(IReturnOrderRepository repository)
    {
        _repository = repository;
    }
    public async Task<object> Handle(GetAllReturnOrderItemsQuery command, CancellationToken cancellationToken)
    {
        var Result = await _repository.GetAllAsync(command.customerid, command.from_date, command.to_date, command.BranchId,command.gascodeid);
        return Result;
    }
}







