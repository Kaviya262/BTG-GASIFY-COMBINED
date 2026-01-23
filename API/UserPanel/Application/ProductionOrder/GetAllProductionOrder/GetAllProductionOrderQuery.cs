using MediatR;

namespace UserPanel.Application.ProductionOrder.GetAllProductionOrder;

public class GetAllProductionOrderQuery : IRequest<object>
{    
    public Int32 ProdId { get;set; }
    public string from_date { get; set; }
    public string to_date { get; set; }
    public Int32 BranchId { get; set; }
}