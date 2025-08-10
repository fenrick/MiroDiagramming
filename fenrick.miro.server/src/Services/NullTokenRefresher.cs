namespace Fenrick.Miro.Server.Services;

using System.Threading;
using System.Threading.Tasks;

using Domain;

/// <summary>
///     No-op implementation returning <see langword="null"/>.
/// </summary>
public sealed class NullTokenRefresher : ITokenRefresher
{
    /// <inheritdoc />
    public Task<UserInfo?> RefreshAsync(UserInfo info, CancellationToken ct = default) =>
        Task.FromResult<UserInfo?>(null);
}
