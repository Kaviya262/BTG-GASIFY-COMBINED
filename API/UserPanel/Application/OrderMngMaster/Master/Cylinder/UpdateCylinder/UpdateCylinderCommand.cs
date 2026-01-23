using Core.Master.Cylinder;
using MediatR;

namespace Application.OrderMngMaster.Master.Cylinder.UpdateCylinder
{
    public class UpdateCylinderCommand : IRequest<object>
    {
        public MasterCylinder Cylinder { get; set; } = null!;
    }
}
