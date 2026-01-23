using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.SaleOrder;
using Core.OrderMng.Quotation;
using MediatR;

namespace UserPanel.Application.Order.CreateOrderItem;

public class CreateOrderItemCommand : IRequest<object>
{
    public SaleOrderItemHeader Header { get; set; }

    public List<SaleOrderItemDetail> Details { get; set; }

    public List<salesquatation> SQDetail { get; set; }

    


}



