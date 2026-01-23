using Core.Abstractions;
using Core.OrderMng.ProductionOrder; 
using MediatR;
using UserPanel.Application.ProductionOrder.CreateProductionOrder; 
using UserPanel.Core.Abstractions;


public class CreateProductionOrderCommandHandler : IRequestHandler<CreateProductionOrderCommand, object>
{
    private readonly IProductionRepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork; 

    public CreateProductionOrderCommandHandler(IProductionRepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        
    }

    public async Task<object> Handle(CreateProductionOrderCommand command, CancellationToken cancellationToken)
    {
        ProductionItems ProductionItems = new ProductionItems();
        ProductionItems.Details = command.Details;
        ProductionItems.Header = command.Header;
       var data= await _repository.AddAsync(ProductionItems);
        _unitOfWork.Commit();
        return data;
        
    }
}