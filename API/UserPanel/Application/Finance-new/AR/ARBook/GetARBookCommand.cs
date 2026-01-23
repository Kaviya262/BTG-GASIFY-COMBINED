using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Financenew.AR.ARBook
{
    public class GetARBookCommand : IRequest<object>
    {
        public int orgid { get; set; }
        public int branchid { get; set; }
        public int customer_id { get; set; }

        public DateTime? from_date { get; set; } = null;
        public DateTime? to_date { get; set; } = null;

    }
}
