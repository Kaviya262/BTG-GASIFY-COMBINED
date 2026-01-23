using MediatR;

namespace Application.OrderMngMaster.Master.Gas.GetGasByID
{
    public class GetGasByIDQuery : IRequest<object>
    {
        public int GasId { get; set; }
    }
}
