using Core.OrderMng.Quotation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.OrderMng.ProductionOrder
{
    public class ProductionItems
    {
        public ProductionItemsHeader Header { get; set; }

        public List<ProductionItemsDetail> Details { get; set; }
    }

    public class ProductionItemsHeader
    {
        public Int32 Prod_ID { get; set; }
        public string ProdDate { get; set; }
        public Int32 GasTypeId { get; set; }
        public string ProdNo { get; set; }
        public Int32 GasCodeId { get; set; }
        public string GasCode { get; set; }
        public string GasTypeName { get; set; }      
        public int IsSubmitted { get; set; }
        public Int32 UserId { get; set; }
        public Int32 BranchId { get; set; }
        public Int32 OrgId { get; set; }
    }
    public class ProductionItemsDetail
    {
        public Int32 Prod_ID { get; set; }
        public Int32 Prod_dtl_Id { get; set; }
        public Int32 cylinderid { get; set; }
        public string barcode { get; set; }
        public Int32 gascodeid { get; set; }
        public Int32 ownershipid { get; set; }
        public Int32 cylindertypeid { get; set; }


        public string cylindername { get; set; }
        public string GasCode { get; set; }
        public string OwnershipName { get; set; }
        public string cylindertype { get; set; }
        public string testedon { get; set; }
        public string nexttestdate { get; set; }
        

    }
}
