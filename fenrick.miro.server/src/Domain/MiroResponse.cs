namespace Fenrick.Miro.Server.Domain;

/// <summary>
/// Response from the Miro API for a single REST request.
/// </summary>
public record MiroResponse(int Status, string Body);
