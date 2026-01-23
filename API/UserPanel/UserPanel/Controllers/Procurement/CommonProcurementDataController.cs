using Application.OrderMngMaster.Common;
using Application.Procurement.Master.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Procurement
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommonProcurementDataController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;
        public CommonProcurementDataController(IMediator mediator , IWebHostEnvironment env)
        {
            _mediator = mediator;
            _env = env;
        }



        [HttpGet("GetUserDetails")]
        public async Task<ActionResult> GetUserDetails(int BranchId,string SearchText,Int32 orgid,Int32 id)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 1,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                Id = id
            });
            return Ok(result);
        }
        [HttpGet("GetDepartMentDetails")]
        public async Task<ActionResult> GetDepartMentDetails(int BranchId, string SearchText, Int32 orgid, Int32 id)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 2,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                Id = id
            });
            return Ok(result);
        }
        [HttpGet("GetPurchaseTypeDetails")]
        public async Task<ActionResult> GetPurchaseTypeDetails(int BranchId, string SearchText, Int32 orgid, Int32 id)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 3,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                Id = id
            });
            return Ok(result);
        }
        [HttpGet("GetUomDetails")]
        public async Task<ActionResult> GetUomDetails(int BranchId, string SearchText, Int32 orgid, Int32 id)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 4,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                Id = id
            });
            return Ok(result);
        }
        [HttpGet("GetItemDetails")]
        public async Task<ActionResult> GetItemDetails(int BranchId, string SearchText, Int32 orgid, Int32 id,int groupid)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 5,
                branchid = BranchId,
                searchtext = SearchText,
                orgid=orgid,
                Id=id,
                groupid= groupid

            });
            return Ok(result);
        }
        [HttpGet("GetPRType")]
        public async Task<ActionResult> GetPRType(int BranchId, string SearchText, Int32 orgid, Int32 id)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 6,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                Id = id

            });
            return Ok(result);
        }
        [HttpGet("GetSupplierDetails")]
        public async Task<ActionResult> GetSupplierDetails(int BranchId, string SearchText, Int32 orgid, Int32 id)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 7,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                Id = id

            });
            return Ok(result);
        }

        [HttpGet("GetPOSupplierDetails")]
        public async Task<ActionResult> GetPOSupplierDetails(int BranchId, string SearchText, Int32 orgid, Int32 id)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 13,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                Id = id

            });
            return Ok(result);
        }
        [HttpGet("GetPaymentTermsDetails")]
        public async Task<ActionResult> GetPaymentTermsDetails(int BranchId, string SearchText, Int32 orgid, Int32 id)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 8,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                Id = id

            });
            return Ok(result);
        }
        [HttpGet("GetDeliveryTermsDetails")]
        public async Task<ActionResult> GetDeliveryTermsDetails(int BranchId, string SearchText, Int32 orgid, Int32 id)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 9,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                Id = id

            });
            return Ok(result);
        }

        [HttpGet("GetItemGroup")]
        public async Task<ActionResult> GetItemGroup(int BranchId, string SearchText, Int32 orgid, Int32 id)
        {

            var result = await _mediator.Send(new CreatePurchaseCommonMasterCommand()
            {
                opt = 10,
                branchid = BranchId,
                searchtext = SearchText,
                orgid = orgid,
                Id = id

            });
            return Ok(result);
        }

        [HttpGet("download-file")]
        public IActionResult DownloadFile([FromQuery] string file_path, Int32 file_id)
        {
            var rootPath = _env.ContentRootPath;

            file_path = file_path.TrimStart('\\', '/');


            var fullPath = Path.Combine(rootPath, file_path);

            if (!System.IO.File.Exists(fullPath))
                return NotFound("File not found.");

            var mimeType = "application/octet-stream"; // Or detect using extension
            var fileName = Path.GetFileName(fullPath);

            var fileBytes = System.IO.File.ReadAllBytes(fullPath);
            return File(fileBytes, mimeType, fileName);
        }
    }
}
