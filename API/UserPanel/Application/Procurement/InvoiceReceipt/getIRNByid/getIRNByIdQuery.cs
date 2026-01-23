using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.getIRNByid
{
    public class getIRNByIdQuery : IRequest<object>
    {
        public int irnid { get; set; }
        public int branchid { get; set; }
        public int orgid { get; set; }
    }
}
