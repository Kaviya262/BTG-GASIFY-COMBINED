using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.AddIRNGRNDet
{
    public class AddIRNGRNQuery : IRequest<object>
    {
        public List<InvoiceReceiptEntry> item { get; set; }
    }
}
