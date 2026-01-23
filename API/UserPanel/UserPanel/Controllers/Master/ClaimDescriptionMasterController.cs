using Application.Master.DepartmentItem.GetDepartmentItemById;
using Application.Procurement.InvoiceReceipt.GenerateInvoiceReceipt;
using Application.Procurement.Master.CategoryTypes;
using Application.Procurement.Master.ClaimDescription;
using Application.Procurement.Master.CreateClaimPayment;
using Application.Procurement.Master.DescriptionStatusChange;
using Application.Procurement.Master.GetAllPaymentDescription;
using Application.Procurement.Master.GetClaimPaymentById;
using Application.Procurement.Master.Item.CreateItem;
using Application.Procurement.Master.Item.GetAllItemCode;
using Application.Procurement.Master.Item.UpdateItem;
using Application.Procurement.Master.SearchbyCategory;
using Application.Procurement.Master.UpdateClaimPayment;
using Core.Master.Claim;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClaimDescriptionMasterController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ClaimDescriptionMasterController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("get-all-category")]
        public async Task<IActionResult> GetAllCategory([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllCategoryQuery
            {
                branchid = branchid,
                orgid = orgid,
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-category-types")]
        public async Task<IActionResult> GetAllCategorytypes([FromQuery] int branchid, [FromQuery] int orgid, [FromQuery] int typeid)
        {
            var query = new GetCategoryTypesQuery
            {
                branchid = branchid,
                orgid = orgid,
                typeid = typeid,
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateClaimPaymentCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateClaimPayment command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpGet("GetDescriptionEditId")]
        public async Task<IActionResult> GetDescriptionEditId(int id)
        {
            if (id == 0){ return NotFound(new { message = "ID not found!." }); }
            var ClaimDescription = await _mediator.Send(new GetClaimPaymentByIdQuery { Id = id });

            return Ok(ClaimDescription);
        }
        [HttpGet("get-all-GetAllPaymentDescription")]
        public async Task<IActionResult> GetpaymentDescriptionList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllPaymentDescriptionCommand
            {
                branchid = branchid,
                orgid = orgid,
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpPut("DescriptionstatusChange")]
        public async Task<IActionResult> DescriptionstatusChange([FromBody] DescriptionStatusChangeQuery command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpGet("searchbyCategory")]
        public async Task<IActionResult> searchbyCategory([FromQuery] int branchid, [FromQuery] int orgid, [FromQuery] int categoryid, [FromQuery] int claimtypeid)
        {
           var query = new GetClaimtypeidCommand
            {
                branchid = branchid,
                orgid = orgid,
                categoryid= categoryid,
                claimtypeid= claimtypeid
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}
