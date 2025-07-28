namespace Fenrick.Miro.Server.Services;

using Domain;

/// <summary>
///     Stores board shapes for quick lookup by board and item identifier.
/// </summary>
/// TODO: provide persistent implementation using a fast datastore and keep
/// DTOs in sync between client and server.
public interface IShapeCache
{
    /// <summary>
    ///     Remove a shape entry from the cache.
    /// </summary>
    /// <param name="boardId">Identifier of the board.</param>
    /// <param name="itemId">Identifier of the widget.</param>
    public void Remove(string boardId, string itemId);

    /// <summary>
    ///     Retrieve a cached shape entry by board and item id.
    /// </summary>
    /// <param name="boardId">Identifier of the board.</param>
    /// <param name="itemId">Identifier of the widget.</param>
    /// <returns>The stored entry or <see langword="null" />.</returns>
    public ShapeCacheEntry? Retrieve(string boardId, string itemId);

    /// <summary>
    ///     Retrieve only the shape data portion of a cached entry.
    /// </summary>
    /// <param name="boardId">Identifier of the board.</param>
    /// <param name="itemId">Identifier of the widget.</param>
    /// <returns>The stored shape or <see langword="null" />.</returns>
    public ShapeData? RetrieveData(string boardId, string itemId);

    /// <summary>
    ///     Store or update a shape entry in the cache.
    /// </summary>
    /// <param name="entry">Entry to store.</param>
    public void Store(ShapeCacheEntry entry);

    /// <summary>
    ///     Store a shape by its identifiers.
    /// </summary>
    /// <param name="boardId">Identifier of the board.</param>
    /// <param name="itemId">Identifier of the widget.</param>
    /// <param name="data">Shape data to persist.</param>
    public void Store(string boardId, string itemId, ShapeData data);
}
