using System;

namespace BackEnd.Finance.Accounts.Models
{
    public class AccountCategory
    {
        public int Id { get; set; }
        public int CategoryCode { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
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
    }
}
