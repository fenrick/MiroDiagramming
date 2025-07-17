using Fenrick.Miro.Api;

namespace Fenrick.Miro.Server.Services;

/// <summary>
/// Provides board metadata caching for quick lookup.
/// </summary>
public interface ICacheService
{
    BoardMetadata? Get(string boardId);
    void Store(BoardMetadata metadata);
}
