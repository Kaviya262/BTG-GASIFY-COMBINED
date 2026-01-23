using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.ReturnOrder;
using Core.OrderMng.SaleOrder;
using MediatR;

namespace UserPanel.Application.ReturnOrder.UpdateReturnOrderItem;

public  class UpdateReturnOrderItemCommand : IRequest<object>
{

    public ReturnOrderItemHeader Header { get; set; }

    public List<ReturnOrderItemDetail> Details { get; set; }

    public List<ReturnOrderItemGas> GasDetail { get; set; }
    public List<ReturnOrderItemDO> DODetail { get; set; }

}
