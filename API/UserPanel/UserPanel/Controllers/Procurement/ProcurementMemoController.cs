
using Application.Finance.ClaimAndPayment.Delete;
using Application.Finance.ClaimAndPayment.Update;
using Application.Procurement.Purchase_Memo.CreatePurchaseMemoItem;
using Application.Procurement.Purchase_Memo.Delete;
using Application.Procurement.Purchase_Memo.GetAllPurchaseMemoItems;
using Application.Procurement.Purchase_Memo.GetPurchaseMemoItem;
using Application.Procurement.Purchase_Memo.GetPurchaseMemoSeqNo;
using Application.Procurement.Purchase_Memo.UpdatePurchaseMemoItem;
using Application.Procurement.Purchase_Memo.UploadDocument;
using Core.Models;
using Core.Procurement.PurchaseMemo;
using DocumentFormat.OpenXml.Spreadsheet;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Procurement
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProcurementMemoController : ControllerBase
    {
        private readonly IMediator _mediator;
 
        private readonly IWebHostEnvironment _env;
        public ProcurementMemoController(IMediator mediator, IWebHostEnvironment env)
        {
            _mediator = mediator;
            _env = env;
        }



        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreatePurchaseMemoCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }


        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdatePurchaseMemoItemCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Upload a document for claim and payment.
        /// </summary>
        [HttpPost("upload-doc")]
        public async Task<IActionResult> UploadDocument(List<IFormFile> file, [FromForm] int memoid, [FromForm] int BranchId, [FromForm] int UserId)
        {
            try
            {
                if (file == null || file.Count == 0)
                    return BadRequest("No file uploaded.");

                if (memoid <= 0)
                    return BadRequest("Invalid memoId.");

                var attachmentList = new List<MemoAttachment>();

                foreach (IFormFile row in file) { 
            if (row == null || row.Length == 0) return BadRequest("No file uploaded.");
            if (memoid <= 0) return BadRequest("Invalid claimPaymentId.");
              
                    var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles", "ProcurementMemo", memoid.ToString());
                    if (!Directory.Exists(uploadDir))
                    {
                        Directory.CreateDirectory(uploadDir);
                    }

                    var filePath = Path.Combine(uploadDir, row.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await row.CopyToAsync(stream);
                    }
                    attachmentList.Add(new MemoAttachment { Id = 0, MemoId = memoid, BranchId = BranchId, FileName = row.FileName, FilePath = uploadDir, UserId = UserId });


            }
                var result = await _mediator.Send(new UploadCommand{ attachmentList=attachmentList });


                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseModel
                {
                    Status = false,
                    Message = "Upload failed due to server error."
                });
            }
        }

        [HttpGet("GetALL")]
        public async Task<IActionResult> GetAll(int requesterid, Int32 BranchId, Int32 OrgId,string pmnumber, int userid)
        {
            var result = await _mediator.Send(new GetAllPurchaseMemoQuery() { requesterid = requesterid,  BranchId = BranchId,OrgId=OrgId, pmnumber= pmnumber,userid= userid });
            return Ok(result);
        }

        [HttpGet("GetById")]
        public async Task<IActionResult> GetById(int pmid, Int32 OrgId)
        {
            var result = await _mediator.Send(new GetPurchaseMemoByIdQuery { Id = pmid,OrgId=OrgId });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("GetPurchaseMemoSeqNo")]
        public async Task<IActionResult> GetInvoicesSiNo(Int32 BranchId,Int32 orgid)
        {
            var result = await _mediator.Send(new GetPurchaseMemoSeqNoQuery() { BranchId = BranchId,OrgId=orgid });
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

        [HttpPost("Delete")]
        public async Task<IActionResult> Delete([FromBody] DeleteMemoCommand command)
        {
            if (command == null) return BadRequest("Invalid payload.");
            var result = await _mediator.Send(command);
            return Ok(result);
        }



    }
}
