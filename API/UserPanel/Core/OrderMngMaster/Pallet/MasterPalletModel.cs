
namespace Core.Master.Pallet
{
    public class MasterPalletModel
    {
        public MasterPallet Pallet { get; set; } = null!;

        public List<MasterPalletitem> PalletItems { get; set; } = null!;
    }

    public class MasterPallet
    {
        public int PalletId { get; set; }
        public string PalletName { get; set; } = null!;
        public string PalletNumber { get; set; }
        public int GasCodeId { get; set; }
        public string GasName { get; set; } = null!;
        public int ContainerId { get; set; }
        public int UserId { get; set; }
        public string? UserIP { get; set; }
        public bool IsActive { get; set; }
        public int? OrgId { get; set; }
        public int? BranchId { get; set; }
        public int PalletTypeId { get; set; }
        public string Barcode { get; set; }
    }

    public partial class MasterPalletitem
    {
        public int PalletItemId { get; set; }
        public int PalletId { get; set; }
        public int PalletItemPos { get; set; }
        public int CylinderId { get; set; }
        public string CylinderName { get; set; }
        public string OwnershipName { get; set; }
        public int ownershipid { get; set; }
        public string Barcode { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }

        public int UserId { get; set; }

        public string? UserIP { get; set; }

        public bool IsActive { get; set; } = true;

    }
}
