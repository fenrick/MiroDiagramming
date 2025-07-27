using Fenrick.Miro.Server.Data;
using Fenrick.Miro.Server.Services;
using Microsoft.Extensions.DependencyInjection;

public class DbContextRegistrationTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> configuredFactory =
        factory.WithWebHostBuilder(
            builder =>
            {
                builder.UseSetting("ConnectionStrings:sqlite", "Data Source=:memory:");
                builder.UseSetting("ApplyMigrations", "false");
            });

    [Fact]
    public void CanResolveDbContext()
    {
        using var scope = this.configuredFactory.Services.CreateScope();
        var db = scope.ServiceProvider.GetService<MiroDbContext>();
        Assert.NotNull(db);
    }

    [Fact]
    public void CanResolveTemplateStore()
    {
        using var scope = this.configuredFactory.Services.CreateScope();
        var store = scope.ServiceProvider.GetService<ITemplateStore>();
        Assert.NotNull(store);
    }
}
