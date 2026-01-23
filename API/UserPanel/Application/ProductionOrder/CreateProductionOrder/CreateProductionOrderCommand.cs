using Core.OrderMng.ProductionOrder;

using MediatR;

namespace UserPanel.Application.ProductionOrder.CreateProductionOrder;

public class CreateProductionOrderCommand : IRequest<object>
{
    public ProductionItemsHeader Header { get; set; }

    public List<ProductionItemsDetail> Details { get; set; }
}
