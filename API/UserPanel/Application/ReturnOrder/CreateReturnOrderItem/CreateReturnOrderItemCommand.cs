using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.SaleOrder;
using Core.OrderMng.Quotation;
using MediatR;
using Core.ReturnOrder;

namespace UserPanel.Application.ReturnOrder.CreateReturnOrderItem;

    public class CreateReturnOrderItemCommand : IRequest<object>
    {
        public ReturnOrderItemHeader Header { get; set; }

        public List<ReturnOrderItemDetail> Details { get; set; }

        public List<ReturnOrderItemGas> GasDetail { get; set; }
        public List<ReturnOrderItemDO> DODetail { get; set; }




    }


