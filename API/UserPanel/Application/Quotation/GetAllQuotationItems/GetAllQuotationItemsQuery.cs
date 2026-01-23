using MediatR;

namespace UserPanel.Application.Quotation.GetAllQuotationItems;

public class GetAllQuotationItemsQuery : IRequest<object>
{
    public int sys_sqnbr { get; set; }
    public string from_date { get; set; }
    public string to_date { get; set; }
    public Int32 BranchId { get; set; }


}