namespace Fenrick.Miro.Server.Services;

using System.Collections.Concurrent;

using Domain;

/// <summary>
///     Thread-safe in-memory cache for board shapes.
/// </summary>
/// <remarks>
///     TODO: back with persistent store and eviction strategy for large boards.
/// </remarks>
public class InMemoryShapeCache : IShapeCache
{
    private readonly
        ConcurrentDictionary<(string Board, string Item), ShapeCacheEntry>
        cache = new();

    /// <inheritdoc />
    public void Remove(string boardId, string itemId) =>
        this.cache.TryRemove((boardId, itemId), out _);

    /// <inheritdoc />
    public ShapeCacheEntry? Retrieve(string boardId, string itemId) =>
        this.cache.TryGetValue((boardId, itemId), out ShapeCacheEntry? entry)
            ? entry
            : null;

    /// <inheritdoc />
    public ShapeData? RetrieveData(string boardId, string itemId) =>
        this.Retrieve(boardId, itemId)?.Data;

    /// <inheritdoc />
    public void Store(ShapeCacheEntry entry) =>
        this.cache[(entry.BoardId, entry.ItemId)] = entry;

    /// <inheritdoc />
    public void Store(string boardId, string itemId, ShapeData data) =>
        this.Store(new ShapeCacheEntry(boardId, itemId, data));
}
