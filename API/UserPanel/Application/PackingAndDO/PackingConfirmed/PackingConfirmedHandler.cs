using Application.PackingAndDO.BarcodeMachineScan;
using Application.PackingAndDO.CreatePackingAndDO;
using Application.PackingAndDO.PackingConfirmed;
using Core.Abstractions;
using Core.OrderMng.PackingAndDO;
using MediatR;
using UserPanel.Core.Abstractions;

public class PackingConfirmedHandler : IRequestHandler<PackingConfirmedCommand, object>
{
    private readonly IPackingAndDORepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork;

    public PackingConfirmedHandler(IPackingAndDORepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<object> Handle(PackingConfirmedCommand command, CancellationToken cancellationToken)
    {
        var result = await _repository.PackingConfirmed(command.PackingId, command.UserId,command.rackid );
        return result;
    }
}
