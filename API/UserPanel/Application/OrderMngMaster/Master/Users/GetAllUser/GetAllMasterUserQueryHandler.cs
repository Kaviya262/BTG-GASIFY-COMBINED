using Core.OrderMngMaster.Users;
using MediatR;

namespace UserPanel.Application.OrderMngMaster.Master.Users;

public class GetAllMasterUserQueryHandler : IRequestHandler<GetAllUserQuery, object>
{
    private readonly IMasterUsersRepository _repository;

    public GetAllMasterUserQueryHandler(IMasterUsersRepository repository)
    {
        _repository = repository;
    }

    public async Task<object> Handle(GetAllUserQuery command, CancellationToken cancellationToken)
    {
        var result = await _repository.GetAllUser(
            command.ProdId,
            command.FromDate,
            command.ToDate,
            command.BranchId,
            command.Username,
            command.Keyword,
            command.PageNumber,
            command.PageSize
        );

        return result;
    }

}