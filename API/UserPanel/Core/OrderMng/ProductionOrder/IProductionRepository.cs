 
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.OrderMng.ProductionOrder
{
    public interface IProductionRepository
    {
        Task<object> AddAsync(ProductionItems item);
        Task<object> UpdateAsync(ProductionItems item);

        Task<object> GetByIdAsync(int id);
        Task<object> GetAllAsync(Int32 ProdId,  string from_date, string to_date, Int32 BranchId); 
        Task<object> GetByProductionOrderNoAsync(int unit);
    }
}
