using System;
using System.Threading.Tasks;

namespace Core.AccessRights
{
    public interface IAccessRightsRepository
    {
        
        Task<object> GetMenusDetails(int userid, int branchId, int orgid);
        Task<object> GetApprovalSettings(int userid, int branchId, int orgid, int screenid);

        Task<object> GetRolesAsync(int branchId, int orgId);

        Task<object> GetDepartmentsAsync(int branchId, int orgId);

        Task<object> GetModuleScreensAsync(int branchId, int orgId);

        Task<object> SaveAccessRights(AccessRightsSaveRequest header);

        Task<object> UpdateAccessRights(AccessRightsSaveRequest header);

        Task<object> GetAccessRightsByBranchOrg(int branchId, int orgId);

        Task<object> GetAccessRightsDetailById(int id);


        Task<object> GetUserRoleDeptMappedAsync(int userId, int branchId, int orgId);

    }
}
