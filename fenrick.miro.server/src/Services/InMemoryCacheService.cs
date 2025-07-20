namespace Fenrick.Miro.Server.Services;

using System.Collections.Concurrent;
using Domain;

/// <summary>
///     Simple in-memory implementation of <see cref="ICacheService" />.
/// </summary>
public class InMemoryCacheService : ICacheService
{
    private readonly ConcurrentDictionary<string, BoardMetadata> _cache = new();

    public BoardMetadata? Get(string boardId) =>
        this._cache.TryGetValue(boardId, out var value) ? value : null;

    public void Store(BoardMetadata metadata) =>
        this._cache[metadata.Id] = metadata;
}
