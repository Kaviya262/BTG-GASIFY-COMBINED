using Application.Finance.PeriodicPaymentPlan.Create;
using Application.Finance.PeriodicPaymentPlan.GetAll;
using Application.Finance.PeriodicPaymentPlan.Voucher;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Finance
{
    [Route("api/[controller]")]
    [ApiController]
    public class PeriodicPaymentPlanController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PeriodicPaymentPlanController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // <summary>
        // Approve claim and periodic payment.
        // </summary>
        [HttpPost("Create")]
        public async Task<IActionResult> SavePaymentVoucher([FromBody] CreatePeriodicPaymentPlanCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll(Int32 Id, Int32 UserId, Int32 BranchId, Int32 orgid)
        {
            var result = await _mediator.Send(new GetAllPeriodicPaymentPlanCommand()
            {
                BranchId = BranchId,
                OrgId = orgid,
                id = Id,
                userid = UserId
            });

            return Ok(result);
        }

        [HttpGet("GetVoucher")]
        public async Task<IActionResult> GetVoucher(Int32 VoucherId, Int32 BranchId, Int32 orgid)
        {
            var result = await _mediator.Send(new GetVoucherCommand()
            {
                BranchId = BranchId,
                OrgId = orgid,
                voucherid = VoucherId
            });

            return Ok(result);
        }
    }
}
