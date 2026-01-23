using Application.Master.DepartmentItem.GetDepartmentItemById;
using Application.Master.DepartmentItem.CreateDepartmentItem;
using Application.Master.DepartmentItem.GetAllDepartmentItem;
using Application.Master.DepartmentItem.UpdateDepartmentItem;
using BackEnd.Currency;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Application.Master.DepartmentItem.GetAllDepartmentITem;

namespace UserPanel.Controllers.Master.Department
{
    [Route("api/[Controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DepartmentController(IMediator mediator)
        {
            _mediator = mediator;
        }
        #region CreateDepartment
        [HttpPost("create")]
        public async Task<ActionResult<object>> CreateDepartment([FromBody] CreateDepartmentItemCommand command)
        {
            if (command == null)
            {
                return BadRequest(new { message = "No Data Found!!" });
            }
            var Depart = await _mediator.Send(command);

            return Depart;
            // return CreatedAtAction(nameof(GetDepartmentById), new { id = Depart },
            //new { message = "Created Department!", data = Depart });
        }
        #endregion
        #region GetAllDepartment
        [HttpGet("get-all")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllDepartment(string? DeptCode, string? DeptName)
        {
            var code = String.IsNullOrEmpty(DeptCode) ? "" : DeptCode;

            var name = String.IsNullOrWhiteSpace(DeptName) ? "" : DeptName;

            var departments = await _mediator.Send(new GetAllDepartmentItemQuery

            {

                DepartCode = code,

                DepartName = name

            });


            return Ok(departments);
        }
        #endregion
        #region GetDepartmentById
        [HttpGet("id/{Id}")]
        public async Task<IActionResult> GetDepartmentById(int DepartId)
        {
            if (DepartId == 0)
            {
                return NotFound(new { message = "ID not found!." });
            }
            var departments = await _mediator.Send(new GetDepartmentItemByIdQuery { Id = DepartId });

            return Ok(departments);
        }
        #endregion
        #region GetDepartmentByCode
        [HttpGet("code/{DepartmentCode}")]
        public async Task<IActionResult> GetDepartmentByCode(string DepartmentCode)
        {
            if (DepartmentCode == null)
            {
                return NotFound(new { message = "Code not Found!" });

            }
            else if(DepartmentCode == "undefined")
            {
                DepartmentCode = "";
            }
                var departcodes = await _mediator.Send(new GetDepartmentItemByIdQuery { DepartmentCode = DepartmentCode });

            return Ok(departcodes);
        }
        #endregion
        #region GetDepartmentByName
        [HttpGet("name/{DepartmentName}")]
        public async Task<IActionResult> GetDepartmentByName(string DepartmentName)
        {
            if (DepartmentName == null)
            {
                return BadRequest(new { message = "Department Name Missing!" });
            }
            else if (DepartmentName == "undefined")
            {
                DepartmentName = "";
            }
            var departnames = await _mediator.Send(new GetDepartmentItemByIdQuery { DepartmentName = DepartmentName });

            return Ok(departnames);

        }
        #endregion

        #region UpdateDepartment
        [HttpPut("update")]
        public async Task<IActionResult> UpdateDepartment([FromBody] UpdateDepartmentItemCommand command)
        {
            if (command == null)
            {
                return BadRequest(new { message = "Data Missing!" });
            }
            var existId = await _mediator.Send(new GetDepartmentItemByIdQuery { Id = command.Header.DepartmentId });
            if (existId == null)
            {
                return NotFound(new { message = "Department Id not Found!!" });
            }
            //command.Header.DepartmentId = command.DepartId;
            var result = await _mediator.Send(command);

            return Ok(result);
        }
        #endregion















    }
}
