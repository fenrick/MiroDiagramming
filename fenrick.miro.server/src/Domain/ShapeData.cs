using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Fenrick.Miro.Server.Domain;

/// <summary>
///     Data describing a shape widget to be created via the Miro API.
/// </summary>
public record ShapeData(
    [property: Required] string Shape,
    double X,
    double Y,
    double Width,
    double Height,
    double? Rotation,
    string? Text,
    Dictionary<string, object>? Style);
