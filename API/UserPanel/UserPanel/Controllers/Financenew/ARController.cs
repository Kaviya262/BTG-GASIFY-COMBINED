using Application.Finance.ClaimAndPayment.Create;
using Application.Finance.ClaimAndPayment.GetById;
using Application.Finance.ClaimAndPayment.Update;
using Application.Financenew.AR.ARBook;
using Application.Financenew.AR.Create;
using Application.Financenew.AR.GetById;
using Application.Financenew.AR.Update;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Financenew
{
    [Route("api/[controller]")]
    [ApiController]
    public class ARController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ARController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Create new AR.
        /// </summary>
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateARCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Update existing AR.
        /// </summary>
        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdateARCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        // <summary>
        // Get a AR by ID.
        // </summary>
        [HttpGet("get-by-id")]
        public async Task<IActionResult> GetById([FromQuery] int customerid, int orgId, int branchId)
        {
            var result = await _mediator.Send(new GetByIdARCommand
            {
                customerid = customerid,
                orgId = orgId,
                branchId=branchId
            });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

 
        [HttpGet("getARBook")]
        public async Task<IActionResult> getARBook([FromQuery] int orgid = 1,
            int branchid = 1,
            int customer_id = 0,
            DateTime? from_date = null,
            DateTime? to_date = null)
        {
            var result = await _mediator.Send(new GetARBookCommand
            {
                customer_id = customer_id,
                orgid = orgid,
                branchid = branchid,
                from_date=from_date,
                to_date=to_date
            });

            if (result == null)
                return NotFound();

            return Ok(result);
        }
    }
}
