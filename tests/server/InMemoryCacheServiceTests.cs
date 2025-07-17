using System;
using System.Collections.Generic;
using Miro.Server.Domain;
using Miro.Server.Services;
using Xunit;

namespace Miro.Server.Tests;

public class InMemoryCacheServiceTests
{
    [Fact]
    public void StoreAndGet_ReturnsCachedItem()
    {
        var service = new InMemoryCacheService();
        var meta = new BoardMetadata("1", "Board");
        service.Store(meta);
        var result = service.Get("1");
        Assert.Equal(meta, result);
    }
}
