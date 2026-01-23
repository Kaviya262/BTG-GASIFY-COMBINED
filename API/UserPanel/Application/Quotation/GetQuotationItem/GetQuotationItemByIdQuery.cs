using MediatR;

namespace UserPanel.Application.Quotation.GetQuotationItem;

public class GetQuotationItemByIdQuery : IRequest<object>
{
    public Int32 Id { get; set; }
   
}