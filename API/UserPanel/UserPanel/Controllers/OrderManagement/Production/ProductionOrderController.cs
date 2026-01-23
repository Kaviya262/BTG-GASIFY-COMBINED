using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UserPanel.Application.ProductionOrder.CreateProductionOrder;
using UserPanel.Application.ProductionOrder.GetAllProductionOrder;
using UserPanel.Application.ProductionOrder.GetProductionOrder;
using UserPanel.Application.ProductionOrder.GetProductionOrderSqNo;
using UserPanel.Application.ProductionOrder.UpdateProductionOrder;


 namespace UserPanel.Controllers.OrderManagement.Production
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionOrderController : ControllerBase
    {

        private readonly IMediator _mediator;

        public ProductionOrderController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateProductionOrderCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetALL")]
        public async Task<IActionResult> GetAll(int ProdId, string FromDate, string ToDate, Int32 BranchId)
        {
            var result = await _mediator.Send(new GetAllProductionOrderQuery() { ProdId= ProdId,  from_date = FromDate, to_date = ToDate, BranchId = BranchId });
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(new GetProductionOrderByIdQuery() { Id = id });

            if (result == null)
                return NotFound();

            return Ok(result);
        }
        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateProductionOrderCommand command)
        {


            var result = await _mediator.Send(command);


            return Ok(result);
        }

        [HttpGet("GetProductionOrderSeqNo")]
        public async Task<IActionResult> GetProductionOrderSeqNo(Int32 BranchId)
        {
            var result = await _mediator.Send(new GetProductionOrderSqNoQuery() { BranchId = BranchId });
            return Ok(result);
        }
    }
}
