namespace Fenrick.Miro.Tests;

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

using Server.Domain;
using Server.Services;

using Xunit;

public class MiroTokenRefresherTests
{
    [Fact]
    public async Task RefreshAsyncUpdatesStoreAsync()
    {
        var cfg = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Miro:AuthBase"] = "http://auth",
            ["Miro:ClientId"] = "id",
            ["Miro:ClientSecret"] = "secret",
        }).Build();
        var handler = new StubHandler();
        var factory = new StubFactory(handler);
        var store = new InMemoryUserStore();
        await store.StoreAsync(new UserInfo("u1", "Bob", "old", "r1", DateTimeOffset.UnixEpoch));
        var refresher = new MiroTokenRefresher(cfg, factory, store);

        var token = await refresher.RefreshAsync("u1");

        Assert.Equal("new", token);
        UserInfo? updated = await store.RetrieveAsync("u1");
        Assert.Equal("new", updated?.AccessToken);
        Assert.Equal("r2", updated?.RefreshToken);
    }

    [Fact]
    public async Task RefreshAsyncReturnsNullWhenMissingTokenAsync()
    {
        var cfg = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();
        var factory = new StubFactory(new StubHandler());
        var store = new InMemoryUserStore();
        await store.StoreAsync(new UserInfo("u1", "Bob", "", "", DateTimeOffset.UnixEpoch));
        var refresher = new MiroTokenRefresher(cfg, factory, store);

        var token = await refresher.RefreshAsync("u1");

        Assert.Null(token);
    }

    private sealed class StubHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var json = "{\"token_type\":\"bearer\",\"access_token\":\"new\",\"refresh_token\":\"r2\",\"expires_in\":3600}";
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(json) });
        }
    }

    private sealed class StubFactory(HttpMessageHandler handler) : IHttpClientFactory
    {
        private readonly HttpClient client = new(handler) { BaseAddress = new Uri("http://auth") };

        public HttpClient CreateClient(string name) => this.client;
    }
}
