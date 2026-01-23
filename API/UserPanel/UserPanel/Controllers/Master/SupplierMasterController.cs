using Application.Procurement.Master.Item.UpdateItemStatus;
using Application.Procurement.Master.Supplier.CreateSupplier;
using Application.Procurement.Master.Supplier.GetAllCity;
using Application.Procurement.Master.Supplier.GetAllCountry;
using Application.Procurement.Master.Supplier.GetAllCurrency;
using Application.Procurement.Master.Supplier.GetAllDeliveryTerms;
using Application.Procurement.Master.Supplier.GetAllPaymentTerms;
using Application.Procurement.Master.Supplier.GetAllState;
using Application.Procurement.Master.Supplier.GetAllSupplier;
using Application.Procurement.Master.Supplier.GetAllSupplierAutocomplete;
using Application.Procurement.Master.Supplier.GetAllSupplierCategory;
using Application.Procurement.Master.Supplier.GetAllTax;
using Application.Procurement.Master.Supplier.GetAllVAT;
using Application.Procurement.Master.Supplier.GetllSupplierBlock;
using Application.Procurement.Master.Supplier.UpdateSupplier;
using Application.Procurement.Master.Supplier.UpdateSupplierStatus;
using Application.Procurement.Purchase_Requitision.CreatePurchaseRequitisionItem;
using Application.Procurement.Purchase_Requitision.UpdatePurchaseRequitisionItem;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierMasterController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SupplierMasterController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-all-supplier")]
        public async Task<IActionResult> GetListALL([FromQuery] int branchid, [FromQuery] int orgid, [FromQuery] int supplierid, [FromQuery] int cityid, [FromQuery] int stateid, [FromQuery] int suppliercategoryid)
        {
            var query = new GetAllSupplierQuery
            {
                branchid = branchid,
                orgid = orgid,
                supplierid = supplierid,
                cityid = cityid,
                stateid = stateid,
                suppliercategoryid = suppliercategoryid

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }


        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateSupplierCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateSuppliercommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("get-all-GetCountryList")]
        public async Task<IActionResult> GetCountryList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllCountryCommand
            {
                branchid = branchid,
                orgid = orgid,             

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetStateList")]
        public async Task<IActionResult> GetStateList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllStateCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetCityList")]
        public async Task<IActionResult> GetCityList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllCityCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetSupplierBlockList")]
        public async Task<IActionResult> GetSupplierBlockList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetllSupplierBlockCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetSupplierCategoryList")]
        public async Task<IActionResult> GetSupplierCategoryList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllSupplierCategoryCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetCurrencyList")]
        public async Task<IActionResult> GetCurrencyList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllCurrencyCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetSupplierList")]
        public async Task<IActionResult> GetSupplierList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllSupplierAutoCompleteCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetAllTaxist")]
        public async Task<IActionResult> GetAllTaxList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllTaxListCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-GetAllVATist")]
        public async Task<IActionResult> GetAllVATList([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllVATListCommand
            {
                branchid = branchid,
                orgid = orgid,

            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-Paymentterms")]
        public async Task<IActionResult> GetAllPaymentTerms([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllPaymentTermsCommand
            {
                branchid = branchid,
                orgid = orgid,
            };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("get-all-Deliveryterms")]
        public async Task<IActionResult> GetAllDeliveryTerms([FromQuery] int branchid, [FromQuery] int orgid)
        {
            var query = new GetAllDeliveryTermsCommand
            {
                branchid = branchid,
                orgid = orgid,
            };
            var result = await _mediator.Send(query);
            return Ok(result);
        }


        [HttpPut("Update-supplier-status")]
        public async Task<IActionResult> UpdateSupplierStatus([FromQuery] int branchid, [FromQuery] int orgid, [FromQuery] int supplierid, [FromQuery] bool isactive, [FromQuery] int userid)
        {
            var command = new UpdateSupplierStatusCommand
            {
                branchid = branchid,
                orgid = orgid,
                supplierid = supplierid,
                isactive = isactive
                // If you want to include userid, you need to add it to the command class
            };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

    }

}

