using Application;
using Application.Distribution.MasterSalesOrder.GetAll;
using Application.Distribution.PackingList.Create;
using Application.Distribution.PackingList.GetbyId;
using Application.Distribution.PackingList.GetList;
using Application.PackingAndDO.ExportPackingAndDO;
using Application.PackingAndDO.GetPackingItem;
using Core.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.OrderManagement.Distribution.PackingListOrder
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackingListOrderController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PackingListOrderController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("GetALL")]
        public async Task<IActionResult> GetAll(int searchBy, int customerId, int gascodeId, int branchId)
        {
            var query = new GetListPackingListCommand()
            {
                SearchBy = searchBy,
                CustomerId = customerId,
                GasCodeId = gascodeId,
                BranchId = 1
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create(string Barcode, int packingdetails, int packingId, int RackId, bool isSubmitted, int userId, string packNo)
        {
            var query = new CreatePackingListCommand()
            {
                Barcodes = Barcode,
                PackingDetailsId = packingdetails,
                PackingId = packingId,
                RackId = RackId,
                IsSubmitted = isSubmitted,
                userId=userId,
                PackNo = packNo
            };

            var result = await _mediator.Send(query);
            return Ok(result);

        }

        [HttpGet("GetAllExportAsync")]
        public async Task<IActionResult> GetAllExportAsync(int Types, Int32 BranchId)
        {
            try
            {
                var result = await _mediator.Send(new ExportPackingAndDOQuery()
                {
                    Types = Types,
                    BranchId = BranchId,
                   
                });
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
        [HttpGet("GetByIdBarcode")]
        public async Task<IActionResult> GetByIdBarcode([FromQuery] int packingId, [FromQuery] int packingDetailsId, [FromQuery] int userId, [FromQuery] int branchId = 1)
        {
           
            var query = new GetByIdPackingBarcode
            {
                PackingId = packingId,
                PackingDetailsId = packingDetailsId,
                BranchId = branchId
            };

            var result = await _mediator.Send(query);

            if (result == null)
            {
                return NotFound("No records found for the given parameters.");
            }

            return Ok(result);
        }

    }
}
