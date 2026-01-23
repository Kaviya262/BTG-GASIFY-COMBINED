using Application.Finance.PettyCash.GetSequencesNumber;
using Application.FinanceModule.PettyCash.CreatePettyCash;
using Application.FinanceModule.PettyCash.GetByIdPettyCash;
using Application.FinanceModule.PettyCash.GetListPettyCash;
using Application.FinanceModule.PettyCash.UpdatePettyCash;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.FinanceModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class PettyCashController : ControllerBase
    {
        private readonly IMediator _mediator;
        public PettyCashController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreatePettyCashCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdatePettyCashCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("get-by-id")]
        public async Task<IActionResult> GetById([FromQuery] int pettycashid, int branchid, int orgid)
        {
            var result = await _mediator.Send(new GetByIdPettyCashQuery
            {
                PettyCashId = pettycashid,
                BranchId = branchid,
                OrgId = orgid
            });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList(int branchid, int orgid, [FromQuery] int? pettycashid, string? exptype = null, string? voucherno = null)
        {
            var result = await _mediator.Send(new GetListPettyCashQuery
            {
                PettyCashId = pettycashid ?? 0,
                ExpType = exptype ?? "",
                VoucherNo = voucherno ?? "",
                BranchId = branchid,
                OrgId = orgid
            });

            return Ok(result);
        }

        [HttpGet("expense-descriptions")]
        public async Task<IActionResult> GetExpenseList(int branchid, int orgid)
        {
            var result = await _mediator.Send(new GetListPettyCashQuery
            {
                PettyCashId = 0,
                ExpType = null,
                BranchId = branchid,
                OrgId = orgid,
                Opt = 5  // key here to fetch expense descriptions
            });

            return Ok(result);
        }

        [HttpGet("get-seq-num")]
        public async Task<IActionResult> GetSequenceNumber(Int32 BranchId, Int32 orgid, int userid)
        {
            var result = await _mediator.Send(new GetSequencesNumberPettyCash() { BranchId = BranchId, orgid = orgid, userid = userid });
            return Ok(result);
        }

    }
}
