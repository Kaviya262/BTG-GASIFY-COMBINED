using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Finance.PaymentPlan
{

    public class PaymentPlan
    {
        public int claimid { get; set; }
        public bool ispaymentgenerated { get; set; }
        public string remarks { get; set; }
    }
     
    public class CashInHands
    {
        public decimal CNY { get; set; }
        public decimal IDR { get; set; }
        public decimal MYR { get; set; }
        public decimal SGD { get; set; }
        public decimal USD { get; set; }
    }

    public class PaymentPlanHdr
    {
   
        public List<PaymentPlan> approve { get; set; }
        public Int32 UserId { get; set; }
        public Int32 orgid { get; set; }
        public Int32 branchid { get; set; }
        public PaymentSummary summary { get; set; }
        public Int32 seqno { get; set; }
      
    }

    public class PaymentSummary
    {
        public PaymentSummaryHeader header { get; set; }
        public List<PaymentSummaryDetail> details { get; set; }
    }

    public class PaymentSummaryHeader
    {
        public Int32 PaymentId { get; set; }
        public int IsSubmitted { get; set; }
        public string seqno { get; set; }
        public CashInHands CashFromSales { get; set; }
        public CashInHands CashInHands { get; set; }
        public decimal Sales_CNY { get; set; }
        public decimal Sales_USD { get; set; }
        public decimal Sales_SGD { get; set; }
        public decimal Sales_IDR { get; set; }
        public decimal Sales_MYR { get; set; }

        public decimal InHand_CNY { get; set; }
        public decimal InHand_USD { get; set; }
        public decimal InHand_SGD { get; set; }
        public decimal InHand_IDR { get; set; }
        public decimal InHand_MYR { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public decimal CashInHand { get; set; }         // string as per sample
        public decimal CashFromSalesAtFactory { get; set; }
        public decimal CashNeeded { get; set; }
        public decimal TotalInHandCash { get; set; }
        public Int32 UserId { get; set; }
        public Int32 orgid { get; set; }
        public Int32 branchid { get; set; }
    }

    public class PaymentSummaryDetail
    {
        public int TypeId { get; set; }
        public string Category { get; set; }
        public int CurrencyId { get; set; }
        public string Conversion { get; set; }
        public decimal ConvertedToIDR { get; set; }
        public string Currency { get; set; }
        public decimal Amount { get; set; }
        
    }
}
