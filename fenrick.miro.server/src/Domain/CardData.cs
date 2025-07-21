using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Fenrick.Miro.Server.Domain;

/// <summary>
///     Data describing a card widget to be created via the Miro API.
/// </summary>
public record CardData(
    [property: Required] string Title,
    string? Description,
    List<string>? Tags,
    Dictionary<string, object>? Style,
    Dictionary<string, object>? Fields,
    string? TaskStatus,
    string? Id);
