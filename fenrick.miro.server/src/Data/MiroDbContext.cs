namespace Fenrick.Miro.Server.Data;

using Microsoft.EntityFrameworkCore;

/// <summary>
///     Entity Framework context managing persistence for the server.
/// </summary>
public class MiroDbContext(DbContextOptions<MiroDbContext> options)
    : DbContext(options)
{
    /// <summary>Users persisted for OAuth token retrieval.</summary>
    public DbSet<UserEntity> Users => this.Set<UserEntity>();

    // TODO: add board state entities when persistence is extended.
}
