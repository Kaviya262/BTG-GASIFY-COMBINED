using Application.Barcode.DeleteBarcode;
using Application.Barcode.OptBarcodeScan;
using Application.Barcode.SaveBarcodeScan;
using Application.OrderMngMaster.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.OrderManagement.Barcode
{
    [Route("api/[controller]")]
    [ApiController]
    public class BarcodeController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BarcodeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("OptBarcodeScan")]
        public async Task<IActionResult> OptBarcodeScan(int PackingId)
        {
            var result = await _mediator.Send(new OptBarcodeScanCommand()
            {

                PackingId = PackingId
            });
            return Ok(result);
        }
        [HttpGet("SaveBarcodeScan")]
        public async Task<IActionResult> SaveBarcodeScan(int PackingId,int rackid)
        {
            var result = await _mediator.Send(new SaveBarcodeScanCommand()
            {
              
                PackingId = PackingId,
                rackid=rackid
            });
            return Ok(result);
        }
        [HttpPut("DeleteBarcode")]
        public async Task<IActionResult> DeleteBarcode(int BarcodeDtlid,int PackingId)
        {
            var result = await _mediator.Send(new DeleteBarcodeItemCommand()
            {
                BarcodeDtlid= BarcodeDtlid,
                PackingId= PackingId
            });
            return Ok(result);
        }
    }
}
