
namespace Core.Master.Pallet
{
    public interface IMasterPalletRepository
    {
        Task<object> AddAsync(MasterPalletModel item);
        Task<object> GetByID(int palletId,int orgId,int branchId);
        Task<object> GetAllAsync(int orgId, int branchId, int? palletTypeId, int? GasCodeId);
        Task<object> UpdateAsync(MasterPalletModel item);
        Task<object> ToogleStatus(MasterPallet item);
    }
}
