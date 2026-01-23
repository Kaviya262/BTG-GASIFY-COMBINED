using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Shared.Tenant_DB
{
    public interface ITenantProvider
    {
        Tenant CurrentTenant { get; set; }

    }
}
