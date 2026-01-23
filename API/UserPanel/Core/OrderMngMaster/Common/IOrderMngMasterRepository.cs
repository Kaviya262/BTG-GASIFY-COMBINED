using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.OrderMngMaster.Common
{
    public interface IOrderMngMasterRepository
    {
        Task<object> GetQuotationTypeAsync(Int32 branchid);
        Task<object> GetCustomerContactAsync(Int32 customerid, Int32 sqid);//
        Task<object> GetCustomerAddressAsync(Int32 contactid, Int32 sqid);//
        Task<object> GetCustomerAsync(Int32 branch, Int32 sqid, string searchtext);//
        Task<object> GetPaymentTermAsync(Int32 branch, Int32 sqid);//
        Task<object> GetGasCodeAsync(Int32 branch, Int32 sqid, string searchtext);
        Task<object> GetGasCodePalletAsync(Int32 gasCodeId, Int32 palletTypeId, Int32 branchId, Int32 palletId);
        Task<object> GetUOMAsync(Int32 branch, Int32 sqid, string searchtext);//
        Task<object> GetCurrencyAsync(Int32 branch, Int32 sqid, string searchtext);//
        Task<object> GetGasCodeDetailsAsync(Int32 GasCodeId);
        Task<object> GetCurrencyConversionAsync(Int32 currencyid);
        Task<object> GetSalesPersonAsync(Int32 branch, Int32 sqid, string searchtext);//
        Task<object> GetPaymentMethodAsync(Int32 branch, Int32 sqid);//
        Task<object> GetSQNumberAsync(Int32 branch, string searchtext);


        Task<object> GetSOTypeAsync(Int32 branch);
        Task<object> GetSQCustomerAsync(Int32 branch);
        Task<object> GetCustomerSQAsync(Int32 customerid, Int32 branch, Int32 soid);

        Task<object> GetSQGasCodeAsync(Int32 sqid, Int32 branch);
        Task<object> GetCustomerGasCodeAsync(Int32 customerid, Int32 GasCodeId, Int32 branch,Int32 SOID);

        Task<object> GetCustomerGasCodeDetailAsync(Int32 customerid, Int32 branch, Int32 soid);

        Task<object> GetPackingCustomerIdAsync(Int32 branch);


        Task<object> GetCustomerPackingIdAsync(Int32 customerid, Int32 branch);

        Task<object> GetGasTypes(Int32 branch);
        Task<object> GetGasCodeAgGasTypes(Int32 GasTypeId, Int32 branch);
        Task<object> GetCylinderDetails(string SearchText, Int32 branch, int GasCodeId, int ProductionId);
        Task<object> GetProductionNo(string SearchText, Int32 branch);

        Task<object> GetPackingDetails(Int32 packingid, Int32 branch);

        Task<object> GetsaleordercustomerId(Int32 branch);


        Task<object> GetPackersName(Int32 branch);

        Task<object> GetDriversName(Int32 branch);
        Task<object> GetPackingSO(Int32 customerid, Int32 branch, int packingid);


        Task<object> GetPackingSODetail(Int32 soid, Int32 branch);

                Task<object> GetReturnOrderCylinderDetails(string SearchText, Int32 branch, int GasCodeId, int ProductionId);
                Task<object> GetReturnOrderCustomerPackingIdAsync(Int32 customerid, Int32 branch);
                Task<object> GetDeliveryAgDODetails(Int32 PackingId);
                Task<object> GetDeliveryAgGasDetails(Int32 GasCodeId);
                Task<object> GetReturnOrderGasCode(Int32 BranchId, string SearchText, int CustomerId);
                Task<object> GetSoHistory(Int32 BranchId, Int32 sqid, Int32 soid, Int32 GasCodeId);
                Task<object> GetBarcodeDetails(string Barcode, Int32 PackingId,int doid);
                Task<object> GetPressure(string SearchText, Int32 BranchId);
                Task<object> GetVolume(string SearchText, Int32 BranchId);
                Task<object> IsAdminUser(string UserId);
                Task<object> GetCylinderSize(int BranchId);
                Task<object> GetSOGasCodeDetails(int soid);
         Task<object> GetGasCode(int BranchId);
        Task<object> GetStagedata(int BranchId);
        Task<object> GetgasCodeData(Int32 BranchId, string SearchText);
        Task<object> GetRackDetails(Int32 BranchId);
        Task<object> GetContactName(int customerId);
        Task<object> GetPalletType(int branchId);
        Task<object> Getgascodeagainstcustomer(Int32 CustomerId,Int32 BranchId);
        Task<object> GetSOagainstGas(Int32 GasCodeId, Int32 branchid);
        Task<object> GetCustomerFilter(Int32 BranchId, string SearchText);
        Task<object> GetPackerList(Int32 BranchId, string SearchText);
        Task<object> GetTruckName(Int32 BranchId, string SearchText);
        Task<object> GetBarcodePackingList(string Barcode, int packingId, string userId, int branchId, int? packingDetailsId, int? deliveryDetailRefId, int? packerId, int? customerId);

        Task<object> GetBank(string userId, int branchId);
    }
}
