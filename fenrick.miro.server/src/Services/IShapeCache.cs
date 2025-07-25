namespace Fenrick.Miro.Server.Services;

using Domain;

/// <summary>
///     Stores board shapes for quick lookup by board and item identifier.
/// </summary>
/// TODO: provide persistent implementation using a fast datastore and keep
///       DTOs in sync between client and server.
public interface IShapeCache
{
    /// <summary>
    ///     Retrieve a cached shape by board and item id.
    /// </summary>
    public ShapeCacheEntry? Retrieve(string boardId, string itemId);

    /// <summary>
    ///     Store or update a shape entry in the cache.
    /// </summary>
    public void Store(ShapeCacheEntry entry);

    /// <summary>
    ///     Remove a shape entry from the cache.
    /// </summary>
    public void Remove(string boardId, string itemId);
}
