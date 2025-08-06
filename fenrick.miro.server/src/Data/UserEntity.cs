namespace Fenrick.Miro.Server.Data;

/// <summary>
///     Database record storing user authentication details.
/// </summary>
public class UserEntity
{
    /// <summary>Primary key derived from the Miro user id.</summary>
    public required string Id { get; set; }

    /// <summary>Display name of the user.</summary>
    public required string Name { get; set; }

    /// <summary>OAuth token used for API requests.</summary>
    public required string Token { get; set; }
}
