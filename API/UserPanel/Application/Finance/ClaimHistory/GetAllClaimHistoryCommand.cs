using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Finance.ClaimHistory
{
    public class GetAllClaimHistoryCommand : IRequest<object>
    {
        public string fromdate { get; set; }
        public string todate { get; set; }
        public int branchid { get; set; }
        public int orgid { get; set; }
    }
}
