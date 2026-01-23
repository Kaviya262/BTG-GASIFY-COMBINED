using Core.AccessRights;
using MediatR;


namespace Application.AccessRights.GetApprovalSettings
{
    public class GetApprovalSettingsCommandHandler : IRequestHandler<GetApprovalSettingsCommand, object>
    {
        private readonly IAccessRightsRepository _repository;


        public GetApprovalSettingsCommandHandler(IAccessRightsRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetApprovalSettingsCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetApprovalSettings(command.userid, command.branchId,command.orgid,command.screenid);
            return Result;

        }
    }
}

