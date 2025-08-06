namespace Fenrick.Miro.Tests;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Server.Domain;
using Server.Services;

public class TagServiceTests
{
    [Fact]
    public async Task GetTagsAsyncReturnsEmptyListOnNonSuccessAsync()
    {
        var client = new StubClient(new MiroResponse(500, string.Empty));
        var svc = new TagService(client);

        IReadOnlyList<TagInfo> tags =
            await svc.GetTagsAsync("b1").ConfigureAwait(false);

        Assert.Empty(tags);
    }

    [Fact]
    public async Task GetTagsAsyncThrowsOnMalformedJsonAsync()
    {
        var client = new StubClient(new MiroResponse(200, "not json"));
        var svc = new TagService(client);

        await Assert
            .ThrowsAsync<InvalidOperationException>(() => svc.GetTagsAsync("b1"))
            .ConfigureAwait(false);
    }

    private sealed class StubClient(MiroResponse response) : IMiroClient
    {
        public Task<MiroResponse> SendAsync(MiroRequest request, CancellationToken ct = default) => Task.FromResult(response);
    }
}

