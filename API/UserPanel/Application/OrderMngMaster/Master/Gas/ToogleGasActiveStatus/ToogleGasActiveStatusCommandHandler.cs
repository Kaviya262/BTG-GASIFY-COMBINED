using Core.Master.Gas;
using MediatR;

namespace Application.OrderMngMaster.Master.Gas.ToogleGasActiveStatus
{
    public class ToogleGasActiveStatusCommandHandler : IRequestHandler<ToogleGasActiveStatusCommand, object>
    {
        private readonly IMasterGasRepository _repository;

        public ToogleGasActiveStatusCommandHandler(IMasterGasRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(ToogleGasActiveStatusCommand request, CancellationToken cancellationToken)
        {
            MasterGas gas = new MasterGas();
            gas.Id = request.Id;
            gas.IsActive = request.IsActive;

            var data = await _repository.ToogleStatus(gas);
            return data;
        }
    }
}
