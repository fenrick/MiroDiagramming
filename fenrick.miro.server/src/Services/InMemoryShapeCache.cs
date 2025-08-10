namespace Fenrick.Miro.Server.Services;

using System;
using System.Collections.Concurrent;
using System.Linq;

using Domain;

/// <summary>
///     Thread-safe in-memory cache for board shapes.
/// </summary>
/// <remarks>
///     TODO: back with persistent store and eviction strategy for large boards.
/// </remarks>
public class InMemoryShapeCache : IShapeCache
{
    private readonly ConcurrentDictionary<(string Board, string Item), CacheItem> cache = new();
    private readonly TimeSpan ttl;
    private readonly int maxSize;

    private record CacheItem(ShapeCacheEntry Entry, DateTimeOffset Timestamp);

    /// <summary>
    ///     Create a cache with the specified retention settings.
    /// </summary>
    /// <param name="ttl">Maximum lifetime for entries.</param>
    /// <param name="maxSize">Maximum number of entries to retain.</param>
    public InMemoryShapeCache(TimeSpan? ttl = null, int maxSize = 1024)
    {
        this.ttl = ttl ?? TimeSpan.FromMinutes(5);
        this.maxSize = maxSize;
    }

    /// <inheritdoc />
    public void Remove(string boardId, string itemId) =>
        this.cache.TryRemove((boardId, itemId), out _);

    /// <inheritdoc />
    public ShapeCacheEntry? Retrieve(string boardId, string itemId)
    {
        this.Purge();
        if (this.cache.TryGetValue((boardId, itemId), out CacheItem item))
        {
            if (DateTimeOffset.UtcNow - item.Timestamp <= this.ttl)
            {
                return item.Entry;
            }

            this.cache.TryRemove((boardId, itemId), out _);
        }

        return null;
    }

    /// <inheritdoc />
    public ShapeData? RetrieveData(string boardId, string itemId) =>
        this.Retrieve(boardId, itemId)?.Data;

    /// <inheritdoc />
    public void Store(ShapeCacheEntry entry)
    {
        this.cache[(entry.BoardId, entry.ItemId)] =
            new CacheItem(entry, DateTimeOffset.UtcNow);
        this.Purge();
    }

    /// <inheritdoc />
    public void Store(string boardId, string itemId, ShapeData data) =>
        this.Store(new ShapeCacheEntry(boardId, itemId, data));

    private void Purge()
    {
        DateTimeOffset now = DateTimeOffset.UtcNow;
        foreach ((var key, CacheItem value) in this.cache)
        {
            if (now - value.Timestamp > this.ttl)
            {
                this.cache.TryRemove(key, out _);
            }
        }

        while (this.cache.Count > this.maxSize)
        {
            (var key, _) = this.cache
                .OrderBy(kv => kv.Value.Timestamp)
                .First();
            this.cache.TryRemove(key, out _);
        }
    }
}
