 
using Core.OrderMngMaster.Customer;
using MediatR;

namespace Application.Master.Customer.CreateCustomer
{
    public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, object>
    {
        private readonly IMasterCustomerRepository _repository;

        public CreateCustomerCommandHandler(IMasterCustomerRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
        {
            MasterCustomerModel customerModel = new MasterCustomerModel();
            customerModel.TabId = request.TabId;
            customerModel.Customer = request.Customer;
            customerModel.CustomerAddresses = request.CustomerAddresses;
            customerModel.CustomerContacts = request.CustomerContacts;

            var data = await _repository.AddAsync(customerModel);
            return data;
        }
    }
}
