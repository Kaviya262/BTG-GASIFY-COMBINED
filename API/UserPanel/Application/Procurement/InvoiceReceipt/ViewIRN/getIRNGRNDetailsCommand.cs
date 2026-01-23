using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.ViewIRN
{
    public class getIRNGRNDetailsCommand : IRequest<object>
    {
        public int receiptnote_hdr_id { get; set; }
    }
}
