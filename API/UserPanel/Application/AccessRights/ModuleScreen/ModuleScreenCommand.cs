using MediatR;

namespace Application.AccessRights.ModuleScreen
{
    public class ModuleScreenCommand : IRequest<object>
    {
        public int BranchId { get; set; }
        public int OrgId { get; set; }
    }
}
