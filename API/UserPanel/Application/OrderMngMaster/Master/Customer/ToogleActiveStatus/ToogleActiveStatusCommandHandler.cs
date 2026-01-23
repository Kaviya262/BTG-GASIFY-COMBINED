
using Core.OrderMngMaster.Customer;
using MediatR;

namespace Application.Master.Customer.ToogleActiveStatus
{
    public class ToogleActiveStatusCommandHandler : IRequestHandler<ToogleActiveStatusCommand, object>
    {
        private readonly IMasterCustomerRepository _repository;

        public ToogleActiveStatusCommandHandler(IMasterCustomerRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(ToogleActiveStatusCommand request, CancellationToken cancellationToken)
        {
            MasterCustomer customer = new MasterCustomer();
            customer.CustomerId = request.CustomerId;
            customer.ContactId = request.ContactId;
            customer.IsActive = request.IsActive;
            customer.BranchId = request.BranchId;
            customer.UserId = request.UserId;
            customer.AddressId = request.AddressId;
            customer.IsCustomer = request.IsCustomer;


            var data = await _repository.ToogleStatus(customer);
            return data;
        }
    }
}
