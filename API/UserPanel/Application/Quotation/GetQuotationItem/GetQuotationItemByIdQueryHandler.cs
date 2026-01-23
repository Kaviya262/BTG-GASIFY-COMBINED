using Core.OrderMng.Quotation;
using MediatR;

using UserPanel.Application.Quotation.GetQuotationItem;

namespace UserPanel.Application.Quotation.GetAllItems;

public class GetQuotationItemByIdQueryHandler : IRequestHandler<GetQuotationItemByIdQuery, object>
{
    private readonly IQuotationRepository _repository;

    public GetQuotationItemByIdQueryHandler(IQuotationRepository repository)
    {
        _repository = repository;
    }

    public async Task<object> Handle(GetQuotationItemByIdQuery query, CancellationToken cancellationToken)
    {
        var Result = await _repository.GetByIdAsync(query.Id);
        return Result;
    }
}




