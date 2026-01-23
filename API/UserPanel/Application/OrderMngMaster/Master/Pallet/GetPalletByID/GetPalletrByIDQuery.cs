using MediatR;

namespace Application.OrderMngMaster.Master.Pallet.GetPalletByID
{
    public class GetPalletByIDQuery : IRequest<object>
    {
        public int PalletId { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }
    }
}
