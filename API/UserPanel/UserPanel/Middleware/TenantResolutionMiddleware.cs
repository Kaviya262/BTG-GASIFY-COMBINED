using Dapper;
using MySql.Data.MySqlClient;
using Core.Shared.Tenant_DB;

namespace UserPanel.Middleware
{
    public class TenantResolutionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _config;

        public TenantResolutionMiddleware(RequestDelegate next, IConfiguration config)
        {
            _next = next;
            _config = config;
        }

        public async Task Invoke(HttpContext context, ITenantProvider tenantProvider)
        {
            var orgCode = context.Request.Headers["X-Tenant-Code"].ToString();
            if (string.IsNullOrEmpty(orgCode))
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsync("Tenant not specified.");
                return;
            }

            var masterDbConn = _config.GetConnectionString("MasterDBConnection");
            using var conn = new MySqlConnection(masterDbConn);
            await conn.OpenAsync();

            var tenant = await conn.QueryFirstOrDefaultAsync<Tenant>(
                "SELECT * FROM tenants WHERE orgid = @OrgCode AND IsActive = 1",
                new { OrgCode = orgCode });

            if (tenant == null)
            {
                context.Response.StatusCode = 404;
                await context.Response.WriteAsync("Tenant not found or inactive.");
                return;
            }

            tenantProvider.CurrentTenant = tenant;

            await _next(context);
        }
    }

}
