using Application.OrderMngMaster.Master.Pallet.GetPalletByID;
using Core.Master.Pallet;
using MediatR;

namespace Application.OrderMngMaster.Master.Pallet.CreatePallet
{
    public class GetGasByIDQueryHandler : IRequestHandler<GetPalletByIDQuery, object>
    {
        private readonly IMasterPalletRepository _repository;

        public GetGasByIDQueryHandler(IMasterPalletRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetPalletByIDQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetByID(request.PalletId,request.OrgId,request.BranchId);
        }
    }
}
