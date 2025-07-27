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

    /// <summary>Stored templates owned by users.</summary>
    public DbSet<TemplateEntity> Templates => this.Set<TemplateEntity>();

    // TODO: add board state entities when persistence is extended.

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TemplateEntity>()
            .HasKey(t => new { t.UserId, t.Name });

        base.OnModelCreating(modelBuilder);
    }
}
