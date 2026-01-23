using Core.AccessRights;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.AccessRights.GetAllAccessRights
{
    public class GetAllAccessRightsCommandHandler : IRequestHandler<GetAllAccessRightsCommand, object>
    {
        private readonly IAccessRightsRepository _repository;

        public GetAllAccessRightsCommandHandler(IAccessRightsRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllAccessRightsCommand request, CancellationToken cancellationToken)
        {
            if (request == null || request.BranchId <= 0 || request.OrgId <= 0)
            {
                return null;
            }

    
            return await _repository.GetAccessRightsByBranchOrg(request.BranchId, request.OrgId);
        }
    }
}
