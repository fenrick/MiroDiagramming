namespace Fenrick.Miro.Server.Domain;

/// <summary>
///     Single element within a shape template definition.
/// </summary>
public record TemplateElement(
    string Shape,
    double Width,
    double Height,
    string Text);

/// <summary>
///     Template composed of one or more elements.
/// </summary>
public record TemplateDefinition(TemplateElement[] Elements);
