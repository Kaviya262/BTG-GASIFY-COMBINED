using MediatR;

namespace Application.OrderMngMaster.Master.Cylinder.GetCylinderByID
{
    public class GetCylinderByIDQuery : IRequest<object>
    {
        public int CylinderId { get; set; }
    }
}
