namespace Fenrick.Miro.Tests;

using System.Net.Http;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc.Testing;

using Server;

using Xunit;

public class OpenApiConfigurationTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client =
        factory
            .WithWebHostBuilder(builder =>
            {
                builder.UseSetting($"ApplyMigrations", $"false");
                builder.UseSetting(
                    $"ConnectionStrings:sqlite",
                    $"Data Source=:memory:");
            })
            .CreateClient();

    [Fact]
    public async Task SwaggerJsonEndpointReturnsDocumentAsync()
    {
        HttpResponseMessage response =
            await this.client.GetAsync($"/swagger/v1/swagger.json").ConfigureAwait(false);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
        Assert.Contains($"\"openapi\"", body, System.StringComparison.Ordinal);
        Assert.Contains($"\"title\": \"fenrick.miro.server\"", body,
            System.StringComparison.Ordinal);
    }
}
