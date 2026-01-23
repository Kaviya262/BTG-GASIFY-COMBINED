 using Core.OrderMngMaster.Customer;
using MediatR;

namespace Application.Master.Customer.GetCustomerByID
{
    public class GetCustomerByIDQueryHandler : IRequestHandler<GetCustomerByIDQuery, object>
    {
        private readonly IMasterCustomerRepository _repository;

        public GetCustomerByIDQueryHandler(IMasterCustomerRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetCustomerByIDQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetByID(request.CustomerId,request.TabId,request.BranchId);
        }
    }
}
