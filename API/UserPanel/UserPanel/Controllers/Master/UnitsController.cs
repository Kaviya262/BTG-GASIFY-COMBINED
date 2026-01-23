
using Application.Master.Units.CreateUnitsItem;
using Application.Master.Units.GetAllUnitsItem;
using Application.Master.Units.GetUnitsItemById;
using Application.Master.Units.UpdateUnitsItem;
using BackEnd.Units;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using static Core.Master.Units.UnitsItem;

namespace UserPanel.Controllers.Master.Units
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnitsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public UnitsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        #region GetAllUnits
        [HttpGet("get-all")] //getall
        public async Task<ActionResult<IEnumerable<object>>> GetAllUnits([FromQuery] string? UnitsCode,
            [FromQuery] int? BranchId, [FromQuery] DateTime? FromDate, [FromQuery] DateTime? ToDate)
        {
            /* if (unitsCode == null)
             {
                 return BadRequest(new { message = "Code Is Empty!" });
             }*/
            var unitsCode = string.IsNullOrWhiteSpace(UnitsCode) ? "" : UnitsCode;
            var units = await _mediator.Send(new GetAllUnitsItemQuery
            {
                UnitsCode = unitsCode
            });

            return Ok(units);
        }
        #endregion

        #region GetUnitsById
        [HttpGet("id/{UnitsId}")] //getById
        public async Task<ActionResult<object>> GetUnitsById(int UnitsId)
        {
            if (UnitsId == 0)
            {
                return BadRequest(new { message = "Id Is Empty!" });
            }
            var unititem = await _mediator.Send(new GetUnitsItemByIdQuery { Id = UnitsId });

            return Ok(unititem);
        }
        #endregion

        #region GetUnitsByCode
        [HttpGet("get-by-code/{UnitsCode}")]
        public async Task<ActionResult<object>> GetUnitsByCode(string UnitsCode)
        {
            if (UnitsCode == null)
            {
                return BadRequest(new { message = "Code Is Empty!" });

            }
            var unitcode = await _mediator.Send(new GetUnitsItemByIdQuery { SearchCode = UnitsCode });

            return Ok(unitcode);
        }
        #endregion

        #region CreateUnits
        [HttpPost("create")] // create unit
        public async Task<ActionResult<object>> CreateUnits([FromBody] CreateUnitsItemCommand command)
        {
            if (command == null)
            {
                return BadRequest(new { message = "Data Is Empty!" });
            }
            var createunit = await _mediator.Send(command);

            return Ok(createunit);
        }
        #endregion

        #region UpdateUnits
        [HttpPut("update")] //Update unit
        public async Task<ActionResult<object>> UpdateUnits(
            [FromBody] UpdateUnitsItemCommand command)
        {
            if (command == null)
            {
                return BadRequest(new { message = "No Id and Data!" });
            }

            var existId = await _mediator.Send(new GetUnitsItemByIdQuery { Id = command.Header.UOMId });
            if (existId == null)
            {
                return NotFound(new { message = "Given Id not Found!" });
            }

            var updateunit = await _mediator.Send(command);
            return Ok(updateunit);

        }
        #endregion

    }
}