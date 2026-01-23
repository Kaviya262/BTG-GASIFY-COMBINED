using Core.OrderMng.PackingAndDO;
using MediatR;

namespace Application.PackingAndDO.PackingConfirmed
{

    public class PackingConfirmedCommand : IRequest<object>
    {
        public int PackingId { get; set; }
        public int UserId { get; set; }
 
        public Int32 rackid { get; set; }
    }



}