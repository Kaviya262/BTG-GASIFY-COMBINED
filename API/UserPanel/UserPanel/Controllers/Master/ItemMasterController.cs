using Application.Procurement.Master.Item.CreateItem;
using Application.Procurement.Master.Item.Delete;
using Application.Procurement.Master.Item.GetAllItem;
using Application.Procurement.Master.Item.GetAllItemCategory;
using Application.Procurement.Master.Item.GetAllItemCode;
using Application.Procurement.Master.Item.GetAllItemGroup;
using Application.Procurement.Master.Item.GetAllItemName;
using Application.Procurement.Master.Item.GetAllUom;
using Application.Procurement.Master.Item.ItemCodeSeqId;
using Application.Procurement.Master.Item.UpdateItem;
using Application.Procurement.Master.Item.UpdateItemStatus;
using Application.Procurement.Master.Supplier.CreateSupplier;
using Application.Procurement.Master.Supplier.GetAllCountry;
using Application.Procurement.Master.Supplier.GetAllSupplier;
using Application.Procurement.Master.Supplier.UpdateSupplier;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemMasterController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ItemMasterController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-all-item")]
        public async Task<IActionResult> GetAllAsync([FromQuery] int branchid, [FromQuery] int orgid, [FromQuery] int itemid, [FromQuery] string? itemcode, [FromQuery] string? itemname,[FromQuery] int groupid, [FromQuery] int categoryid)
        {
            var query = new GetAllItemQuery
            {
                branchid = branchid,
                orgid = orgid,
                itemid = itemid,
                itemcode = itemcode,
                itemname = itemname,
                groupid = groupid,
                categoryid = categoryid

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }


        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateItemCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateItemCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("get-all-GetAllItemCategory")]
        public async Task<IActionResult> GetItemCategoryList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllItemCategoryCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetAllItemgroup")]
        public async Task<IActionResult> GetItemGroupList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllItemGroupCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetAllUom")]
        public async Task<IActionResult> GetUOMList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllUomCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetAllitemcode")]
        public async Task<IActionResult> GetItemCodeList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllItemCodeCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetAllitemname")]
        public async Task<IActionResult> GetItemNameList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAlltemNameCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }


        [HttpPut("Update-item-status")]
        public async Task<IActionResult> UpdateItemStatus([FromQuery] int branchid, [FromQuery] int orgid, [FromQuery] int itemid, [FromQuery] bool isactive, [FromQuery] int userid)
        {
            var command = new UpdateItemStatusCommand
            {
                branchid = branchid,
                orgid = orgid,
                itemid = itemid,
                isactive = isactive
                // If you want to include userid, you need to add it to the command class
            };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("UpdateIsActive")]
        public async Task<IActionResult> UpdateIsActive([FromQuery] int itemid, [FromQuery] bool isactive)
        {
            //var result = await _mediator.Send(command);
            //return Ok(result);
            var command = new UpdateIsActiveCommand
            {
                ItemId = itemid,
                IsActive = isactive
            };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("getItemCodeSeqId")]
        public async Task<IActionResult> GetItemCodeSeqIdGenerate([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetItemCodeSeqCommon
            {
                branchid = branchid,
                orgid = orgid

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

    }
}
