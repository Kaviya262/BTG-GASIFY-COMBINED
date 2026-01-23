using Application.FinanceModule.Revenue.CreateRevenue;
using Application.FinanceModule.Revenue.GetByIdRevenue;
using Application.FinanceModule.Revenue.GetListRevenue;
using Application.FinanceModule.Revenue.GetSequenceNumber;
using Application.FinanceModule.Revenue.UpdateRevenue;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.FinanceModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class RevenueController : ControllerBase
    {
        private readonly IMediator _mediator;
        public RevenueController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateRevenueCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdateRevenueCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("get-by-id")]
        public async Task<IActionResult> GetById([FromQuery] int revenueid, int branchid, int orgid)
        {
            var result = await _mediator.Send(new GetByIdRevenueQuery
            {
                RevenueId = revenueid,
                BranchId = branchid,
                OrgId = orgid
            });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList(int branchid, int orgid, [FromQuery] int? revenueid, string? revtype = null, string? voucherno = null)
        {
            var result = await _mediator.Send(new GetListRevenueQuery
            {
                RevenueId = revenueid ?? 0,
                RevenueType = revtype ?? "",
                VoucherNo = voucherno ?? "",
                BranchId = branchid,
                OrgId = orgid
            });

            return Ok(result);
        }

        [HttpGet("revenuetype-list")]
        public async Task<IActionResult> GetRevenueTypeList(int branchid, int orgid)
        {
            var result = await _mediator.Send(new GetListRevenueQuery
            {
                RevenueId = 0,
                RevenueType = null,
                BranchId = branchid,
                OrgId = orgid,
                Opt = 5  // key here to fetch revenue type list
            });

            return Ok(result);
        }

        [HttpGet("get-seq-num")]
        public async Task<IActionResult> GetSequenceNumber(Int32 BranchId, Int32 orgid, int userid)
        {
            var result = await _mediator.Send(new GetSequenceNumberRevenueCommand() { BranchId = BranchId, orgid = orgid, userid = userid });
            return Ok(result);
        }

    }
}
