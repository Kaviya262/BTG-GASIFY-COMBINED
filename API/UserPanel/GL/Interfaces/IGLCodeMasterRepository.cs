using Core.AccountsCategories.GLcodemaster;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GL.Interfaces
{
    public interface IGLCodeMasterRepository
    {
        Task<IEnumerable<GLCodeMaster>> GetAllAsync();
        Task<GLCodeMaster> CreateAsync(GLCodeMaster entity);
        Task<GLCodeMaster> UpdateAsync(GLCodeMaster entity);
        Task DeleteAsync(int id);
        Task<string> GenerateGLSequenceIdAsync(int categoryId, int inputId);
        Task<IEnumerable<AccountTypeDetailsDto>> GetAllAccountTypeDetailsAsync();
        Task<AccountTypeDetailsDto> GetAccountTypeDetailsByIdAsync(int glId);
    }
}
