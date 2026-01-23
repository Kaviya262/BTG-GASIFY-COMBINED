using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Core.OrderMng.Quotation
{
    public class QuotationItemsMain
    {
        public QuotationItemsHeader Header { get; set; }

        public List<QuotationItemsDetail> Details { get; set; }

        public List<QuotationOperationContact> operation { get; set; }

    }
    public class QuotationOperationContact
    {
        public int Id { get; set; }
        public int CustomerContactId { get; set; }
        
    }
    public class QuotationItemsHeader
    {
        public bool IsWithCustomer { get; set; }
        public string TBA { get; set; }
        public int? Qtn_Day { get; set; }
        public string? Qtn_Month { get; set; }

        public string? OrderedBy { get; set; }
        public Int32 isalreadypost { get; set; } = 0;
        public string TermsAndCond { get; set; }
        public int Id { get; set; }
        public string SQ_Nbr { get; set; }
        public string Sys_SQ_Nbr { get; set; }
        public int SQ_Type { get; set; }
        public DateTime SQ_Date { get; set; }
        public string Subject { get; set; }
        public int? CustomerId { get; set; }
        public string MainAddress { get; set; }
        public string? DeliveryAddress { get; set; }
        public string PhoneNumber { get; set; }
        public string FaxNo { get; set; }
        public string Email { get; set; }
        public string CustomerAttention { get; set; }
        public string Validity { get; set; }
        public string DeliveryTerms { get; set; }
        public int PaymentTerms { get; set; }
        public int PaymentMethod { get; set; }         
        public int SalesPerson { get; set; }
        public string SalesPersonContact { get; set; }
        public string SalesPersonEmail { get; set; }
        public int IsReadyToPost { get; set; }
        public DateTime EffectiveFromDate { get; set; }
        public int UserId { get; set; }
        //public string CreatedDate { get; set; }
        //public string CreatedIP { get; set; }
        //public int  LastModifiedBy { get; set; }
        //public DateTime LastModifiedDate { get; set; }
        //public string LastModifiedIP { get; set; }
        // public bool IsActive { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }
        public int IsSubmit { get; set; }
        public int? CustomerContactId { get; set; }
        public int? DeliveryAddressId { get; set; }
        public bool IsSalesOrderSaved { get; set; }
        public bool IsSavedByDSO { get; set; }

    }
    public class QuotationItemsDetail
    {
        public decimal? Exchangerate { get; set; }
        public int Id { get; set; }
        public int SQ_ID { get; set; }

        public string? Po_No { get; set; }
        public int GasCodeId { get; set; }
        public string GasDescription { get; set; }
        public string Volume { get; set; }
        public string Pressure { get; set; }
        public decimal? Qty { get; set; }
        public int UOM { get; set; }
        public int CurrencyId { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal ConvertedPrice { get; set; }
        public int ConvertedCurrencyId { get; set; }
        //  public bool IsActive { get; set; }
    }
}
