using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Quotation;

namespace Core.OrderMng.SaleOrder
{
    public class SaleOrderItemmain
    {
        public SaleOrderItemHeader Header { get; set; }

        public List<SaleOrderItemDetail> Details { get; set; }

        public List<salesquatation> SQDetail { get; set; }


    }

    public class SaleOrderItemHeader
    {
        public int SO_ID { get; set; }
        public int OrderType { get; set; }

        public DateTime OrderDate { get; set; }
        public string SO_Number { get; set; }

        public string OrderBy { get; set; }

        //public int GasCodeId { get; set; }
         
        public int CustomerID { get; set; }


        public string CustomerEmail { get; set; }

        public string CustomerPhone { get; set; }
        public int BranchId { get; set; }

        public string RackNumber { get; set; }
        public string ProjectName { get; set; }
        public int UserId { get; set; }

        public int IsSubmitted { get; set; }

        public int Categories { get; set; }
        public int SQ_ID { get; set; }

        // public DateTime CreatedDate { get; set; }
        //public string CreatedIP { get; set;}
        //public DateTime LastModifiedDate { get; set; }
        //public int  LastModifiedBy { get; set; }
        //public string LastModifiedIP { get; set; }
        // public bool IsActive { get; set; }











    }
    public class SaleOrderItemDetail
    {
        //public List<SODeliveryaddress> Deliveryaddress { get; set; }

        public DateTime ReqDeliveryDate { get; set; }

        public int Deliveryaddressid { get; set; }
        public string? DeliveryInstruction { get; set; }

        public string Deliveryaddress { get; set; }

        //public string DeliveryInstruction { get; set; }
        public int Id { get; set; }
        public int Sqdtlid { get; set; }
        public int SQID { get; set; }
        public int SO_ID { get; set; }

        public string PONumber { get; set; }
        public int GasID { get; set; }
        public string GasDescription { get; set; }
        public string Volume { get; set; }
        public string Pressure { get; set; }

        public decimal Alr_Issued_Qty { get; set; }
        public decimal SQ_Qty { get; set; }
        public decimal SO_Qty { get; set; }
        public decimal Balance_Qty { get; set; }
        public int UOMID { get; set; }







    }


    public class salesquatation
    {
        public int Sqid { get; set; }
        public int SO_ID { get; set; }
    }



    public class SODeliveryaddress
    {
        public int Id { get; set; }
        public int SOdtlid { get; set; }

        public DateTime ReqDeliveryDate { get; set; }

        public int Deliveryaddressid { get; set; }

        public string Deliveryaddress { get; set; }

        public string DeliveryInstruction { get; set; }



    }





}
