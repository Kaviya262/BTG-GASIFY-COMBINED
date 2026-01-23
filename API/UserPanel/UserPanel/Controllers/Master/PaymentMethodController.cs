using Application.Master.PaymentMethodItem.CreatePaymentMethodItem;
using Application.Master.PaymentMethodItem.GetAllPaymentMethodItem;
using Application.Master.PaymentMethodItem.GetPaymentMethodItemById;
using Application.Master.PaymentMethodItem.UpdatePaymentMethodItem;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master.PaymentMethod
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentMethodController : ControllerBase
    {
        private readonly IMediator _mediator;
        public PaymentMethodController(IMediator mediator)
        {
            _mediator = mediator;
        }
        #region GetAllPaymentMethod
        [HttpGet("get-all")] //getall
        public async Task<ActionResult<IEnumerable<object>>> GetAllPaymentMethod([FromQuery] string? paymethodcode,
            [FromQuery] int? BranchId, [FromQuery] DateTime? FromDate, [FromQuery] DateTime? ToDate)
        {
            var payMCode = string.IsNullOrWhiteSpace(paymethodcode) ? "" : paymethodcode;

            var paymethods = await _mediator.Send(new GetAllPaymentMethodItemQuery
            { PayMethodCode = payMCode });

            return Ok(paymethods);
        }
        #endregion

        #region GetPaymentMethodById
        [HttpGet("id/{PaymethodId}")]
        public async Task<IActionResult> GetPaymentMethodById(int PaymethodId)
        {
            if (PaymethodId == 0)
            {
                return NotFound(new { message = "Id Not Found!" });
            }
            var paymethod = await _mediator.Send(new GetPaymentMethodItemByIdQuery { Id = PaymethodId });

            return Ok(paymethod);
        }
        #endregion

        #region GetPaymentMethodByCode
        [HttpGet("code/{PaymentMethodCODE}")]
        public async Task<IActionResult> GetPaymentMethodByCode(string PaymentMethodCODE)
        {
            if (PaymentMethodCODE == null)
            {
                return BadRequest(new { message = "Search Code Is Empty!" });
            }
            var paycodes = await _mediator.Send(new GetPaymentMethodItemByIdQuery
            { PayMethodCode = PaymentMethodCODE });

            return Ok(paycodes);
        }
        #endregion

        #region CreatePaymentMethod
        [HttpPost("create")]
        public async Task<IActionResult> CreatePaymentMethod([FromBody]
                                                    CreatePaymentMethodItemCommand command)
        {
            if (command == null)
            {
                return BadRequest(new { message = "Insert Data Is Empty!" });
            }
            var paymethod = await _mediator.Send(command);

            return Ok(paymethod);

        }
        #endregion

        #region UpdatePaymentMethod
        [HttpPut("update")]
        public async Task<IActionResult> UpdatePaymentMethod([FromBody]
                                             UpdatePaymentMethodItemCommand command)
        {
            if (command == null)
            {
                return BadRequest(new { message = "Update Data Is Empty!" });
            }
            var existPMID = await _mediator.Send(new GetPaymentMethodItemByIdQuery { Id = command.Header.PaymentMethodId });
            if (existPMID == null)
                return BadRequest(new { message = "Given ID not Found!" });

            var payupdate = await _mediator.Send(command);

            return Ok(payupdate);
        }
        #endregion


    }

}
