namespace Fenrick.Miro.Server.Services;

using System.Threading;
using System.Threading.Tasks;

using Domain;

/// <summary>
///     Provides access token refresh logic for expired tokens.
/// </summary>
public interface ITokenRefresher
{
    /// <summary>
    ///     Request updated OAuth tokens for the specified user.
    /// </summary>
    /// <param name="info">Current user details and tokens.</param>
    /// <param name="ct">Cancellation token to abort the operation.</param>
    /// <returns>The refreshed details or <see langword="null"/> if refresh failed.</returns>
    public Task<UserInfo?> RefreshAsync(UserInfo info, CancellationToken ct = default);
}
