using Application.AccessRights.ModuleScreen;
using Core.AccessRights;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.AccessRights.ModuleScreen
{
    public class ModuleScreenCommandHandler : IRequestHandler<ModuleScreenCommand, object>
    {
        private readonly IAccessRightsRepository _repository;

        public ModuleScreenCommandHandler(IAccessRightsRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(ModuleScreenCommand command, CancellationToken cancellationToken)
        {
            
            var result = await _repository.GetModuleScreensAsync(command.BranchId, command.OrgId);
            return result;
        }
    }
}
