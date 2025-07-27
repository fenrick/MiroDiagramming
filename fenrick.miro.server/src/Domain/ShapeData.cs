namespace Fenrick.Miro.Server.Domain;

using System.ComponentModel.DataAnnotations;

/// <summary>
///     Data describing a shape widget to be created via the Miro API.
/// </summary>
public record ShapeData(
    [property: Required] string Shape,
    [property: Required] double X,
    [property: Required] double Y,
    [property: Required] double Width,
    [property: Required] double Height,
    double? Rotation,
    string? Text,
    IReadOnlyDictionary<string, object>? Style);
