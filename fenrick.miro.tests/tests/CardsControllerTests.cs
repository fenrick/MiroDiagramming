#nullable enable

namespace Fenrick.Miro.Tests;

using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Xunit;

public class CardsControllerTests
{
    [Fact]
    public async Task CreateAsyncHandlesBulk()
    {
        CardData[] cards = Enumerable.Range(0, 21).Select(_ => new CardData($"t", Description: Tags: null, null, TaskStatus: null, Id: null, null)).ToArray();
        var controller = new CardsController(new StubClient())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            },
        };

        var result = await controller.CreateAsync(cards).ConfigureAwait(false) as OkObjectResult;

        List<MiroResponse> data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Equal(21, data.Count);
    }

    [Fact]
    public async Task CreateAsyncReturnsResponses()
    {
        CardData[] cards = new[]
                    {
                        new CardData($"t", Description: Tags: null, null, TaskStatus: null, Id: null, null),
                    };
        var controller = new CardsController(new StubClient())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            },
        };

        var result = await controller.CreateAsync(cards).ConfigureAwait(false) as OkObjectResult;

        List<MiroResponse> data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Single(data);
        Assert.Equal($"0", data[0].Body);
    }

    private sealed class StubClient : IMiroClient
    {
        private int count;

        public Task<MiroResponse> SendAsync(
            MiroRequest request,
            CancellationToken ct = default)
        {
            var res = new MiroResponse(
                201,
                this.count++.ToString(CultureInfo.InvariantCulture));
            return Task.FromResult(res);
        }
    }
}
