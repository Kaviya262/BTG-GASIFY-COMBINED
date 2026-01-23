using System.Threading;
using System.Threading.Tasks;
using Core.AccessRights;
using MediatR;

namespace Application.AccessRights.Departmentdropdown
{
    
    public class DepartmentdropdownCommandHandler : IRequestHandler<DepartmentdropdownCommand, object>
    {
        private readonly IAccessRightsRepository _repository;

        public DepartmentdropdownCommandHandler(IAccessRightsRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(DepartmentdropdownCommand command, CancellationToken cancellationToken)
        {
            
            var result = await _repository.GetDepartmentsAsync(command.BranchId, command.OrgId);
            return result;
        }
    }
}
