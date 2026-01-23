
using Core.OrderMngMaster.Customer;
using MediatR;

namespace Application.Master.Customer.CreateCustomer
{
    public class CreateCustomerCommand : IRequest<object>
    {
        public int TabId { get; set; }
        public MasterCustomer? Customer { get; set; }
        public List<MasterCustomeraddress> CustomerAddresses { get; set; } = new();
        public List<MasterCustomercontact> CustomerContacts { get; set; } = new();
    }

}
