namespace Fenrick.Miro.Server.Services;

using Fenrick.Miro.Server.Domain;

/// <summary>
///     Utility helpers for matching board objects by content.
/// </summary>

// TODO: extend with fuzzy matching and shape property searches
public static class ObjectMatcher
{
    /// <summary>
    ///     Find a shape with the given label ignoring case.
    /// </summary>
    /// <param name="shapes">Shapes to search.</param>
    /// <param name="label">Label text.</param>
    /// <returns>The matching shape or <c>null</c>.</returns>
    /// <remarks>Matches only the <see cref="ShapeData.Text" /> field for now.</remarks>
    public static ShapeData? FindShapeByLabel(
        IEnumerable<ShapeData> shapes,
        string label) =>
        shapes.FirstOrDefault((ShapeData s) => string.Equals(
            s.Text,
            label,
            StringComparison.OrdinalIgnoreCase));
}
