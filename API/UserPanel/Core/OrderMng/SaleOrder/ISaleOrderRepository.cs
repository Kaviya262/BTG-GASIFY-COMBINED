using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.OrderMng.SaleOrder
{
    public interface ISaleOrderRepository
    {
        Task<object> AddAsync(SaleOrderItemmain item);

        Task<object> UpdateAsync(SaleOrderItemmain item);


        Task<object> GetAllAsync(Int32 customer, string from_date, string to_date, Int32 BranchId, string PO, Int32 FilterType,Int32 type );

        Task<object> GetByIdAsync( int orderid);


        Task<object> GetBySoNoAsync(int BranchId);
        Task<object> GetAllExportAsync(Int32 customer, string from_date, string to_date, Int32 BranchId, string PO, Int32 FilterType);
        
    }
}
