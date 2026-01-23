using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Shared.Tenant_DB
{
    public class Tenant
    {
        public int TenantId { get; set; }
        public string OrgCode { get; set; }
        public string SalesDB { get; set; }
        public string PurchaseDB { get; set; }
        public string MasterDB { get; set; }
        public bool IsActive { get; set; }
    }

}
