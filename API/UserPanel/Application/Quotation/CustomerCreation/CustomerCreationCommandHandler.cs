using Core.Abstractions;
using Core.OrderMng.Quotation;
using MediatR;
using UserPanel.Application.Quotation.CreateQuotationItem;
using UserPanel.Application.Quotation.CustomerCreation;
using UserPanel.Core.Abstractions;


public class CustomerCreationCommandHandler : IRequestHandler<CustomerCreationCommand, object>
{
    private readonly IQuotationRepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork; 

    public CustomerCreationCommandHandler(IQuotationRepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        
    }

    public async Task<object> Handle(CustomerCreationCommand command, CancellationToken cancellationToken)
    {
        
        var data= await _repository.Createcustomer(command.CustomerName,command.OrgId,command.BranchId,command.UserId);
        return data;
        
    }
}