using Core.Master.Gas;
using MediatR;

namespace Application.OrderMngMaster.Master.Gas.GetAllGasListing
{
    public class GetAllGasListingQueryHandler : IRequestHandler<GetAllGasListingQuery, object>
    {
        private readonly IMasterGasRepository _repository;

        public GetAllGasListingQueryHandler(IMasterGasRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllGasListingQuery request, CancellationToken cancellationToken)
        {
            var gasName = request.GasName.Length == 2 ? request.GasName.Replace("\"", "") : request.GasName;
            return await _repository.GetAllAsync(gasName, request.volume, request.pressure);
        }
    }
}
