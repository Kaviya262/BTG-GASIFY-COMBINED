namespace Core.FinanceModule.Report
{
    public class CashBook
    {
        public CashBookHeader Header { get; set; }
    }
    public class CashBookHeader
    {
        public DateTime Date { get; set; }
        public string VoucherNo { get; set; }
        public string TransactionType { get; set; }
        public string PartyOrAccount { get; set; }
        public string Description { get; set; }
        public decimal CashInIDR { get; set; }
        public decimal CashOutIDR { get; set; }
        public decimal BalanceIDR { get; set; }
    }




}
