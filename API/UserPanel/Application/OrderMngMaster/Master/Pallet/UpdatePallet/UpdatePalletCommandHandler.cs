
using Core.Master.Pallet;
using MediatR;

namespace Application.OrderMngMaster.Master.Pallet.UpdatePallet
{
    public class UpdateCylinderCommandHandler : IRequestHandler<UpdatePalletCommand, object>
    {
        private readonly IMasterPalletRepository _repository;

        public UpdateCylinderCommandHandler(IMasterPalletRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(UpdatePalletCommand request, CancellationToken cancellationToken)
        {
            var data = await _repository.UpdateAsync(request.PalletModel);
            return data;
        }
    }
}
