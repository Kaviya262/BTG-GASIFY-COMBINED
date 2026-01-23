using MediatR;

namespace UserPanel.Application.OrderMngMaster.Master.Users;
public class GetAllUserQuery : IRequest<object>
{
    public int? ProdId { get; set; }
    public string FromDate { get; set; }
    public string ToDate { get; set; }
    public int? BranchId { get; set; }

    public string Username { get; set; }
    public string Keyword { get; set; }
    public int? PageNumber { get; set; }
    public int? PageSize { get; set; }
}
