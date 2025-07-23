namespace Fenrick.Miro.Server.Services;

using System.Collections.Concurrent;
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
    private readonly ConcurrentDictionary<string, UserInfo> users = new();

    /// <inheritdoc />
    public UserInfo? Retrieve(string userId) =>
        this.users.TryGetValue(userId, out var info) ? info : null;

    /// <inheritdoc />
    public void Store(UserInfo info) =>
        this.users[info.Id] = info;
}
