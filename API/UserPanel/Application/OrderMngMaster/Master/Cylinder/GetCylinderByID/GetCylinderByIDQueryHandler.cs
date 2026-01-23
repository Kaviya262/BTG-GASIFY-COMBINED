using Core.Master.Cylinder;
using MediatR;

namespace Application.OrderMngMaster.Master.Cylinder.GetCylinderByID
{
    public class GetGasByIDQueryHandler : IRequestHandler<GetCylinderByIDQuery, object>
    {
        private readonly IMasterCylinderRepository _repository;

        public GetGasByIDQueryHandler(IMasterCylinderRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetCylinderByIDQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetByID(request.CylinderId);
        }
    }
}
