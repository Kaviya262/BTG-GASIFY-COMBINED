namespace Core.OrderMngMaster.Customerdoc
{
    public class UploadCustomerDoc
    {
        public int CustomerId { get; set; }
        public int BranchId { get; set; }
        public int UserId { get; set; }

        public string? LegalDocumentPath { get; set; }
        public string? CustomerReviewFormPath { get; set; }
    }
}
