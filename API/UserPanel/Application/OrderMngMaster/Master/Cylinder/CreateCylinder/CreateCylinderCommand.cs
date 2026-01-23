using Core.Master.Cylinder;
using MediatR;

namespace Application.OrderMngMaster.Master.Cylinder.CreateCylinder
{
    public class CreateCylinderCommand : IRequest<object>
    {
        public MasterCylinder Cylinder { get; set; } = null!;
    }

}
