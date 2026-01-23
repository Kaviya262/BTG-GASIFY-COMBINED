using BackEnd.Finance.Accounts.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackEnd.Finance.Accounts.Interfaces
{
    public interface IAccountCategoryRepository
    {
        Task<IEnumerable<AccountCategory>> GetAll();
        Task<AccountCategory> Insert(AccountCategory category);
        Task Update(AccountCategory category);
        Task Delete(int id);
    }
}
