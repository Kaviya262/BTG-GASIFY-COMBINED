using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.GoodsReceiptNote;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.AddIRN
{
    public class AddIRNQuery : IRequest<object>
    {
        public POSupplierItemHeader Header { get; set; }
        public List<POSupplierItemSummary> Details { get; set; }
        public List<POSupplierItemDetail> Requisition { get; set; }
    }
}
