using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using Core.Finance.PaymentPlan;
using MediatR;

namespace Application.Finance.PaymentPlan.Create
{
    public class SavePaymentPlanCommand : IRequest<object>
    {
        public PaymentPlanHdr Approve { get; set; }
        
    }
    
}

