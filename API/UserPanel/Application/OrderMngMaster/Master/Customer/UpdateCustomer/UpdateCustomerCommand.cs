using Core.OrderMngMaster.Customer;
using MediatR;

namespace Application.Master.Customer.UpdateCustomer
{
    public class UpdateCustomerCommand : IRequest<object>
    {
        public MasterCustomer Customer { get; set; } = null!;

        public List<MasterCustomeraddress> CustomerAddresses { get; set; } = null!;

        public List<MasterCustomercontact> CustomerContacts { get; set; } = null!;
    }
}
