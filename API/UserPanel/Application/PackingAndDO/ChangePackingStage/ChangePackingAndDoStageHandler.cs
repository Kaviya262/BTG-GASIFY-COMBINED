using Application.PackingAndDO.CreatePackingAndDO;
using Core.Abstractions;
using Core.OrderMng.PackingAndDO;
using MediatR;
using UserPanel.Core.Abstractions;

public class ChangePackingAndDoStageHandler : IRequestHandler<ChangePackingAndDoStageCommand, object>
{
    private readonly IPackingAndDORepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork;

    public ChangePackingAndDoStageHandler(IPackingAndDORepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<object> Handle(ChangePackingAndDoStageCommand command, CancellationToken cancellationToken)
    {
        var result = await _repository.ChangePackingStage(command.PackingId, command.StageId, command.BranchId);
        return result;
    }
}
