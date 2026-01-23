using Core.OrderMngMaster.Customer;
using DocumentFormat.OpenXml.Bibliography;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.Supplier
{
    public interface ISupplierMasterRepository
    {
        Task<object> GetAllAsync(int branchid, int orgid, int supplierid, int cityid , int stateid ,int suppliercategoryid);

       Task<object> AddAsync(SupplierMaster item);

        Task<object> UpdateAsync(SupplierMaster item);

        Task<object> GetCountryList(int branchid, int orgid);
        Task<object> GetStateList(int branchid, int orgid);
        Task<object> GetCityList(int branchid, int orgid);

        Task<object> GetSupplierBlockList(int branchid, int orgid);

        Task<object> GetSupplierCategoryList(int branchid, int orgid);

        Task<object> GetCurrencyList(int branchid, int orgid);
        Task<object> GetSupplierList(int branchid, int orgid);
        Task<object> GetAllTaxList(int branchid, int orgid);

        Task<object> GetAllPaymentTerms(int branchid, int orgid);
        Task<object> GetAllDeliveryTerms(int branchid, int orgid);

        Task<object> UpdateSupplierStatus(int branchid, int orgid, int supplierid, bool isactive,int userid);
        Task<object> GetAllVatList(int branchid, int orgid);
    }
}
