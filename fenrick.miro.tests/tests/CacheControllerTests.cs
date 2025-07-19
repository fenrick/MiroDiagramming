using System;
using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Xunit;

#nullable enable

namespace Fenrick.Miro.Tests;

public class CacheControllerTests
{
    [Fact]
    public void Get_ReturnsCachedItem()
    {
        var service = new StubCache(new BoardMetadata("1", "Board"));
        var controller = new CacheController(service);

        var result = controller.Get("1");
        var ok = Assert.IsType<OkObjectResult>(result.Result);

        var data = Assert.IsType<BoardMetadata>(ok.Value);
        Assert.Equal("1", data.Id);
    }

    private sealed class StubCache : ICacheService
    {
        private readonly BoardMetadata _value;
        public StubCache(BoardMetadata value) => _value = value;
        public BoardMetadata? Get(string boardId) => _value;
        public void Store(BoardMetadata metadata) { }
    }

    /// <summary>
    /// When the cache misses, the controller should return an OK result with
    /// a null payload so the client can fetch directly from Miro.
    /// </summary>
    [Fact]
    public void Get_ReturnsNullWhenNotFound()
    {
        var controller = new CacheController(new NullCache());

        var result = controller.Get("missing");
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Null(ok.Value);
    }

    private sealed class NullCache : ICacheService
    {
        public BoardMetadata? Get(string boardId) => null;
        public void Store(BoardMetadata metadata) { }
    }
}
