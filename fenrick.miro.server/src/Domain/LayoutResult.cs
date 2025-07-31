namespace Fenrick.Miro.Server.Domain;

/// <summary>
///     Output produced by the layout engine.
/// </summary>
public record LayoutResult(
    IDictionary<string, PositionedNode> Nodes,
    IList<PositionedEdge> Edges);
