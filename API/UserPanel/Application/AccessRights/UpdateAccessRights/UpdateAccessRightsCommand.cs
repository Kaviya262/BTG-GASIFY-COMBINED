using Core.AccessRights;
using MediatR;

namespace Application.AccessRights.UpdateAccessRights
{
    public class UpdateAccessRightsCommand : IRequest<object>
    {
        public AccessRightsSaveRequest Request { get; set; }

    }
}
