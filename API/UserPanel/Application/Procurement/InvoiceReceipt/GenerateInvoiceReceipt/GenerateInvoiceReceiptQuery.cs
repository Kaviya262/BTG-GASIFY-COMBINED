using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GenerateInvoiceReceipt
{
    public class GenerateInvoiceReceiptQuery : IRequest<object>
    {
        public POSupplierItemHeader Header { get; set; }
    }
}
