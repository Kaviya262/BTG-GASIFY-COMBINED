
using Application.FinanceModule.Report.CommonReport;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.FinanceModule
{
    [Route("api/[controller]")]
    [ApiController]
    public class FinanceReportController : ControllerBase
    {

        private readonly IMediator _mediator;

        public FinanceReportController(IMediator mediator)
        {
            _mediator = mediator;
        }


        [HttpGet("SalesReport")]
        public async Task<IActionResult> SalesReport([FromQuery] int orgid,  
            [FromQuery] string? fromDate, [FromQuery] string? toDate, int customerid,int gasid)
        {
            var result = await _mediator.Send(new CommonReportQuery
            {
                opt=1,
                orgid = orgid,
                customerid = customerid,
                Fromdate = fromDate,
                Todate = toDate,
                gasid = gasid
            });

            return Ok(result);
        }
        [HttpGet("ProfitAndLossReport")]
        public async Task<IActionResult> ProfitAndLossReport([FromQuery] int orgid,
           [FromQuery] string? fromDate, [FromQuery] string? toDate, int currencyid)
        {
            var result = await _mediator.Send(new CommonReportQuery
            {
                opt = 2,
                orgid = orgid,
                currencyid = currencyid,
                Fromdate = fromDate,
                Todate = toDate,
                
            });

            return Ok(result);
        }
    }
}
