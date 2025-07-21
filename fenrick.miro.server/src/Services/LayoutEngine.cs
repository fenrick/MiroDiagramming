namespace Fenrick.Miro.Server.Services;

using Fenrick.Miro.Server.Domain;

/// <summary>
///     Simplified layout engine placing nodes vertically.
/// </summary>
// TODO: integrate ELK for advanced layout algorithms
public class LayoutEngine
{
    private const double Spacing = 120;

    /// <summary>
    ///     Position graph nodes in a vertical list.
    /// </summary>
    /// <param name="data">Graph structure.</param>
    /// <returns>Result containing node coordinates.</returns>
    /// <remarks>Replaced once ELK integration is complete.</remarks>
    public LayoutResult Layout(GraphData data)
    {
        var nodes = new Dictionary<string, PositionedNode>();
        double y = 0;
        foreach (var node in data.Nodes)
        {
            nodes[node.Id] = new PositionedNode(0, y, 100, 60);
            y += Spacing;
        }

        var edges = new List<PositionedEdge>();
        foreach (var edge in data.Edges)
        {
            if (nodes.TryGetValue(edge.From, out var start) && nodes.TryGetValue(edge.To, out var end))
            {
                edges.Add(new PositionedEdge((start.X, start.Y), (end.X, end.Y)));
            }
        }

        return new LayoutResult(nodes, edges);
    }
}
