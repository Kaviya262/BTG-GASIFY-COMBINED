using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.SearchBy
{
    public class getSearchbySupplierduedate : IRequest<object>
    {
        public string branchid { get; set; }
        public int orgid { get; set; }
        public int supplierid { get; set; }
        public string fromdate { get; set; }
        public string todate { get; set; }
    }
}
