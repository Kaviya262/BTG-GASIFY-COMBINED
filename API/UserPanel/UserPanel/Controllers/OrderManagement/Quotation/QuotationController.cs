using Application.Quotation.CopyQuotationItem;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UserPanel.Application.Quotation.CreateQuotationItem;
using UserPanel.Application.Quotation.CustomerCreation;
using UserPanel.Application.Quotation.DeleteTodoItem;
using UserPanel.Application.Quotation.GetAllQuotationItems;
using UserPanel.Application.Quotation.GetQuotationItem;
using UserPanel.Application.Quotation.GetQuotationSqNo;
using UserPanel.Application.Quotation.UpdateQuotationItem;

namespace UserPanel.Controllers.OrderManagement.Quotation
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuotationController : ControllerBase
    {

        private readonly IMediator _mediator;

        public QuotationController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateQuotationItemCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetALL")]
        public async Task<IActionResult> GetAll(int SQID, string FromDate, string ToDate,Int32 BranchId )
        {
            var result = await _mediator.Send(new GetAllQuotationItemsQuery() { sys_sqnbr = SQID, from_date = FromDate, to_date = ToDate,BranchId= BranchId });
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<IActionResult> GetById(int id, int Categories)
        {
            var result = await _mediator.Send(new GetQuotationItemByIdQuery() { Id = id });

           if (result == null)
                return NotFound();

            return Ok(result);
        }





        [HttpPut("Update")]
        public async Task<IActionResult> Update( [FromBody] UpdateQuotationItemCommand command)
        {
            

            var result = await _mediator.Send(command);
 

            return Ok(result);
        }

        [HttpGet("GetQuotationSeqNo")]
        public async Task<IActionResult> GetQuotationSeqNo(Int32 BranchId)
        {
            var result = await _mediator.Send(new GetQuotationSqNoQuery() { BranchId= BranchId });
            return Ok(result);
        }

        [HttpGet("Copy")]
        public async Task<IActionResult> Copy(int id)
        {
            var result = await _mediator.Send(new CopyQuotationItemByIdQuery { Id = id });

            if (result == null)
                return NotFound();

            return Ok(result);
        }
        [HttpGet("Delete")]
        public async Task<IActionResult> Delete(int Id, int IsActive, int userid)
        {
            var result = await _mediator.Send(new DeleteQuotationItemCommand { Id = Id,IsActive=IsActive,userid=userid });
            return Ok(result);
        }

        [HttpPost("CreateCustomer")]
        public async Task<IActionResult> CreateCustomer([FromBody] CustomerCreationCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
