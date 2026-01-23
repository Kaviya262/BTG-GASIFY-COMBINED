using MediatR;

namespace Application.Master.Customer.GetAllCustomer
{
    public class GetAllCustomerQuery : IRequest<object>
    {
        public string CustomerName { get; set; } = null!;
        public string FromDate { get; set; } = null!;
        public string ToDate { get; set; } = null!;
        public int TabId { get; set; }
        public int CustomerId { get; set; }
        public int ContactId { get; set; }
        public int BranchId { get; set; }
        public int UserId { get; set; }
        public int AddressId { get; set; }

    }
}
