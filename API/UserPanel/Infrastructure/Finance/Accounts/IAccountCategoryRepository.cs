using BackEnd.Finance.Accounts.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Finance.Accounts
{
    // Duplicate interface in Infrastructure namespace to satisfy existing repository references.
    public interface IAccountCategoryRepository
    {
        Task<IEnumerable<AccountCategory>> GetAll();
        Task<AccountCategory> Insert(AccountCategory category);
        Task Update(AccountCategory category);
        Task Delete(int id);
    }
}
