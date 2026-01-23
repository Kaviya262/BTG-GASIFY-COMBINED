using Core.Master.Pallet;
using MediatR;

namespace Application.OrderMngMaster.Master.Pallet.GetAllPalletListing
{
    public class GetAllPalletListingQueryHandler : IRequestHandler<GetAllPalletListingQuery, object>
    {
        private readonly IMasterPalletRepository _repository;

        public GetAllPalletListingQueryHandler(IMasterPalletRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllPalletListingQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllAsync(request.OrgId, request.BranchId,request.PalletTypeId,request.GasCodeId);
        }

    }
}
