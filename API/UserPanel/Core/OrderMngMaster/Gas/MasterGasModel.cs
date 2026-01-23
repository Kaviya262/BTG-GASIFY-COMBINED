namespace Core.Master.Gas
{
    public class MasterGasModel
    {

    }

    public class MasterGas
    {
        public int Id { get; set; }

        public string GasCode { get; set; } = null!;

        public string GasName { get; set; } = null!;

        public string Volume { get; set; }

        public int VolumeId { get; set; }
        public int PressureId { get; set; }

        public decimal UnitPrice { get; set; }

        public string Pressure { get; set; }
        public int UserId { get; set; }
        public string? UserIP { get; set; }

        //public int CreatedBy { get; set; }

        //public DateTime CreatedDate { get; set; }

        //public string CreatedIp { get; set; } = null!;

        //public int LastModifiedBy { get; set; }

        //public DateTime LastModifiedDate { get; set; }

        //public string LastModifiedIp { get; set; } = null!;

        public bool IsActive { get; set; }

        public int? OrgId { get; set; }

        public int? BranchId { get; set; }

        public string? Descriptions { get; set; }

        public int GasTypeId { get; set; }

        // public DateTime EffectiveFromDate { get; set; }
        // public DateTime EffectiveToDate { get; set; }
    }

    public class MasterGastype
    {
        public int Id { get; set; }

        public string TypeName { get; set; } = null!;

        public string Descriptions { get; set; } = null!;
        public int UserId { get; set; }
        public string? UserIP { get; set; }
        //public int CreatedBy { get; set; }

        //public DateTime CreatedDate { get; set; }

        //public string CreatedIp { get; set; } = null!;

        //public int LastModifiedBy { get; set; }

        //public DateTime LastModifiedDate { get; set; }

        //public string LastModifiedIp { get; set; } = null!;

        public bool IsActive { get; set; }

        public int? OrgId { get; set; }

        public int? BranchId { get; set; }
    }
}

