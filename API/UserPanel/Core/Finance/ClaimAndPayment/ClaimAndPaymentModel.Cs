using Core.Procurement.PurchaseMemo;
using MediatR;

namespace Core.Finance.ClaimAndPayment
{
    public class ClaimAndPaymentModel : IRequest<object>
    {
        public ClaimAndPaymentHeader Header { get; set; }
        public List<ClaimAndPaymentDetail> Details { get; set; }
    }

    public class ClaimAndPaymentHeader
    {
        public Int32 docType { get; set; }
        public int ClaimId { get; set; }
        public int ClaimCategoryId { get; set; }
        public DateTime ApplicationDate { get; set; }
        public string ApplicationNo { get; set; }
        public int DepartmentId { get; set; }
        public int ApplicantId { get; set; }
        public string JobTitle { get; set; }
        public int HOD { get; set; }
        public int TransactionCurrencyId { get; set; }
        public int ModeOfPaymentId { get; set; }
        public string AttachmentName { get; set; }
        public string AttachmentPath { get; set; }
        public int CostCenterId { get; set; }
        public decimal ClaimAmountInTC { get; set; }
        public decimal TotalAmountInIDR { get; set; }
        public string Remarks { get; set; }
        public Int32 IsActive { get; set; }
        public Int32 IsSubmitted { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }
        public string PONo { get; set; }
        public Int32 SupplierId { get; set; }
        public int UserId { get; set; }
        public Int32 IsTaxCalType { get; set; }
    }
    public class ClaimAndPaymentDetail
    {
        public Int32 poid { get; set; }
        public string docReference { get; set; }
        public decimal TaxPerc { get; set; }
        public decimal VatPerc { get; set; }
        public int taxid { get; set; }
        public int vatid { get; set; }
        public Int32 IsTaxCalType { get; set; }
        public int ClaimDtlId { get; set; }
        public int ClaimId { get; set; }
        public int ClaimTypeId { get; set; }
        public string ClaimAndPaymentDesc { get; set; }
        public decimal Amount { get; set; }
        public decimal TaxRate { get; set; }
        public decimal VatRate { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string Purpose { get; set; }
        
        public int PaymentId { get; set; }
    }

    public class InActiveClaim
    {
        public int InActiveBy { get; set; }
        public string InActiveIP { get; set; }

        public int ClaimId { get; set; }
    }


    public class DiscussClaim
    {
        public int DiscussedBy { get; set; }
        public string Comment { get; set; }
        public int ClaimId { get; set; }
    }
}
