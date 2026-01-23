using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GetAll
{
    public class GetAllinvoice : IRequest<object>
    {
        public int supplier_id { get; set; }
        public int org_id { get; set; }
        public int branchid { get; set; }

    }
}
