namespace Fenrick.Miro.Server.Domain;

/// <summary>
///     Represents a shape widget stored in the cache.
/// </summary>
/// <param name="BoardId">Identifier of the Miro board.</param>
/// <param name="ItemId">Identifier of the widget on the board.</param>
/// <param name="Data">Original shape creation data.</param>
public record ShapeCacheEntry(string BoardId, string ItemId, ShapeData Data);
