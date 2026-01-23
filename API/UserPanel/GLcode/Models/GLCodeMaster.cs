namespace GLcode.Models
{
    public class GLCodeMaster
    {
        public int Id { get; set; }
        public string Glcode { get; set; }
        public string CategoryName { get; set; }
        public int CategoryId { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public System.DateTime? CreatedDate { get; set; }
        public string CreatedIP { get; set; }
        public int LastModifiedBy { get; set; }
        public System.DateTime? LastModifiedDate { get; set; }
        public string LastModifiedIP { get; set; }
        public bool IsActive { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }
        public int AccountTypeId { get; set; }
    }
}
