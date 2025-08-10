namespace Fenrick.Miro.Server.Domain;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

/// <summary>
///     Data describing a shape widget to be created via the Miro API.
/// </summary>
public record ShapeData(
    [property: Required]
    [property: JsonRequired]
    string Shape,
    [property: Required]
    [property: JsonRequired]
    double? X,
    [property: Required]
    [property: JsonRequired]
    double? Y,
    [property: Required]
    [property: JsonRequired]
    double? Width,
    [property: Required]
    [property: JsonRequired]
    double? Height,
    double? Rotation,
    string? Text,
    IDictionary<string, object>? Style);
