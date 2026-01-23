using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPurchaseOrderItem
{
    public class GetPurchaseOrderByIdQuery : IRequest<object>
    {
        public int poid { get; set; }
        public int branchid { get; set; }
        public int orgid { get; set; }
    }
}
