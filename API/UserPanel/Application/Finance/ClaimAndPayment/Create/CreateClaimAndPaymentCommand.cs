using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Create
{
    public class CreateClaimAndPaymentCommand : IRequest<object>
    {
        public ClaimAndPaymentHeader Header { get; set; }
        public List<ClaimAndPaymentDetail> Details { get; set; }
    }
    
}

