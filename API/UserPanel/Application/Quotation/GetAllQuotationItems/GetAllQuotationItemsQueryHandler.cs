using Core.OrderMng.Quotation;
using MediatR;
using UserPanel.Application.Quotation.GetAllQuotationItems;

namespace UserPanel.Application.Quotation.GetAllItems;

public class GetAllQuotationItemsQueryHandler : IRequestHandler<GetAllQuotationItemsQuery, object>
{
    private readonly IQuotationRepository _repository;

    public GetAllQuotationItemsQueryHandler(IQuotationRepository repository)
    {
        _repository = repository;
    }

    public async Task<object> Handle(GetAllQuotationItemsQuery command, CancellationToken cancellationToken)
    {
        var Result = await _repository.GetAllAsync(command.sys_sqnbr, command.from_date, command.to_date,command.BranchId);
        return Result;
    }
}