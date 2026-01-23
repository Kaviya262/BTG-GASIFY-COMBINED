using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.InvoiceReceipt.PaymentHistory
{
    public class PaymentHistoryQuery : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int supplierid { get; set; }
        public string? fromdate { get; set; }
        public string? todate { get; set; }
 
    }
}
