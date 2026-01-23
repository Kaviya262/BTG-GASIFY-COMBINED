using Application.AccessRights.GetUserAccess.GetUserAccessCommand;
using Core.AccessRights;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.AccessRights.GetUserAccess.GetUserAccessCommand
{
    public class GetUserAccessCommandHandler : IRequestHandler<GetUserAccessCommand, object>
    {
        private readonly IAccessRightsRepository _repository;

        public GetUserAccessCommandHandler(IAccessRightsRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetUserAccessCommand command, CancellationToken cancellationToken)
        {
            var result = await _repository.GetUserRoleDeptMappedAsync(
                command.UserId,
                command.BranchId,
                command.OrgId
            );

            return result;
        }
    }
}
