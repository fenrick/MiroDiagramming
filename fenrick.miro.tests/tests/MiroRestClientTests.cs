
namespace Fenrick.Miro.Tests;

using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using Server.Domain;
using Server.Services;

using Xunit;

public class MiroRestClientTests
{
    [Fact]
    public async Task SendAsyncAddsBearerTokenAsync()
    {
        var handler = new StubHandler();
        var httpClient =
            new HttpClient(handler) { BaseAddress = new Uri($"http://x") };
        var store = new InMemoryUserStore();
        await store
            .StoreAsync(
                new UserInfo($"u1", $"Bob", $"tok", $"r1", DateTimeOffset.UnixEpoch));
        var ctx = new DefaultHttpContext();
        ctx.Request.Headers[$"X-User-Id"] = $"u1";
        var client = new MiroRestClient(
            httpClient,
            store,
            new HttpContextAccessor { HttpContext = ctx },
            new StubRefresher($"none"));

        await client.SendAsync(new MiroRequest($"GET", $"/", Body: null),
            ctx.RequestAborted);

        Assert.Equal($"Bearer", handler.Request?.Headers.Authorization?.Scheme);
        Assert.Equal($"tok", handler.Request?.Headers.Authorization?.Parameter);
    }

    [Fact]
    public async Task SendAsyncRefreshesTokenAsync()
    {
        var handler = new SequenceHandler();
        var httpClient = new HttpClient(handler) { BaseAddress = new Uri($"http://x") };
        var store = new InMemoryUserStore();
        await store
            .StoreAsync(
                new UserInfo($"u1", $"Bob", $"old", $"r1", DateTimeOffset.UnixEpoch));
        var refresher = new StubRefresher($"new", store);
        var ctx = new DefaultHttpContext();
        ctx.Request.Headers[$"X-User-Id"] = $"u1";
        var client = new MiroRestClient(
            httpClient,
            store,
            new HttpContextAccessor { HttpContext = ctx },
            refresher);

        await client.SendAsync(new MiroRequest($"GET", $"/", Body: null), ctx.RequestAborted);

        Assert.Equal(2, handler.CallCount);
        Assert.Equal($"new", handler.LastRequest?.Headers.Authorization?.Parameter);
        Assert.Equal(
            $"new",
            (await store.RetrieveAsync($"u1", ctx.RequestAborted))?.AccessToken);
        Assert.True(refresher.Called);
    }

    private sealed class StubHandler : HttpMessageHandler
    {
        public HttpRequestMessage? Request { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            this.Request = request;
            return Task.FromResult(
                new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent($"{{}}") });
        }
    }

    private sealed class SequenceHandler : HttpMessageHandler
    {
        public int CallCount { get; private set; }

        public HttpRequestMessage? LastRequest { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            this.CallCount++;
            this.LastRequest = request;
            HttpStatusCode status = this.CallCount == 1 ? HttpStatusCode.Unauthorized : HttpStatusCode.OK;
            return Task.FromResult(new HttpResponseMessage(status));
        }
    }

    private sealed class StubRefresher(string token, IUserStore? store = null) : ITokenRefresher
    {
        public bool Called { get; private set; }

        public async Task<string?> RefreshAsync(string userId, CancellationToken ct = default)
        {
            this.Called = true;
            if (store != null)
            {
                UserInfo? info = await store.RetrieveAsync(userId, ct);
                if (info != null)
                {
                    await store.StoreAsync(
                        info with { AccessToken = token },
                        ct);
                }
            }

            return token;
        }
    }
}
