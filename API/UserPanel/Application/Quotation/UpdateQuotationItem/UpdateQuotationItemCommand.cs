using Core.OrderMng.Quotation;
using MediatR;
namespace UserPanel.Application.Quotation.UpdateQuotationItem;

public class UpdateQuotationItemCommand : IRequest<object>
{
    public QuotationItemsHeader Header { get; set; }

    public List<QuotationItemsDetail> Details { get; set; }

    public List<QuotationOperationContact> operation { get; set; }
}