using Application.Order.GetAllExportOrder;
using Application.Order.GetOrderItem;
using Application.Order.GetOrderSoNo;
using Application.Order.PrintOrder;
using Application.Order.UpdateOrderItem;
 
using Core.Models;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UserPanel.Application.Order.CreateOrderItem;
using UserPanel.Application.Order.GetAllOrderItems;

namespace UserPanel.Controllers.OrderManagement.Order
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OrderController(IMediator mediator)
        {
            _mediator = mediator;
        }


        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateOrderItemCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }


        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateOrderItemCommand command)
        {


            var result = await _mediator.Send(command);


            return Ok(result);
        }



        [HttpGet("GetALL")]
        public async Task<IActionResult> GetAll(int customerid, string FromDate, string ToDate, Int32 BranchId,int FilterType,string PO)
        {
            var result = await _mediator.Send(new GetAllOrderItemsQuery() { customerid = customerid, from_date = FromDate, to_date = ToDate, BranchId = BranchId, FilterType = FilterType });
            return Ok(result);
        }



        [HttpGet("GetById")]
        public async Task<IActionResult> GetById(int orderid)
        {
            var result = await _mediator.Send(new GetOrderItemByIdQuery { Id = orderid  });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("GetOrderSeqNo")]
        public async Task<IActionResult> GetOrderSeqNo(Int32 BranchId)
        {
            var result = await _mediator.Send(new GetOrderSoNoQuery() { BranchId = BranchId });
            return Ok(result);
        }

        [HttpGet("GetAllExportAsync")]
        public async Task<IActionResult> GetAllExportAsync(int customerid, string FromDate, string ToDate, Int32 BranchId, int FilterType, string PO)
        {
            try
            {
                var result = await _mediator.Send(new GetAllExportOrderQuery() { customerid = customerid, from_date = FromDate, to_date = ToDate, BranchId = BranchId, PO = PO, FilterType = FilterType });
                return File(result.stream, result.contentType, result.fileName);
            }
            catch (Exception ex)
            {
                ResponseModel RM = new ResponseModel()
                {
                    Data = null,
                    Message = "Data not available",
                    Status = false

                };
                return Ok(RM);
            }
        }

        [HttpGet("PrintOrder")]
        public async Task<IActionResult> PrintOrder(int customerid, string FromDate, string ToDate, Int32 BranchId, int FilterType, string PO   )
        {
            try
            {


                var result = await _mediator.Send(new PrintOrderQuery() { customerid = customerid, from_date = FromDate, to_date = ToDate, BranchId = BranchId,PO=PO,FilterType=FilterType });
                return File(result.stream, result.contentType, result.fileName);
            }
            catch (Exception ex)
            {
                ResponseModel RM = new ResponseModel()
                {
                    Data = null,
                    Message = "Data not available",
                    Status = false

                };
                return Ok(RM);
            }
        }




    }
}
