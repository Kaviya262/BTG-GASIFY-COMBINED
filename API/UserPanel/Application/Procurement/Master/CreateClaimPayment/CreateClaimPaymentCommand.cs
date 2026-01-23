using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Claim;
using Core.Master.Item;
using MediatR;

namespace Application.Procurement.Master.CreateClaimPayment
{
    public class CreateClaimPaymentCommand : IRequest<object>
    {
        public ClaimDescriptionPay payment { get; set; }
        public Int32 id { get; set; }
    }
}
