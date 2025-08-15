namespace Fenrick.Miro.Server.Domain;

/// <summary>
///     Single element within a shape template definition.
/// </summary>
public record TemplateElement(
    string Shape,
    double Width,
    double Height,
    string Text);
