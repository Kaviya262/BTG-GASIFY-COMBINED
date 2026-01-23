using Application.PackingAndDO.BarcodeMachineScan;
using Application.PackingAndDO.CreatePackingAndDO;
using Core.Abstractions;
using Core.OrderMng.PackingAndDO;
using MediatR;
using UserPanel.Core.Abstractions;

public class BarcodeMachineScanHandler : IRequestHandler<BarcodeMachineScanCommand, object>
{
    private readonly IPackingAndDORepository _repository;
    private readonly IUnitOfWorkDB1 _unitOfWork;

    public BarcodeMachineScanHandler(IPackingAndDORepository repository, IUnitOfWorkDB1 unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<object> Handle(BarcodeMachineScanCommand command, CancellationToken cancellationToken)
    {
        var result = await _repository.BarcodeMachineScan(command.PackingId, command.UserId );
        return result;
    }
}
