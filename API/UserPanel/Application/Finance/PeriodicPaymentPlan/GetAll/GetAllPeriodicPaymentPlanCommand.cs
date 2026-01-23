using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Finance.PeriodicPaymentPlan.GetAll
{
    public class GetAllPeriodicPaymentPlanCommand : IRequest<object>
    {
        public int id { get; set; }
        public int userid { get; set; }
        public int OrgId { get; set; }
        public Int32 BranchId { get; set; }
    }
}
