namespace Fenrick.Miro.Server.Services;

using System.Threading;
using System.Threading.Tasks;

/// <summary>
///     No-op implementation returning <see langword="null"/>.
/// </summary>
public sealed class NullTokenRefresher : ITokenRefresher
{
    /// <inheritdoc />
    public Task<string?> RefreshAsync(string userId, CancellationToken ct = default) =>
        Task.FromResult<string?>(null);
}
