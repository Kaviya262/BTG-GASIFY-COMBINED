using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Finance.PaymentPlan;
using Core.Finance.PeriodicPaymentPlan;
using DocumentFormat.OpenXml.Math;
using MediatR;

namespace Application.Finance.PeriodicPaymentPlan.Create
{
    public class CreatePeriodicPaymentPlanCommand : IRequest<object>
    {
        public PeriodicPaymentPlanHdr Approve { get; set; }
    }
}
