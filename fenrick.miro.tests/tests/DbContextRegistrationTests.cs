namespace Fenrick.Miro.Tests;

using Microsoft.Extensions.DependencyInjection;

using Server.Data;
using Server.Services;

public class DbContextRegistrationTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> configuredFactory =
        factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting($"ConnectionStrings:MiroDBContext",
                $"Data Source=:memory:");
            builder.UseSetting($"ApplyMigrations", $"false");
        });

    [Fact]
    public void CanResolveDbContext()
    {
        using IServiceScope scope =
            this.configuredFactory.Services.CreateScope();
        MiroDbContext db = scope.ServiceProvider.GetRequiredService<MiroDbContext>();
        Assert.NotNull(db);
    }

    [Fact]
    public void CanResolveTemplateStore()
    {
        using IServiceScope scope =
            this.configuredFactory.Services.CreateScope();
        ITemplateStore store =
            scope.ServiceProvider.GetRequiredService<ITemplateStore>();
        Assert.NotNull(store);
    }
}
