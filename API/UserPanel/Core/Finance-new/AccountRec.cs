using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Core.Finance_new
{
    class AccountRec
    {
    }
    public class AccountsReceivableModel
    {
        public long ArId { get; set; }
        public string ArNo { get; set; } = "";
        public string InvoiceNo { get; set; } = "";
        public DateTime InvoiceDate { get; set; }
        public string CustomerName { get; set; } = "";
        public long CustomerId { get; set; }
        public decimal InvAmount { get; set; }
        public decimal AlreadyReceived { get; set; }
        public decimal BalanceAmount { get; set; }
        public bool IsPartial { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int? UpdatedBy { get; set; }
    }
 
public class ArReceiptInput
    {
        [JsonPropertyName("receipt_id")]
        public int receipt_id { get; set; }

        [JsonPropertyName("payment_amount")]
        public decimal paymentAmount { get; set; }

        [JsonPropertyName("ar_id")]
        public long ArId { get; set; }

        [JsonPropertyName("cash_amount")]
        public decimal CashAmount { get; set; }

        [JsonPropertyName("bank_amount")]
        public decimal BankAmount { get; set; }

        [JsonPropertyName("contra_amount")]
        public decimal ContraAmount { get; set; }

        [JsonPropertyName("tax_rate")]
        public decimal TaxRate { get; set; }

        [JsonPropertyName("bank_payment_via")]
        public int BankPaymentVia { get; set; }

        [JsonPropertyName("bank_name")]
        public string? BankName { get; set; }

        [JsonPropertyName("cheque_number")]
        public string? ChequeNumber { get; set; }

        [JsonPropertyName("giro_number")]
        public string? GiroNumber { get; set; }

        [JsonPropertyName("deposit_bank_id")]
        public Int32? DepositBankId { get; set; }

        [JsonPropertyName("deposit_account_number")]
        public string? DepositAccountNumber { get; set; }

        [JsonPropertyName("contra_reference")]
        public string? ContraReference { get; set; }

        [JsonPropertyName("proof_missing")]
        public bool ProofMissing { get; set; }
    }


}
