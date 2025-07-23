#nullable enable

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
    public async Task SendAsyncAddsBearerToken()
    {
        var handler = new StubHandler();
        var httpClient =
            new HttpClient(handler) { BaseAddress = new Uri("http://x") };
        var store = new InMemoryUserStore();
        store.Store(new UserInfo("u1", "Bob", "tok"));
        var ctx = new DefaultHttpContext();
        ctx.Request.Headers["X-User-Id"] = "u1";
        var client = new MiroRestClient(httpClient, store,
            new HttpContextAccessor { HttpContext = ctx });

        await client.SendAsync(new MiroRequest("GET", "/", null));

        Assert.Equal("Bearer", handler.Request?.Headers.Authorization?.Scheme);
        Assert.Equal("tok", handler.Request?.Headers.Authorization?.Parameter);
    }

    // TODO add tests covering token refresh behaviour once refresh endpoint is
    // implemented on the server.

    private sealed class StubHandler : HttpMessageHandler
    {
        public HttpRequestMessage? Request { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
        {
            this.Request = request;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("{}")
            });
        }
    }
}
