namespace Core.FinanceModule.Report
{
    public class BankBook
    {
        public BankBookHeader Header { get; set; }
    }
    public class BankBookHeader
    {
        public DateTime Date { get; set; }
        public string VoucherNo { get; set; }
        public string TransactionType { get; set; }
        public string Account { get; set; }
        public string Party { get; set; }
        public string Description { get; set; }
        public decimal CreditInIDR { get; set; }
        public decimal DebitOutIDR { get; set; }
        public decimal BalanceIDR { get; set; }
    }
}
