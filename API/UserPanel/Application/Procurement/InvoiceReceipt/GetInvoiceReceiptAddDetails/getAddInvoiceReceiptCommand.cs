using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GetInvoiceReceiptAddDetails
{
    public class getAddInvoiceReceiptCommand : IRequest<object>
    {
        public string branchid { get; set; }
        public string orgid { get; set; }
        public string fromdate { get; set; }
        public string todate { get; set; }
    }
}
