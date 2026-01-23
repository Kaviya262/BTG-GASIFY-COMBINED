using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimApproval.ClaimComments
{
    public class ClaimCommentsCommand : IRequest<object>
    {
        public Int32 claimid { get; set; }
        public Int32 level { get; set; }

    }
    
}

