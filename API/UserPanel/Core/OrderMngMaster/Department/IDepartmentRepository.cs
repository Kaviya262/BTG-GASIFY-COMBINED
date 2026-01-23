using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Core.Master.Currency.CurrencyItem;
using static Core.Master.Department.DepartmentItem;

namespace Core.Master.Department
{
    public interface IDepartmentRepository
    {
        Task<object> GetAllDepartmentAsync(int opt,int deptId,string departCode, string departName);
        Task<object> GetDepartmentByIdAsync(int opt, int deptId, string departCode, string departName);
        Task<object> GetDepartmentByCodeAsync(int opt, int deptId, string departCode, string departName);
        Task<object> GetDepartmentByNameAsync(int opt, int deptId, string departCode, string departName);
        Task<object> CreateDepartmentAsync(DepartmentItemMain department);
        Task<object> UpdateDepartmentAsync(DepartmentItemMain department);
    }
}
