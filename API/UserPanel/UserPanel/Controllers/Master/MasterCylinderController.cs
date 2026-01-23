using Application.OrderMngMaster.Common;
using Application.OrderMngMaster.Master.Cylinder.CreateCylinder;
using Application.OrderMngMaster.Master.Cylinder.GetAllCynlinderListing;
using Application.OrderMngMaster.Master.Cylinder.GetCylinderByID;
using Application.OrderMngMaster.Master.Cylinder.ToogleCylinderActiveStatus;
using Application.OrderMngMaster.Master.Cylinder.UpdateCylinder;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master
{
    [Route("api/[controller]")]
    [ApiController]
    public class MasterCylinderController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MasterCylinderController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateCylinderCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetAllCylinderListing")]
        public async Task<IActionResult> GetAllCylinderListing(
           [FromQuery] string? cylinderName = "",
           [FromQuery] string? fromDate = null,
           [FromQuery] string? toDate = null)
            {
            var normalizedCylinderName = string.IsNullOrWhiteSpace(cylinderName) ? "" : cylinderName;
            var normalizedFromDate = string.IsNullOrWhiteSpace(fromDate) ? "0000-00-00" : fromDate;
            var normalizedToDate = string.IsNullOrWhiteSpace(toDate) ? "9999-12-31" : toDate;

            var query = new GetAllCylinderListingQuery
            {
                CylinderName = normalizedCylinderName,
                FromDate = normalizedFromDate,
                ToDate = normalizedToDate
            };

            var result = await _mediator.Send(query);

            return Ok(result);
        }


        [HttpGet("GetByID")]
        public async Task<IActionResult> GetByID(int cylinderID, int branchId)
        {
            var result = await _mediator.Send(new GetCylinderByIDQuery() { CylinderId = cylinderID });
            return Ok(result);

        }

        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateCylinderCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("ToogleActiveStatus")]
        public async Task<IActionResult> ToogleActiveStatus([FromBody] ToogleCylinderActiveStatusCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

    }
}
