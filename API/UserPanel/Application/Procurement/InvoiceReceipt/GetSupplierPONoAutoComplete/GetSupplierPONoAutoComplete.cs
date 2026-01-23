using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GetSupplierPONoAutoComplete
{
    public class GetSupplierPONoAutoComplete : IRequest<object>
    {
        public int supplier_id { get; set; }
        public int category_id { get; set; }
        public int org_id { get; set; }
    }
}
