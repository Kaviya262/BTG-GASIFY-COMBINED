using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.ReturnOrder
{
    public interface IReturnOrderRepository
    {
        Task<object> AddAsync(ReturnOrderItem item);

        Task<object> UpdateAsync(ReturnOrderItem item);


        Task<object> GetAllAsync(Int32 customer, string from_date, string to_date, Int32 BranchId, Int32 gascodeid);

        Task<object> GetByIdAsync( int orderid);


        Task<object> GetProductionOrderSqNoQuery(int BranchId);
       
    }
}
