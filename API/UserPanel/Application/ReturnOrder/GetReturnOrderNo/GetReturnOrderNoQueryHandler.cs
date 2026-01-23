using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Quotation;
using Core.ReturnOrder;
using Core.OrderMng.SaleOrder;
using MediatR; 

namespace UserPanel.Application.ReturnOrder.GetReturnOrderNo;

public class GetReturnOrderNoQueryHandler : IRequestHandler<GetReturnOrderNoQuery, object>
{
    private readonly IReturnOrderRepository _repository;


    public GetReturnOrderNoQueryHandler(IReturnOrderRepository repository)
    {
        _repository = repository;
    }

   

    public async Task<object> Handle(GetReturnOrderNoQuery command,CancellationToken cancellationToken)
    {


        var Result = await _repository.GetProductionOrderSqNoQuery(command.BranchId);
        return Result;

    }

   
}





