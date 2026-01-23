using Application.Procurement.InvoiceReceipt.GetAllIRNList;
using Application.Procurement.InvoiceReceipt.GetAllSupplierIRNList;
using Application.Procurement.InvoiceReceipt.getIRNByid;
using Application.Procurement.InvoiceReceipt.GetSupplierPONoAutoComplete;
using Application.Procurement.InvoiceReceipt.PaymentHistory;
using Core.Master.Supplier;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Procurement
{
    [Route("api/[controller]")]
    [ApiController]
    public class IRNListController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;

        public IRNListController(IMediator mediator, IWebHostEnvironment env)
        {
            _mediator = mediator;
            _env = env;
        }

        [HttpGet("Get-All-IRN-List")]
        public async Task<IActionResult> GetAllIRNL(int branchid, int orgid, int supplierid, string? fromdate, string? todate, int irnid,int userid)
        {
            var result = await _mediator.Send(new GetAllIRNList() { branchid = branchid, orgid = orgid, supplierid = supplierid, fromdate = fromdate, todate  = todate , irnid  = irnid, userid= userid });
            return Ok(result);
        }

        [HttpGet("PaymentHistory")]
        public async Task<IActionResult> PaymentHistory(int branchid, int orgid, int supplierid, string? fromdate, string? todate )
        {
            var result = await _mediator.Send(new PaymentHistoryQuery() { branchid = branchid, orgid = orgid, supplierid = supplierid, fromdate = fromdate, todate = todate  });
            return Ok(result);
        }

        [HttpGet("Get-All_IRN-List-Supplier-dropdown")]
        public async Task<IActionResult> GetAllSupplierIRNList(int branchid, int orgid)
        {
            var result = await _mediator.Send(new GetAllSupplierIRNListQuery() { branchid = branchid, orgid = orgid });
            return Ok(result);
        }
        [HttpGet("GetByIRNId")]
        public async Task<IActionResult> GetByIRNId(int irnid,int branchid, int orgid)
        {
            var result = await _mediator.Send(new getIRNByIdQuery() { irnid = irnid, branchid = branchid, orgid = orgid });
            return Ok(result);
        }
    }
}
