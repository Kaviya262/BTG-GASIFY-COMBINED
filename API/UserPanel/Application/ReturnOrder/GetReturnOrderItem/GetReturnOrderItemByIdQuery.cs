using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace UserPanel.Application.ReturnOrder.GetReturnOrderItem;

public class GetReturnOrderItemByIdQuery : IRequest<object>
{
    public Int32 Id { get; set; }

   

}
