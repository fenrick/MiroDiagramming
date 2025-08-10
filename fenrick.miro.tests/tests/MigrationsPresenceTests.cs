namespace Fenrick.Miro.Tests;

using System.Linq;

using Microsoft.EntityFrameworkCore.Migrations;

using Server.Data;

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
