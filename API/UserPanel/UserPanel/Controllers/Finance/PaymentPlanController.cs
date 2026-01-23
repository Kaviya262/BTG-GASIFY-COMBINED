
using Application.Finance.ClaimApproval.GetAll;
using Application.Finance.PaymentPlan.Create;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Finance
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentPlanController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PaymentPlanController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Approve claim and payment.
        /// </summary>
        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] SavePaymentPlanCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll(Int32 Id, Int32 UserId, Int32 BranchId, Int32 orgid)
        {
            var result = await _mediator.Send(new GetAllPaymentPlanCommand() { BranchId = BranchId, OrgId = orgid, id = Id, userid = UserId });
            return Ok(result);
        }
    }
}
