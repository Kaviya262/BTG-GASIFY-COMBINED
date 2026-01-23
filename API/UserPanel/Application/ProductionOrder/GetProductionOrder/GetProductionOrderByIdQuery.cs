using MediatR;

namespace UserPanel.Application.ProductionOrder.GetProductionOrder;

public class GetProductionOrderByIdQuery : IRequest<object>
{
    public Int32 Id { get; set; }
   
}