using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GenerateInvoiceReceiptIRN
{
    public class GenerateInvoiceReceiptIRNQuery : IRequest<object>
    {
        public List<InvoiceReceiptEntry> item { get; set; }
    }
}
