using Application.OrderMngMaster.Master.Gas.GetAllGasListing;
using Core.Master.Gas;
using MediatR;

namespace Application.OrderMngMaster.Master.Gas.GetAllGasTypes
{
    public class GetAllGasTypesQueryHandler : IRequestHandler<GetAllGasTypesQuery, object>
    {
        private readonly IMasterGasRepository _repository;

        public GetAllGasTypesQueryHandler(IMasterGasRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllGasTypesQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllGasTypesAsync();
        }
    }
}
