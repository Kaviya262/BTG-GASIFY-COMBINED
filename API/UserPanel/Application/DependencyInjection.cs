using Microsoft.Extensions.DependencyInjection;

namespace UserPanel.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Add MediatR with handlers from the Application assembly
            services.AddMediatR(configuration =>
            {
                configuration.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
            });

            // Register UoW, and other services
            // services.AddTransient<IUnitOfWorkDB1, DapperUnitOfWork>();
            //services.AddTransient<PrioritySuggestionService>();

            return services;
        }
    }
}
