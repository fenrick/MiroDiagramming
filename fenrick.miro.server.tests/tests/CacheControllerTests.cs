using System;
using Fenrick.Miro.Server.Api;
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Xunit;

#nullable enable

namespace Fenrick.Miro.Server.Tests;

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
}
