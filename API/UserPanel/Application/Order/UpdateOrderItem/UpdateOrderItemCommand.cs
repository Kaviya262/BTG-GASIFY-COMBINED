using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.SaleOrder;
using MediatR;

namespace Application.Order.UpdateOrderItem
{
    public  class UpdateOrderItemCommand : IRequest<object>
    {


        public SaleOrderItemHeader Header { get; set; }

        public List<SaleOrderItemDetail> Details { get; set; }

        public List<salesquatation> SQDetail { get; set; }
    }
}
