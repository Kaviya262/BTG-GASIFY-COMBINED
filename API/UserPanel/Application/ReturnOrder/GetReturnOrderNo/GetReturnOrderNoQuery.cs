
using MediatR;

namespace UserPanel.Application.ReturnOrder.GetReturnOrderNo;

public class GetReturnOrderNoQuery : IRequest<object>

{
    public Int32 BranchId { get; set; }

}







