using Core.Master.Gas;
using MediatR;

namespace Application.OrderMngMaster.Master.Gas.CreateGas
{
    public class CreateGasCommandHandler : IRequestHandler<CreateGasCommand, object>
    {
        private readonly IMasterGasRepository _repository;

        public CreateGasCommandHandler(IMasterGasRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(CreateGasCommand request, CancellationToken cancellationToken)
        {
            var data = await _repository.AddAsync(request.Gas);
            return data;
        }
    }
}
