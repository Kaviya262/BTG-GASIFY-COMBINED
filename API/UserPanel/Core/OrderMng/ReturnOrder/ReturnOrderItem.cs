using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Quotation;

namespace Core.ReturnOrder
{
    public class ReturnOrderItem
    {
        public ReturnOrderItemHeader Header { get; set; }

        public List<ReturnOrderItemDetail> Details { get; set; }

        public List<ReturnOrderItemGas> GasDetail { get; set; }
        public List<ReturnOrderItemDO> DODetail { get; set; }


    }
    public class ReturnOrderItemGas
    {
        public Int32 id { get; set; }
        public Int32 GasCodeId { get; set; }
        public Int32 Rtn_ID {  get; set; }
        public string gascode { get; set; }
    }
    public class ReturnOrderItemDO
    {
        public Int32 id { get; set; }
        public Int32 DOID { get; set; }
        public Int32 Rtn_ID { get; set; }
        public string DONO { get; set; }
    }
    public class ReturnOrderItemHeader
    {
        public string rtnno { get; set; }
        public string rtndate { get; set; }
        public Int32 customerid { get; set; }
        public Int32 categoryid { get; set; }
        public Int32 issubmitted { get; set; }
        public Int32 UserId { get; set; }
        public Int32 BranchId { get; set; }
        public Int32 OrgId { get; set; }
        public Int32 id { get; set; }

    }
    public class ReturnOrderItemDetail
    {
        public Int32 DelDtlId { get; set; }
        public Int32 Rtn_Gas_ID { get; set; }

        public Int32 Rtn_DO_ID { get; set; }
        public Int32 id { get; set; }  
        public Int32 Rtn_ID { get; set; }
        public Int32 GasCodeId { get; set; }
        public string GasCode { get; set; }
        public Int32 cylinderid { get; set; }
        public string cylindername { get; set; }
        public string barcode { get; set; }
        public string PONumber { get; set; }
        public Int32 DOID { get; set; }
        public Int32 UOMID { get; set; }
        public string Volume { get; set; }
        public string Pressure { get; set; }
        public string GasDescription { get; set; }
        public Int32 DeliveryAddressId { get; set; }
        public string Address { get; set; }
        public string DriverName { get; set; }
        public string TruckName { get; set; }





    }


   




}
