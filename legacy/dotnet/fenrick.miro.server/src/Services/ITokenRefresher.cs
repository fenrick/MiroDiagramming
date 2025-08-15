namespace Fenrick.Miro.Server.Services;

using System.Threading;
using System.Threading.Tasks;

/// <summary>
///     Provides access token refresh logic for expired tokens.
/// </summary>
public interface ITokenRefresher
{
    /// <summary>
    ///     Request updated OAuth tokens for the specified user.
    /// </summary>
    /// <param name="userId">Identifier of the user.</param>
    /// <param name="ct">Cancellation token to abort the operation.</param>
    /// <returns>The refreshed access token or <see langword="null"/> if refresh failed.</returns>
    public Task<string?> RefreshAsync(string userId, CancellationToken ct = default);
}
