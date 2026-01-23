using Core.OrderMng.ProductionOrder; 
using MediatR;

using UserPanel.Application.Quotation.GetQuotationItem;

namespace UserPanel.Application.ProductionOrder.GetProductionOrder;


public class GetProductionOrderByIdQueryHandler : IRequestHandler<GetProductionOrderByIdQuery, object>
{
    private readonly IProductionRepository _repository;

    public GetProductionOrderByIdQueryHandler(IProductionRepository repository)
    {
        _repository = repository;
    }

    public async Task<object> Handle(GetProductionOrderByIdQuery query, CancellationToken cancellationToken)
    {
        var Result = await _repository.GetByIdAsync(query.Id);
        return Result;
    }
}




