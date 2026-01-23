using MediatR;

namespace UserPanel.Application.OrderMngMaster.Master.Users;

public class GetUserByIdQuery : IRequest<object>
{
    public Int32 UserId { get; set; }
    public Int32 BranchId { get; set; }
   
}