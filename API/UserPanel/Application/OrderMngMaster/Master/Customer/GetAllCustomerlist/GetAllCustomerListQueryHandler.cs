using Core.OrderMngMaster.Customer;
using MediatR;

namespace Application.Master.Customer.GetAllCustomer
{
    public class GetAllCustomerListQueryHandler : IRequestHandler<GetAllCustomerListQuery, object>
    {
        private readonly IMasterCustomerRepository _repository;

        public GetAllCustomerListQueryHandler(IMasterCustomerRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllCustomerListQuery request, CancellationToken cancellationToken)
        {
            var customerName = request.CustomerName != null && request.CustomerName.Length == 2
                ? request.CustomerName.Replace("\"", "")
                : request.CustomerName;

            return await _repository.GetAllCustomerAsync(
                customerName,
                request.BranchId,
                request.UserId,
                request.CustomerId,
                request.ContactId,
                request.AddressId
            );
        }
    }
}


