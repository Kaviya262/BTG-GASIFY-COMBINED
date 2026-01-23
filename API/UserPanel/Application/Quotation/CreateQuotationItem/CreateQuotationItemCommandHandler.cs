using Core.Abstractions;
using Core.OrderMng.Quotation;
using MediatR;
using UserPanel.Application.Quotation.CreateQuotationItem;
using UserPanel.Core.Abstractions;


public class CreateQuotationItemCommandHandler : IRequestHandler<CreateQuotationItemCommand, object>
{
    private readonly IQuotationRepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork; 

    public CreateQuotationItemCommandHandler(IQuotationRepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        
    }

    public async Task<object> Handle(CreateQuotationItemCommand command, CancellationToken cancellationToken)
    {
        QuotationItemsMain QuotationItems = new QuotationItemsMain();
        QuotationItems.Details = command.Details;
        QuotationItems.Header = command.Header;
        QuotationItems.operation = command.operation;
        var data= await _repository.AddAsync(QuotationItems);
        _unitOfWork.Commit();
        return data;
        
    }
}