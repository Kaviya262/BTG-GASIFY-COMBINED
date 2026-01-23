using Core.OrderMng.Quotation;
using MediatR;

namespace UserPanel.Application.Quotation.CustomerCreation;

public class CustomerCreationCommand : IRequest<object>
{
  public string CustomerName { get; set; }
    public Int32 UserId { get; set; }
    public Int32 BranchId { get; set; }
    public Int32 OrgId { get; set; }

}
