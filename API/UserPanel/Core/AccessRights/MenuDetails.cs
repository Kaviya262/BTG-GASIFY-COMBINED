using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.AccessRights
{
    public class MenuDetails
    {
    }
    public class MenuScreen
    {
        public int MenuOrder { get; set; }

        public int ModuleId { get; set; }
        public int ScreenId { get; set; }
        public string URL { get; set; }
        public string Icon { get; set; }
        public string ScreenName { get; set; }
        public List<MenuModule> Module { get; set; } = new();
    }

    public class MenuModule
    {
        public int ModuleId { get; set; }
        public string ModuleName { get; set; }
        public string Icon { get; set; }
        public int? ParentModuleId { get; set; }
        public int MenuOrder { get; set; }
        public List<MenuScreen> Screen { get; set; } = new();
    }

    public class MenuResponse
    {
        public string HomePage { get; set; } 
        public List<MenuModule> Menus { get; set; } = new();
    }

    public class RoleDropdown
    {
        public string Id { get; set; }    
        public string Name { get; set; }  
    }

    public class DepartmentDropdown
    {
        public int DepartmentId { get; set; }             
        public string DepartmentCode { get; set; }  
    }


    public class ModuleScreens
    {
        public string ModuleName { get; set; } = string.Empty;
        public List<ScreenPermissions> Screens { get; set; } = new();
    }

    public class ScreenPermissions
    {
        public string ScreenName { get; set; } = string.Empty;
        public Permissions Permissions { get; set; } = new Permissions();
    }

    public class AccessRightsSaveRequest
    {

        public int HeaderId { get; set; } = 0;

        public int DepartmentId { get; set; } 
        public string Role { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public DateTime? EffectiveDate { get; set; }
        public bool IsHOD { get; set; }
        public bool? IsActive { get; set; }

        public string? RoleId { get; set; }
        public List<ModuleScreens> Modules { get; set; } = new();
    }

    public class Permissions
    {
        public bool View { get; set; }
        public bool Edit { get; set; }
        public bool Delete { get; set; }
        public bool Post { get; set; }
        public bool Save { get; set; }
        public bool Print { get; set; }
        public bool ViewRate { get; set; }
        public bool SendMail { get; set; }
        public bool ViewDetails { get; set; }
        public int RecordsPerPage { get; set; }
    }

    public class UserAccessResponse
    {
        public UserAccessUser User { get; set; }
        public UserAccessHeader Header { get; set; }
        public List<UserAccessDetail> Details { get; set; } = new();
    }

    public class UserAccessUser
    {
        public int Id { get; set; } 

        public string UserRoleId { get; set; }
        public string UserDepartmentId { get; set; }
        public bool IsHOD { get; set; }
    }

    public class UserAccessHeader
    {
        public int HeaderId { get; set; }
        public string Role { get; set; }
        public string Department { get; set; }
        public string RoleId { get; set; }
        public string DepartmentId { get; set; }

        public string Hod { get; set; }
        public int HeaderBranchId { get; set; }
        public int HeaderOrgId { get; set; }
        public bool HeaderIsActive { get; set; }
        public string HeaderCreatedBy { get; set; }
        public DateTime? HeaderCreatedDate { get; set; }
        public string HeaderCreatedIP { get; set; }
        public string HeaderModifiedBy { get; set; }
        public DateTime? HeaderLastModifiedDate { get; set; }
        public string HeaderModifiedIP { get; set; }
        public DateTime? EffectiveFrom { get; set; }
    }

    public class UserAccessDetail
    {
        public int DetailId { get; set; }
        public string Module { get; set; }
        public string Screen { get; set; }
        public bool View { get; set; }
        public bool Edit { get; set; }
        public bool Delete { get; set; }
        public bool Post { get; set; }
        public bool Save { get; set; }
        public bool Print { get; set; }
        public bool ViewRate { get; set; }
        public bool SendMail { get; set; }
        public bool ViewDetails { get; set; }
        public int Records { get; set; }
        public bool DetailIsActive { get; set; }
    }

}
