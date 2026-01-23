using Core.Abstractions;
using Core.OrderMng.Quotation;
using MediatR;
using UserPanel.Core.Abstractions;


namespace UserPanel.Application.Quotation.DeleteTodoItem;

public class DeleteQuotationItemCommandHandler : IRequestHandler<DeleteQuotationItemCommand, object>
{
    private readonly IQuotationRepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork;

    public DeleteQuotationItemCommandHandler(IQuotationRepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<object> Handle(DeleteQuotationItemCommand command, CancellationToken cancellationToken)
    {
         

       var result= await _repository.DeleteAsync(command.Id,command.IsActive,command.userid);
        //_unitOfWork.Commit();

        return result;
    }
}