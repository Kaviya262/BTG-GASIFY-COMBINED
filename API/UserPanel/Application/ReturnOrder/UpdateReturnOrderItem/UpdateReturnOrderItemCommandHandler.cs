 
using MediatR;

using UserPanel.Core.Abstractions;
  
using Core.ReturnOrder;
using Core.Abstractions;



namespace UserPanel.Application.ReturnOrder.UpdateReturnOrderItem;

public  class UpdateReturnOrderItemCommandHandler : IRequestHandler<UpdateReturnOrderItemCommand, object>
{
    private readonly IReturnOrderRepository _repository;

    private readonly IUnitOfWorkDB1 _unitOfWork;
    
    
    public UpdateReturnOrderItemCommandHandler(IReturnOrderRepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        
    }
    public async Task<object> Handle(UpdateReturnOrderItemCommand command,CancellationToken cancellationToken)
    {
        ReturnOrderItem returnOrderItems = new ReturnOrderItem();
        returnOrderItems.Details = command.Details;
        returnOrderItems.Header = command.Header;
        returnOrderItems.DODetail = command.DODetail;
        returnOrderItems.GasDetail = command.GasDetail;

        var data = await _repository.UpdateAsync(returnOrderItems);
        _unitOfWork.Commit();

        return data;


    }
}



