namespace Fenrick.Miro.Server.Services;

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
        var entity = this.db.Users.Find(userId);
        return entity is null ? null : new UserInfo(entity.Id, entity.Name, entity.Token);
    }

    /// <inheritdoc />
    public void Store(UserInfo info)
    {
        var entity = this.db.Users.Find(info.Id);
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
}
