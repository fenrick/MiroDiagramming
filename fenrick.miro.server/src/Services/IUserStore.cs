namespace Fenrick.Miro.Server.Services;

using Domain;

/// <summary>
///     Persist user details and OAuth tokens for API requests.
/// </summary>
public interface IUserStore
{
    /// <summary>Retrieve stored info for a user.</summary>
    /// <param name="userId">Identifier of the user.</param>
    /// <returns>Stored details or <c>null</c>.</returns>
    public UserInfo? Retrieve(string userId);

    /// <summary>Remove the user and associated token.</summary>
    /// <param name="userId">Identifier of the user.</param>
    public void Delete(string userId);

    /// <summary>Store or replace user details.</summary>
    /// <param name="info">Details to persist.</param>
    public void Store(UserInfo info);
}
