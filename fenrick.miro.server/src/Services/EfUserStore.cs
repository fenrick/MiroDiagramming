namespace Fenrick.Miro.Server.Services;

using Data;
using Domain;

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
            throw new ArgumentException("User id must be provided",
                nameof(userId));
        }

        var entity = this.db.Users.Find(userId);
        return entity is null
            ? null
            : new UserInfo(entity.Id, entity.Name, entity.Token);
    }

    /// <inheritdoc />
    public void Store(UserInfo info)
    {
        if (string.IsNullOrWhiteSpace(info.Id))
        {
            throw new ArgumentException("User id must be provided",
                nameof(info));
        }

        var entity = this.db.Users.Find(info.Id);
        if (entity is null)
        {
            this.db.Users.Add(new UserEntity
            {
                Id = info.Id, Name = info.Name, Token = info.Token
            });
        }
        else
        {
            entity.Name = info.Name;
            entity.Token = info.Token;
        }

        this.db.SaveChanges();
    }

    /// <inheritdoc />
    public void Delete(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User id must be provided",
                nameof(userId));
        }

        var entity = this.db.Users.Find(userId);
        if (entity != null)
        {
            this.db.Users.Remove(entity);
            this.db.SaveChanges();
        }
    }
}
