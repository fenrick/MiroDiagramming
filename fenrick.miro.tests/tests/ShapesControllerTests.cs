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

public class ShapesControllerTests
{
    [Fact]
    public async Task CreateAsyncHandlesBulk()
    {
        ShapeData[] shapes = Enumerable.Range(0, 25)
            .Select(i => new ShapeData("r", i, 0, 1, 1, Rotation: null, Text: null, Style: null))
            .ToArray();
        var controller = new ShapesController(
            new StubClient(),
            new NullShapeCache())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            },
        };

        var result =
            await controller.CreateAsync($"b1", shapes) as OkObjectResult;

        List<MiroResponse> data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Equal(25, data.Count);
    }

    [Fact]
    public async Task CreateAsyncReturnsResponses()
    {
        ShapeData[] shapes = new[]
                     {
                         new ShapeData("rect", 0, 0, 1, 1, Rotation: null, Text: null, Style: null),
                     };
        var controller = new ShapesController(
            new StubClient(),
            new NullShapeCache())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            },
        };

        var result =
            await controller.CreateAsync($"b1", shapes) as OkObjectResult;

        List<MiroResponse> data = Assert.IsType<List<MiroResponse>>(result!.Value);
        Assert.Single(data);
        Assert.Equal($"0", data[0].Body);
    }

    [Fact]
    public async Task DeleteAsyncRemovesEntry()
    {
        var stub = new StubClient();
        var cache = new RecordingCache();
        var controller = new ShapesController(stub, cache)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            },
        };

        var res = await controller.DeleteAsync($"b2", $"i3") as OkObjectResult;

        Assert.Equal($"0", ((MiroResponse)res!.Value!).Body);
        Assert.Equal($"i3", cache.RemovedItem);
    }

    [Fact]
    public async Task UpdateAsyncStoresEntry()
    {
        var stub = new StubClient();
        var cache = new RecordingCache();
        var controller = new ShapesController(stub, cache)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            },
        };

        var res = await controller.UpdateAsync(
$"b1",
$"i1",
                      new ShapeData(
$"r",
                          0,
                          0,
                          1,
                          1,
Rotation: null,
Style: null,
                          null)) as OkObjectResult;

        Assert.Equal($"0", ((MiroResponse)res!.Value!).Body);
        Assert.Equal($"i1", cache.ItemId);
    }

    [Fact]
    public async Task GetAsyncReturnsCachedEntry()
    {
        var cache = new RecordingCache();
        cache.Store(new ShapeCacheEntry("b1", "i2", new ShapeData("r", 0, 0, 1, 1, Rotation: null, Text: null, Style: null)));
        var controller = new ShapesController(new StubClient(), cache)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            },
        };

        var res = await controller.GetAsync($"b1", $"i2") as ContentResult;

        Assert.NotNull(res);
        Assert.Contains($"\"Shape\"", res!.Content, System.StringComparison.Ordinal);
    }

    [Fact]
    public async Task GetAsyncFetchesAndStores()
    {
        var cache = new RecordingCache();
        var stub = new StubClient(/*lang=json,strict*/ $"{\"shape\":\"rect\"}");
        var controller = new ShapesController(stub, cache)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            },
        };

        var res = await controller.GetAsync($"b1", $"i3") as ContentResult;

        Assert.Equal(/*lang=json,strict*/ $"{\"shape\":\"rect\"}", res!.Content);
        Assert.Equal($"i3", cache.ItemId);
    }

    private sealed class NullShapeCache : IShapeCache
    {
        public void Remove(string boardId, string itemId) { }

        public ShapeCacheEntry? Retrieve(string boardId, string itemId) => null;

        public ShapeData? RetrieveData(string boardId, string itemId) => null;

        public void Store(ShapeCacheEntry entry) { }

        public void Store(string boardId, string itemId, ShapeData data) { }
    }

    private sealed class RecordingCache : IShapeCache
    {
        public string? ItemId { get; private set; }

        private readonly Dictionary<string, ShapeCacheEntry> store = [];

        public string? RemovedItem { get; private set; }

        public void Remove(string boardId, string itemId) =>
            this.RemovedItem = itemId;

        public ShapeCacheEntry? Retrieve(string boardId, string itemId) =>
            this.store.TryGetValue($"{boardId}:{itemId}", out ShapeCacheEntry? e) ? e : null;

        public ShapeData? RetrieveData(string boardId, string itemId) =>
            this.Retrieve(boardId, itemId)?.Data;

        public void Store(ShapeCacheEntry entry)
        {
            this.ItemId = entry.ItemId;
            this.store[$"{entry.BoardId}:{entry.ItemId}"] = entry;
        }

        public void Store(string boardId, string itemId, ShapeData data) =>
            this.Store(new ShapeCacheEntry(boardId, itemId, data));
    }

    private sealed class StubClient(string? body = null) : IMiroClient
    {
        private int count;
        private readonly string? fixedBody = body;

        public Task<MiroResponse> SendAsync(
            MiroRequest request,
            CancellationToken ct = default)
        {
            var res = new MiroResponse(
                201,
                this.fixedBody ?? this.count++.ToString(CultureInfo.InvariantCulture));
            return Task.FromResult(res);
        }
    }
}
