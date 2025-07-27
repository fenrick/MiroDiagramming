namespace Fenrick.Miro.Tests;

using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;

using Xunit;

public class InMemoryCacheServiceTests
{
    [Fact]
    public void GetReturnsValueWhenPresentOtherwiseNull()
    {
        var service = new InMemoryCacheService();
        Assert.Null(service.Retrieve($"1"));
        var meta = new BoardMetadata($"1", $"Board");
        service.Store(meta);
        Assert.Equal(meta, service.Retrieve($"1"));
    }

    /// <summary>
    ///     Storing the same board twice should override the previous value.
    /// </summary>
    [Fact]
    public void StoreOverridesExistingMetadata()
    {
        var service = new InMemoryCacheService();
        service.Store(new BoardMetadata($"1", $"Old"));
        service.Store(new BoardMetadata($"1", $"New"));

        Assert.Equal($"New", service.Retrieve($"1")?.Name);
    }
}
