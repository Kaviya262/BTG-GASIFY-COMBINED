using Application.AccessRights.Roledropdown;
using Core.AccessRights;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.AccessRights.Roledropdown
{
    public class RoledropdownCommandHandler : IRequestHandler<RoledropdownCommand, object>
    {
        private readonly IAccessRightsRepository _repository;

        public RoledropdownCommandHandler(IAccessRightsRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(RoledropdownCommand command, CancellationToken cancellationToken)
        {
           
            var result = await _repository.GetRolesAsync(command.BranchId, command.OrgId);

            return result;
        }
    }
}
