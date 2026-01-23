

namespace Core.Master.Gas
{
    public interface IMasterGasRepository
    {
        Task<object> AddAsync(MasterGas item);
        Task<object> GetByID(int id);
        Task<object> GetAllAsync(string name, string volume, string pressure);
        Task<object> UpdateAsync(MasterGas item);
        Task<object> ToogleStatus(MasterGas item);
        Task<object> GetAllGasTypesAsync();

    }
}
