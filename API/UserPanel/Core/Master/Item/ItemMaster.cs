using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.Item
{
    public class ItemMaster
    {
        public Masteritem Master { get; set; }

    }
    public class Masteritem
    {
        public int ItemId { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public int GroupId { get; set; }
        public int UOMID { get; set; }
        public int LocationId { get; set; }
        public bool IsActive { get; set; }
        public int userid { get; set; }
        public string CreatedIP { get; set; }
        public DateTime CreatedDate { get; set; }
        public string LastModifiedIP { get; set; }
        public DateTime LastModifiedDate { get; set; }
        public int OrgId { get; set; }
        public int BranchId { get; set; }
        public decimal TaxPerc { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal VAT { get; set; }
        public string SellingItemName { get; set; }
    }
}