using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimApproval.Remarks
{
    public class RemarksClaimCommand : IRequest<object>
    {
        public Int32 claimid { get; set; }
        
    }
    
}

