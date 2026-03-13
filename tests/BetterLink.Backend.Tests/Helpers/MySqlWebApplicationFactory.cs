using BetterLink.Backend.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BetterLink.Backend.Tests.Helpers;

/// <summary>
/// Hosts the API against a real MySQL database for smoke testing.
/// Expects a reachable MySQL instance and will recreate the schema each run.
/// </summary>
public class MySqlWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public const string DefaultConnectionString =
        "Server=127.0.0.1;Port=33306;Database=betterlink_mysql_test;User=betterlink_user;Password=ChangeMe123!;";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options =>
                options.UseMySql(DefaultConnectionString, new MySqlServerVersion(new Version(8, 0, 0))));
        });
    }

    public async Task InitializeAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // MySQL container can take a few seconds to accept connections.
        var connected = false;
        for (var i = 0; i < 15; i++)
        {
            if (await db.Database.CanConnectAsync())
            {
                connected = true;
                break;
            }

            await Task.Delay(1000);
        }

        if (!connected)
        {
            throw new InvalidOperationException("Could not connect to MySQL test database at 127.0.0.1:33306.");
        }

        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
        await IdentitySeeder.SeedRolesAsync(Services);
    }

    public new Task DisposeAsync() => base.DisposeAsync().AsTask();
}
