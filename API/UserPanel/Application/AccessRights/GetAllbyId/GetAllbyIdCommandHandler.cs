using System.Threading;
using System.Threading.Tasks;
using Core.AccessRights;
using MediatR;

namespace Application.AccessRights.GetAllbyId
{
    public class GetAllByIdCommandHandler : IRequestHandler<GetAllByIdCommand, object>
    {
        private readonly IAccessRightsRepository _accessRightsRepository;

        public GetAllByIdCommandHandler(IAccessRightsRepository accessRightsRepository)
        {
            _accessRightsRepository = accessRightsRepository;
        }

        public async Task<object> Handle(GetAllByIdCommand request, CancellationToken cancellationToken)
        {
           
            var result = await _accessRightsRepository.GetAccessRightsDetailById(request.Id);
            return result;
        }
    }
}
