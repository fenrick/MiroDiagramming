namespace Fenrick.Miro.Server.Services;

using System.Collections.Concurrent;

using Domain;

/// <summary>
///     Simple in-memory implementation of <see cref="ICacheService" />.
/// </summary>
public class InMemoryCacheService : ICacheService
{
    private readonly ConcurrentDictionary<string, BoardMetadata> cache =
        new(StringComparer.Ordinal);

    public BoardMetadata? Retrieve(string boardId) =>
        this.cache.TryGetValue(boardId, out BoardMetadata? value)
            ? value
            : null;

    public void Store(BoardMetadata metadata) =>
        this.cache[metadata.Id] = metadata;
}
