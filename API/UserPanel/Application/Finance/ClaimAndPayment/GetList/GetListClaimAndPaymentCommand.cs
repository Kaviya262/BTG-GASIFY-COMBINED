using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Finance.ClaimAndPayment.GetList
{
    public class GetListClaimAndPaymentCommand : IRequest<object>
    {
        public int departmentid { get; set; }
        public int categoryid { get; set; }
        public int OrgId { get; set; }
        public int currencyid { get; set; }
        public Int32 BranchId { get; set; }
        public Int32 user_id { get; set; }
        public Int32 claimtypeid { get; set; }
    }
}
