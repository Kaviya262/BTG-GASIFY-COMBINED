using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.Approval;
using MediatR;

namespace Application.Procurement.RequisitionApproval.Approval
{
    public class ApproveRequisitionCommand : IRequest<object>
    {
        public RequisitionApprovalHdr Approve { get; set; }
    }
}
