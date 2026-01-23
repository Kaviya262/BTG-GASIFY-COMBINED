using BackEnd.Finance.Accounts.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackEnd.Finance.Accounts.Interfaces
{
    public interface IAccountTypeRepository
    {
        Task<IEnumerable<AccountType>> GetAllAsync();
        Task<AccountType> InsertAsync(AccountType accountType);
        Task<AccountType> UpdateAsync(AccountType accountType);
        Task<int> DeleteAsync(int id);
    }
}
