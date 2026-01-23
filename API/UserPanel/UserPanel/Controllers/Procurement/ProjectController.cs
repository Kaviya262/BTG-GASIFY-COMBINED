using Application.Procurement.Master.Project.CreateProject;
using Application.Procurement.Master.Project.GetByIdProject;
using Application.Procurement.Master.Project.GetListProject;
using Application.Procurement.Master.Project.UpdateProject;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Procurement
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProjectController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateProjectCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdateProjectCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("get-by-id")]
        public async Task<IActionResult> GetProjectById([FromQuery] int projectid, int branchid, int orgid)
        {
            var result = await _mediator.Send(new GetByIdProjectQuery
            {
                projectid = projectid,
                branchid = branchid,
                orgid = orgid
            });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetListProject([FromQuery] string? projectcode, [FromQuery] string? projectname, [FromQuery] int? userid, int branchid, int orgid)
        {
            var result = await _mediator.Send(new GetListProjectQuery
            {
                projectcode = projectcode,
                projectname = projectname,
                userid = userid ?? 0,
                branchid = branchid,
                orgid = orgid
            });

            return Ok(result);
        }
    }
}
