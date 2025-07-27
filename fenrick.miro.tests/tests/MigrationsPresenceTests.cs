using System.Linq;
using Fenrick.Miro.Server.Data;
using Microsoft.EntityFrameworkCore.Migrations;

public class MigrationsPresenceTests
{
    [Fact]
    public void ContainsInitialMigration()
    {
        var migrationTypes = typeof(MiroDbContext).Assembly
            .GetTypes()
            .Where(t => t.IsSubclassOf(typeof(Migration)))
            .ToList();

        Assert.NotEmpty(migrationTypes);
    }
}
