using System;
using System.Collections.Generic;

namespace Core.Finance.PeriodicPaymentPlan
{
    public class PeriodicPaymentPlan
    {
        public int claimid { get; set; }
        public bool ispaymentgenerated { get; set; }
        public string remarks { get; set; }

        public int? ModeOfPaymentId { get; set; }  // nullable in case it's optional
        public int? BankId { get; set; }           // nullable
        public DateTime? PaymentDate { get; set; } // nullable
    }

    public class PeriodicPaymentPlanHdr
    {
        public List<PeriodicPaymentPlan> approve { get; set; }
        public int UserId { get; set; }
        public int orgid { get; set; }
        public int branchid { get; set; }
    }
}
