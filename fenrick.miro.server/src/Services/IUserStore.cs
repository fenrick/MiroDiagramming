namespace Fenrick.Miro.Server.Services;

using System.Threading;
using System.Threading.Tasks;

using Domain;

/// <summary>
///     Persist user details and OAuth tokens for API requests.
/// </summary>
public interface IUserStore
{
    /// <summary>Retrieve stored info for a user.</summary>
    /// <param name="userId">Identifier of the user.</param>
    /// <returns>Stored details or <see langword="null"/>.</returns>
    public UserInfo? Retrieve(string userId);

    /// <summary>Retrieve stored info for a user asynchronously.</summary>
    /// <param name="userId">Identifier of the user.</param>
    /// <param name="ct">Cancellation token to abort the operation.</param>
    /// <returns>Stored details or <see langword="null"/>.</returns>
    public Task<UserInfo?> RetrieveAsync(
        string userId,
        CancellationToken ct = default);

    /// <summary>Remove the user and associated token.</summary>
    /// <param name="userId">Identifier of the user.</param>
    public void Delete(string userId);

    /// <summary>Remove the user and associated token asynchronously.</summary>
    /// <param name="userId">Identifier of the user.</param>
    /// <param name="ct">Cancellation token to abort the operation.</param>
    public Task DeleteAsync(string userId, CancellationToken ct = default);

    /// <summary>Store or replace user details.</summary>
    /// <param name="info">Details to persist.</param>
    public void Store(UserInfo info);

    /// <summary>Store or replace user details asynchronously.</summary>
    /// <param name="info">Details to persist.</param>
    /// <param name="ct">Cancellation token to abort the operation.</param>
    public Task StoreAsync(UserInfo info, CancellationToken ct = default);
}
