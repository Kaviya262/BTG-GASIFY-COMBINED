using MediatR;

namespace Application.Master.Customer.ToogleActiveStatus
{
    public class ToogleActiveStatusCommand : IRequest<object>
    {
        public int? CustomerId { get; set; }
        public int? ContactId { get; set; }
        public int? AddressId { get; set; }
        public int? BranchId { get; set; }
        public int? UserId { get; set; }
        public bool IsActive { get; set; }
        public bool IsCustomer { get; set; }
    }
}
