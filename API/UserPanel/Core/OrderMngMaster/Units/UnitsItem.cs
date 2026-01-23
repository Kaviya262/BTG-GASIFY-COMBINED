using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.Units
{
    public class UnitsItem
    {
        public class UnitsItemMain
        {
            public UnitsItemHeader Header { get; set; }
            public int UOMId { get; set; }
            public string UOMCode { get; set; }

        }
        public class UnitsItemHeader
        {
            public int UOMId { get; set; }
            public string UOMCode { get; set; }
            public string UOMDescription { get; set; }

            [Range(0, 1, ErrorMessage = "IsActive must be either 1 or 0 !!")]
            public int IsActive { get; set; }
            public int UserId { get; set; }
            public int OrgId { get; set; }
            public int BranchId { get; set; }

        }




    }
}
