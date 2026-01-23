 
using Dapper;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System.Reflection;
using UserPanel.Core.Abstractions;
using UserPanel.Infrastructure.Data;
using UserPanel.Application.Context;
using Core.Abstractions;
namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var db1ConnectionString = configuration.GetConnectionString("SalesDB")
                                       ?? throw new ArgumentNullException("DB1Connection missing");

            var db2ConnectionString = configuration.GetConnectionString("PurchaseDB")
                                       ?? throw new ArgumentNullException("DB2Connection missing");

            var db3ConnectionString = configuration.GetConnectionString("FinanceDB")
                             ?? throw new ArgumentNullException("FinanceDB missing");

            var db4ConnectionString = configuration.GetConnectionString("MasterDB")
                             ?? throw new ArgumentNullException("MasterDB missing");

            // Register per-DB connection factories
            services.AddSingleton<IMySqlConnectionFactoryDB1>(sp => new MySqlConnectionFactory(db1ConnectionString));
            services.AddSingleton<IMySqlConnectionFactoryDB2>(sp => new MySqlConnectionFactory(db2ConnectionString));
            services.AddSingleton<IFinaceDBConnection>(sp => new MySqlConnectionFactory(db3ConnectionString));
            services.AddSingleton<IMasterDBConnection>(sp => new MySqlConnectionFactory(db4ConnectionString));
            

            // Register unit of work with lazy connection setup
            services.AddScoped<IUnitOfWorkDB1>(sp =>
            {
                var factory = sp.GetRequiredService<IMySqlConnectionFactoryDB1>();
                return new DapperUnitOfWork(factory);
            });

            services.AddScoped<IUnitOfWorkDB2>(sp =>
            {
                var factory = sp.GetRequiredService<IMySqlConnectionFactoryDB2>();
                return new DapperUnitOfWork(factory);
            });

            services.AddScoped<IUnitOfWorkDB3>(sp =>
            {
                var factory = sp.GetRequiredService<IFinaceDBConnection>();
                return new DapperUnitOfWork(factory);
            });
            services.AddScoped<IUnitOfWorkDB4>(sp =>
            {
                var factory = sp.GetRequiredService<IMasterDBConnection>();
                return new DapperUnitOfWork(factory);
            });

            var repositoryTypes = Assembly.GetAssembly(typeof(QuotationRepository))
                  ?.GetTypes()
                  .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith("Repository"))
                  .ToList();

            foreach (var type in repositoryTypes)
            {
                var interfaceType = type.GetInterfaces().FirstOrDefault(i => i.Name == "I" + type.Name);
                if (interfaceType != null)
                {
                    services.AddScoped(interfaceType, type);
                }
            }


            return services;
        }

    }
}
