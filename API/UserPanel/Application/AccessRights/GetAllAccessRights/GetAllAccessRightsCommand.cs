using System;
using MediatR;

namespace Application.AccessRights.GetAllAccessRights
{
    public class GetAllAccessRightsCommand : IRequest<object>
    {
        public int BranchId { get; set; }
        public int OrgId { get; set; }
    }
}
