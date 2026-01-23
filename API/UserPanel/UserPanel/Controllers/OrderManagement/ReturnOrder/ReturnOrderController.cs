 
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UserPanel.Application.ReturnOrder.CreateReturnOrderItem;
using UserPanel.Application.ReturnOrder.GetAllReturnOrderItems;
using UserPanel.Application.ReturnOrder.GetReturnOrderItem;
using UserPanel.Application.ReturnOrder.GetReturnOrderNo;
using UserPanel.Application.ReturnOrder.UpdateReturnOrderItem;



namespace UserPanel.Controllers.OrderManagement.ReturnOrder
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReturnOrderController : ControllerBase
    {

        private readonly IMediator _mediator;

        public ReturnOrderController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateReturnOrderItemCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetALL")]
        public async Task<IActionResult> GetAll(Int32 GasCode, int Customer, string FromDate, string ToDate, Int32 BranchId)
        {
            var result = await _mediator.Send(new GetAllReturnOrderItemsQuery() { gascodeid = GasCode, customerid = Customer, from_date = FromDate, to_date = ToDate, BranchId = BranchId });
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(new GetReturnOrderItemByIdQuery() { Id = id });

            if (result == null)
                return NotFound();

            return Ok(result);
        }
        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateReturnOrderItemCommand command)
        {


            var result = await _mediator.Send(command);


            return Ok(result);
        }

        [HttpGet("GetReturnOrderSeqNo")]
        public async Task<IActionResult> GetProductionOrderSeqNo(Int32 BranchId)
        {
            var result = await _mediator.Send(new GetReturnOrderNoQuery() { BranchId = BranchId });
            return Ok(result);
        }
    }
}
