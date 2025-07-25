#nullable enable

namespace Fenrick.Miro.Tests;

using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Xunit;

public class ShapesControllerTests
{
    [Fact]
    public async Task CreateAsyncHandlesBulk()
    {
        var shapes = Enumerable.Range(0, 25)
            .Select((int i) => new ShapeData("r", i, 0, 1, 1, null, null, null))
            .ToArray();
        var controller = new ShapesController(
            new StubClient(),
            new NullShapeCache());

        var result =
            await controller.CreateAsync("b1", shapes) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Equal(25, data.Count);
    }

    [Fact]
    public async Task CreateAsyncReturnsResponses()
    {
        var shapes = new[]
                     {
                         new ShapeData("rect", 0, 0, 1, 1, null, null, null)
                     };
        var controller = new ShapesController(
            new StubClient(),
            new NullShapeCache());

        var result =
            await controller.CreateAsync("b1", shapes) as OkObjectResult;

        var data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Single(data);
        Assert.Equal("0", data[0].Body);
    }

    [Fact]
    public async Task DeleteAsyncRemovesEntry()
    {
        var stub = new StubClient();
        var cache = new RecordingCache();
        var controller = new ShapesController(stub, cache);

        var res = await controller.DeleteAsync("b2", "i3") as OkObjectResult;

        Assert.Equal("0", ((MiroResponse)res!.Value!).Body);
        Assert.Equal("i3", cache.RemovedItem);
    }

    [Fact]
    public async Task UpdateAsyncStoresEntry()
    {
        var stub = new StubClient();
        var cache = new RecordingCache();
        var controller = new ShapesController(stub, cache);

        var res = await controller.UpdateAsync(
                      "b1",
                      "i1",
                      new ShapeData(
                          "r",
                          0,
                          0,
                          1,
                          1,
                          null,
                          null,
                          null)) as OkObjectResult;

        Assert.Equal("0", ((MiroResponse)res!.Value!).Body);
        Assert.Equal("i1", cache.ItemId);
    }

    private sealed class NullShapeCache : IShapeCache
    {
        public void Remove(string boardId, string itemId) { }

        public ShapeCacheEntry? Retrieve(string boardId, string itemId) => null;

        public void Store(ShapeCacheEntry entry) { }
    }

    private sealed class RecordingCache : IShapeCache
    {
        public string? ItemId { get; private set; }

        public string? RemovedItem { get; private set; }

        public void Remove(string boardId, string itemId) =>
            this.RemovedItem = itemId;

        public ShapeCacheEntry? Retrieve(string boardId, string itemId) => null;

        public void Store(ShapeCacheEntry entry) => this.ItemId = entry.ItemId;
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
