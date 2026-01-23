using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Claim;
using MediatR;

namespace Application.Procurement.Master.UpdateClaimPayment
{
    public class UpdateClaimPayment : IRequest<object>
    {
        public ClaimDescriptionPay payment { get; set; }
    }
}
