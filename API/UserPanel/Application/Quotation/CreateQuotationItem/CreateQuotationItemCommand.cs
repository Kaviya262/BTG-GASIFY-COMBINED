using Core.OrderMng.Quotation;
using MediatR;

namespace UserPanel.Application.Quotation.CreateQuotationItem;

public class CreateQuotationItemCommand : IRequest<object>
{
    public QuotationItemsHeader Header { get; set; }

    public List<QuotationItemsDetail> Details { get; set; }

    public List<QuotationOperationContact> operation { get; set; }
}
