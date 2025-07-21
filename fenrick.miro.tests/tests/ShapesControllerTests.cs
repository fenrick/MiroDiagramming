#nullable enable

namespace Fenrick.Miro.Tests;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Server.Api;
using Server.Domain;
using Xunit;

public class ShapesControllerTests
{
    [Fact]
    public async Task CreateAsyncReturnsResponses()
    {
        var shapes = new[] { new ShapeData("rect", 0, 0, 1, 1, null, null, null) };
        var controller = new ShapesController(new StubClient());

        var result = await controller.CreateAsync(shapes) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Single(data);
        Assert.Equal("0", data[0].Body);
    }

    [Fact]
    public async Task CreateAsyncHandlesBulk()
    {
        var shapes = Enumerable.Range(0, 25)
            .Select(i => new ShapeData("r", i, 0, 1, 1, null, null, null))
            .ToArray();
        var controller = new ShapesController(new StubClient());

        var result = await controller.CreateAsync(shapes) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Equal(25, data.Count);
    }

    private sealed class StubClient : IMiroClient
    {
        private int count;
        public Task<MiroResponse> SendAsync(MiroRequest request)
        {
            var res = new MiroResponse(201, (this.count++).ToString());
            return Task.FromResult(res);
        }
    }
}
