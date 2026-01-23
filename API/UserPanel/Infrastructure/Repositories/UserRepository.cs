using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class UserRepository
    {
        private readonly ITenantProvider _tenantProvider;
        private readonly IConfiguration _config;

        public UserRepository(ITenantProvider tenantProvider, IConfiguration config)
        {
            _tenantProvider = tenantProvider;
            _config = config;
        }

        private IDbConnection CreateConnection(string dbName)
        {
            var baseConn = _config.GetConnectionString("TenantBaseConnection");
            // Replace placeholder `{DB}` with tenant DB name
            var connStr = baseConn.Replace("{DB}", dbName);
            return new MySqlConnection(connStr);
        }

        public async Task<IEnumerable<User>> GetUsersAsync()
        {
            var tenantDb = _tenantProvider.CurrentTenant?.SalesDB;
            if (string.IsNullOrEmpty(tenantDb))
                throw new Exception("Tenant DB not resolved.");

            using var conn = CreateConnection(tenantDb);
            var users = await conn.QueryAsync<User>("SELECT * FROM users");
            return users;
        }
    }

}
