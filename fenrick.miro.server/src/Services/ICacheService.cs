namespace Fenrick.Miro.Server.Services;

using Domain;

/// <summary>
///     Provides board metadata caching for quick lookup.
/// </summary>
public interface ICacheService
{
    public BoardMetadata? Get(string boardId);
    public void Store(BoardMetadata metadata);
}
