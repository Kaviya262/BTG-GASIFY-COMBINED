using Core.OrderMng.ProductionOrder;
using MediatR;
namespace UserPanel.Application.ProductionOrder.UpdateProductionOrder;

public class UpdateProductionOrderCommand : IRequest<object>
{
    public ProductionItemsHeader Header { get; set; }

    public List<ProductionItemsDetail> Details { get; set; }
}