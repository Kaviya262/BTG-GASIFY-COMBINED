using Core.Abstractions;
using Core.OrderMngMaster.Users;
using MediatR;
using UserPanel.Application.ProductionOrder.UpdateProductionOrder;
using UserPanel.Core.Abstractions;


public class UserStatusQueryHandler : IRequestHandler<UserStatusQuery, object>
{
    private readonly IMasterUsersRepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork;

    public UserStatusQueryHandler(IMasterUsersRepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;

    }
    public async Task<object> Handle(UserStatusQuery userStatus, CancellationToken cancellationToken)
    {
        var master = new MasterUsersCommand();

        master.MasterUser.Id = userStatus.UserId;
        master.MasterUser.Remark = userStatus.Remark;
        master.MasterUser.BranchId = userStatus.BranchId;
        master.MasterUser.IsActive = userStatus.IsActive;
        
        var data = await _repository.ToggleUserActiveStatusAsync(master);
        return data;
    }


}