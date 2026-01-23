using Core.OrderMng.Invoices;
using DocumentFormat.OpenXml.Spreadsheet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.PurchaseMemo
{
   public class PurchaseMemo
   {
        public PurchaseMemoHeader Header { get; set; }
        public List<PurchaseMemoDetail> Details { get; set; }
   }
    public class PurchaseMemoHeader
    {
        public int isNew { get; set; }
        public Int32 Memo_ID { get;set;}
        public Int32 PM_Type { get;set;}
        public string PM_Number { get; set;}
        public string PMDate { get; set;}
        public Int32 RequestorId { get; set;}
        public string DeliveryAddress { get; set;}
        public string Remarks { get; set;}
        public Int32 UserId { get; set;}
        public Int32 IsSubmitted { get; set;}
        public Int32 OrgId { get; set;}
        public Int32 BranchId { get; set;}
        public int IsEmailNotification { get; set; }
        public Int32 hodid { get; set; }
        public string hod { get; set; }
    }

    public class PurchaseMemoDetail
    {
        public Int32 Memo_dtl_ID { get; set;}
        public Int32 Memo_ID { get; set;}
        public Int32 ItemId { get; set;}
        public Int32 DepartmentId { get; set;}
        public Int32 UOMId { get; set;}
        public decimal Qty { get; set;}
        public decimal AvailStk { get; set;}
        public string DeliveryDate { get; set;}
        public string Remarks { get; set;}
        public Int32 itemGroupId { get; set; }


    }
    public class InActiveMemo
    {
        public int InActiveBy { get; set; }
        public string InActiveIP { get; set; }
        public int memoId { get; set; }
    }
}
