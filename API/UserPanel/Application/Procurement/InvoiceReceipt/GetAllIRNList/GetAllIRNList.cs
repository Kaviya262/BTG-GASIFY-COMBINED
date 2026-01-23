using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.InvoiceReceipt.GetAllIRNList
{
    public class GetAllIRNList : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int supplierid { get; set; }
        public string? fromdate { get; set; }
        public string? todate { get; set; }
        public int irnid { get; set; }
        public int userid { get; set; }
    }
}
