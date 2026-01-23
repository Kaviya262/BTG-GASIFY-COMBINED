using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Core.OrderMng.Invoices
{
    public class InvoiceItemMain
    {


        public InvoiceItemHeader Header { get; set; }

        public List<InvoiceItemDetail> Details { get; set; }

        public List<DeliveryOrderDetail> DODetail { get; set; }
    }

    public class InvoiceItemHeader
    {
        public Int32 ismanual { get; set; }
        public int Id { get; set; }
        public string SalesInvoiceNbr { get; set; }
        public int CustomerId { get; set; }
        public DateTime SalesInvoiceDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal TotalQty { get; set; }
        //public bool IsActive { get; set; } 
        public int IsSubmitted { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }

        public decimal CalculatedPrice { get; set; }


        public int UserId { get; set; }
        //public int CreatedBy { get; set; }
        //public int UpdatedBy { get; set; }
        // public DateTime CreatedDate { get; set; }
        // public string CreatedIP { get; set; }
        // public string LastModifiedIP { get; set; }
        // public DateTime LastModifiedDate { get; set; }
    }

    public class InvoiceItemDetail
    {
        public Int32 sqid { get; set; }
        public Int32 packingid { get; set; }
        public int Id { get; set; }
        public int SalesInvoicesId { get; set; }
        public int PackingDetailId { get; set; }

        public string DeliveryNumber { get; set; }
        public int GasCodeId { get; set; }
        public int SoQty { get; set; }
        public decimal PickedQty { get; set; }

        public int uomid { get; set; }

        public int Currencyid { get; set; }



        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal Price { get; set; }

        public string DriverName { get; set; }
        public string TruckName { get; set; }
        public string PoNumber { get; set; }
        public DateTime RequestDeliveryDate { get; set; }
        public string DeliveryAddress { get; set; }
        public string DeliveryInstruction { get; set; }
        public decimal So_Issued_Qty { get; set; }
        public decimal Balance_Qty { get; set; }

        public int ConvertedCurrencyId { get; set; }

        public string DoNumber { get; set; }


        // public bool IsActive { get; set; } ;
    }

    public class DeliveryOrderDetail
    {
        public Int32 doid { get; set; }
        public int Id { get; set; }
        public int SalesInvoicesId { get; set; }
        public int PackingId { get; set; }
        /*
        public bool IsActive { get; set; } = true;
        public int CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedIP { get; set; }
        public string LastModifiedIP { get; set; }
        public DateTime LastModifiedDate { get; set; }*/
    }

}


