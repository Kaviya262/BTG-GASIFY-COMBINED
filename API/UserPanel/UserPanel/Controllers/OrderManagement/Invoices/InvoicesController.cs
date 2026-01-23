using Application.Order.GetOrderItem;
using Application.Order.GetOrderSoNo;
using Application.Invoices.CreateInvoicesItem;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using UserPanel.Application.Invoices.CreateInvoicesItem;
using Application.Order.UpdateOrderItem;
using UserPanel.Application.Order.GetAllOrderItems;
using Application.Invoices.UpdateInvoicesitem;
using Application.Invoices.GetAllInvoicesItems;
using Application.Invoices.GetInvoicesItem;
using Application.Invoices.GetInvoicesSiNo;




namespace UserPanel.Controllers.OrderManagement.Invoices
{

    [Route("api/[controller]")]
    [ApiController]
    public class InvoicesController : ControllerBase
    {
        private readonly IMediator _mediator;


        public InvoicesController(IMediator mediator)
        {
            _mediator = mediator;
        }



        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateInvoicesItemCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }






        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateInvoicesItemCommand command)
        {


            var result = await _mediator.Send(command);


            return Ok(result);
        }



        [HttpGet("GetALL")]
        public async Task<IActionResult> GetAll(int customerid, string FromDate, string ToDate, Int32 BranchId,Int32 type)
        {
            var result = await _mediator.Send(new GetAlllnvoicesItemsQuery() { customerid = customerid, from_date = FromDate, to_date = ToDate, BranchId = BranchId, typeid= type });
            return Ok(result);
        }



        [HttpGet("GetById")]
        public async Task<IActionResult> GetById(int invoicesid)
        {
            var result = await _mediator.Send(new GetInvoicesItemByIdQuery { Id = invoicesid });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("GetInvoicesSiNo")]
        public async Task<IActionResult> GetInvoicesSiNo(Int32 BranchId, Int32 type)
        {
            var result = await _mediator.Send(new GetInvoicesSiNoQuery() { BranchId = BranchId,typeid=type });
            return Ok(result);
        }






    }


}