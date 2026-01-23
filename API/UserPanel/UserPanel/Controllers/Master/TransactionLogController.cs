using Application.OrderMngMaster.Master.TransactionLogMaster;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionLogController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TransactionLogController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateTransactionLogCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
