namespace Fenrick.Miro.Server.Services;

using System.Collections.Concurrent;
using Domain;

/// <summary>
///     Thread-safe in-memory cache for board shapes.
/// </summary>
public class InMemoryShapeCache : IShapeCache
{
    private readonly ConcurrentDictionary<(string Board, string Item), ShapeCacheEntry> cache = new();

    /// <inheritdoc />
    public ShapeCacheEntry? Retrieve(string boardId, string itemId) =>
        this.cache.TryGetValue((boardId, itemId), out var entry) ? entry : null;

    /// <inheritdoc />
    public void Store(ShapeCacheEntry entry)
    {
        this.cache[(entry.BoardId, entry.ItemId)] = entry;
    }

    /// <inheritdoc />
    public void Remove(string boardId, string itemId)
    {
        this.cache.TryRemove((boardId, itemId), out _);
    }
}
