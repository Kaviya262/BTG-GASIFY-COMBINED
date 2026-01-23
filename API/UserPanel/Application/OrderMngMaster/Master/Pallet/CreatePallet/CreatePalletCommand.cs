using Core.Master.Pallet;
using MediatR;

namespace Application.OrderMngMaster.Master.Pallet.CreatePallet
{
    public class CreatePalletCommand : IRequest<object>
    {
        public MasterPalletModel PalletModel { get; set; } = null!;
    }

}
