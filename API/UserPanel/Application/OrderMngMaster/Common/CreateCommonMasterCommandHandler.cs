using Core.Abstractions;
using Core.Models;
using Core.OrderMng.Quotation;
using Core.OrderMngMaster.Common;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UserPanel.Core.Abstractions;

namespace Application.OrderMngMaster.Common
{
    public class CreateCommonMasterCommandHandler : IRequestHandler<CreateCommonMasterCommand, object>
    {
        private readonly IOrderMngMasterRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;
        private readonly IMasterDBConnection _masterOfWork;

        public CreateCommonMasterCommandHandler(IOrderMngMasterRepository repository, IUnitOfWorkDB1 unitOfWork, IMasterDBConnection masterOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _masterOfWork = masterOfWork;
        }

        public async Task<object> Handle(CreateCommonMasterCommand command, CancellationToken cancellationToken)
        {
            if (command.Opt == 1)
            {
                var Result = await _repository.GetQuotationTypeAsync(command.BranchId);
                return Result;
            }
            if (command.Opt == 2)
            {
                var Result = await _repository.GetCustomerContactAsync(command.customerid, command.sqid);
                return Result;
            }
            if (command.Opt == 3)
            {
                var Result = await _repository.GetCustomerAddressAsync(command.contactid, command.sqid);
                return Result;
            }
            if (command.Opt == 4)
            {
                var Result = await _repository.GetCustomerAsync(command.BranchId, command.sqid, command.SearchText);
                return Result;
            }
            if (command.Opt == 5)
            {
                var Result = await _repository.GetPaymentTermAsync(command.BranchId, command.sqid);
                return Result;
            }
            if (command.Opt == 6)
            {
                var Result = await _repository.GetGasCodeAsync(command.BranchId, command.sqid, command.SearchText);
                return Result;
            }
            if (command.Opt == 7)
            {
                var Result = await _repository.GetUOMAsync(command.BranchId, command.sqid, command.SearchText);
                return Result;
            }
            if (command.Opt == 8)
            {
                var Result = await _repository.GetCurrencyAsync(command.BranchId, command.sqid, command.SearchText);
                return Result;
            }
            if (command.Opt == 9)
            {
                var Result = await _repository.GetGasCodeDetailsAsync(command.GasCodeId);
                return Result;
            }
            if (command.Opt == 10)
            {
                var Result = await _repository.GetCurrencyConversionAsync(command.currencyid);
                return Result;
            }
            if (command.Opt == 11)
            {
                var Result = await _repository.GetSalesPersonAsync(command.BranchId, command.sqid, command.SearchText);
                return Result;
            }
            if (command.Opt == 12)
            {
                var Result = await _repository.GetPaymentMethodAsync(command.BranchId, command.sqid);
                return Result;
            }
            if (command.Opt == 13)
            {
                var Result = await _repository.GetSQNumberAsync(command.BranchId, command.SearchText);
                return Result;
            }
            if (command.Opt == 14)
            {
                var Result = await _repository.GetSOTypeAsync(command.BranchId);
                return Result;
            }
            if (command.Opt == 15)
            {
                var Result = await _repository.GetSQCustomerAsync(command.BranchId);
                return Result;
            }
            if (command.Opt == 16)
            {
                var Result = await _repository.GetCustomerSQAsync(command.customerid, command.BranchId, command.soid);
                return Result;
            }


            if (command.Opt == 17)
            {
                var Result = await _repository.GetSQGasCodeAsync(command.sqid, command.BranchId);
                return Result;
            }
            if (command.Opt == 18)
            {
                var Result = await _repository.GetCustomerGasCodeAsync(command.customerid, command.GasCodeId, command.BranchId,command.soid);
                return Result;
            }
            if (command.Opt == 19)
            {
                var Result = await _repository.GetCustomerGasCodeDetailAsync(command.customerid, command.BranchId, command.soid);
                return Result;

            }
            if (command.Opt == 20)
            {
                var Result = await _repository.GetPackingCustomerIdAsync(command.BranchId);
                return Result;

            }
            if (command.Opt == 21)
            {
                var Result = await _repository.GetCustomerPackingIdAsync(command.customerid, command.BranchId);
                return Result;

            }

            if (command.Opt == 22)
            {
                var Result = await _repository.GetGasTypes(command.BranchId);
                return Result;

            }
            if (command.Opt == 23)
            {
                var Result = await _repository.GetGasCodeAgGasTypes(command.GasTypeId, command.BranchId);
                return Result;

            }
            if (command.Opt == 24)
            {
                var Result = await _repository.GetCylinderDetails(command.SearchText, command.BranchId, command.GasCodeId, command.id);
                return Result;

            }
            if (command.Opt == 25)
            {
                var Result = await _repository.GetProductionNo(command.SearchText, command.BranchId);
                return Result;

            }
            if (command.Opt == 26)
            {
                var Result = await _repository.GetPackingDetails(command.packingid, command.BranchId);
                return Result;

            }

            if (command.Opt == 27)
            {
                var Result = await _repository.GetsaleordercustomerId(command.BranchId);
                return Result;

            }

            if (command.Opt == 28)
            {
                var Result = await _repository.GetPackersName(command.BranchId);
                return Result;

            }
            if (command.Opt == 29)
            {
                var Result = await _repository.GetPackingSO(command.customerid, command.BranchId, command.packingid);
                return Result;

            }
            if (command.Opt == 30)
            {
                var Result = await _repository.GetPackingSODetail(command.soid, command.BranchId);
                return Result;

            }
            if (command.Opt == 31)
            {
                var Result = await _repository.GetReturnOrderCylinderDetails(command.SearchText, command.BranchId, command.GasCodeId, command.id);
                return Result;

            }
            if (command.Opt == 32)
            {
                var Result = await _repository.GetReturnOrderCustomerPackingIdAsync(command.customerid, command.BranchId);
                return Result;

            }
            if (command.Opt == 33)
            {
                var Result = await _repository.GetDeliveryAgGasDetails(command.GasCodeId);
                return Result;

            }
            if (command.Opt == 34)
            {
                var Result = await _repository.GetDeliveryAgDODetails(command.packingid);
                return Result;

            }
            if (command.Opt == 35)
            {
                var Result = await _repository.GetReturnOrderGasCode(command.BranchId, command.SearchText, command.customerid);
                return Result;

            }
            if (command.Opt == 36)
            {
                var Result = await _repository.GetSoHistory(command.BranchId, command.sqid, command.soid, command.GasCodeId);
                return Result;
            }
            if (command.Opt == -1)
            {
                var Result = await _repository.GetBarcodeDetails(command.SearchText, command.packingid, command.doid);
                return Result;
            }
            if (command.Opt == 38)
            {
                var Result = await _repository.GetVolume(command.SearchText, command.BranchId);
                return Result;
            }
            if (command.Opt == 37)
            {
                var Result = await _repository.GetPressure(command.SearchText, command.BranchId);
                return Result;
            }
            if (command.Opt == -2)
            {
                var Result = await _repository.IsAdminUser(command.UserId);
                return Result;
            }
            if (command.Opt == 39)
            {
                var Result = await _repository.GetCylinderSize(command.BranchId);
                return Result;
            }
            if (command.Opt == 40)
            {
                var Result = await _repository.GetGasCode(command.BranchId);
                return Result;
            }
            if (command.Opt == 41)
            {
                var Result = await _repository.GetSOGasCodeDetails(command.soid);
                return Result;
            }
            if (command.Opt == 42)
            {
                var Result = await _repository.GetStagedata(command.BranchId);
                return Result;
            }
            if (command.Opt == 43)
            {
                var Result = await _repository.GetgasCodeData(command.BranchId, command.SearchText);
                return Result;
            }
            if (command.Opt == 44)
            {
                var Result = await _repository.GetRackDetails(command.BranchId);
                return Result;
            }
            if (command.Opt == 45)
            {
                var Result = await _repository.GetContactName(command.customerid);
                return Result;
            }
            if (command.Opt == 46)
            {
                var Result = await _repository.Getgascodeagainstcustomer(command.customerid, command.BranchId);
                return Result;
            }
            if (command.Opt == 47)
            {
                var Result = await _repository.GetSOagainstGas(command.GasCodeId, command.BranchId);
                return Result;
            }
            if (command.Opt == 48)
            {
                var Result = await _repository.GetPalletType( command.BranchId);
                return Result;
            }
            if (command.Opt == 49)
            {
                var Result = await _repository.GetGasCodePalletAsync(command.GasCodeId,command.PalletTypeId,command.BranchId,command.PalletId);
                return Result;
            }
            if(command.Opt == 50)
            {
                var Result = await _repository.GetDriversName(command.BranchId);
                return Result;
            }

            if (command.Opt == 51)
            {
                var Result = await _repository.GetCustomerFilter(command.BranchId,command.SearchText);
                return Result;
            }
            if (command.Opt == 52)
            {
                var Result = await _repository.GetPackerList(command.BranchId, command.SearchText);
                return Result;
            }
            if (command.Opt == 53)
            {
                var Result = await _repository.GetTruckName(command.BranchId, "");
                return Result;
            }
            if (command.Opt == 54)
            {
                var result = await _repository.GetBarcodePackingList(
                    command.Barcode,
                    command.packingid,
                    command.UserId,
                    command.BranchId,
                    command.PackingDetailsId,
                    command.DeliveryDetailRefId,
                    command.PackerId,
                    command.CustomerId
                );

                return result;
            }

            if (command.Opt == 55)
            {
                var result = await _repository.GetBank(
                    command.UserId,
                    command.BranchId
                );
                return result;
            }
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "No record found",
                    Status = false
                };
            }

        }
    }
}
