using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Invoices.GetInvoicesSiNo
{
    public class GetInvoicesSiNoQuery : IRequest<object>
    {

        public Int32 BranchId { get; set; }
        public int typeid { get; set; }
    }
}
