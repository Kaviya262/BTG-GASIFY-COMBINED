using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Purchase_Order.GetPurchaseOrderPrint
{
    public class GetPurchaseOrderPrintQuery : IRequest<object>
    {
        public Int32 opt { get; set; }
        public Int32 poid { get; set; }
        public Int32 branchid { get; set; }
        public Int32 orgid { get; set; }
    }
}
