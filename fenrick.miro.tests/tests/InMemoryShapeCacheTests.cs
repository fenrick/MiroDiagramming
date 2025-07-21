#nullable enable
using Fenrick.Miro.Server.Domain;
using Fenrick.Miro.Server.Services;
using Xunit;

public class InMemoryShapeCacheTests
{
    [Fact]
    public void RetrieveReturnsStoredEntry()
    {
        var cache = new InMemoryShapeCache();
        var entry = new ShapeCacheEntry(
            "b1",
            "i1",
            new ShapeData("rect", 0, 0, 1, 1, null, null, null));
        cache.Store(entry);

        var result = cache.Retrieve("b1", "i1");
        Assert.Equal(entry, result);
    }

    [Fact]
    public void RemoveDeletesEntry()
    {
        var cache = new InMemoryShapeCache();
        var entry = new ShapeCacheEntry(
            "b",
            "i",
            new ShapeData("r", 0, 0, 1, 1, null, null, null));
        cache.Store(entry);
        cache.Remove("b", "i");
        Assert.Null(cache.Retrieve("b", "i"));
    }
}
