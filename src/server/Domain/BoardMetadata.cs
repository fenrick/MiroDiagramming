namespace Miro.Server.Domain;

/// <summary>
/// Basic information about a Miro board used by caching.
/// </summary>
public record BoardMetadata(string Id, string Name);
