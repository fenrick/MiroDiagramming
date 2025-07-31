namespace Fenrick.Miro.Server.Services;

using System.Threading;
using System.Threading.Tasks;

/// <summary>
///     Provides access token refresh logic for expired tokens.
/// </summary>
public interface ITokenRefresher
{
    /// <summary>
    ///     Request a new token for the specified user.
    /// </summary>
    /// <param name="userId">User identifier.</param>
    /// <param name="ct">Cancellation token to abort the operation.</param>
    /// <returns>The refreshed token or <see langword="null"/> if refresh failed.</returns>
    public Task<string?> RefreshAsync(string userId, CancellationToken ct = default);
}
