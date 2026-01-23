
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Invoices.GetAllInvoicesItems
{
    public class GetAlllnvoicesItemsQuery : IRequest<object>
    {

        public int customerid { get; set; }
 
        public string from_date { get; set; }
        public string to_date { get; set; }
        public Int32 BranchId { get; set; }
        public int typeid { get; set; }
    }
}


