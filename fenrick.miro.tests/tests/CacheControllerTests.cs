#nullable enable

namespace Fenrick.Miro.Tests;

using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;

using Microsoft.AspNetCore.Mvc;

public class CacheControllerTests
{
    [Fact]
    public void GetReturnsCachedItem()
    {
        var service = new StubCache(new BoardMetadata($"1", $"Board"));
        var controller = new CacheController(service);

        ActionResult<BoardMetadata?> result = controller.Get($"1");
        OkObjectResult ok = Assert.IsType<OkObjectResult>(result.Result);

        BoardMetadata data = Assert.IsType<BoardMetadata>(ok.Value);
        Assert.Equal($"1", data.Id);
    }

    /// <summary>
    ///     When the cache misses, the controller should return an OK result with
    ///     a null payload so the client can fetch directly from Miro.
    /// </summary>
    [Fact]
    public void GetReturnsNullWhenNotFound()
    {
        var controller = new CacheController(new NullCache());

        ActionResult<BoardMetadata?> result = controller.Get($"missing");
        OkObjectResult ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Null(ok.Value);
    }

    private sealed class NullCache : ICacheService
    {
        public BoardMetadata? Retrieve(string boardId) => null;

        public void Store(BoardMetadata metadata) { }
    }

    private sealed class StubCache(BoardMetadata value) : ICacheService
    {
        private readonly BoardMetadata board = value;

        public BoardMetadata? Retrieve(string boardId) => this.board;

        public void Store(BoardMetadata metadata) { }
    }
}
