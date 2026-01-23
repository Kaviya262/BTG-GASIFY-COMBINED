 
using Core.OrderMngMaster.Customer;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Master.Customer.UpdateCustomer
{
    public class UpdateCustomerCommandHandler : IRequestHandler<UpdateCustomerCommand, object>
    {
        private readonly IMasterCustomerRepository _repository;

        public UpdateCustomerCommandHandler(IMasterCustomerRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
        {
            MasterCustomerModel customerModel = new MasterCustomerModel();
            customerModel.Customer = request.Customer;
            customerModel.CustomerAddresses = request.CustomerAddresses;
            customerModel.CustomerContacts = request.CustomerContacts;

            var data = await _repository.AddAsync(customerModel);
            return data;
        }
    }
}
