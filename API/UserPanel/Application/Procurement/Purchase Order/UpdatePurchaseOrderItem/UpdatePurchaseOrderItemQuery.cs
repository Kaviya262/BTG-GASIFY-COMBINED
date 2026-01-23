using Core.Procurement.PurchaseOrder;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.UpdatePurchaseOrderItem
{
    public class UpdatePurchaseOrderItemQuery : IRequest<object>
    {
        public PurchaseOrderHeader Header { get; set; }
        public List<PurchaseOrderDetail> Details { get; set; }

        public List<PurchaseOrderRequisition> Requisition { get; set; }
    }
}
