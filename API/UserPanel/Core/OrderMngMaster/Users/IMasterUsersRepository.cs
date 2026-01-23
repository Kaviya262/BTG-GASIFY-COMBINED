using System.Threading.Tasks;

namespace Core.OrderMngMaster.Users
{
    public interface IMasterUsersRepository
    {
        Task<object> GetAllAsync(int opt);

        Task<object> GetAllUser(int? prodId, string fromDate, string toDate, int? branchId, string username, string keyword, int? pageNumber, int? pageSize);

        Task<object> ToggleUserActiveStatusAsync(MasterUsersCommand userStatus);

        Task<object> CreateOrUpdateUserAsync(MasterUsersCommand createOrUpdateUser);
        Task<object> UpdateUserPasswordAsync(MasterUsersCommandpwd createOrUpdateUser);

        Task<object> GetUserByIdAsync(int userId, int branchId);
    }
}
