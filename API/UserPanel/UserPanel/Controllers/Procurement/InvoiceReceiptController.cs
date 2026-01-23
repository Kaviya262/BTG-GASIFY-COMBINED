using Application.Procurement.InvoiceReceipt.AddIRN;
using Application.Procurement.InvoiceReceipt.AddIRNGRNDet;
using Application.Procurement.InvoiceReceipt.GenerateInvoiceReceipt;
using Application.Procurement.InvoiceReceipt.GenerateInvoiceReceiptIRN;
using Application.Procurement.InvoiceReceipt.GetAll;
using Application.Procurement.InvoiceReceipt.GetInvoiceReceiptAddDetails;
using Application.Procurement.InvoiceReceipt.getIRNDetails;
using Application.Procurement.InvoiceReceipt.GetSupplierGRNAutoComplete;
using Application.Procurement.InvoiceReceipt.GetSupplierPODetailsEditView;
using Application.Procurement.InvoiceReceipt.getSUpplierPODetailsView;
using Application.Procurement.InvoiceReceipt.GetSupplierPONoAutoComplete;
using Application.Procurement.InvoiceReceipt.SearchBy;
using Application.Procurement.InvoiceReceipt.UpdatePOSupplierItemDetailsView;
using Application.Procurement.InvoiceReceipt.UploadDocument;
using Application.Procurement.InvoiceReceipt.UploadInvoiceReceipts;
using Application.Procurement.InvoiceReceipt.ViewIRN;
using Application.Procurement.Master.SearchbyCategory;
using Application.Procurement.Purchase_Requitision.RequisitionUploadDocument;
using Core.Models;
using Core.Procurement.InvoiceReceipt;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;


