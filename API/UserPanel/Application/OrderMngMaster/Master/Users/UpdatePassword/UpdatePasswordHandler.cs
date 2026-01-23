using Core.Abstractions;
using Core.OrderMngMaster.Users;
using MediatR;
using UserPanel.Application.OrderMngMaster.Master.UpdatePassword;
using UserPanel.Application.OrderMngMaster.Master.Users;
using UserPanel.Core.Abstractions;


public class UpdatePasswordCommandHandler : IRequestHandler<UpdatePasswordUserCommand, object>
{
    private readonly IMasterUsersRepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork;

    public UpdatePasswordCommandHandler(IMasterUsersRepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;

    }

    public async Task<object> Handle(UpdatePasswordUserCommand command, CancellationToken cancellationToken)
    {
        MasterUsersCommandpwd master = new MasterUsersCommandpwd();

        master.MasterUserspwd = new MasterUserspwd 
        {
            Id =command.Id,
            Password = command.Password,
            oldpassword=command.oldPassword,
        };

        var data = await _repository.UpdateUserPasswordAsync(master);
        return data;
    }
}