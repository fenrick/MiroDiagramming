namespace Fenrick.Miro.Tests;

using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class OpenApiConfigurationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public OpenApiConfigurationTests(WebApplicationFactory<Program> factory)
    {
        this.client = factory.CreateClient();
    }

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
