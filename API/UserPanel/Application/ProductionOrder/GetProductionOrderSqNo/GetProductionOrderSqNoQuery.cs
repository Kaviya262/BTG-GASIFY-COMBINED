using MediatR;

namespace UserPanel.Application.ProductionOrder.GetProductionOrderSqNo
{
    public  class GetProductionOrderSqNoQuery : IRequest<object>
    {

        public Int32 BranchId { get; set; }

    }
}






