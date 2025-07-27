#nullable enable

namespace Fenrick.Miro.Tests;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public class BatchControllerTests
{
    [Fact]
    public async Task ForwardAsyncReturnsOrderedResponses()
    {
        var requests = new[]
                       {
                           new MiroRequest("GET", "/boards/1", null),
                           new MiroRequest("GET", "/boards/2", null)
                       };
        var responses = new Queue<MiroResponse>(
        [
            new MiroResponse(200, "1"),
            new MiroResponse(200, "2")
        ]);
        var client =
            new StubClient(req => Task.FromResult(responses.Dequeue()));
        var controller = new BatchController(client)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        var result = await controller.ForwardAsync(requests) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Equal("1", data[0].Body);
        Assert.Equal("2", data[1].Body);
    }

    /// <summary>
    ///     An empty batch should still produce an OK result with an empty array.
    /// </summary>
    [Fact]
    public async Task ForwardAsyncWithNoRequestsReturnsEmptyList()
    {
        var controller = new BatchController(
            new StubClient(_ => Task.FromResult(new MiroResponse(200, string.Empty))))
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        var result = await controller.ForwardAsync([]) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Empty(data);
    }

    private sealed class StubClient(Func<MiroRequest, Task<MiroResponse>> cb)
        : IMiroClient
    {
        private readonly Func<MiroRequest, Task<MiroResponse>> callback = cb;

        public Task<MiroResponse> SendAsync(
            MiroRequest request,
            CancellationToken ct = default) =>
            this.callback(request);
    }
}
