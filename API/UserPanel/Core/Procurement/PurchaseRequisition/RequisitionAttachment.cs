using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.PurchaseRequisition
{
    public class RequisitionAttachment
    {

        public Int32 prattachId { get; set; }
        public Int32 UserId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public Int32 prId { get; set; }
        public Int32 OrgId { get; set; }
        public Int32 BranchId { get; set; }
        public string createdip { get; set; }
        public string modifiedip { get; set; }

    }
}
