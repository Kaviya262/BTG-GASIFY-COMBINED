using Application.AccessRights.Departmentdropdown;
using Application.AccessRights.GetAllAccessRights;
using Application.AccessRights.GetAllbyId;
using Application.AccessRights.GetApprovalSettings;
using Application.AccessRights.GetMenusDetails;
using Application.AccessRights.GetUserAccess.GetUserAccessCommand;
using Application.AccessRights.ModuleScreen;
using Application.AccessRights.Roledropdown;
using Application.AccessRights.SaveAccessRights;
using Application.AccessRights.UpdateAccessRights;
using Core.AccessRights;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.AcessRights
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccessRightsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AccessRightsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("GetMenusDetails")]
        public async Task<IActionResult> GetMenusDetails(int userid, int branchId, int orgid)
        {
            var result = await _mediator.Send(new GetMenusDetailsCommand() { userid = userid, orgid = orgid, branchId = branchId });
            return Ok(result);
        }

        [HttpGet("GetApprovalSettings")]
        public async Task<IActionResult> GetApprovalSettings(int userid, int branchId, Int32 orgid, Int32 screenid)
        {
            var result = await _mediator.Send(new GetApprovalSettingsCommand() { branchId = branchId, orgid = orgid, userid = userid, screenid = screenid });
            return Ok(result);
        }

        [HttpGet("GetRolesDropdown")]
        public async Task<IActionResult> GetRolesDropdown(int branchId, int orgId)
        {
            var result = await _mediator.Send(new RoledropdownCommand());
            return Ok(result);
        }

        [HttpGet("GetDepartmentsDropdown")]
        public async Task<IActionResult> GetDepartmentsDropdown(int branchId, int orgId)
        {
            var result = await _mediator.Send(new DepartmentdropdownCommand());
            return Ok(result);
        }

        [HttpGet("GetModuleScreens")]
        public async Task<IActionResult> GetModuleScreens(int branchId, int orgId)
        {
            var result = await _mediator.Send(new ModuleScreenCommand
            {
                BranchId = branchId,
                OrgId = orgId
            });

            return Ok(result);
        }

        [HttpPost("SaveAccessRights")]
        public async Task<IActionResult> SaveAccessRights([FromBody] SaveAccessRightsCommand command)
        {
            if (command?.Header == null)
                return BadRequest("Invalid request");

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("UpdateAccessRights/{headerId}")]
        public async Task<IActionResult> UpdateAccessRights(int headerId, [FromBody] UpdateAccessRightsCommand command)
        {
            if (command?.Request == null)
                return BadRequest("Invalid request");

            command.Request.HeaderId = headerId;

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetAllAccessRights")]
        public async Task<IActionResult> GetAllAccessRights(int branchId, int orgId)
        {
            var result = await _mediator.Send(new GetAllAccessRightsCommand
            {
                BranchId = branchId,
                OrgId = orgId
            });
            return Ok(result);
        }

        [HttpGet("GetAccessRightsById")]
        public async Task<IActionResult> GetAccessRightsById(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid Id");

            var result = await _mediator.Send(new GetAllByIdCommand(id));
            return Ok(result);
        }

        [HttpGet("GetUserAccess")]
        public async Task<IActionResult> GetUserAccess(int userId, int branchId, int orgId)
        {
            if (userId <= 0)
                return BadRequest("Invalid UserId");

            var result = await _mediator.Send(new GetUserAccessCommand
            {
                UserId = userId,
                BranchId = branchId,
                OrgId = orgId
            });

            return Ok(result);
        }



    }
}
