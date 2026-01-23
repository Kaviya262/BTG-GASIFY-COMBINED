using Application.OrderMngMaster.Common;
using Core.Models;
using Dapper;
using MediatR;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Dynamic;
 

namespace UserPanel.Controllers.OrderManagement.Quotation
{
     
    [Route("api/[controller]")]
    [ApiController]

    public class OrderMngMasterController : ControllerBase
    {
         
        private readonly IMediator _mediator;
          
        public OrderMngMasterController(IMediator mediator )
        {
            _mediator = mediator;
            
        }



        [HttpGet("GetQuotationType")]
        public async Task<ActionResult> GetQuotationType(int BranchId)
        {
           
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 1,
                BranchId = BranchId,

            });
            return Ok(result);
        }

        [HttpGet("GetCustomerContact")]
        public async Task<ActionResult> GetCustomerContact(int customerid, int Sqid)
        {
             
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 2,
                customerid = customerid,
                sqid = Sqid,

            });
            return Ok(result);
        }
        [HttpGet("GetCustomerAddress")]
        public async Task<ActionResult> GetCustomerAddress(int ContactId, int Sqid)
        {             
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 3,
                contactid = ContactId,
                sqid = Sqid,
                 
            });
            return Ok(result);
        }
        [HttpGet("GetCustomer")]
        public async Task<ActionResult> GetCustomer(int BranchId, int Sqid, string SearchText)
        {
         
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 4,
                BranchId = BranchId,
                sqid = Sqid,
                SearchText = SearchText,
            });
            return Ok(result);
        }
        [HttpGet("GetPaymentTerm")]
        public async Task<ActionResult> GetPaymentTerm(int BranchId, int Sqid)
        {
             
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 5,
                BranchId = BranchId,
                sqid = Sqid,

            });
            return Ok(result);
        }

        [HttpGet("GetGasCode")]
        public async Task<ActionResult> GetGasCode(int BranchId, int Sqid, string SearchText)
        {
             
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 6,
                BranchId = BranchId,
                SearchText = SearchText,
                sqid = Sqid,
            });
            return Ok(result);
        }


        [HttpGet("GetUOM")]
        public async Task<ActionResult> GetUOM(int BranchId, int Sqid, string SearchText)
        {
             
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 7,
                BranchId = BranchId,
                sqid = Sqid,
                SearchText = SearchText,
            });
            return Ok(result);
        }
        [HttpGet("GetCurrency")]
        public async Task<ActionResult> GetCurrency(int BranchId, int Sqid, string SearchText)
        { 
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 8,
                BranchId = BranchId,
                sqid = Sqid,
                SearchText = SearchText,
            });
            return Ok(result);
        }

        [HttpGet("GetGasCodeDetails")]
        public async Task<ActionResult> GetGasCodeDetails(int GasCodeId)
        {
        
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 9,
                GasCodeId = GasCodeId

            });
            return Ok(result);
        }


        [HttpGet("GetCurrencyConversion")]
        public async Task<ActionResult> GetCurrencyConversion(int currencyid)
        { 
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 10,
                currencyid = currencyid

            });
            return Ok(result);
        }

        [HttpGet("GetSalesPerson")]
        public async Task<ActionResult> GetSalesPerson(int BranchId, int Sqid, string SearchText)
        {           
            var result = await _mediator.Send(new CreateCommonMasterCommand() {
                Opt = 11,
                BranchId = BranchId,
                sqid = Sqid,
                SearchText = SearchText,
            });
            return Ok(result);
        }
        [HttpGet("GetPaymentMethod")]
        public async Task<ActionResult> GetPaymentMethod(int BranchId, int Sqid)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 12,
                BranchId = BranchId,
                sqid = Sqid,
            });
            return Ok(result);
        }
        [HttpGet("GetSQNumber")]
        public async Task<ActionResult> GetSQNumber(int BranchId, string SearchText)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 13,
                BranchId = BranchId,
                SearchText = SearchText
            });
            return Ok(result);
        }
    
        [HttpGet("GetSOType")]
        public async Task<ActionResult> GetSOType(int BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 14,
                BranchId = BranchId
            });
            return Ok(result);
        }
        [HttpGet("GetSQCustomer")]
        public async Task<ActionResult> GetSQCustomer(int BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 15,
                BranchId = BranchId
            });
            return Ok(result);
        }
          [HttpGet("GetCustomerSQ")]
        public async Task<ActionResult> GetCustomerSQ(int customerID, int BranchId,int soid)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 16,
                customerid = customerID,
                BranchId = BranchId,
                soid= soid
            });
            return Ok(result);
        }
        [HttpGet("GetSQGasCode")]
        public async Task<ActionResult> GetSQGasCode(int sqid, Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 17,
                sqid = sqid,
                BranchId = BranchId
            });
            return Ok(result);
        }

        [HttpGet("GetCustomerGasCode")]
        public async Task<ActionResult> GetCustomerGasCode(int customerid, int GasCodeId, Int32 BranchId,Int32 SOID)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 18,
                customerid = customerid,
                GasCodeId = GasCodeId,
                BranchId = BranchId,
                soid=SOID
            });
            return Ok(result);
        }

        [HttpGet("GetCustomerGasCodeDetail")]
        public async Task<ActionResult> GetCustomerGasCodeDetail(int customerid,  Int32 BranchId,int soid)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 19,
                customerid = customerid,
                
                BranchId = BranchId,
                soid= soid
            });
            return Ok(result);
        }


        [HttpGet("GetPackingCustomerId")]
        public async Task<ActionResult> GetPackingCustomerId(Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 20,
                BranchId = BranchId
            });
            return Ok(result);
        }


        [HttpGet("GetCustomerPackingId")]
        public async Task<ActionResult> GetCustomerPackingId(int customerid, Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 21,
                customerid = customerid,
                BranchId = BranchId
            });
            return Ok(result);
        }

        [HttpGet("GetGasTypes")]
        public async Task<ActionResult> GetGasTypes(Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 22,                 
                BranchId = BranchId
            });
            return Ok(result);
        }

        [HttpGet("GetGasCodeAgGasTypes")]
        public async Task<ActionResult> GetGasCodeAgGasTypes(int GasTypeId, Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 23,
                GasTypeId = GasTypeId,
                BranchId = BranchId
            });
            return Ok(result);
        }

        [HttpGet("GetCylinderDetails")]
        public async Task<ActionResult> GetCylinderDetails(string searchtext, Int32 BranchId,Int32 GasCodeId,Int32 ProductionId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 24,
                SearchText = searchtext,
                BranchId = BranchId,
                id= ProductionId,
                GasCodeId=GasCodeId
            });
            return Ok(result);
        }

        [HttpGet("GetProductionNo")]
        public async Task<ActionResult> GetProductionNo(string searchtext, Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 25,
                SearchText = searchtext,
                BranchId = BranchId
            });
            return Ok(result);
        }

        [HttpGetAttribute("GetPackingDetails")]
        public async Task<ActionResult> GetPackingDetails(Int32 packingid, Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 26,
                packingid = packingid,
                BranchId = BranchId
            });
            return Ok(result);
        }



        [HttpGetAttribute("GetsaleordercustomerId")]
        public async Task<ActionResult> GetsaleordercustomerId(Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 27,
                BranchId = BranchId
            });
            return Ok(result);
        }



        [HttpGetAttribute("GetPackersName")]
        public async Task<ActionResult> GetPackersName(Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 28,
                BranchId = BranchId
            });
            return Ok(result);
        }

        [HttpGetAttribute("GetDriversName")]
        public async Task<ActionResult> GetDriversName(Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 50,
                BranchId = BranchId
            });
            return Ok(result);
        }


        [HttpGetAttribute("GetPackingSO")]
        public async Task<ActionResult> GetPackingSO(int customerid, Int32 BranchId,int PackingId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 29,
                customerid = customerid,
                BranchId = BranchId,
                packingid= PackingId
            });
            return Ok(result);
        }


        [HttpGetAttribute("GetPackingSODetail")]
        public async Task<ActionResult> GetPackingSODetail(int soid, Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 30,
                soid = soid,
                BranchId = BranchId
            });
            return Ok(result);
        }

        [HttpGet("GetReturnOrderCylinderDetails")]
        public async Task<ActionResult> GetReturnOrderCylinderDetails(string searchtext, Int32 BranchId, Int32 GasCodeId, Int32 ReturnId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 31,
                SearchText = searchtext,
                BranchId = BranchId,
                id = ReturnId,
                GasCodeId = GasCodeId
            });
            return Ok(result);
        }

        [HttpGet("GetReturnOrderCustomerPackingIdAsync")]
        public async Task<ActionResult> GetReturnOrderCustomerPackingIdAsync(Int32 BranchId, Int32 CustomerID)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 32,
                SearchText = "",
                BranchId = BranchId,
                id = 0,
                customerid = CustomerID
            });
            return Ok(result);
        }

        [HttpGet("GetDeliveryAgGasDetails")]
        public async Task<ActionResult> GetDeliveryAgGasDetails(Int32 GascodeId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 33,
                SearchText = "",
                BranchId = 0,
                id = 0,
                GasCodeId = GascodeId
            });
            return Ok(result);
        }

        [HttpGet("GetDeliveryAgDODetails")]
        public async Task<ActionResult> GetDeliveryAgDODetails(Int32 packingid)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 34,
                SearchText = "",
                BranchId = 0,
                id = 0,
                packingid = packingid
            });
            return Ok(result);
        }

        [HttpGet("GetReturnOrderGasCode")]
        public async Task<ActionResult> GetReturnOrderGasCode(Int32 BranchId,string SearchText,Int32 CustomerId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 35,
                SearchText = SearchText,
                BranchId = BranchId,
                id = 0,
                packingid =0,
                customerid= CustomerId
            });
            return Ok(result);
        }

        [HttpGet("GetSoHistory")]
        public async Task<ActionResult> GetSoHistory(Int32 BranchId, int sqid, Int32 soid,Int32 GasCodeId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 36,
                SearchText = "",
                BranchId = BranchId,
                sqid = sqid,
                soid = soid,
                GasCodeId = GasCodeId,
                packingid = 0,
                customerid = 0
            });
            return Ok(result);
        }

        [HttpGet("GetBarcodeDetails")]
        public async Task<ActionResult> GetBarcodeDetails(string Barcode, Int32 PackingId,int doid)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = -1,
                SearchText = Barcode,
                packingid = PackingId,
                doid= doid

            });
            return Ok(result);
        }

        [HttpGet("GetVolume")]
        public async Task<ActionResult> GetVolume(string SearchText, Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 38,
                SearchText = SearchText,
                BranchId = BranchId,

            });
            return Ok(result);
        }
        [HttpGet("GetPressure")]
        public async Task<ActionResult> GetPressure(string SearchText, Int32 BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 37,
                SearchText = SearchText,
                BranchId = BranchId,

            });
            return Ok(result);
        }
