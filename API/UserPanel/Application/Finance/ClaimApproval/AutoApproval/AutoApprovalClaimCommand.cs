using Core.Finance.Approval; 
using MediatR;

namespace Application.Finance.ClaimApproval.AutoApproval
{
    public class AutoApprovalClaimCommand : IRequest<object>
    {
        public PPPApproval Approve { get; set; }
        
    }
    
}

