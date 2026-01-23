using Core.Abstractions;
using Core.OrderMngMaster.Users;
using MediatR;
using UserPanel.Application.OrderMngMaster.Master.Users;
using UserPanel.Core.Abstractions;


public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, object>
{
    private readonly IMasterUsersRepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork;

    public CreateUserCommandHandler(IMasterUsersRepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;

    }

    public async Task<object> Handle(CreateUserCommand command, CancellationToken cancellationToken)
    {
        MasterUsersCommand master = new MasterUsersCommand();

        master.MasterUser = new MasterUsers 
        {
            Id =command.Id,
            UserName = command.UserName,
            EmailID = command.EmailID,
            MobileNo = command.MobileNo,
            FirstName = command.FirstName,
            MiddleName = command.MiddleName,
            LastName = command.LastName,
            Password = command.Password,
            Role = command.Role,
            Department = command.Department,
            FromDate = command.FromDate,
            ToDate = command.ToDate,
            Remark = command.Remark,
            BranchId = command.BranchId ,
            CreatedBy = command.CreatedBy ?? 1
           // BranchId = command.BranchId ?? 1 // default to 1 if null
        };

        var data = await _repository.CreateOrUpdateUserAsync(master);
        return data;
    }
}