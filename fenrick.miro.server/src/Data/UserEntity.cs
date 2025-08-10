namespace Fenrick.Miro.Server.Data;

using System;

/// <summary>
///     Database record storing user authentication details.
/// </summary>
public class UserEntity
{
    /// <summary>Primary key derived from the Miro user id.</summary>
    public required string Id { get; set; }

    /// <summary>Display name of the user.</summary>
    public required string Name { get; set; }

    /// <summary>OAuth access token used for API requests.</summary>
    public required string AccessToken { get; set; }

    /// <summary>OAuth refresh token used to renew the access token.</summary>
    public required string RefreshToken { get; set; }

    /// <summary>Expiry instant of the current access token.</summary>
    public DateTimeOffset ExpiresAt { get; set; }
}
