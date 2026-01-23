using Core.AccessRights;
using MediatR;

namespace Application.AccessRights.SaveAccessRights
{
    public class SaveAccessRightsCommand : IRequest<object>
    {
        public AccessRightsSaveRequest Header { get; set; }

    }
}
