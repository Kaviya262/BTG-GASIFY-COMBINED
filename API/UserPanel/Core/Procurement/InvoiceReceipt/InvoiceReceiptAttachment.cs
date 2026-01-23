using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.InvoiceReceipt
{
    public class InvoiceReceiptAttachment
    {
        public Int32 receiptnote_hdr_id { get; set; }
        public Int32 UserId { get; set; }
        public string file_name { get; set; }
        public string file_path { get; set; }
        public Int32 purchase_id { get; set; }
        public Int32 grn_id { get; set; }
        public Int32 OrgId { get; set; }
        public Int32 BranchId { get; set; }
    }
}
