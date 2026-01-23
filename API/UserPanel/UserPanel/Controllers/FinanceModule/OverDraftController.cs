using Application.FinanceModule.OverDraft.CreateOverDraft;
using Application.FinanceModule.OverDraft.GetByIdOverDraft;
using Application.FinanceModule.OverDraft.GetListOverDraft;
using Application.FinanceModule.OverDraft.GetSequencesNumber;
using Application.FinanceModule.OverDraft.UpdateOverDraft;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.FinanceModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class OverDraftController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OverDraftController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // 🔹 Create OverDraft
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateOverDraftCommand command)
        {
            if (command == null)
                return BadRequest("Invalid payload.");

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        // 🔹 Update OverDraft
        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdateOverDraftCommand command)
        {
            if (command == null)
                return BadRequest("Invalid payload.");

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        // 🔹 Get OverDraft by ID
        [HttpGet("get-by-id")]
        public async Task<IActionResult> GetById([FromQuery] int overdraftid, int branchid, int orgid)
        {
            var result = await _mediator.Send(new GetByIdOverDraftQuery
            {
                OverDraftId = overdraftid,
                BranchId = branchid,
                OrgId = orgid
            });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        // 🔹 Get OverDraft List
        [HttpGet("list")]
        public async Task<IActionResult> GetList(int branchid, int orgid, [FromQuery] int? overdraftid, string? overdrafttype = null, string? voucherno = null)
        {
            var result = await _mediator.Send(new GetListOverDraftQuery
            {
                OverDraftId = overdraftid ?? 0,
                OverDraftType = overdrafttype ?? "",
                VoucherNo = voucherno ?? "",
                BranchId = branchid,
                OrgId = orgid
            });

            return Ok(result);
        }

        // 🔹 Get OverDraft Sequence Number
        [HttpGet("get-seq-num")]
        public async Task<IActionResult> GetSequenceNumber(int branchid, int orgid, int userid)
        {
            var result = await _mediator.Send(new GetSequencesNumberOverDraft
            {
                BranchId = branchid,
                orgid = orgid,
                userid = userid
            });

            return Ok(result);
        }
    }
}
