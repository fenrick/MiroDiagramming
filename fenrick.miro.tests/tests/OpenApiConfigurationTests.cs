namespace Fenrick.Miro.Tests;

using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class OpenApiConfigurationTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client =
        factory
            .WithWebHostBuilder(
                builder =>
                {
                    builder.UseSetting("ApplyMigrations", "false");
                    builder.UseSetting(
                        "ConnectionStrings:postgres",
                        "Host=unused;Database=test;Username=u;Password=p");
                })
            .CreateClient();

    [Fact]
    public async Task SwaggerJsonEndpointReturnsDocumentAsync()
    {
        var response = await this.client.GetAsync("/swagger/v1/swagger.json");
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"openapi\"", body);
        Assert.Contains("\"title\": \"fenrick.miro.server\"", body);
    }
}
