using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Item;

namespace Core.Master.Claim
{
    public class ClaimDescriptionPayment
    {
        public ClaimDescriptionPay payment { get; set; }
        public Int32 id { get; set; }
    }
    public class ClaimDescriptionPay
    {
        public int paymentid { get; set; }
        public string paymentCode { get; set; }
        public string paymentdescription { get; set; }
        public int claimtypeid { get; set; }
        public int createdby { get; set; }
        public string CreatedIP { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsActive { get; set; }
        public int lastmodifiedby { get; set; }
        public string LastModifiedIP { get; set; }
        public DateTime LastModifiedDate { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }
    }
}
