namespace Fenrick.Miro.Server.Domain;

using System.ComponentModel.DataAnnotations;

/// <summary>
///     Data describing a tag on a Miro board.
/// </summary>
public record TagInfo(
    [property: Required] string Id,
    [property: Required] string Title,
    string? Color);
