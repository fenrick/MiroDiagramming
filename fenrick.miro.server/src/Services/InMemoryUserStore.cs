namespace Fenrick.Miro.Server.Services;

using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;

using Domain;

/// <summary>
///     Thread safe in-memory implementation of <see cref="IUserStore" />.
///     TODO: replace with persistent storage for production use and support the
///     server-side OAuth exchange.
///     TODO: implement ORM-backed store (e.g. EF Core) to manage user tokens
///     and allow future expansion with refresh tokens.
/// </summary>
public class InMemoryUserStore : IUserStore
{
    private readonly ConcurrentDictionary<string, UserInfo> users =
        new(StringComparer.Ordinal);

    /// <inheritdoc />
    public UserInfo? Retrieve(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException($"User id must be provided",
                nameof(userId));
        }

        return this.users.TryGetValue(userId, out UserInfo? info) ? info : null;
    }

    /// <inheritdoc />
    public Task<UserInfo?> RetrieveAsync(string userId,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException($"User id must be provided",
                nameof(userId));
        }

        return Task.FromResult(
            this.users.TryGetValue(userId, out UserInfo? info) ? info : null);
    }

    /// <inheritdoc />
    public void Store(UserInfo info)
    {
        if (string.IsNullOrWhiteSpace(info.Id))
        {
            throw new ArgumentException($"User id must be provided",
                nameof(info));
        }

        this.users[info.Id] = info;
    }

    /// <inheritdoc />
    public Task StoreAsync(UserInfo info, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(info.Id))
        {
            throw new ArgumentException($"User id must be provided",
                nameof(info));
        }

        this.users[info.Id] = info;
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public void Delete(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException($"User id must be provided",
                nameof(userId));
        }

        this.users.TryRemove(userId, out _);
    }

    /// <inheritdoc />
    public Task DeleteAsync(string userId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException($"User id must be provided",
                nameof(userId));
        }

        this.users.TryRemove(userId, out _);
        return Task.CompletedTask;
    }
}
