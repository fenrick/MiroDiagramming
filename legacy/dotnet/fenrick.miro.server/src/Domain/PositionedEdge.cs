namespace Fenrick.Miro.Server.Domain;

/// <summary>
///     Positioned edge linking two nodes.
/// </summary>
public record PositionedEdge(
    (double X, double Y) StartPoint,
    (double X, double Y) EndPoint);
