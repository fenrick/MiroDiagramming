namespace Fenrick.Miro.Server.Domain;

using System.ComponentModel.DataAnnotations;

/// <summary>
///     Data describing a card widget to be created via the Miro API.
/// </summary>
public record CardData(
    [property: Required] string Title,
    string? Description,
    IList<string>? Tags,
    IDictionary<string, object>? Style,
    IDictionary<string, object>? Fields,
    string? TaskStatus,
    string? Id);
