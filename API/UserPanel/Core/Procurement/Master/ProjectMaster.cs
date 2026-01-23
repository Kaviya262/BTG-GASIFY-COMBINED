using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.Master
{
    public class ProjectMaster
    {      
     public MasterProject Project { get; set; }

    }
    public class MasterProject
    {
            public int projectid { get; set; }
            public string projectcode { get; set; }
            public string projectname { get; set; }
            public string projectaddress { get; set; }            
            public bool isactive { get; set; }
            public int userid { get; set; }
            public string createdip { get; set; }
            public DateTime createddate { get; set; }
            public string modifiedip { get; set; }
            public DateTime modifieddate { get; set; }
            public int orgid { get; set; }
            public int branchid { get; set; }
            
    }
}
