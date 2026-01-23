using Core.OrderMng.PackingAndDO;

namespace Core.OrderMng.Distribution.MasterSalesOrders
{
    public interface IMasterSalesOrderRepository
    {
        Task<object> GetAll(int? searchBy, int? customerId, int? gasCodeId, int? branchId);

        Task<object> AddAsync(PackingAndDOItems item);
        Task<object> UpdateAsync(PackingAndDOItems Obj);
    }

}
