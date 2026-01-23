using Core.Abstractions;
using Core.OrderMng.Quotation;
using MediatR;
using UserPanel.Application.Quotation.UpdateQuotationItem;
using UserPanel.Core.Abstractions;


public class UpdateQuotationItemCommandHandler : IRequestHandler<UpdateQuotationItemCommand,  object>
{
    private readonly IQuotationRepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork; 

    public UpdateQuotationItemCommandHandler(IQuotationRepository repository, IUnitOfWorkDB1 unitOfWork )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
         
    }

    public async Task<object> Handle(UpdateQuotationItemCommand command, CancellationToken cancellationToken)
    {
        //var todoItem = await _repository.GetByIdAsync(command.Id);
        //if (todoItem == null) return false;

        //todoItem.SetTitle(command.Title);
        //todoItem.SetDueDate(command.DueDate);
        //if (command.IsCompleted.HasValue && command.IsCompleted.Value)
        //{
        //    todoItem.MarkAsCompleted();
        //}

        QuotationItemsMain QuotationItems = new QuotationItemsMain();
        QuotationItems.Details = command.Details;
        QuotationItems.Header = command.Header;
        QuotationItems.operation = command.operation;

        var data=await _repository.UpdateAsync(QuotationItems);
        _unitOfWork.Commit();

        return data;
    }
}
