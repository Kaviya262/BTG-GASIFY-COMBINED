using Application.OrderMngMaster.Master.Gas.CreateGas;
using Application.OrderMngMaster.Master.Gas.GetAllGasListing;
using Application.OrderMngMaster.Master.Gas.GetAllGasTypes;
using Application.OrderMngMaster.Master.Gas.GetGasByID;
using Application.OrderMngMaster.Master.Gas.ToogleGasActiveStatus;
using Application.OrderMngMaster.Master.Gas.UpdateGas;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master
{
    [Route("api/[controller]")]
    [ApiController]
    public class MasterGasController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MasterGasController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateGasCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetAllGasListing")]
        public async Task<IActionResult> GetAllGasListing(string gasName = "", string volume = "", string pressure = "")
        {
            var result = await _mediator.Send(new GetAllGasListingQuery() { GasName = gasName, volume = volume, pressure = pressure });
            return Ok(result);
        }

        [HttpGet("GetAllGasTypes")]
        public async Task<IActionResult> GetAllGasTypes()
        {
            var result = await _mediator.Send(new GetAllGasTypesQuery());
            return Ok(result);
        }

        [HttpGet("GetByID")]
        public async Task<IActionResult> GetByID(int gasID)
        {
            var result = await _mediator.Send(new GetGasByIDQuery() { GasId = gasID });
            return Ok(result);
        }

        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateGasCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("ToogleActiveStatus")]
        public async Task<IActionResult> ToogleActiveStatus([FromBody] ToogleGasActiveStatusCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
