using Core.OrderMng.ProductionOrder;
using Core.OrderMngMaster.Users;
using MediatR;
namespace UserPanel.Application.ProductionOrder.UpdateProductionOrder;

public class UpdateUseryCommand : IRequest<object>
{
    public MasterUsers MasterUser { get; set; }
}