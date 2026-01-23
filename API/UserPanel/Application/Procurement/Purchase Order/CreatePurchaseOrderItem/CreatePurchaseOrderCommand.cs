using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.PurchaseOrder;

namespace Application.Procurement.Purchase_Order.CreatePurchaseOrderItem
{
    public class CreatePurchaseOrderCommand : IRequest<object>
    {
        public PurchaseOrderHeader Header { get; set; }
        public List<PurchaseOrderDetail> Details { get; set; }

        public List<PurchaseOrderRequisition> Requisition { get; set; }
    }
}
