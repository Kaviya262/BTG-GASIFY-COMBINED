using Core.Master.Gas;
using MediatR;

namespace Application.OrderMngMaster.Master.Gas.GetGasByID
{
    public class GetGasByIDQueryHandler : IRequestHandler<GetGasByIDQuery, object>
    {
        private readonly IMasterGasRepository _repository;

        public GetGasByIDQueryHandler(IMasterGasRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetGasByIDQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetByID(request.GasId);
        }
    }
}