[HttpGet("IsAdminUser")]
        public async Task<ActionResult> IsAdminUser(string UserId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = -2,
                UserId = UserId
            });
            return Ok(result);
        }
        [HttpGet("GetSOGasCodeDetails")]
        public async Task<ActionResult> GetSOGasCodeDetails( Int32 SOID)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 41,
                soid = SOID 

            });
            return Ok(result);
        }

        [HttpGet("GetStagedata")]
        public async Task<ActionResult> GetStagedata(Int32 branchid)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 42,
                BranchId = branchid

            });
            return Ok(result);
        }


        [HttpGet("GetgasCodeData")]
        public async Task<ActionResult> GetgasCodeData(Int32 branchid,string SearchText)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 43,
                BranchId = branchid,
                SearchText= SearchText

            });
            return Ok(result);
        }


        [HttpGet("GetRackDetails")]
        public async Task<ActionResult> GetRackDetails(Int32 branchid)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 44,
                BranchId = branchid

            });
            return Ok(result);
        }


        [HttpGet("Getgascodeagainstcustomer")]
        public async Task<ActionResult> Getgascodeagainstcustomer(Int32 CustomerId, Int32 branchid)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 46,
                BranchId = branchid,
                customerid= CustomerId

            });
            return Ok(result);
        }

        [HttpGet("GetSOagainstGas")]
        public async Task<ActionResult> GetSOagainstGas(Int32 GasCodeId, Int32 branchid)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 47,
                BranchId = branchid,
                GasCodeId = GasCodeId

            });
            return Ok(result);
        }






        #region

        [HttpGet("get-cylinder-size")]
        public async Task<ActionResult> GetCylinderSize(int BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 39,
                BranchId = BranchId,

            });
            return Ok(result);
        }
        #endregion


        #region

        [HttpGet("get-contact-name")]
        public async Task<ActionResult> GetContactName(int customerId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 45,
                customerid = customerId,

            });
            return Ok(result);
        }
        #endregion

        #region

        [HttpGet("get-pallet-type")]
        public async Task<ActionResult> GetPalletType(int branchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 48,
                BranchId = branchId,

            });
            return Ok(result);
        }
        #endregion


        [HttpGet("get-gas-code-pallet")  ]
        public async Task<ActionResult> GetGasCodePallet(int gasCodeId, int palletTypeId, int branchId, int palletId)
        {

            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {

                Opt = 49,
                GasCodeId = gasCodeId,
                BranchId = branchId,
                PalletTypeId = palletTypeId,
                PalletId= palletId,
            });
            return Ok(result);
        }

        [HttpGet("GetCustomerFilter")]
        public async Task<ActionResult> GetCustomerFilter(int branchId, string searchtext)
        {

            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {

                Opt = 51,
                SearchText = searchtext,
                BranchId = branchId, 
            });
            return Ok(result);
        }

        [HttpGet("GetPackerList")]
        public async Task<ActionResult> GetPackerList(int branchId, string searchtext)
        {

            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {

                Opt = 52,
                SearchText = searchtext,
                BranchId = branchId,
            });
            return Ok(result);
        }
        [HttpGet("GetTruckName")]
        public async Task<ActionResult> GetTruckName(int branchId)
        {

            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {

                Opt = 53,
                BranchId = branchId,
            });
            return Ok(result);
        }

        [HttpGet("GetBarcodeDetailsByPacking")]
        public async Task<ActionResult> GetBarcodeDetailsByPacking(
               [FromQuery] string? Barcode,
               [FromQuery] int PackingId,
               [FromQuery] int UserId,
               [FromQuery] int BranchId,
               [FromQuery] int? PackingDetailsId ,
               [FromQuery] int? DeliveryDetailRefId ,
               [FromQuery] int? PackerId ,
               [FromQuery] int? CustomerId 
           )
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 54, // Unique operation code for barcode packing logic
                Barcode = Barcode,
                packingid = PackingId,
                UserId = UserId.ToString(),
                BranchId = BranchId,

                // New parameters passed to the command
                PackingDetailsId = PackingDetailsId,
                DeliveryDetailRefId = DeliveryDetailRefId,
                PackerId = PackerId,
                CustomerId = CustomerId
            });

            return Ok(result);
        }


        [HttpGet("get-bank")]
        public async Task<ActionResult> GetBank( int UserId, int BranchId)
        {
            var result = await _mediator.Send(new CreateCommonMasterCommand()
            {
                Opt = 55, // Unique operation code for this use case
                UserId = UserId.ToString(),
                BranchId = BranchId
            });

            return Ok(result);
        }

    }
}
