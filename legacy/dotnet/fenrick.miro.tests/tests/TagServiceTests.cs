namespace Fenrick.Miro.Tests;

using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

using Server.Domain;
using Server.Services;

public class TagServiceTests
{
    [Fact]
    public async Task GetTagsAsyncThrowsOnNonSuccessStatusAsync()
    {
        var client = new StubClient(new MiroResponse(500, string.Empty));
        var svc = new TagService(client);

        HttpRequestException ex = await Assert
            .ThrowsAsync<HttpRequestException>(() => svc.GetTagsAsync($"b1")).ConfigureAwait(false);

        Assert.Equal(HttpStatusCode.InternalServerError, ex.StatusCode);
    }

    [Fact]
    public Task GetTagsAsyncThrowsOnMalformedJsonAsync()
    {
        var client = new StubClient(new MiroResponse(200, $"not json"));
        var svc = new TagService(client);

        return Assert
            .ThrowsAsync<InvalidOperationException>(() => svc.GetTagsAsync($"b1"));
    }

    private sealed class StubClient(MiroResponse response) : IMiroClient
    {
        public Task<MiroResponse> SendAsync(MiroRequest request, CancellationToken ct = default) => Task.FromResult(response);
    }
}

