using System;

namespace Core.AccountsCategories.GLcodemaster
{
    public class GLCodeMaster
    {
        public int Id { get; set; }
        public string Glcode { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string Description { get; set; } = string.Empty;
        public int CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CreatedIP { get; set; } = string.Empty;
        public int LastModifiedBy { get; set; }
        public DateTime? LastModifiedDate { get; set; }
        public string LastModifiedIP { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }
        public int AccountTypeId { get; set; }
    }
}
