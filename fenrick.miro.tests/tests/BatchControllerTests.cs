#nullable enable

namespace Fenrick.Miro.Tests;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Server.Api;
using Server.Domain;
using Server.Services;

public class BatchControllerTests
{
    [Fact]
    public async Task ForwardAsyncReturnsOrderedResponsesAsync()
    {
        MiroRequest[] requests =
        [
            new($"GET", $"/boards/1", Body: null),
            new($"GET", $"/boards/2", Body: null),
        ];
        var responses = new Queue<MiroResponse>(
        [
            new MiroResponse(200, $"1"),
            new MiroResponse(200, $"2"),
        ]);
        var client =
            new StubClient(req => Task.FromResult(responses.Dequeue()));
        var controller = new BatchController(client)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() },
        };

        var result = await controller.ForwardAsync(requests).ConfigureAwait(false) as OkObjectResult;

        List<MiroResponse> data =
            Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Equal($"1", data[0].Body);
        Assert.Equal($"2", data[1].Body);
    }

    /// <summary>
    ///     An empty batch should still produce an OK result with an empty array.
    /// </summary>
    [Fact]
    public async Task ForwardAsyncWithNoRequestsReturnsEmptyListAsync()
    {
        var controller = new BatchController(
            new StubClient(_ =>
                Task.FromResult(new MiroResponse(200, string.Empty))))
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() },
        };

        var result = await controller.ForwardAsync([]).ConfigureAwait(false) as OkObjectResult;

        List<MiroResponse> data =
            Assert.IsType<List<MiroResponse>>(result!.Value);
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
