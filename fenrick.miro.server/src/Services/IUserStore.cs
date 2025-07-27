namespace Fenrick.Miro.Server.Services;

using System.Threading;
using System.Threading.Tasks;

using Fenrick.Miro.Server.Domain;

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
    public virtual Task<UserInfo?> RetrieveAsync(
        string userId,
        CancellationToken ct = default) =>
        Task.FromResult(await this.RetrieveAsync(userId).ConfigureAwait(false));

    /// <summary>Remove the user and associated token.</summary>
    /// <param name="userId">Identifier of the user.</param>
    public void Delete(string userId);

    /// <summary>Remove the user and associated token asynchronously.</summary>
    /// <param name="userId">Identifier of the user.</param>
    /// <param name="ct">Cancellation token to abort the operation.</param>
    public virtual Task DeleteAsync(string userId, CancellationToken ct = default)
    {
        await this.DeleteAsync(userId).ConfigureAwait(false);
        return Task.CompletedTask;
    }

    /// <summary>Store or replace user details.</summary>
    /// <param name="info">Details to persist.</param>
    public void Store(UserInfo info);

    /// <summary>Store or replace user details asynchronously.</summary>
    /// <param name="info">Details to persist.</param>
    /// <param name="ct">Cancellation token to abort the operation.</param>
    public virtual Task StoreAsync(UserInfo info, CancellationToken ct = default)
    {
        await this.StoreAsync(info).ConfigureAwait(false);
        return Task.CompletedTask;
    }
}
