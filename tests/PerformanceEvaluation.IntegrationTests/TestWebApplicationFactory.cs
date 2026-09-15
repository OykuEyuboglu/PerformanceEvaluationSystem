using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using PerformanceEvaluation.Infrastructure.Data;

namespace PerformanceEvaluation.IntegrationTests;

public class TestWebApplicationFactory
    : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(
        IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor =
                services.SingleOrDefault(
                    d => d.ServiceType ==
                         typeof(DbContextOptions<AppDbContext>));

            if (descriptor is not null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase(
                    $"TestDb_{Guid.NewGuid()}");
            });

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme =
                        TestAuthHandler.SchemeName;

                    options.DefaultChallengeScheme =
                        TestAuthHandler.SchemeName;
                })
                .AddScheme<
                    AuthenticationSchemeOptions,
                    TestAuthHandler>(
                    TestAuthHandler.SchemeName,
                    _ => { });
        });
    }
}