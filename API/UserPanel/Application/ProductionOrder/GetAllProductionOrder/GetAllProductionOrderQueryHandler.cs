using Core.OrderMng.ProductionOrder;
using MediatR; 

namespace UserPanel.Application.ProductionOrder.GetAllProductionOrder;

public class GetAllProductionOrderQueryHandler : IRequestHandler<GetAllProductionOrderQuery, object>
{
    private readonly IProductionRepository _repository;

    public GetAllProductionOrderQueryHandler(IProductionRepository repository)
    {
        _repository = repository;
    }

    public async Task<object> Handle(GetAllProductionOrderQuery command, CancellationToken cancellationToken)
    {
        var Result = await _repository.GetAllAsync(command.ProdId, command.from_date, command.to_date,command.BranchId);
        return Result;
    }
}