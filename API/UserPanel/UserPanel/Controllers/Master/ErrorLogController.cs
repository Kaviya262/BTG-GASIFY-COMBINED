using Application.OrderMngMaster.Master.ErrorLogMaster;
using Application.Procurement.Master.Item.CreateItem;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master
{
    [Route("api/[controller]")]
    [ApiController]
    public class ErrorLogController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ErrorLogController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateErrorLogCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
