namespace Fenrick.Miro.Server.Domain;

/// <summary>
///     Authentication details of a Miro user forwarded by the web client.
/// </summary>
/// <param name="Id">Unique user identifier provided by Miro.</param>
/// <param name="Name">Display name of the user.</param>
/// <param name="Token">OAuth access token for REST API calls.</param>
public record UserInfo(string Id, string Name, string Token);
