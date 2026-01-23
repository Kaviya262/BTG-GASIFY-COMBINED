
using Core.AccessRights;
using MediatR;


namespace Application.AccessRights.GetMenusDetails
{
    public class GetMenusDetailsCommandHandler : IRequestHandler<GetMenusDetailsCommand, object>
    {
        private readonly IAccessRightsRepository _repository;


        public GetMenusDetailsCommandHandler(IAccessRightsRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetMenusDetailsCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetMenusDetails(command.userid, command.branchId,command.orgid);
            return Result;

        }
    }
}

