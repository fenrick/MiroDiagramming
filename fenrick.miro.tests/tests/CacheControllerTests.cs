#nullable enable

namespace Fenrick.Miro.Tests;

using Microsoft.AspNetCore.Mvc;
using Server.Api;
using Server.Domain;
using Server.Services;
using Xunit;

public class CacheControllerTests
{
    [Fact]
    public void GetReturnsCachedItem()
    {
        var service = new StubCache(new BoardMetadata("1", "Board"));
        var controller = new CacheController(service);

        var result = controller.Get("1");
        var ok = Assert.IsType<OkObjectResult>(result.Result);

        var data = Assert.IsType<BoardMetadata>(ok.Value);
        Assert.Equal("1", data.Id);
    }

    /// <summary>
    ///     When the cache misses, the controller should return an OK result with
    ///     a null payload so the client can fetch directly from Miro.
    /// </summary>
    [Fact]
    public void GetReturnsNullWhenNotFound()
    {
        var controller = new CacheController(new NullCache());

        var result = controller.Get("missing");
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Null(ok.Value);
    }

    private sealed class StubCache(BoardMetadata value) : ICacheService
    {
        private readonly BoardMetadata board = value;

        public BoardMetadata? Retrieve(string boardId) => this.board;
        public void Store(BoardMetadata metadata) { }
    }

    private sealed class NullCache : ICacheService
    {
        public BoardMetadata? Retrieve(string boardId) => null;
        public void Store(BoardMetadata metadata) { }
    }
}
