using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.Master
{
   public interface IPurchaseMasterRepository
    {
        Task<object> GetUserDetails(Int32 branchid, string Searchtext, int orgid, int id);
        Task<object> GetDepartMentDetails(Int32 branchid, string Searchtext, int orgid, int id);
        Task<object> GetPurchaseTypeDetails(Int32 branchid, string Searchtext, int orgid, int id);
        Task<object> GetUomDetails(Int32 branchid, string Searchtext, int orgid, int id);
        Task<object> GetItemDetails(Int32 branchid, string Searchtext, int orgid, int id,int groupid);

        Task<object> GetPRType(int branchid, string searchtext, int orgid, int id);
        Task<object> GetSupplierDetails(int branchid, string searchtext, int orgid, int id);
        Task<object> GetPOSupplierDetails(int branchid, string searchtext, int orgid, int id);
        Task<object> GetPaymentTermsDetails(int branchid, string searchtext, int orgid, int id);
        Task<object> GetItemGroup(Int32 branchid, string Searchtext, int orgid, int id);
        Task<object> GetDeliveryTermsDetails(int branchid, string searchtext, int orgid, int id);
    }
}
