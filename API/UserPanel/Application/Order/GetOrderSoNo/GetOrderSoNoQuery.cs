
using MediatR;

namespace Application.Order.GetOrderSoNo
{
    public class GetOrderSoNoQuery : IRequest<object>

    {
        public Int32 BranchId { get; set; }

    }
}







