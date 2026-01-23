using Application.Master.Customer.CreateCustomer;
using Application.Master.Customer.GetAllCustomer;
using Application.Master.Customer.GetCustomerByID;
using Application.Master.Customer.ToogleActiveStatus;
using Application.Master.Customer.UpdateCustomer;
using Application.Master.DepartmentItem.GetDepartmentItemById;
using Application.PackingAndDO.UploadPackingAndDO;
using Core.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Bcpg;

namespace UserPanel.Controllers.Master
{
    [Route("api/[controller]")]
    [ApiController]
    public class MasterCustomerController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MasterCustomerController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("create-update")]
        public async Task<IActionResult> CreateOrUpdate([FromBody] CreateCustomerCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("Upload-doc")]
        public async Task<IActionResult> UploadDO(IFormFile file, [FromForm] int CustomerId, [FromForm] int BranchId, [FromForm] int UserId)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            if (CustomerId == 0)
            {
                return BadRequest("CustomerId is required.");
            }

            try
            {
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles", "CustomerDoc", CustomerId.ToString());
                if (!Directory.Exists(uploadDir))
                {
                    Directory.CreateDirectory(uploadDir);
                }
                var filePath = Path.Combine(uploadDir, file.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                var result = await _mediator.Send(new UploadDocQuery
                {
                    Id = CustomerId,
                    Path = filePath,
                    UserId = UserId,
                    BranchId = BranchId
                });

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

        [HttpGet("get-list-tab")]
        public async Task<IActionResult> GetListALL([FromQuery] int tabId, [FromQuery] int customerId, [FromQuery] int contactId, [FromQuery] int addressId)
        {
            var query = new GetAllCustomerQuery
            {
                TabId = tabId,
                CustomerId = customerId,
                ContactId = contactId,
                AddressId = addressId,
                BranchId = 1,
                UserId = 1
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("GetByID")]
        public async Task<IActionResult> GetByID(int customerID, int tabId, int branchId)
        {
            var result = await _mediator.Send(new GetCustomerByIDQuery() { CustomerId = customerID, TabId = tabId, BranchId = branchId });
            return Ok(result);
        }


        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateCustomerCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("toggle-actve-status")]
        public async Task<IActionResult> ToogleActiveStatus([FromBody] ToogleActiveStatusCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("get-list-tab-customer")]
        public async Task<IActionResult> GetAllCustomerAsync(string customerName = "", int tabId = 0, int customerId = 0, int contactId = 0, int addressId = 0, int branchId = 0, int userId = 0)
        {
            var query = new GetAllCustomerListQuery
            {
                CustomerName = customerName,
                BranchId = branchId,
                UserId = userId,
                CustomerId = customerId,
                ContactId = contactId,
                AddressId = addressId,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }
        #region GetDepartmentByCode
        [HttpGet("name/{DepartmentName}")]
        public async Task<IActionResult> GetDepartmentByName(string DepartmentName)
        {
            var departnames = await _mediator.Send(new GetDepartmentItemByIdQuery { DepartmentName = DepartmentName });
            return Ok(departnames);
        }
        #endregion
    }
}
