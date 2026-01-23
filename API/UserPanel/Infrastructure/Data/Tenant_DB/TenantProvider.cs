using Core.Shared.Tenant_DB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Tenant_DB
{
    public class TenantProvider: ITenantProvider
    {  public Tenant CurrentTenant { get; set; }
    }
}
