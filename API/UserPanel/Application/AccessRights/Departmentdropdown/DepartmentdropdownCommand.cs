using MediatR;

namespace Application.AccessRights.Departmentdropdown
{
    
    public class DepartmentdropdownCommand : IRequest<object>
    {
        public int BranchId { get; set; }
        public int OrgId { get; set; }
    }
}
