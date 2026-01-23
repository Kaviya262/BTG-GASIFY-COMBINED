using Application.FinanceModule.Report.GetListCashBook;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.FinanceModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class CashBookController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CashBookController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetCashBookList(
            [FromQuery] int orgid,
            [FromQuery] int branchid,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate)
        {
            var result = await _mediator.Send(new GetListCashBookQuery
            {
                OrgId = orgid,
                BranchId = branchid,
                FromDate = fromDate,
                ToDate = toDate
            });

            return Ok(result);
        }
    }
}
