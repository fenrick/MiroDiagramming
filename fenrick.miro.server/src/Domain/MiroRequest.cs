namespace Fenrick.Miro.Server.Domain;

/// <summary>
/// Lightweight description of a REST request sent to the Miro API.
/// </summary>
public record MiroRequest(string Method, string Path, string? Body);
