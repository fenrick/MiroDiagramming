using System.Collections.Concurrent;
using Fenrick.Miro.Server.Domain;

namespace Fenrick.Miro.Server.Services;

/// <summary>
/// Simple in-memory implementation of <see cref="ICacheService"/>.
/// </summary>
public class InMemoryCacheService : ICacheService
{
    private readonly ConcurrentDictionary<string, BoardMetadata> _cache = new();

    public BoardMetadata? Get(string boardId) =>
        _cache.TryGetValue(boardId, out var value) ? value : null;

    public void Store(BoardMetadata metadata) =>
        _cache[metadata.Id] = metadata;
}
