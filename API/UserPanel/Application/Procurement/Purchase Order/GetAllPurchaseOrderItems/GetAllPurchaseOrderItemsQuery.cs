using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetAllPurchaseOrderItems
{
    public class GetAllPurchaseOrderItemsQuery : IRequest<object>
    {
        public int requestorid { get; set; }
        public int supplierid { get; set; }
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int poid { get; set; }
        public int userid { get; set; }
    }
}
