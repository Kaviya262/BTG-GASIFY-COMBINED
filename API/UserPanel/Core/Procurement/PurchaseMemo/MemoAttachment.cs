using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.PurchaseMemo
{
    public class MemoAttachment
    {
        public Int32 Id { get; set; }
        public Int32 UserId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public Int32 MemoId { get; set; }
        public Int32 OrgId { get; set; }
        public Int32 BranchId { get; set; }
    }
}
