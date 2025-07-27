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
        var cards = Enumerable.Range(0, 21).Select(_ => new CardData("t", null, null, null, null, null, null)).ToArray();
        var controller = new CardsController(new StubClient())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        var result = await controller.CreateAsync(cards) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Equal(21, data.Count);
    }

    [Fact]
    public async Task CreateAsyncReturnsResponses()
    {
        var cards = new[]
                    {
                        new CardData("t", null, null, null, null, null, null)
                    };
        var controller = new CardsController(new StubClient())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        var result = await controller.CreateAsync(cards) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Single(data);
        Assert.Equal("0", data[0].Body);
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
