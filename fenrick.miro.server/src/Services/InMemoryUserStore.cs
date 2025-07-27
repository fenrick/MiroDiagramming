namespace Fenrick.Miro.Server.Services;

using System;
using System.Collections.Concurrent;
using Fenrick.Miro.Server.Domain;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
///     Thread safe in-memory implementation of <see cref="IUserStore" />.
///     TODO: replace with persistent storage for production use and support the
///     server-side OAuth exchange.
///     TODO: implement ORM-backed store (e.g. EF Core) to manage user tokens
///     and allow future expansion with refresh tokens.
/// </summary>
public class InMemoryUserStore : IUserStore
{
    private readonly ConcurrentDictionary<string, UserInfo> users = new();

    /// <inheritdoc />
    public UserInfo? Retrieve(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User id must be provided", nameof(userId));
        }

        return this.users.TryGetValue(userId, out var info) ? info : null;
    }

    /// <inheritdoc />
    public Task<UserInfo?> RetrieveAsync(string userId, CancellationToken ct = default) =>
        Task.FromResult(this.Retrieve(userId));

    /// <inheritdoc />
    public void Store(UserInfo info)
    {
        if (string.IsNullOrWhiteSpace(info.Id))
        {
            throw new ArgumentException("User id must be provided", nameof(info));
        }

        this.users[info.Id] = info;
    }

    /// <inheritdoc />
    public Task StoreAsync(UserInfo info, CancellationToken ct = default)
    {
        this.Store(info);
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public void Delete(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User id must be provided", nameof(userId));
        }

        this.users.TryRemove(userId, out _);
    }

    /// <inheritdoc />
    public Task DeleteAsync(string userId, CancellationToken ct = default)
    {
        this.Delete(userId);
        return Task.CompletedTask;
    }
}
