using Core.OrderMng.PackingAndDO;
using MediatR;

namespace Application.PackingAndDO.BarcodeMachineScan
{

    public class BarcodeMachineScanCommand : IRequest<object>
    {
        public int PackingId { get; set; }
        public int UserId { get; set; }
 

    }



}