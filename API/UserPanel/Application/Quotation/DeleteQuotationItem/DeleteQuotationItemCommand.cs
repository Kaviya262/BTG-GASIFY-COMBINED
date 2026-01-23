using MediatR;

namespace UserPanel.Application.Quotation.DeleteTodoItem;

public class DeleteQuotationItemCommand : IRequest<object>
{
    public int Id { get; set; }
    public int IsActive { get; set; }
    public int userid { get; set; }
}