using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.Approval
{
    public class RequisitionApproval
    {
        public int userid { get; set; }
        public int prid { get; set; }        
        public bool isapprovedone { get; set; }
        public bool isdiscussedone { get; set; }
        public bool isapprovedtwo { get; set; }
        public bool isdiscussedtwo { get; set; }
        public string remarks { get; set; }

        
    }
    public class RequisitionApprovalHdr
    {
        public List<RequisitionApproval> approve { get; set; }
        public Int32 UserId { get; set; }
        public Int32 orgid { get; set; }
        public Int32 branchid { get; set; }
        
    }
   
}
