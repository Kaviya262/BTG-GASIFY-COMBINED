using Core.Abstractions;
using Core.FinanceModule.Revenue;
using MediatR;

namespace Application.FinanceModule.Revenue.UpdateRevenue
{
    public class UpdateRevenueCommandHandler : IRequestHandler<UpdateRevenueCommand, object>
    {
        private readonly IRevenueRepository _repository;
        private readonly IUnitOfWorkDB3 _unitOfWorkDB3;

        public UpdateRevenueCommandHandler(IRevenueRepository repository, IUnitOfWorkDB3 unitOfWorkDB3)
        {
            _repository = repository;
            _unitOfWorkDB3 = unitOfWorkDB3;
        }
        public async Task<object> Handle(UpdateRevenueCommand command, CancellationToken cancellationToken)
        {
            if (command == null)
                throw new ArgumentNullException(nameof(command));

            var Cash = new RevenueModel();
            Cash.Header = command.Header;

            var data = await _repository.UpdateAsync(Cash);
            _unitOfWorkDB3.Commit();
            return data;

        }
    }
}

