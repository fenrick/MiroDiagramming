namespace Fenrick.Miro.Server.Domain;

/// <summary>
///     Node description used for layout and creation.
/// </summary>
public record GraphNode(string Id, string Label, string Type);

/// <summary>
///     Edge connecting two nodes.
/// </summary>
public record GraphEdge(string From, string To);

/// <summary>
///     Minimal graph structure for layout.
/// </summary>
public record GraphData(GraphNode[] Nodes, GraphEdge[] Edges);

/// <summary>
///     Resulting position for a node.
/// </summary>
public record PositionedNode(double X, double Y, double Width, double Height);

/// <summary>
///     Positioned edge linking two nodes.
/// </summary>
public record PositionedEdge((double X, double Y) StartPoint, (double X, double Y) EndPoint);

/// <summary>
///     Output produced by the layout engine.
/// </summary>
public record LayoutResult(Dictionary<string, PositionedNode> Nodes, List<PositionedEdge> Edges);
