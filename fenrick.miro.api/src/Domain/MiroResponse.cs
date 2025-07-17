namespace Fenrick.Miro.Api;

/// <summary>
/// Response from the Miro API for a single REST request.
/// </summary>
public record MiroResponse(int Status, string Body);
