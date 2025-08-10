namespace Fenrick.Miro.Server.Domain;

using System;
using System.Text.Json.Serialization;

/// <summary>
///     Authentication and OAuth token details of a Miro user forwarded by the web client.
/// </summary>
/// <param name="Id">Unique user identifier provided by Miro.</param>
/// <param name="Name">Display name of the user.</param>
/// <param name="AccessToken">OAuth access token for REST API calls.</param>
/// <param name="RefreshToken">Token used to renew the access token when it expires.</param>
/// <param name="ExpiresAt">Instant when the access token becomes invalid.</param>
public record UserInfo(
    string Id,
    string Name,
    string AccessToken,
    string RefreshToken,
    [property: JsonRequired] DateTimeOffset ExpiresAt);
