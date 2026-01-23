using MediatR;

namespace Application.AccessRights.GetUserAccess.GetUserAccessCommand
{
    public class GetUserAccessCommand: IRequest<object>
    {
        public int UserId { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
    }
}
