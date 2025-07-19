using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Domain;
using Microsoft.AspNetCore.Mvc;
using Xunit;

#nullable enable

namespace Fenrick.Miro.Tests;

public class BatchControllerTests
{
    [Fact]
    public async Task ForwardAsync_ReturnsOrderedResponses()
    {
        var requests = new[]
        {
            new MiroRequest("GET", "/boards/1", null),
            new MiroRequest("GET", "/boards/2", null)
        };
        var responses = new Queue<MiroResponse>(new[]
        {
            new MiroResponse(200, "1"),
            new MiroResponse(200, "2")
        });
        var client = new StubClient(req => Task.FromResult(responses.Dequeue()));
        var controller = new BatchController(client);

        var result = await controller.ForwardAsync(requests) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Equal("1", data[0].Body);
        Assert.Equal("2", data[1].Body);
    }

    private sealed class StubClient : IMiroClient
    {
        private readonly Func<MiroRequest, Task<MiroResponse>> _cb;
        public StubClient(Func<MiroRequest, Task<MiroResponse>> cb) => _cb = cb;
        public Task<MiroResponse> SendAsync(MiroRequest request) => _cb(request);
    }

    /// <summary>
    /// An empty batch should still produce an OK result with an empty array.
    /// </summary>
    [Fact]
    public async Task ForwardAsync_WithNoRequests_ReturnsEmptyList()
    {
        var controller = new BatchController(new StubClient(_ => Task.FromResult(new MiroResponse(200, ""))));

        var result = await controller.ForwardAsync(Array.Empty<MiroRequest>()) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Empty(data);
    }
}
