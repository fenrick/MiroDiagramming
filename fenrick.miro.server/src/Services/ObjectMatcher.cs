namespace Fenrick.Miro.Server.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using Fenrick.Miro.Server.Domain;

/// <summary>
///     Utility helpers for matching board objects by content.
/// </summary>

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
        shapes.FirstOrDefault(s => string.Equals(
            s.Text,
            label,
            StringComparison.OrdinalIgnoreCase));

    /// <summary>
    ///     Find shapes with a specific style property value.
    /// </summary>
    /// <param name="shapes">Shapes to search.</param>
    /// <param name="key">Style key to match.</param>
    /// <param name="value">Expected value.</param>
    /// <returns>Matching shapes.</returns>
    /// <exception cref="ArgumentNullException">
    ///     Thrown when <paramref name="shapes" /> or <paramref name="key" /> is null.
    /// </exception>
    public static IEnumerable<ShapeData> FindShapesByStyle(
        IEnumerable<ShapeData> shapes,
        string key,
        object value)
    {
        ArgumentNullException.ThrowIfNull(shapes);

        ArgumentNullException.ThrowIfNull(key);

        return shapes.Where(s =>
            s.Style != null
            && s.Style.TryGetValue(key, out var v)
            && ((v is string sv && value is string svExpect)
                ? string.Equals(sv, svExpect, StringComparison.OrdinalIgnoreCase)
                : Equals(v, value)));
    }
}
