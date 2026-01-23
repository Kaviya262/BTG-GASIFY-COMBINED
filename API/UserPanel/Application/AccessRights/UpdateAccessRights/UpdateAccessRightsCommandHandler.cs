using Core.AccessRights;
using Core.Abstractions;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.AccessRights.UpdateAccessRights
{
    public class UpdateAccessRightsCommandHandler : IRequestHandler<UpdateAccessRightsCommand, object>
    {
        private readonly IAccessRightsRepository _repository;

        public UpdateAccessRightsCommandHandler(IAccessRightsRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(UpdateAccessRightsCommand command, CancellationToken cancellationToken)
        {
            var request = command?.Request;

            if (request == null || string.IsNullOrWhiteSpace(request.Role))
            {
                return null; 
            }

            return await _repository.UpdateAccessRights(request);
        }
    }
}
