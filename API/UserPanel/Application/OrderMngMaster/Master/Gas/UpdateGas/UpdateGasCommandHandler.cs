using Core.Master.Gas;
using MediatR;

namespace Application.OrderMngMaster.Master.Gas.UpdateGas
{
    public class UpdateGasCommandHandler : IRequestHandler<UpdateGasCommand, object>
    {
        private readonly IMasterGasRepository _repository;

        public UpdateGasCommandHandler(IMasterGasRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(UpdateGasCommand request, CancellationToken cancellationToken)
        {
            var data = await _repository.UpdateAsync(request.Gas);
            return data;
        }
    }
}
