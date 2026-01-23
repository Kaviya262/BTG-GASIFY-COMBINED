using Application.OrderMngMaster.Master.Pallet.TooglePaletActiveStatus;
using Application.OrderMngMaster.Master.Pallet.CreatePallet;
using Application.OrderMngMaster.Master.Pallet.GetAllPalletListing;
using Application.OrderMngMaster.Master.Pallet.GetPalletByID;
using Application.OrderMngMaster.Master.Pallet.UpdatePallet;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master
{
    [Route("api/[controller]")]
    [ApiController]
    public class MasterPalletController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MasterPalletController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreatePalletCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetAllPalletListing")]
        public async Task<IActionResult> GetAllPalletList(int orgId, int branchId, int? palletTypeId, int? GasCodeId)
        {
            var result = await _mediator.Send(new GetAllPalletListingQuery() {OrgId=orgId,BranchId=branchId,PalletTypeId=palletTypeId, GasCodeId = GasCodeId});
            return Ok(result);
        }

        [HttpGet("GetByID")]
        public async Task<IActionResult> GetByID(int palletID,int orgId ,int branchId)
        {
            var result = await _mediator.Send(new GetPalletByIDQuery() { PalletId = palletID,OrgId =orgId,BranchId = branchId });
            return Ok(result);
        }

        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdatePalletCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("ToogleActiveStatus")]
        public async Task<IActionResult> ToogleActiveStatus([FromBody] TooglePalletActiveStatusCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
