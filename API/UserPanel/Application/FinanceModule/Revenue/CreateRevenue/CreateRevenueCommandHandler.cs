using Core.Abstractions;
using Core.FinanceModule.Revenue;
using MediatR;

namespace Application.FinanceModule.Revenue.CreateRevenue
{
    public class CreateRevenueCommandHandler : IRequestHandler<CreateRevenueCommand, object>
    {
        public readonly IRevenueRepository _repository;
        public readonly IUnitOfWorkDB3 _unitOfWorkDB3;

        public CreateRevenueCommandHandler(IRevenueRepository repository, IUnitOfWorkDB3 unitOfWorkDB3)
        {
            _repository = repository;
            _unitOfWorkDB3 = unitOfWorkDB3;
        }
        public async Task<object> Handle(CreateRevenueCommand command, CancellationToken cancellationToken)
        {
            if (command == null)
            {
                throw new ArgumentNullException(nameof(command));
            }

            var revenue = new RevenueModel();
            revenue.Header = command.Header;

            var data = await _repository.AddAsync(revenue);
            _unitOfWorkDB3.Commit();
            return data;

        }
    }
}
