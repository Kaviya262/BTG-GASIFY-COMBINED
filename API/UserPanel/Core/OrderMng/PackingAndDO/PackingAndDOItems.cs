using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.OrderMng.PackingAndDO
{
    public class PackingAndDOItemss
    {
        public PackingAndDOHeader Header { get; set; }
        public List<PackingAndDOCustomer> Customers { get; set; }
        public List<PackingAndDOSO> SODtl { get; set; }
        public List<PackingAndDODetails> Details { get; set; }
        public List<PackingAndDOGas> GasDtl { get; set; }
    }


    public class PackingAndDOHeaders
    {
        public Int32 PackingType { get; set; }
        public string esttime { get; set; }
        public string RackNo { get; set; }
        public Int32 RackId { get; set; }
        public int UserId { get; set; }
        public int BranchId { get; set; }
        public int OrgId { get; set; }
        public int packingpersonid { get; set; }
        public string pdldate { get; set; }
        public int IsSubmitted { get; set; }
        public string PackNo { get; set; }
        public Int32 id { get; set; }

    }
    public class PackingAndDOCustomers
    {
        public int id { get; set; }
        public int PackingId { get; set; }
        public int CustomerId { get; set; }      

    }

    public class PackingAndDOGass
    {
        public int id { get; set; }
        public int PackingId { get; set; }
        public int CustomerId { get; set; }
        public int gascodeid { get; set; }
        public int CustomerDtlId { get; set; }
    }
    public class PackingAndDOSOs
    {
        public int id { get; set; }
        public int PackingId { get; set; }
        public int CustomerId { get; set; }
        public int SOID { get; set; }
        public int CustomerDtlId { get; set; }         
    }
    public class PackingAndDODetailss
    {
        public Int32 SQID { get; set; }
        public Int32 soid { get; set; }
        public int id { get; set; }
        public int packerheaderid { get; set; }
        public int sodetailid { get; set; }
        public int gascodeid { get; set; }
        public decimal soqty { get; set; }
        public decimal pickqty { get; set; }
        public string drivername { get; set; }
        public string trucknumber { get; set; }
        public string ponumber { get; set; }
        public string requestdeliverydate { get; set; }
        public string deliveryaddress { get; set; }
        public string deliveryinstruction { get; set; }
        public string Volume { get; set; }
        public string Pressure { get; set; }
        public decimal SQ_Qty { get; set; }
        public int CurrencyId { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TotalPrice { get; set; }
        public decimal? ConvertedPrice { get; set; }
        public int ConvertedCurrencyId { get; set; }
        public decimal ExchangeRate { get; set; }
        public decimal So_Issued_Qty { get; set; }
        public decimal Balance_Qty { get; set; }         
        public int uomid { get; set; }
    }

    public class packingacknowledgements
    {
        public Int32 packingid { get; set; }
        public Int32 isacknowledged { get; set; }
        public Int32 id { get; set; }
        public string DONo { get; set; }
    }

}
