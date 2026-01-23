using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.Department
{
    public class DepartmentItem
    {
        public class DepartmentItemMain
        {
            public DepartmentItemHeader Header { get; set; }
            public string DepartmentId { get; set; }
            public string DepartmentCode { get; set; }
            public string DepartmentName { get; set; }
        }

        public class DepartmentItemHeader
        {
            public int DepartmentId { get; set; }
            public string DepartmentCode { get; set; }
            public string DepartmentName { get; set; }
            public string DepartmentRemark { get; set; }
            public int UserId { get; set; }

            [Range(0, 1, ErrorMessage = "IsActive must be either 1 or 0 !!")]
            public int IsActive { get; set; }
            public int OrgId { get; set; }
            public int BranchId { get; set; }
            //public string CreaetedIP { get; set; }
            //public DateTime CreatedDate { get; set; }
            //public string ModifiedBy { get; set; }
            //public string ModifiedIP { get; set; }
            //public DateTime ModifiedDate { get; set; }

        }
    }

}
