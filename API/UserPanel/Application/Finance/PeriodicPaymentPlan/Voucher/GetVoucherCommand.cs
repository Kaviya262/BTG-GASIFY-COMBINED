using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Finance.PeriodicPaymentPlan.Voucher
{
    public class GetVoucherCommand : IRequest<object>
    {
        public int voucherid { get; set; }
        public int userid { get; set; }
        public int OrgId { get; set; }
        public Int32 BranchId { get; set; }
    }
}
