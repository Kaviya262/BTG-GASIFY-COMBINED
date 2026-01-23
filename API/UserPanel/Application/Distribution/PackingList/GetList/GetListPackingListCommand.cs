using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Distribution.PackingList.GetList
{
    public class GetListPackingListCommand :IRequest<object>
    {
        public int OrgId { get; set; }
        public int SearchBy { get; set; }
        public int? CustomerId { get; set; }
        public int? GasCodeId { get; set; }
        public int? BranchId { get; set; }
        public int? PackerId { get; set; }

        public int? PackingId { get; set; }
        public int? PackingDetailsId { get; set; }
    }

}
