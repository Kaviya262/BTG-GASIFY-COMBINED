using Application;
using Application.Distribution.MasterSalesOrder.GetAll;
using Application.Distribution.Update;
using Application.PackingAndDO.CreatePackingAndDO;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.OrderManagement.Distribution.MasterSalesOrder
{
    [Route("api/[controller]")]
    [ApiController]
    public class MasterSalesOrderController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MasterSalesOrderController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("GetALL")]
        public async Task<IActionResult> GetAll(int searchBy, int customerId, int gascodeId, int branchId)
        {
            var query = new GetAllMasterSalesOrderCommand()
            {
                SearchBy = searchBy,
                CustomerId = customerId,
                GasCodeId = gascodeId,
                BranchId = 1
            };

            var result = await _mediator.Send(query);
            return Ok(result);
            }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreatePackingAndDOCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("Update")]
        public async Task<IActionResult> Update([FromBody] UpdatePackingAndDOCommands command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
