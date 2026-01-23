using Core.Abstractions;
using Core.OrderMng.Distribution.MasterSalesOrders;
using MediatR;

namespace Application.Distribution.MasterSalesOrder.GetAll
{
    public class GetAllMasterSalesOrderCommandHandler : IRequestHandler<GetAllMasterSalesOrderCommand, object>
    {
        private readonly IMasterSalesOrderRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetAllMasterSalesOrderCommandHandler(IMasterSalesOrderRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(GetAllMasterSalesOrderCommand command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetAll(command.SearchBy, command.CustomerId, command.GasCodeId, command.BranchId);
            return Result;
        }

    }
}