namespace UserPanel.Controllers.Procurement
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoiceReceiptController : ControllerBase
    {
        //public IActionResult Index()
        //{
        //    return View();
        //}
        
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;

        public InvoiceReceiptController(IMediator mediator, IWebHostEnvironment env)
        {
            _mediator = mediator;
            _env = env;
        }
        

        [HttpGet("GetPONoAutoComplete")]
        public async Task<IActionResult> GetPONoAutoComplete(int supplier_id, int category_id, int org_id)
        {
            var result = await _mediator.Send(new GetSupplierPONoAutoComplete() { supplier_id = supplier_id, category_id = category_id, org_id = org_id });
            return Ok(result);
        }
        [HttpGet("GetSupplierGRNAutoComplete")]
        public async Task<IActionResult> GetSupplierGRNAutoComplete(int supplier_id, int category_id, int org_id)
        {
            var result = await _mediator.Send(new GetSupplierGRNAutoComplete() { supplier_id = supplier_id, category_id = category_id, org_id = org_id });
            return Ok(result);
        }

        [HttpGet("getSupplierPODetailsView")]
        public async Task<IActionResult> getSupplierPODetailsView(string po_id, int org_id,int cid)
        {
            var result = await _mediator.Send(new getSupplierPODetailsView() { po_id = po_id, org_id = org_id,cid= cid });
            return Ok(result);
        }
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll(Int32 supplierid, int org_id,int branchid)
        {
            var result = await _mediator.Send(new GetAllinvoice() { supplier_id = supplierid, org_id = org_id,branchid= branchid });
            return Ok(result);
        }

        [HttpPut("updateSupplierPODetailsView")]
        public async Task<IActionResult> updateSupplierPODetailsView([FromBody] UpdateSupplierPOItemDetailsQuery command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPut("InvoiceReceiptGenerate")]
        public async Task<IActionResult> InvoiceReceiptGenerate([FromBody] GenerateInvoiceReceiptQuery command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPut("InvoiceReceiptDocumentUpload")]
        public async Task<IActionResult> InvoiceReceiptDocumentUpload([FromBody] UploadCommandInvoice command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPost("AddIRN")]
        public async Task<IActionResult> AddIRN([FromBody] AddIRNQuery command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("getSupplierPODetailsEditView")]
        public async Task<IActionResult> getSupplierPODetailsEditView(int po_id, int org_id)
        {
            var result = await _mediator.Send(new getSupplierPODetailsEditViewQuery() {po_id = po_id, org_id = org_id });
            return Ok(result);
        }
        [HttpGet("download-invoice")]
        public IActionResult DownloadInvoice([FromQuery] string file_path, Int32 receiptnote_hdr_id)
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
        [HttpGet("searchbySupplierId")]
        public async Task<IActionResult> searchbySupplierId([FromQuery] string branchid, [FromQuery] int orgid, [FromQuery] int supplierid, [FromQuery] string fromdate, [FromQuery] string todate)
        {
            var query = new getSearchbySupplierduedate
            {
                branchid = branchid,
                orgid = orgid,
                supplierid = supplierid,
                fromdate = fromdate,
                todate = todate
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("InvoicereceiptNoteDetails")]
        public async Task<IActionResult> InvoicereceiptNoteDetails([FromQuery] int receiptnote_hdr_id)
        {
            var query = new getIRNGRNDetailsCommand
            {
                receiptnote_hdr_id = receiptnote_hdr_id,
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("getInvoicereceiptAddDetails")]
        public async Task<IActionResult> getInvoicereceiptAddDetails([FromQuery] string branchid, [FromQuery] string orgid, [FromQuery] string fromdate, [FromQuery] string todate)
        {
            var query = new getAddInvoiceReceiptCommand
            {
                branchid = branchid,
                orgid = orgid,
                fromdate = fromdate,
                todate = todate,
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpPost("AddIRNGRNDet")]
        public async Task<IActionResult> AddIRNGRNDet([FromBody] AddIRNGRNQuery command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpGet("getIRNReceiptDetails")]
        public async Task<IActionResult> getIRNReceiptDetails([FromQuery] string branchid, [FromQuery] string orgid, [FromQuery] string fromdate, [FromQuery] string todate)
        {
            var query = new getIRNDetailsCommand
            {
                branchid = branchid,
                orgid = orgid,
                fromdate = fromdate,
                todate = todate,
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpPost("upload-attachment")]
        public async Task<IActionResult> uploadDocument(List<IFormFile> file, [FromForm] int receiptnote_hdr_id, [FromForm] int grnid, [FromForm] int BranchId, [FromForm] int UserId)
        {
            try
            {
                if (file == null || file.Count == 0)
                    return BadRequest("No file uploaded.");

                if (grnid <= 0)
                    return BadRequest("Invalid Grnid ID.");

                var attachmentList = new List<InvoiceReceiptAttachment>();

                foreach (IFormFile row in file)
                {
                    if (row == null || row.Length == 0) return BadRequest("No file uploaded.");
                    if (grnid <= 0) return BadRequest("Invalid GRN Id.");
                    
                    var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles", "InvoiceReceipt", grnid.ToString());
                    
                    if (!Directory.Exists(uploadDir))
                    {
                        Directory.CreateDirectory(uploadDir);
                    }
                    if (uploadDir== null || uploadDir.Length == 0) { uploadDir = ""; }

                    var filePath = Path.Combine(uploadDir, row.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await row.CopyToAsync(stream);
                    }
                    attachmentList.Add(new InvoiceReceiptAttachment { receiptnote_hdr_id = receiptnote_hdr_id, grn_id = grnid, BranchId = BranchId, file_name = row.FileName, file_path = uploadDir, UserId = UserId });
                }
                var result = await _mediator.Send(new UploadInvoiceReceiptsQuery { attachmentList = attachmentList });
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
        [HttpGet("download-invoiceIRN")]
        public IActionResult DownloadinvoiceIRN([FromQuery] string file_path, Int32 receiptnote_hdr_id)
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
        [HttpPut("InvoiceReceiptGenerateIRN")]
        public async Task<IActionResult> InvoiceReceiptGenerateIRN([FromBody] GenerateInvoiceReceiptIRNQuery command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
