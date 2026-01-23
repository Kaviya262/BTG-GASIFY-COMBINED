using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Master.SearchbyCategory
{
    public class GetClaimtypeidCommand : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int categoryid { get; set; }
        public int claimtypeid { get; set; }
    }
}
