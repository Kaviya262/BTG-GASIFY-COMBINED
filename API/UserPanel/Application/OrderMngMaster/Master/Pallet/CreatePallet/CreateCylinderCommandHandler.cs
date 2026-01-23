
using Application.OrderMngMaster.Master.Pallet.CreatePallet;
using Core.Master.Pallet;
using MediatR;

namespace Application.OrderMngMaster.Pallet.CreatePallet.CreatePallet
{
    public class CreateGasCommandHandler : IRequestHandler<CreatePalletCommand, object>
    {
        private readonly IMasterPalletRepository _repository;

        public CreateGasCommandHandler(IMasterPalletRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(CreatePalletCommand request, CancellationToken cancellationToken)
        {
            var data = await _repository.AddAsync(request.PalletModel);
            return data;
        }
    }
}
