using MediatR;

namespace Application.OrderMngMaster.Master.Pallet.GetAllPalletListing
{
    public class GetAllPalletListingQuery : IRequest<object>
    {
        public int? GasCodeId { get; set; } = null!;
        public int? PalletTypeId { get; set; } = null!;
        public int BranchId { get; set; } 
        public int OrgId { get; set; } 
    }
}
