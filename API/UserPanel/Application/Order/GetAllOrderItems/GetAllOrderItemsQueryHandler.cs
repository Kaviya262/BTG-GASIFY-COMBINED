using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.SaleOrder;

using MediatR;
using MySqlX.XDevAPI.Common;
using UserPanel.Application.Order.GetAllOrderItems;
using UserPanel.Application.Quotation.GetAllQuotationItems;

namespace Application.Order.GetAllOrderItems;

public class GetAllOrderItemsQueryHandler : IRequestHandler<GetAllOrderItemsQuery, object>
{
    private readonly ISaleOrderRepository _repository;

    public GetAllOrderItemsQueryHandler(ISaleOrderRepository repository)
    {
        _repository = repository;
    }
    public async Task<object> Handle(GetAllOrderItemsQuery command, CancellationToken cancellationToken)
    {
        var Result = await _repository.GetAllAsync(command.customerid, command.from_date, command.to_date, command.BranchId,command.PO,command.FilterType,command.type);
        return Result;
    }
}







