using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Order.GetOrderItem
{
    public class GetOrderItemByIdQuery : IRequest<object>
    {
        public Int32 Id { get; set; }

       

    }
}
