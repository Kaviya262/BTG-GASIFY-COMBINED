using Core.Abstractions;
using Core.OrderMngMaster.Users;
using MediatR;
using UserPanel.Application.OrderMngMaster.Master.Users;
using UserPanel.Application.ProductionOrder.UpdateProductionOrder;
using UserPanel.Core.Abstractions;


public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, object>
{
    private readonly IMasterUsersRepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork;

    public GetUserByIdHandler(IMasterUsersRepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;

    }

    public async Task<object> Handle(GetUserByIdQuery command, CancellationToken cancellationToken)
    {
        var data = await _repository.GetUserByIdAsync(command.UserId,command.BranchId);
        return data;
    }
}