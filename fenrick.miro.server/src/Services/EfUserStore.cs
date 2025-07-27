namespace Fenrick.Miro.Server.Services;

using System;
using System.Threading;
using System.Threading.Tasks;

using Fenrick.Miro.Server.Data;
using Fenrick.Miro.Server.Domain;

/// <summary>
///     User store backed by Entity Framework Core.
///     TODO: encrypt tokens at rest and support asynchronous APIs.
/// </summary>
public class EfUserStore(MiroDbContext context) : IUserStore
{
    private readonly MiroDbContext db = context;

    /// <inheritdoc />
    public UserInfo? Retrieve(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException($"User id must be provided", nameof(userId));
        }

        UserEntity? entity = this.db.Users.Find(userId);
        return entity is null ? null : new UserInfo(entity.Id, entity.Name, entity.Token);
    }

    /// <inheritdoc />
    public async Task<UserInfo?> RetrieveAsync(string userId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException($"User id must be provided", nameof(userId));
        }

        UserEntity? entity = await this.db.Users.FindAsync([userId], ct).ConfigureAwait(false);
        return entity is null ? null : new UserInfo(entity.Id, entity.Name, entity.Token);
    }

    /// <inheritdoc />
    public void Store(UserInfo info)
    {
        if (string.IsNullOrWhiteSpace(info.Id))
        {
            throw new ArgumentException($"User id must be provided", nameof(info));
        }

        UserEntity? entity = this.db.Users.Find(info.Id);
        if (entity is null)
        {
            this.db.Users.Add(new UserEntity { Id = info.Id, Name = info.Name, Token = info.Token });
        }
        else
        {
            entity.Name = info.Name;
            entity.Token = info.Token;
        }

        this.db.SaveChanges();
    }

    /// <inheritdoc />
    public async Task StoreAsync(UserInfo info, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(info.Id))
        {
            throw new ArgumentException($"User id must be provided", nameof(info));
        }

        UserEntity? entity = await this.db.Users.FindAsync([info.Id], ct).ConfigureAwait(false);
        if (entity is null)
        {
            await this.db.Users.AddAsync(new UserEntity { Id = info.Id, Name = info.Name, Token = info.Token }, ct).ConfigureAwait(false);
        }
        else
        {
            entity.Name = info.Name;
            entity.Token = info.Token;
        }

        await this.db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public void Delete(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException($"User id must be provided", nameof(userId));
        }

        UserEntity? entity = this.db.Users.Find(userId);
        if (entity != null)
        {
            this.db.Users.Remove(entity);
            this.db.SaveChanges();
        }
    }

    /// <inheritdoc />
    public async Task DeleteAsync(string userId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException($"User id must be provided", nameof(userId));
        }

        UserEntity? entity = await this.db.Users.FindAsync([userId], ct).ConfigureAwait(false);
        if (entity != null)
        {
            this.db.Users.Remove(entity);
            await this.db.SaveChangesAsync(ct).ConfigureAwait(false);
        }
    }
}
