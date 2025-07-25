#nullable enable

namespace Fenrick.Miro.Tests;

using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Server.Api;
using Server.Domain;
using Server.Services;
using Xunit;

public class CardsControllerTests
{
    [Fact]
    public async Task CreateAsyncHandlesBulk()
    {
        var cards = Enumerable.Range(0, 21).Select(_ =>
            new CardData("t", null, null, null, null, null, null)).ToArray();
        var controller = new CardsController(new StubClient());

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
        var controller = new CardsController(new StubClient());

        var result = await controller.CreateAsync(cards) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Single(data);
        Assert.Equal("0", data[0].Body);
    }

    private sealed class StubClient : IMiroClient
    {
        private int count;

        public Task<MiroResponse> SendAsync(MiroRequest request)
        {
            var res = new MiroResponse(
                201,
                this.count++.ToString(CultureInfo.InvariantCulture));
            return Task.FromResult(res);
        }
    }
}
