namespace Core.OrderMngMaster.Users
{
    public class MasterUsersCommand
    {
        public MasterUsers MasterUser { get; set; } = new MasterUsers();
    }

    public class MasterUsersCommandpwd
    {
        public MasterUserspwd MasterUserspwd { get; set; } = new MasterUserspwd();
    }

    public class MasterUsers
    {
        public string userid { get; set; }
        public int? Id { get; set; }
        public string UserName { get; set; }

        public string EmailID { get; set; }

        public string MobileNo { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Password { get; set; }

        public string Role { get; set; }

        public string Department { get; set; }

        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public string MiddleName { get; set; }

        public string Remark { get; set; }

        public int? BranchId { get; set; }
        public int? CreatedBy { get; set; }
        public bool IsActive { get; set; }
    }


    public class MasterUserspwd
    {
        public string userid { get; set; }
        public int? Id { get; set; }
        public string UserName { get; set; }

        public string EmailID { get; set; }

        public string MobileNo { get; set; }

        public string FirstName { get; set; }

        public string oldpassword { get; set; }

        public string Password { get; set; }

        public string Role { get; set; }

        public string Department { get; set; }

        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public string MiddleName { get; set; }

        public string Remark { get; set; }

        public int? BranchId { get; set; }
        public int? CreatedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
