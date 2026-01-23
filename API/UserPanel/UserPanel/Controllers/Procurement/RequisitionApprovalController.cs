using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Application.Procurement.RequisitionApproval.GetAll;
using Application.Finance.ClaimApproval.Approval;
using Application.Procurement.RequisitionApproval.Approval;
using Application.Finance.ClaimApproval.Remarks;
using Application.Finance.ClaimApproval.GetHistory;
using Application.Procurement.RequisitionApproval.Remarks;
using Application.Procurement.RequisitionApproval.GetHistory;

namespace UserPanel.Controllers.Procurement
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequisitionApprovalController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RequisitionApprovalController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Approve claim and payment.
        /// </summary>
        

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll(Int32 Id, Int32 UserId, Int32 BranchId, Int32 orgid)
        {
            var result = await _mediator.Send(new GetAllApproveRequisitionCommand() { Opt = 1, BranchId = BranchId, OrgId = orgid, id = Id, userid = UserId });
            return Ok(result);
        }

        [HttpPost("Approve")]
        public async Task<IActionResult> Approve([FromBody] ApproveRequisitionCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetRemarksHistory")]
        public async Task<IActionResult> GetRemarksHistory(Int32 prid)
        {
            var result = await _mediator.Send(new RemarksRequisitionCommand() { prid = prid });
            return Ok(result);
        }

        [HttpGet("GetHistory")]
        public async Task<IActionResult> GetHistory(Int32 Id, Int32 UserId, Int32 BranchId, Int32 orgid, string fromdate, string todate)
        {
            var result = await _mediator.Send(new GetHistoryRequisitionApproveCommand() { BranchId = BranchId, OrgId = orgid, id = Id, userid = UserId, fromdate = fromdate, todate = todate });
            return Ok(result);
        }
    }
}

