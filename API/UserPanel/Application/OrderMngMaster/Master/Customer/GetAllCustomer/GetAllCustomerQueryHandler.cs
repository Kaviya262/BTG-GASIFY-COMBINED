using MediatR;
using System.Threading;
using System.Threading.Tasks;
using Core.OrderMngMaster.Customer;

namespace Application.Master.Customer.GetAllCustomer
{
    public class GetAllCustomerQueryHandler : IRequestHandler<GetAllCustomerQuery, object>
    {
        private readonly IMasterCustomerRepository _repository;

        public GetAllCustomerQueryHandler(IMasterCustomerRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllCustomerQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllAsync(request.TabId, request.CustomerId, request.ContactId,request.BranchId,request.UserId,request.AddressId, cancellationToken);
        }

    }
}
