using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.getSUpplierPODetailsView
{
    public class getSupplierPODetailsView : IRequest<object>
    {
        public string po_id { get; set; }
        public int org_id { get; set; }
        public Int32 cid { get; set; }
    }
}
