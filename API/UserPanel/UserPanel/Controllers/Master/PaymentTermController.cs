using Application.Master.PaymentTerms.CreatePaymentTermItem;
using Application.Master.PaymentTerms.GetAllPaymentTermItem;
using Application.Master.PaymentTerms.GetPaymentTermItemById;
using Application.Master.PaymentTerms.UpdatePaymentTermItem;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master.PaymentTerm
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentTermController : ControllerBase
    {
        private readonly IMediator _mediator;
        public PaymentTermController(IMediator mediator)
        {
            _mediator = mediator;
        }
        #region GetAllPaymentTerm
        [HttpGet("get-all")] //getall
        public async Task<ActionResult<IEnumerable<object>>> GetAllPaymentTerm([FromQuery] string? payTermCode,
            [FromQuery] int? BranchId, [FromQuery] DateTime? FromDate, [FromQuery] DateTime? ToDate)
        {

            var paymentTermCode = string.IsNullOrWhiteSpace(payTermCode) ? "" : payTermCode;
            var payterms = await _mediator.Send(new GetAllPaymentTermItemQuery { PayTermCode = paymentTermCode });

            return Ok(payterms);
        }
        #endregion

        #region GetPaymentTermById
        [HttpGet("id/{PaymentTermId}")] //getById
        public async Task<ActionResult<object>> GetPaymentTermById(int PaymentTermId)
        {
            if (PaymentTermId == 0)
            {
                return BadRequest(new { message = "Id Is Empty!" });
            }
            var payterm = await _mediator.Send(new GetPaymentTermItemByIdQuery { Id = PaymentTermId });

            return Ok(payterm);
        }
        #endregion

        #region GetPaymentTermByCode
        [HttpGet("code/{PaymentTermCode}")]
        public async Task<ActionResult<object>> GetPaymentTermByCode(string PaymentTermCode)
        {
            if (PaymentTermCode == null)
            {
                return BadRequest(new { message = "SearchCode Is Empty!!" });
            }
            var paycode = await _mediator.Send(new GetPaymentTermItemByIdQuery { SearchCode = PaymentTermCode });
            if (paycode == null)
            {
                return NotFound(new { message = "No Match Found!" });
            }

            return Ok(paycode);
        }
        #endregion

        #region CreatePaymentTerm
        [HttpPost("create")] // create term
        public async Task<ActionResult<object>> CreatePaymentTerm([FromBody] CreatePaymentTermItemCommand command)
        {
            if (command == null)
            {
                return BadRequest(new { message = "Data Is Empty!!" });
            }
            var createterm = await _mediator.Send(command);

            return Ok(createterm);
        }
        #endregion

        #region UpdatePaymentTerm
        [HttpPut("update")] //Update Term
        public async Task<ActionResult<object>> UpdatePaymentTerm(
            [FromBody] UpdatePaymentTermItemCommand command)
        {
            if (command == null)
            {
                return BadRequest(new { message = "Data is Empty!" });
            }

            var existId = await _mediator.Send(new GetPaymentTermItemByIdQuery { Id = command.Header.PaymentTermId });
            if (existId == null)
            {
                return NotFound(new { message = "Given Id not Found!" });
            }

            var updateterm = await _mediator.Send(command);

            return Ok(updateterm);

        }
        #endregion

        #region Toggle User Active Status

        /// <summary>
        /// Toggles the active status of a user.
        /// </summary>
        /// <param name="command">The command containing user ID and active status information.</param>

        [HttpPost("change-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdatePaymentTermItemCommand command)
        {
            if (command == null)
            {
                return BadRequest("Active status data is required.");
            }

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        #endregion

    }
}
