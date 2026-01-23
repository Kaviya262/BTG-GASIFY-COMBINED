using Core.OrderMngMaster.Users;
using MediatR;

namespace Application.Master.Users.GetAllSalesPerson
{
    public class GetAllSalesPersonQueryHandler : IRequestHandler<GetAllSalesPersonQuery, object>
    {
        private readonly IMasterUsersRepository _repository;

        public GetAllSalesPersonQueryHandler(IMasterUsersRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllSalesPersonQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllAsync(request.opt);
        }
    }
}
