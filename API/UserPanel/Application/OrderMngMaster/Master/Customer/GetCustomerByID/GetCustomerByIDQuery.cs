using MediatR;

namespace Application.Master.Customer.GetCustomerByID
{
    public class GetCustomerByIDQuery : IRequest<object>
    {
        public int CustomerId { get; set; }
        public int TabId { get; set; }
        public int BranchId { get; set; }
    }
}
