using Core.Master.Pallet;
using MediatR;

namespace Application.OrderMngMaster.Master.Pallet.UpdatePallet
{
    public class UpdatePalletCommand : IRequest<object>
    {
        public MasterPalletModel PalletModel { get; set; } = null!;
    }
}
