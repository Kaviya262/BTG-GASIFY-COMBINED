using MediatR;
using System.Threading;
using System.Threading.Tasks;
using Core.AccessRights;

namespace Application.AccessRights.SaveAccessRights
{
    public class SaveAccessRightsCommandHandler : IRequestHandler<SaveAccessRightsCommand, object>
    {
        private readonly IAccessRightsRepository _repository;

        public SaveAccessRightsCommandHandler(IAccessRightsRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(SaveAccessRightsCommand request, CancellationToken cancellationToken)
        {
         
            return await _repository.SaveAccessRights(request.Header);
        }
    }
}
