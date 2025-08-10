
#nullable enable

namespace Fenrick.Miro.Tests;

using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.DependencyInjection;

using Server.Domain;
using Server.Services;

public class ContractSmokeTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client =
        factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting($"ApplyMigrations", $"false");
                builder.UseSetting($"ConnectionStrings:sqlite", $"Data Source=:memory:");
                builder.ConfigureServices(services =>
                {
                    services.AddSingleton<ICacheService, StubCacheService>();
                    services.AddSingleton<IUserStore, StubUserStore>();
                    services.AddSingleton<IMiroClient, StubMiroClient>();
                });
            })
            .CreateClient();

    [Fact]
    public async Task EndpointsReturnSuccessAsync()
    {
        HttpResponseMessage cacheResponse =
            await this.client.GetAsync($"/api/cache/board");
        cacheResponse.EnsureSuccessStatusCode();

        UserInfo user = new($"id", $"name", $"token");
        HttpResponseMessage userResponse =
            await this.client.PostAsJsonAsync($"/api/users", user);
        Assert.Equal(HttpStatusCode.Accepted, userResponse.StatusCode);

        MiroRequest[] batch = [new($"GET", $"/ping", Body: null)];
        HttpResponseMessage batchResponse =
            await this.client.PostAsJsonAsync($"/api/batch", batch);
        batchResponse.EnsureSuccessStatusCode();
        List<MiroResponse>? body =
            await batchResponse.Content.ReadFromJsonAsync<List<MiroResponse>>();
        Assert.NotNull(body);
        Assert.Single(body!);
    }

    private sealed class StubCacheService : ICacheService
    {
        public BoardMetadata? Retrieve(string boardId) => new(boardId, $"name");

        public void Store(BoardMetadata metadata)
        {
        }
    }

    private sealed class StubUserStore : IUserStore
    {
        public UserInfo? Retrieve(string userId) => null;

        public Task<UserInfo?> RetrieveAsync(string userId, CancellationToken ct = default) =>
            Task.FromResult<UserInfo?>(null);

        public void Delete(string userId)
        {
        }

        public Task DeleteAsync(string userId, CancellationToken ct = default) => Task.CompletedTask;

        public void Store(UserInfo info)
        {
        }

        public Task StoreAsync(UserInfo info, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class StubMiroClient : IMiroClient
    {
        public Task<MiroResponse> SendAsync(MiroRequest request, CancellationToken ct = default) =>
            Task.FromResult(new MiroResponse((int)HttpStatusCode.OK, $"ok"));
    }
}

