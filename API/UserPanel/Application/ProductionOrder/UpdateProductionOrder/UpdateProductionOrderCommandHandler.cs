
using Core.Abstractions;
using Core.OrderMng.ProductionOrder;
using MediatR;
using UserPanel.Application.ProductionOrder.UpdateProductionOrder;
using UserPanel.Core.Abstractions;


public class UpdateProductionOrderCommandHandler : IRequestHandler<UpdateProductionOrderCommand,  object>
{
    private readonly IProductionRepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork; 

    public UpdateProductionOrderCommandHandler(IProductionRepository repository, IUnitOfWorkDB1 unitOfWork )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
         
    }

    public async Task<object> Handle(UpdateProductionOrderCommand command, CancellationToken cancellationToken)
    {

        ProductionItems ProductionItems = new ProductionItems();
        ProductionItems.Details = command.Details;
        ProductionItems.Header = command.Header;

        var data=await _repository.UpdateAsync(ProductionItems);
        _unitOfWork.Commit();

        return data;
    }
}
