using Application.PackingAndDO.acknowledgement;
using Application.PackingAndDO.BarcodeMachineScan;
using Application.PackingAndDO.CreatePackingAndDO;
using Application.PackingAndDO.DocPrint;
using Application.PackingAndDO.DownloadPackingAndDO;
using Application.PackingAndDO.ExportPackingAndDO;
using Application.PackingAndDO.GenerateInvoice;
using Application.PackingAndDO.GetAllPackingItems;
using Application.PackingAndDO.GetInvoiceData;
using Application.PackingAndDO.GetPackingItem;
using Application.PackingAndDO.GetPackingPackNo;
using Application.PackingAndDO.IsDOGenerated;
using Application.PackingAndDO.PackingConfirmed;
using Application.PackingAndDO.UpdatePackingAndDO;
using Application.PackingAndDO.UploadAck;
using Application.PackingAndDO.UploadPackingAndDO;
using Core.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace UserPanel.Controllers.OrderManagement.PackingAndDO
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackingAndDOController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PackingAndDOController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("DownloadDO")]
        public async Task<IActionResult> DownloadDO(Int32 PackId)
        {
            try
            {
                var result = await _mediator.Send(new DownloadPackingAndDOQuery { Id = PackId });
                return File(result.stream, result.contentType, result.fileName);
            }
            catch (Exception ex)
            {
                ResponseModel RM = new ResponseModel()
                {
                    Data = null,
                    Message = "File is not available",
                    Status = false
                };
                return Ok(RM);
            }


        }
        // POST api/files/upload-with-params
        [HttpPost("UploadDO")]
        public async Task<IActionResult> UploadDO(IFormFile file, [FromForm] string PackingNo, Int32 PackId)
        {
            ResponseModel Mod = new ResponseModel();
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded.");
                }


                if (string.IsNullOrEmpty(PackingNo))
                {
                    return BadRequest("PackingNo is required.");
                }

                if (PackId == 0)
                {
                    return BadRequest("PackId is required.");
                }

                // Define the path where the file will be saved
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), @"UploadedFiles\PDO\" + PackingNo + "", file.FileName);

                // Create the directory if it doesn't exist
                var directoryPath = Path.GetDirectoryName(filePath);
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                // Save the file to the server
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                var result = await _mediator.Send(new UploadPackingAndDOQuery { Id = PackId, Path = filePath });
                return Ok(result);
            }
            catch (Exception ex)
            {
                Mod.Status = false;
                Mod.Message = "Upload failed";
                return Ok(Mod);
            }
            // Return file details and the description

        }

        [HttpGet("GetALL")]
        public async Task<IActionResult> GetAll(int packerid, string FromDate, string ToDate, Int32 BranchId, Int32 GasCodeId,int customerid,string esttime,int packer_id)
        {
            var result = await _mediator.Send(new GetAllPackingItemsQuery() { packingid = packerid, from_date = FromDate, to_date = ToDate, BranchId = BranchId, GasCodeId= GasCodeId,customerid=customerid,esttime=esttime,packerid =packer_id   
            });
            return Ok(result);
        }

        [HttpGet("GetPackingPackNo")]
        public async Task<IActionResult> GetPackingPackNo(Int32 BranchId)
        {
            var result = await _mediator.Send(new GetPackingPackNoQuery() { BranchId = BranchId });
            return Ok(result);
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreatePackingAndDOCommands command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        //[HttpPut("Update")]
        //public async Task<IActionResult> Update([FromBody] UpdatePackingAndDOCommands command)
        //{
        //    var result = await _mediator.Send(command);
        //    return Ok(result);
        //}

        [HttpGet("GetById")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(new GetPackingItemByIdQuery() { Id = id });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        // POST api/files/upload-with-params
        [HttpPost("UploadACK")]
        public async Task<IActionResult> UploadACK(IFormFile file, [FromForm] string PackingNo, Int32 PackId, Int32 UserId)
        {
            ResponseModel Mod = new ResponseModel();
            try
            {

                var resultofdo = await _mediator.Send(new IsDOGeneratedQuery() { Id = PackId });
                if (resultofdo == true)
                {
                    if (file == null || file.Length == 0)
                    {
                        return BadRequest("No file uploaded.");
                    }


                    if (string.IsNullOrEmpty(PackingNo))
                    {
                        return BadRequest("PackingNo is required.");
                    }

                    if (PackId == 0)
                    {
                        return BadRequest("PackId is required.");
                    }

                    // Define the path where the file will be saved
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), @"UploadedFiles\PDO-ACK\" + PackingNo + "", file.FileName);

                    // Create the directory if it doesn't exist
                    var directoryPath = Path.GetDirectoryName(filePath);
                    if (!Directory.Exists(directoryPath))
                    {
                        Directory.CreateDirectory(directoryPath);
                    }

                    // Save the file to the server
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    var result = await _mediator.Send(new UploadPackingACKQuery { Id = PackId, Path = filePath, FileName = file.FileName, UserId = UserId });
                    return Ok(result);
                }

                else
                {

                    ResponseModel RM = new ResponseModel()
                    {
                        Data = null,
                        Message = "DO is not uploaded for this pack no",
                        Status = false
                    };
                    return Ok(RM);
                }
            }
            catch (Exception ex)
            {
                Mod.Status = false;
                Mod.Message = "Upload failed";
                return Ok(Mod);
            }
            // Return file details and the description

        }
        [HttpGet("GetAllExportAsync")]
        public async Task<IActionResult> GetAllExportAsync(int Types, int packerid, string FromDate, string ToDate, Int32 BranchId,Int32 GasCodeId, int customerid, string esttime, int packer_id)
        {
            try
            {
                var result = await _mediator.Send(new ExportPackingAndDOQuery() { Types = Types, packingid = packerid, from_date = FromDate, to_date = ToDate, BranchId = BranchId, GasCodeId = GasCodeId,
                    customerid = customerid,
                    esttime = esttime,
                    packerid = packer_id
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
        [HttpPost("change-packing-stage")]
        public async Task<IActionResult> ChangePackingStage([FromBody] ChangePackingAndDoStageCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("packingacknoledgement")]
        public async Task<IActionResult> packingacknoledgement([FromBody] acknowledgementCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("GetInvoiceData")]
        public async Task<IActionResult> GetInvoiceData(Int32 PackingId)
        {
            var result = await _mediator.Send(new GetInvoiceDataNoQuery() { PackingId = PackingId });
            return Ok(result);
        }


        [HttpPost("GenerateInvoice")]
        public async Task<IActionResult> GenerateInvoice([FromBody] GenerateInvoiceItemsQuery command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPost("BarcodeMachineScan")]
        public async Task<ActionResult> BarcodeMachineScan([FromBody] BarcodeMachineScanCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("PackingConfirmed")]
        public async Task<ActionResult> PackingConfirmed([FromBody] PackingConfirmedCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("docprintId")]
        public async Task<IActionResult> docprint(int id)
        {
            var result = await _mediator.Send(new GetDocPrintQuery() { Id = id });

            if (result == null)
                return NotFound();

            return Ok(result);
        }

    }
}



