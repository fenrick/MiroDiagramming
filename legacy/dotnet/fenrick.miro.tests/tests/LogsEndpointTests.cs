
#nullable enable

namespace Fenrick.Miro.Tests;

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

using Microsoft.Extensions.DependencyInjection;

using Server.Domain;
using Server.Services;

public class LogsEndpointTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> configuredFactory =
        factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting($"ApplyMigrations", $"false");
            builder.UseSetting($"ConnectionStrings:sqlite", $"Data Source=:memory:");
            builder.ConfigureServices(services =>
            {
                services.AddSingleton<RecordingSink>();
                services.AddSingleton<ILogSink>(sp => sp.GetRequiredService<RecordingSink>());
            });
        });

    [Fact]
    public async Task CaptureEndpointPersistsEntriesAsync()
    {
        RecordingSink sink = this.configuredFactory.Services.GetRequiredService<RecordingSink>();
        HttpClient client = this.configuredFactory.CreateClient();
        ClientLogEntry[] payload =
        [
            new(DateTime.UtcNow, $"info", $"message", Context: null),
        ];

        HttpResponseMessage response =
            await client.PostAsJsonAsync($"/api/logs", payload);
        Assert.Equal(System.Net.HttpStatusCode.Accepted, response.StatusCode);
        Assert.Single(sink.Entries);
    }

    private sealed class RecordingSink : ILogSink
    {
        public List<ClientLogEntry> Entries { get; } = [];

        public void Store(IEnumerable<ClientLogEntry> entries) =>
            this.Entries.AddRange(entries);
    }
}

