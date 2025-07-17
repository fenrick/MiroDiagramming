using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Xunit;

namespace Fenrick.Miro.Server.Tests;

public class InMemoryCacheServiceTests
{
    [Fact]
    public void Get_ReturnsValueWhenPresentOtherwiseNull()
    {
        var service = new InMemoryCacheService();
        Assert.Null(service.Get("1"));
        var meta = new BoardMetadata("1", "Board");
        service.Store(meta);
        Assert.Equal(meta, service.Get("1"));
    }
}
