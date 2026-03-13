using BetterLink.Backend.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BetterLink.Backend.Tests.Helpers;

/// <summary>
/// Starts the BetterLink API against an in-memory SQLite database so tests
/// run without a live MySQL server.  Roles are seeded after EnsureCreated().
/// </summary>
public class TestWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    // One connection kept open for the factory lifetime so the in-memory DB persists.
    private readonly SqliteConnection _connection = new("Data Source=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Tell the app it's running under "Testing" – Program.cs skips IdentitySeeder
        // in that environment so we can call EnsureCreated first.
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove the MySQL DbContextOptions that Program.cs registered.
            services.RemoveAll<DbContextOptions<AppDbContext>>();

            // Re-register with SQLite using the persistent open connection.
            _connection.Open();
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(_connection));
        });
    }

    // Called once for the factory instance (before any tests run in the class).
    public async Task InitializeAsync()
    {
        // Accessing Services triggers the full app-startup pipeline.
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Create all tables from the EF model (no migrations needed for tests).
        await db.Database.EnsureCreatedAsync();

        // Seed roles now that the schema exists.
        await IdentitySeeder.SeedRolesAsync(Services);
    }

    public new async Task DisposeAsync()
    {
        await base.DisposeAsync();
        await _connection.DisposeAsync();
    }
}
