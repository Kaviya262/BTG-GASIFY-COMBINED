using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.SaleOrder;

namespace Core.OrderMng.Quotation
{
    public interface IQuotationRepository
    {
        Task<object> GetByIdAsync(int id);
        Task<object> GetAllAsync(Int32 sys_sqnbr, string from_date, string to_date, Int32 BranchId);
        Task<object> AddAsync(QuotationItemsMain item);
        Task<object> UpdateAsync(QuotationItemsMain item);
        Task<object> GetBySqNoAsync(int unit);
        Task<object> CopyAsync(int id);
        Task<object> DeleteAsync(int id, int IsActive,int userid);
        Task<object> Createcustomer(string CustomerName, int OrgId, int BranchId, int userid);
    }
}
