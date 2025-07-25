using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using Fenrick.Miro.Server.Data;

public class DbContextRegistrationTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> configuredFactory =
        factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("ConnectionStrings:postgres", "Host=unused;Database=test;Username=u;Password=p");
        });

    [Fact]
    public void CanResolveDbContext()
    {
        using var scope = this.configuredFactory.Services.CreateScope();
        var db = scope.ServiceProvider.GetService<MiroDbContext>();
        Assert.NotNull(db);
    }
}
