using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.PackingAndDO;
using MediatR;

namespace Application.PackingAndDO.acknowledgement
{
    public class acknowledgementCommand : IRequest<object>
    {

     public List<packingacknowledgement> ack { get; set; }
        public Int32 UserId { get; set; }
    }
}


