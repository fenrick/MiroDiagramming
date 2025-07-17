using Miro.Server.Domain;

namespace Miro.Server.Services;

/// <summary>
/// Provides board metadata caching for quick lookup.
/// </summary>
public interface ICacheService
{
    BoardMetadata? Get(string boardId);
    void Store(BoardMetadata metadata);
}
