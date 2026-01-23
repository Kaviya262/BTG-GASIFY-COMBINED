namespace Core.Master.Cylinder
{
    public class MasterCylinderModel
    {

    }

    public class MasterCylinder
    {
        public int Cylinderid { get; set; }
        public string Barcode { get; set; } = null!;
        public string? Serialno { get; set; } = null!;
        public string CylinderCode { get; set; } = null!;
        public string? CylinderName { get; set; } = null!;
        public string CylinderNumber { get; set; } = null!;
        public int GasCodeId { get; set; }
        public int Cylindertypeid { get; set; }
        public string? Cylindertype { get; set; } = null!;
        public int Ownershipid { get; set; }
        public string OwnershipName { get; set; } = null!;
        public string? Testedon { get; set; } = null!;
        public DateTime Nexttestdate { get; set; }
        public string Remarks { get; set; } = null!;
        public int UserId { get; set; }
        public string? UserIP { get; set; }
        public bool IsActive { get; set; }
        public int? BranchId { get; set; }
        public int? OrgId { get; set; }
        public int StatusId { get; set; }
        public string? Location { get; set; }
        public string? HSCode { get; set; }

        public int? IsDelivered { get; set; }
        public string? Manufacturer { get; set; }
        public decimal? WorkingPressure { get; set; }
        public string PalletRegNumber { get; set; }
        public string PalletBarcode { get; set; }
        public string? DocNumber { get; set; }
        public string? Path { get; set; }
        public string FileName { get; set; }
        public string FileData { get; set; }
        public int TestedMonth { get; set; }
        public int TestedYear { get; set; }
        public string? CylinderSize { get; set; }
        public string? GasDescription { get; set; }
    }


    public class MasterCylinderstatus
    {
        public int Id { get; set; }

        public string Status { get; set; } = null!;

        public string Description { get; set; } = null!;
        public int UserId { get; set; }
        public string? UserIP { get; set; }

        public bool IsActive { get; set; }

        public int? OrgId { get; set; }

        public int? BranchId { get; set; }
    }

    public class MasterCylindertype
    {
        public int Id { get; set; }

        public string? Cylindertype { get; set; } = null!;

        public string Description { get; set; } = null!;

        public int UserId { get; set; }
        public string? UserIP { get; set; }

        public bool IsActive { get; set; }

        public int? OrgId { get; set; }

        public int? BranchId { get; set; }
    }
}
