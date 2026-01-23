using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackEnd.Finance.ClaimAndPayment
{
    public class ClaimAndPaymentDB
    {
        public static string ClaimAndPayment= "proc_purchasememo";
        public static string ClaimAndPaymentApproval = "proc_claimapprove";

        public static string ClaimAndPaymentApprovalHistory = "proc_claim_gmanddirector_history";
        public static string PaymentPlan = "proc_paymentplan";
        public static string PeriodicPaymentPlan = "proc_periodicPaymentplan";
        public static string UpdateClaimPaymentInfo = "sp_UpdateClaimPaymentInfo";
        public static string PaymentVoucher = "proc_paymentvoucher";
        public static string ClaimHistory = "proc_proc_claim_gmanddirector_history";
    }
}
