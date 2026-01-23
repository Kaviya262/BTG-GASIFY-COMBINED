using Core.Abstractions;
using Core.OrderMng.Distribution.MasterSalesOrders;
using Core.OrderMng.PackingAndDO;
using MediatR;



namespace Application
{
    public class MasterSalesOrderCommandHandler : IRequestHandler<CreatePackingAndDOCommand, object>
    {
        private readonly IMasterSalesOrderRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public MasterSalesOrderCommandHandler(IMasterSalesOrderRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(CreatePackingAndDOCommand command, CancellationToken cancellationToken)
        {
            PackingAndDOItems PackingItems = new PackingAndDOItems();
            PackingItems.Details = command.Details;
            PackingItems.Header = command.Header;
            PackingItems.SODtl = command.SODtl;
            PackingItems.Customers = command.Customers;
            PackingItems.GasDtl = command.GasDtl;

            var data = await _repository.AddAsync(PackingItems);
            _unitOfWork.Commit();
            return data;

        }

    }
}


