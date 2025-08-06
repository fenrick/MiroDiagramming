namespace Fenrick.Miro.Tests;

using Server.Domain;
using Server.Services;

using Xunit;

public class InMemoryShapeCacheTests
{
    [Fact]
    public void RemoveDeletesEntry()
    {
        var cache = new InMemoryShapeCache();
        var entry = new ShapeCacheEntry(
            $"b",
            $"i",
            new ShapeData($"r", 0, 0, 1, 1, Rotation: null, Text: null,
Style: null));
        cache.Store(entry);
        cache.Remove($"b", $"i");
        Assert.Null(cache.Retrieve($"b", $"i"));
    }

    [Fact]
    public void RetrieveReturnsStoredEntry()
    {
        var cache = new InMemoryShapeCache();
        var entry = new ShapeCacheEntry(
            $"b1",
            $"i1",
            new ShapeData($"rect", 0, 0, 1, 1, Rotation: null, Text: null,
Style: null));
        cache.Store(entry);

        ShapeCacheEntry? result = cache.Retrieve($"b1", $"i1");
        Assert.Equal(entry, result);
    }

    [Fact]
    public void RetrieveDataReturnsStoredShape()
    {
        var cache = new InMemoryShapeCache();
        var data = new ShapeData($"r", 1, 2, 3, 4, Rotation: null, Text: null, Style: null);
        cache.Store($"b2", $"i2", data);

        ShapeData? result = cache.RetrieveData($"b2", $"i2");

        Assert.Equal(data, result);
    }
}
