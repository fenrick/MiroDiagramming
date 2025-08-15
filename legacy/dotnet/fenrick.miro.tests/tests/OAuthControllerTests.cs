namespace Fenrick.Miro.Tests;

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using Server.Api;
using Server.Domain;
using Server.Services;

using Xunit;

public class OAuthControllerTests
{
    [Fact]
    public async Task CallbackExchangesCodeAndStoresTokensAsync()
    {
        IConfiguration cfg = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
(StringComparer.Ordinal)
        {
            [$"Miro:AuthBase"] = $"http://auth",
            [$"Miro:ClientId"] = $"id",
            [$"Miro:ClientSecret"] = $"secret",
            [$"Miro:RedirectUri"] = $"http://redir",
        }).Build();
        var handler = new StubHandler();
        var factory = new StubFactory(handler);
        var store = new InMemoryUserStore();
        var controller = new OAuthController(cfg, store, factory);

        IActionResult res = await controller.Callback($"code", $"x:u1", CancellationToken.None).ConfigureAwait(false);

        UserInfo? info = await store.RetrieveAsync($"u1").ConfigureAwait(false);
        Assert.Equal($"tok", info?.AccessToken);
        Assert.Equal($"ref", info?.RefreshToken);
        RedirectResult redirect = Assert.IsType<RedirectResult>(res);
        Assert.Equal($"/app.html", redirect.Url);
    }

    private sealed class StubHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            const string json = """{""token_type"":""bearer"",""access_token"":""tok"",""refresh_token"":""ref"",""expires_in"":3600}""";
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json),
            });
        }
    }

    private sealed class StubFactory(HttpMessageHandler handler) : IHttpClientFactory, IDisposable
    {
        private readonly HttpClient client = new(handler) { BaseAddress = new Uri($"http://auth") };

        public HttpClient CreateClient(string name) => this.client;

        public void Dispose() => this.client.Dispose();
    }
}

